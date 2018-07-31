unit UBAmqpTable;

interface

uses
  Classes,
  SysUtils,
  rabbitmq;

type
  TAmqpDecimalRec = record
    case Boolean of
      False: (
        rec: amqp_decimal_t;
      );
      True: (
        bits: UInt64;
      )
  end;

  { TAmqpTable }

  TAmqpTable = class
  private
    FPool: amqp_pool_t;
    FReservedEntries: size_t;
    FTable: amqp_table_t;
    function GetAmqpTable: amqp_table_t;
  public
    constructor Create(ASize: size_t);
    destructor Destroy; override;
    procedure Add(const AName: AnsiString; const AValue: Variant; AKind: Byte);
    property AmqpTable: amqp_table_t read GetAmqpTable;
  end;

implementation

uses
  TypInfo,
  Variants;

type
  amqp_table_entries_array_t = array [0..100000] of amqp_table_entry_t;
  pamqp_table_entries_array_t = ^amqp_table_entries_array_t;

constructor TAmqpTable.Create(ASize: size_t);
var
  mem: Pointer;
  num_bytes: size_t;
begin
  if ASize < 1 then
    raise EArgumentException.Create('Can''t create an empty table');
  inherited Create;
  init_amqp_pool(@FPool, 1024);
  num_bytes := ASize * sizeof(amqp_table_entry_t);
  mem := amqp_pool_alloc(@FPool, num_bytes);
  if not Assigned(mem) then
    raise EOutOfMemory.Create('Out of memory');
  FillChar(mem^, num_bytes, 0);
  FTable.entries := mem;
  FReservedEntries := ASize;
end;

destructor TAmqpTable.Destroy;
begin
  empty_amqp_pool(@FPool);
  inherited Destroy;
end;

procedure TAmqpTable.Add(const AName: AnsiString; const AValue: Variant;
  AKind: Byte);
var
  entry: amqp_table_entry_t;
  idx: size_t;
  newSize: size_t;
  mem: Pointer;

  procedure CalculateEntryFromValue; inline;
  var
    s: AnsiString;
  begin
    case amqp_field_value_kind_t(AKind) of
      AMQP_FIELD_KIND_VOID:
        { No value };
      AMQP_FIELD_KIND_BOOLEAN:
        entry.value.value.&boolean := AValue;
      AMQP_FIELD_KIND_U8:
        entry.value.value.u8 := AValue;
      AMQP_FIELD_KIND_I8:
        entry.value.value.i8 := AValue;
      AMQP_FIELD_KIND_U16:
        entry.value.value.u16 := AValue;
      AMQP_FIELD_KIND_I16:
        entry.value.value.i16 := AValue;
      AMQP_FIELD_KIND_U32:
        entry.value.value.u32 := AValue;
      AMQP_FIELD_KIND_I32:
        entry.value.value.i32 := AValue;
      AMQP_FIELD_KIND_U64,
      AMQP_FIELD_KIND_TIMESTAMP:
        entry.value.value.u64 := AValue;
      AMQP_FIELD_KIND_I64:
        entry.value.value.i64 := AValue;
      AMQP_FIELD_KIND_F32:
        entry.value.value.f32 := AValue;
      AMQP_FIELD_KIND_F64:
        entry.value.value.f64 := AValue;
      AMQP_FIELD_KIND_DECIMAL:
        entry.value.value.decimal := TAmqpDecimalRec(Int64(AValue)).rec;
      AMQP_FIELD_KIND_UTF8,
      AMQP_FIELD_KIND_BYTES: begin
        s := AValue;
        amqp_pool_alloc_bytes(@FPool, Succ(Length(s)), @entry.value.value.bytes);
        if not Assigned(entry.value.value.bytes.bytes) then
          raise EOutOfMemory.Create('Out of memory');
        Move(PAnsiChar(s)^, entry.value.value.bytes.bytes^, entry.value.value.bytes.len);
      end;
      AMQP_FIELD_KIND_ARRAY:
        raise ENotSupportedException.Create('Array field is not supported');
      AMQP_FIELD_KIND_TABLE:
        raise ENotSupportedException.Create('Table field is not supported');
      else
        raise EArgumentException.Create('Invalid value kind');
    end;
    entry.value.kind := AKind;
    amqp_pool_alloc_bytes(@FPool, Succ(Length(AName)), @entry.key);
    if not Assigned(entry.key.bytes) then
      raise EOutOfMemory.Create('Out of memory');
    Move(PAnsiChar(AName)^, entry.key.bytes^, entry.key.len);
  end;

begin
  CalculateEntryFromValue;
  idx := FTable.num_entries;
  if idx < FReservedEntries then begin
    Inc(FTable.num_entries);
    pamqp_table_entries_array_t(FTable.entries)[idx] := entry;
  end else
    raise ERangeError.Create('Not enouth space to store entries');
end;

function TAmqpTable.GetAmqpTable: amqp_table_t;
begin
  if Assigned(Self) then
    Result := FTable
  else
    Result := amqp_empty_table;
end;

end.

