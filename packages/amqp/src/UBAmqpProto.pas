unit UBAmqpProto;

interface

uses
  Classes,
  SysUtils,
  SpiderMonkey,
  SyNodeSimpleProto,
  mORMot;

type

  { TAmqpTableProto }

  TAmqpTableProto = class(TSMSimpleRTTIProtoObject)
  public
    function NewSMInstance(cx: PJSContext; argc: uintN; var vp: JSArgRec): TObject; override;
    class procedure RegisterClass(cx: PJSContext; AParent: PJSRootedObject);
  end;

  { TAmqpConnectionProto }

  TAmqpConnectionProto = class(TSMSimpleRTTIProtoObject)
  public
    function NewSMInstance(cx: PJSContext; argc: uintN; var vp: JSArgRec): TObject; override;
    class procedure RegisterClass(cx: PJSContext; AParent: PJSRootedObject);
  end;

  { TAmqpChannelProto }

  TAmqpChannelProto = class(TSMSimpleRTTIProtoObject)
  public
    function NewSMInstance(cx: PJSContext; argc: uintN; var vp: JSArgRec): TObject; override;
    class procedure RegisterClass(cx: PJSContext; AParent: PJSRootedObject);
  end;

function ubamqp_parse_url(cx: PJSContext; argc: uintN; var vp: jsargRec): Boolean; cdecl;

implementation

uses
  TypInfo,
  SynCommons,
  SyNode,
  SyNodeProto,
  UBAmqpTypes,
  UBAmqpTable,
  UBAmqpBasicMessage,
  UBAmqpConnection,
  UBAmqpChannel;

type
  { TSMAmqpTable }

  {$M+}
  TSMAmqpTable = class(TAmqpTable)
  public
    class function FromJSVal(cx: PJSContext; val: jsval;
      const errMsg: String): TAmqpTable;
  published
    function Add(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
  end;
  {$M-}

  { TSMAmqpConnection }

  {$M+}
  TSMAmqpConnection = class(TAmqpConnection)
  end;
  {$M-}

  { TSMAmqpChannel }

  {$M+}
  TSMAmqpChannel = class(TAmqpChannel)
  published
    function basicAck(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicCancel(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicConsume(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicConsumeMessage(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicGet(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicNack(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicPublish(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicQos(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicRecover(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function basicReject(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function bindExchange(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function bindQueue(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function declareExchange(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function declareQueue(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function deleteExchange(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function deleteQueue(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function purgeQueue(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function unbindExchange(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
    function unbindQueue(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; overload; cdecl;
  end;
  {$M-}

  { TBooleanHelper }

  TBooleanHelper = record helper for Boolean
  public
    function ToJSVal: jsval;
  end;

  { TIntegerHelper }

  TIntegerHelper = record helper for Integer
  public
    function ToJSVal: jsval;
  end;

  { TUInt8Helper }

  TUInt8Helper = record helper for UInt8
  public
    function ToJSVal: jsval;
  end;

  { TUInt16Helper }

  TUInt16Helper = record helper for UInt16
  public
    function ToJSVal: jsval;
  end;

  { TUInt32Helper }

  TUInt32Helper = record helper for UInt32
  public
    function ToJSVal: jsval;
  end;

  { TUInt64Helper }

  TUInt64Helper = record helper for UInt64
  public
    function ToJSVal: jsval;
  end;

  { TAmqpBytesHelper }

  TAmqpBytesHelper = record helper for TAmqpBytes
  public
    function ToArrayBuffer(cx: PJSContext): PJSObject;
    function ToJSString(cx: PJSContext): PJSString;
  end;

  { TAmqpBasicMessageHelper }

   TAmqpBasicMessageHelper = class helper for TAmqpBasicMessage
   public
     function ToJSObject(cx: PJSContext): PJSObject;
   end;

function ubamqp_parse_url(cx: PJSContext; argc: uintN; var vp: jsargRec): Boolean; cdecl;
var
  in_argv: PjsvalVector;
  url: RawUTF8;
  info: TAmqpConnectionInfo;
  obj: PJSRootedObject;
  val: jsval;
const
  f_usage = 'usage: ubamqp_parse_url(uri: String): Object';
begin
  try
    in_argv := vp.argv;
    if (argc <> 1) or not in_argv[0].isString then
      raise ESMException.Create(f_usage);
    url := in_argv[0].asJSString.ToUTF8(cx);
    info := TAmqpConnectionInfo.FromUrl(url);

    obj := cx.NewRootedObject(cx.NewObject(nil));
    val.asBoolean := info.SSL <> 0;
    obj.ptr.DefineProperty(cx, 'ssl', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    val := cx.NewJSString(info.host).ToJSVal;
    obj.ptr.DefineProperty(cx, 'host', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    val.asInteger := info.port;
    obj.ptr.DefineProperty(cx, 'port', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    val := cx.NewJSString(info.vhost).ToJSVal;
    obj.ptr.DefineProperty(cx, 'vhost', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    val := cx.NewJSString(info.user).ToJSVal;
    obj.ptr.DefineProperty(cx, 'user', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    val := cx.NewJSString(info.password).ToJSVal;
    obj.ptr.DefineProperty(cx, 'password', val, JSPROP_ENUMERATE or JSPROP_READONLY, nil, nil);
    vp.rval := obj.ptr.ToJSValue;
    Result := True;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

{ TSMAmqpTable }

class function TSMAmqpTable.FromJSVal(cx: PJSContext; val: jsval;
  const errMsg: String): TAmqpTable;
var
  inst: PSMInstanceRecord;
begin
  if IsInstanceObject(cx, val, inst) and (inst.instance is TAmqpTable) then
    Result := TAmqpTable(inst.instance)
  else if val.isVoid then
    Result := nil
  else
    raise ESMException.Create(errMsg);
end;

function TSMAmqpTable.Add(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;

  function JSValToVariant(kind: Byte; val: jsval): Variant;
  var
    valid: Boolean;
    sval: Single;
    dv, pv: jsval;
    dval: TAmqpDecimalRec;
    bsval: RawByteString;
    l: uint32;
    p: Puint8Vector;
  begin
    case kind of
      Ord('t'): begin // boolean type. 0 = false, 1 = true @see amqp_boolean_t
        valid := val.isBoolean;
        if valid then
          Result := val.asBoolean;
      end;
      Ord('b'): begin // 8-bit signed integer, datatype: int8_t
        valid := val.isNumber;
        if valid then
          Result := System.Int8(val.asInt64);
      end;
      Ord('B'): begin // 8-bit unsigned integer, datatype: uint8_t
        valid := val.isNumber;
        if valid then
          Result := System.UInt8(val.asInt64);
      end;
      Ord('s'): begin // 16-bit signed integer, datatype: int16_t
        valid := val.isNumber;
        if valid then
          Result := System.Int16(val.asInt64);
      end;
      Ord('u'): begin // 16-bit unsigned integer, datatype: uint16_t
        valid := val.isNumber;
        if valid then
          Result := System.UInt16(val.asInt64);
      end;
      Ord('I'): begin // 32-bit signed integer, datatype: int32_t
        valid := val.isNumber;
        if valid then
          Result := System.Int32(val.asInt64);
      end;
      Ord('i'): begin // 32-bit unsigned integer, datatype: uint32_t
        valid := val.isNumber;
        if valid then
          Result := System.UInt32(val.asInt64);
      end;
      Ord('l'): begin // 64-bit signed integer, datatype: int64_t
        valid := val.isNumber;
        if valid then
          Result := System.Int64(val.asInt64);
      end;
      Ord('L'): begin // 64-bit unsigned integer, datatype: UInt64
        valid := val.isNumber;
        if valid then
          Result := System.UInt64(val.asInt64);
      end;
      Ord('f'): begin // single-precision floating point Result, datatype: float
        valid := val.isNumber;
        if valid then begin
          sval := val.asDouble;
          Result := sval;
        end;
      end;
      Ord('d'): begin // double-precision floating point Result, datatype: double
        valid := val.isNumber;
        if valid then
          Result := val.asDouble;
      end;
      Ord('D'): begin // amqp-decimal Result, datatype: amqp_decimal_t
        valid := val.isObject and
          val.asObject.GetProperty(cx, 'digits', dv) and dv.isInteger and
          val.asObject.GetProperty(cx, 'places', pv) and pv.isInteger;
        if valid then begin
          dval.rec.value := System.UInt32(dv.asInteger);
          dval.rec.decimals := System.UInt8(pv.asInteger);
          Result := dval.bits;
        end;
      end;
      Ord('S'): begin // UTF-8 null-terminated character string, datatype: amqp_bytes_t
        valid := val.isString;
        if valid then
          Result := val.asJSString.ToUTF8(cx);
      end;
      Ord('A'): begin // field array (repeated values of another datatype. datatype: amqp_array_t
        raise ENotSupportedException.Create('Array type is not supported');
      end;
      Ord('T'): begin // 64-bit timestamp. datatype UInt64
        valid := val.isNumber;
        if valid then
          Result := System.UInt64(val.asInt64);
      end;
      Ord('F'): begin // field table. encapsulates a table inside a table entry. datatype: amqp_table_t
        raise ENotSupportedException.Create('Table type is not supported');
      end;
      Ord('V'): begin // empty entry
        valid := val.isNull;
        if valid then
          SetVariantNull(Result);
      end;
      Ord('x'): begin // unformatted byte string, datatype: amqp_bytes_t
        valid := val.isObject and val.asObject.IsArrayBufferObject;
        if valid then begin
          val.asObject.GetBufferDataAndLength(p, l);
          FastSetString(bsval, p, l);
          Result := bsval;
        end;
      end;
      else
        valid := False;
    end;
    if not valid then
      raise EArgumentException.Create('Invalid argument type');
  end;

var
  argv: PjsvalVector;
  vtype: RawUTF8;
  kind: Byte;
  name: RawUTF8;
  value: Variant;
begin
  Result := True;
  if (argc <> 3) then
    raise ESMException.Create('Adding data to an amqp table requires three parameters');
  argv := vp.argv;
  if argv[0].isString and argv[1].isString then begin
    vtype := argv[0].asJSString.ToUTF8(cx);
    if (Length(vtype) = 1) then
      kind := Ord(vtype[1])
    else
      kind := 0; // 0 - is invalid field type - should raise exception inside JSValToVariant
    name := argv[1].asJSString.ToUTF8(cx);
    value := JSValToVariant(kind, argv[2]);
    Self.Add(name, value, kind);
  end else
    raise ESMException.Create('Invalid argument types while adding data to an amqp table');
end;

{ TSMAmqpChannel }

function TSMAmqpChannel.basicAck(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  deliveryTag: UInt64;
begin
  try
    Result := True;
    if argc <> 2 then
      raise ESMException.Create('Message acknowledge requires two parameters');
    argv := vp.argv;
    if argv[0].isNumber and argv[1].isBoolean then begin
      deliveryTag := argv[0].asInt64;
      // ?? := argv[1].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types for message acknowledge');
    BasicAck(deliveryTag{, ??});
    vp.rval := JSVAL_VOID;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicCancel(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  consumerTag: RawUTF8;
begin
  try
    Result := True;
    if argc <> 1 then
      raise ESMException.Create('Cancelling requires one parameter');
    argv := vp.argv;
    if argv[0].isString then
      consumerTag := argv[0].asJSString.ToUTF8(cx)
    else
      raise ESMException.Create('Invalid argument type for cancelling');
    BasicCancel(consumerTag);
    vp.rval := JSVAL_VOID;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicConsume(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  qname: RawUTF8;
  tag: RawUTF8;
  noLocal: Boolean;
  noAck: Boolean;
  exclusive: Boolean;
begin
  try
    Result := True;
    if (argc < 5) or (argc > 6) then
      raise ESMException.Create('Consuming start from an amqp queue requires five or six parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isBoolean and argv[3].isBoolean and argv[4].isBoolean then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      tag := argv[1].asJSString.ToUTF8(cx);
      noLocal := argv[2].asBoolean;
      noAck := argv[3].asBoolean;
      exclusive := argv[4].asBoolean;
      if argc = 5 then
        args := TSMAmqpTable.FromJSVal(cx, argv[5],
          'While consuming start from an amqp queue the fifth argument must be an object if provided');
    end else
      raise ESMException.Create('Invalid argument types while consuming start from an amqp queue');
    vp.rval := cx.NewJSString(
      BasicConsume(qname, tag, noLocal, noAck, exclusive, args)).ToJSVal;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicConsumeMessage(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  tag: RawUTF8;
  timeout: DWord;
  msg: TAmqpBasicMessage;
begin
  try
    Result := True;
    if argc <> 2 then
      raise ESMException.Create('Consuming message from an amqp queue requires two parameters');
    argv := vp.argv;
    if argv[0].isString and argv[1].isInteger then begin
      tag := argv[0].asJSString.ToUTF8(cx);
      timeout := DWord(argv[1].asInteger);
    end else
      raise ESMException.Create('Invalid argument types to consume message from an amqp queue');
    msg := BasicConsumeMessage(tag, timeout);
    if Assigned(msg) then begin
      vp.rval := msg.ToJSObject(cx).ToJSValue;
      msg.Free;
    end else
      vp.rval := JSVAL_VOID;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicGet(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  qname: RawUTF8;
  noAck: Boolean;
  msg: TAmqpBasicMessage;
begin
  try
    Result := True;
    if argc <> 2 then
      raise ESMException.Create('Get message from an amqp queue requires two parameters');
    argv := vp.argv;
    if argv[0].isString and argv[1].isBoolean then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      noAck := argv[1].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types to get message from an amqp queue');
    msg := BasicGet(qname, noAck);
    if Assigned(msg) then begin
      vp.rval := msg.ToJSObject(cx).ToJSValue;
      msg.Free;
    end else
      vp.rval := JSVAL_VOID;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicNack(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  deliveryTag: UInt64;
  requeue: Boolean;
begin
  try
    Result := True;
    if argc <> 3 then
      raise ESMException.Create('Message nack requires three parameters');
    argv := vp.argv;
    if argv[0].isNumber and argv[1].isBoolean and argv[2].isBoolean then begin
      deliveryTag := argv[0].asInt64;
      // ?? := argv[1].asBoolean;
      requeue := argv[2].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types for message nack');
    BasicNack(deliveryTag{, ??}, requeue);
    vp.rval := JSVAL_VOID;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicPublish(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  exchange: RawUTF8;
  routingKey: RawUTF8;
  mandatory: Boolean;
  data: Pointer;
  len: size_t;
begin
  try
    Result := True;
    if (argc < 4) or (argc > 5) then
      raise ESMException.Create('Publishing data to an amqp exchange requires four or five parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isObject and argv[2].asObject.IsTypedArrayObject and argv[3].isBoolean then begin
      exchange := argv[0].asJSString.ToUTF8(cx);
      routingKey := argv[1].asJSString.ToUTF8(cx);
      data := argv[2].asObject.GetUint8ArrayData;
      len := argv[2].asObject.GetTypedArrayByteLength;
      mandatory := argv[3].asBoolean;
      if argc = 5 then
        args := TSMAmqpTable.FromJSVal(cx, argv[4],
          'While publishing data to an amqp exchange the fifth argument must be an amqp table if provided');
    end else
      raise ESMException.Create('Invalid argument types while publishing data to an amqp exchange');
    BasicPublish(exchange, routingKey, data, len, mandatory, False);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicQos(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  mpc: UInt16;
begin
  try
    Result := True;
    if (argc <> 1) then
      raise ESMException.Create('Setting up amqp qos parameters requires one parameter');
    argv := vp.argv;
    if argv[0].isInteger then begin
      mpc := argv[0].asInteger
    end else
      raise ESMException.Create('Invalid argument type for setting up amqp qos parameters');
    BasicQos(mpc);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicRecover(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
begin
  try
    Result := True;
    if (argc <> 0) then
      raise ESMException.Create('Recover operation does not need any parameters');
    BasicRecover();
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.basicReject(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  deliveryTag: UInt64;
  requeue: Boolean;
begin
  try
    Result := True;
    if (argc <> 2) then
      raise ESMException.Create('Rejecting message requires two parameters');
    argv := vp.argv;
    if argv[0].isNumber and argv[1].isBoolean then begin
      deliveryTag := argv[0].asInt64;
      requeue := argv[1].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types for rejecting message');
    BasicReject(deliveryTag, requeue);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.bindExchange(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  src: RawUTF8;
  dst: RawUTF8;
  pattern: RawUTF8;
begin
  try
    Result := True;
    if (argc < 3) or (argc > 4) then
      raise ESMException.Create('Binding amqp exchanges requires three or four parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isString then begin
      dst := argv[0].asJSString.ToUTF8(cx);
      src := argv[1].asJSString.ToUTF8(cx);
      pattern := argv[2].asJSString.ToUTF8(cx);
      if argc = 4 then
        args := TSMAmqpTable.FromJSVal(cx, argv[3],
          'While binding amqp exchanges the fourth argument must be an amqp table if provided');
    end else
      raise ESMException.Create('Invalid argument types while binding amqp exchanges');
    BindExchange(dst, src, pattern, args);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.bindQueue(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  qname: RawUTF8;
  exchangeName: RawUTF8 = '';
  routingKey: RawUTF8 = '';
begin
  try
    Result := True;
    if (argc < 3) or (argc > 4) then
      raise ESMException.Create('Binding to an amqp queue requires three or four parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isString then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      exchangeName := argv[1].asJSString.ToUTF8(cx);
      routingKey := argv[2].asJSString.ToUTF8(cx);
      if argc = 4 then
        args := TSMAmqpTable.FromJSVal(cx, argv[3],
          'While binding to an amqp queue the fourth argument must be an amqp table if provided');
    end else
      raise ESMException.Create('Invalid argument types while binding to an amqp queue');
    BindQueue(qname, exchangeName, routingKey, args);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.declareExchange(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  ename: RawUTF8;
  etype: RawUTF8;
  passive: Boolean;
  durable: Boolean;
  autodelete: Boolean;
  internal: Boolean;
begin
  try
    Result := True;
    if (argc < 6) or (argc > 7) then
      raise ESMException.Create('Declaring an amqp exchange requires six or seven parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isBoolean and argv[3].isBoolean and argv[4].isBoolean and argv[5].isBoolean then begin
      ename := argv[0].asJSString.ToUTF8(cx);
      etype := argv[1].asJSString.ToUTF8(cx);
      passive := argv[2].asBoolean;
      durable := argv[3].asBoolean;
      autoDelete := argv[4].asBoolean;
      internal := argv[5].asBoolean;
      if argc = 7 then
        args := TSMAmqpTable.FromJSVal(cx, argv[6],
          'While declaring an amqp exchange the seventh argument must be an object if provided');
    end else
      raise ESMException.Create('Invalid argument types while declaring an amqp exchange');
    DeclareExchange(ename, etype, passive, durable, autodelete, internal, args);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.declareQueue(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  qname: RawUTF8;
  passive: Boolean;
  durable: Boolean;
  exclusive: Boolean;
  autoDelete: Boolean;
  msg_count, consumer_count: UInt32;
  obj: PJSRootedObject;
begin
  try
    Result := True;
    if (argc < 5) or (argc > 6) then
      raise ESMException.Create('Declaring an amqp queue requires five or six parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isBoolean and argv[2].isBoolean and argv[3].isBoolean and argv[4].isBoolean then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      passive := argv[1].asBoolean;
      durable := argv[2].asBoolean;
      exclusive := argv[3].asBoolean;
      autoDelete := argv[4].asBoolean;
      if argc = 6 then
        args := TSMAmqpTable.FromJSVal(cx, argv[5],
          'While declaring an amqp queue the sixth argument must be an object if provided');
    end else
      raise ESMException.Create('Invalid argument types while declaring an amqp queue');
    qname := DeclareQueue(qname, msg_count, consumer_count, passive, durable, exclusive, autoDelete, args);
    obj := cx.NewRootedObject(cx.NewObject(nil));
    try
      obj.ptr.DefineProperty(cx, 'queue',
        cx.NewJSString(qname).ToJSVal, JSPROP_ENUMERATE, nil, nil);
      obj.ptr.DefineProperty(cx, 'messageCount',
        msg_count.ToJSVal, JSPROP_ENUMERATE, nil, nil);
      obj.ptr.DefineProperty(cx, 'consumerCount',
        consumer_count.ToJSVal, JSPROP_ENUMERATE, nil, nil);
      vp.rval := obj.ptr.ToJSValue;
    finally
      cx.FreeRootedObject(obj);
    end;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.deleteExchange(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  ename: RawUTF8;
  ifUnused: Boolean;
begin
  try
    Result := True;
    if argc <> 2 then
      raise ESMException.Create('Deleting an amqp exchange requires two parameters');
    argv := vp.argv;
    if argv[0].isString and argv[1].isBoolean then begin
      ename := argv[0].asJSString.ToUTF8(cx);
      ifUnused := argv[1].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types to delete an amqp exchange');
    DeleteExchange(ename, ifUnused);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.deleteQueue(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  qname: RawUTF8;
  ifUnused: Boolean;
  ifEmpty: Boolean;
begin
  try
    Result := True;
    if argc <> 3 then
      raise ESMException.Create('Deleting an amqp queue requires three parameters');
    argv := vp.argv;
    if argv[0].isString and argv[1].isBoolean and argv[2].isBoolean then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      ifUnused := argv[1].asBoolean;
      ifEmpty := argv[2].asBoolean;
    end else
      raise ESMException.Create('Invalid argument types to delete an amqp queue');
    vp.rval := DeleteQueue(qname, ifUnused, ifEmpty).ToJSVal;
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.purgeQueue(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  qname: RawUTF8;
begin
  try
    Result := True;
    if (argc <> 1) then
      raise ESMException.Create('Purging an amqp queue requires one parameter');
    argv := vp.argv;
    if argv[0].isString then begin
      qname := argv[0].asJSString.ToUTF8(cx);
    end else
      raise ESMException.Create('Invalid argument type for purging an amqp queue');
    PurgeQueue(qname);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.unbindExchange(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  src: RawUTF8;
  dst: RawUTF8;
  pattern: RawUTF8;
begin
  try
    Result := True;
    if (argc < 3) or (argc > 4) then
      raise ESMException.Create('Unbinding amqp exchanges requires three or four parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isString then begin
      dst := argv[0].asJSString.ToUTF8(cx);
      src := argv[1].asJSString.ToUTF8(cx);
      pattern := argv[2].asJSString.ToUTF8(cx);
      if argc = 4 then
        args := TSMAmqpTable.FromJSVal(cx, argv[3],
          'While unbinding amqp exchanges the fourth argument must be an amqp table if provided');
    end else
      raise ESMException.Create('Invalid argument types while unbinding amqp exchanges');
    UnbindExchange(dst, src, pattern, args);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

function TSMAmqpChannel.unbindQueue(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): Boolean; cdecl;
var
  argv: PjsvalVector;
  args: TAmqpTable;
  qname: RawUTF8;
  ename: RawUTF8;
  rk: RawUTF8;
begin
  try
    Result := True;
    if (argc < 3) or (argc > 4) then
      raise ESMException.Create('Unbinding amqp queue requires three or four parameters');
    argv := vp.argv;
    args := nil;
    if argv[0].isString and argv[1].isString and argv[2].isString then begin
      qname := argv[0].asJSString.ToUTF8(cx);
      ename := argv[1].asJSString.ToUTF8(cx);
      rk := argv[2].asJSString.ToUTF8(cx);
      if argc = 4 then
        args := TSMAmqpTable.FromJSVal(cx, argv[3],
          'While unbinding amqp queue the fourth argument must be an amqp table if provided');
    end else
      raise ESMException.Create('Invalid argument types while unbinding amqp queue');
    UnbindQueue(qname, ename, rk, args);
  except
    on E: Exception do begin
      Result := False;
      vp.rval := JSVAL_VOID;
      JSError(cx, E);
    end;
  end;
end;

{ TAmqpBytesHelper }

function TAmqpBytesHelper.ToJSString(cx: PJSContext): PJSString;
var
  chars: PAnsiChar;
begin
  if len > 0 then
    chars := Self.bytes
  else
    chars := nil;
  Result := cx.NewJSString(chars, Self.len, CP_UTF8);
end;

function TAmqpBytesHelper.ToArrayBuffer(cx: PJSContext): PJSObject;
begin
  Result := cx.NewArrayBuffer(Self.len);
  MoveFast(Self.bytes^, Result.GetArrayBufferData()^, Self.len);
end;

{ TBooleanHelper }

function TBooleanHelper.ToJSVal: jsval;
begin
  Result.asBoolean := Self;
end;

{ TIntegerHelper }

function TIntegerHelper.ToJSVal: jsval;
begin
  Result.asInteger := Self;
end;

{ TUInt8Helper }

function TUInt8Helper.ToJSVal: jsval;
begin
  Result.asInteger := Self;
end;

{ TUInt16Helper }

function TUInt16Helper.ToJSVal: jsval;
begin
  Result.asInteger := Self;
end;

{ TUInt32Helper }

function TUInt32Helper.ToJSVal: jsval;
begin
  Result.asInteger := Self;
end;

{ TUInt64Helper }

function TUInt64Helper.ToJSVal: jsval;
begin
  Result.asInt64 := Self;
end;

{ TAmqpTableProto }

function TAmqpTableProto.NewSMInstance(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): TObject;
var
  argv: PjsvalVector;
  size: size_t;
begin
  if argc <> 1 then
    raise ESMException.Create('Amqp table constructor requres one argument');
  argv := vp.argv;
  if argv[0].isInteger and (argv[0].asInteger > 0) then
    size := argv[0].asInteger
  else
    raise ESMException.Create('The parameter (size) must be a positive integer');
  Result := TSMAmqpTable.Create(size);
end;

class procedure TAmqpTableProto.RegisterClass(cx: PJSContext;
  AParent: PJSRootedObject);
begin
  defineClass(cx, TSMAmqpTable, Self, AParent);
end;

{ TAmqpConnectionProto }

function TAmqpConnectionProto.NewSMInstance(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): TObject;
var
  argv: PjsvalVector;
  host: AnsiString = '127.0.0.1';
  port: Integer = -1;
  username: AnsiString = 'guest';
  password: AnsiString = 'guest';
  vhost: AnsiString = '/';
  useSSL: Boolean = False;
  pathToCACert: AnsiString = '';
  pathToClientKey: AnsiString = '';
  pathToClientCert: AnsiString = '';
  frameMax: Integer = 131072;
  verifyHostname: Boolean = True;
begin
  if (argc <> 11) then
    raise ESMException.Create('Amqp connection constructor requires exactly 11 parameters');
  argv := vp.argv;
  if argv[0].isString then
    host := argv[0].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (host) must be a string');
  if argv[1].isInteger then
    port := argv[1].asInteger
  else
    raise ESMException.Create('The second parameter (port) must be an integer');
  if argv[2].isString then
    username := argv[2].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (username) must be a string');
  if argv[3].isString then
    password := argv[3].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (password) must be a string');
  if argv[4].isString then
    vhost := argv[4].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (vhost) must be a string');
  if argv[5].isBoolean then
    useSSL := argv[5].asBoolean
  else
    raise ESMException.Create('The first parameter (ssl) must be a string');
  if argv[6].isString then
    pathToCACert := argv[6].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (pathToCACert) must be a string');
  if argv[7].isString then
    pathToClientKey := argv[7].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (pathToClientKey) must be a string');
  if argv[8].isString then
    pathToClientCert := argv[8].asJSString.ToUTF8(cx)
  else
    raise ESMException.Create('The first parameter (pathToClientCert) must be a string');
  if argv[9].isInteger then
    frameMax := argv[9].asInteger
  else
    raise ESMException.Create('The first parameter (frameMax) must be a string');
  if argv[10].isBoolean then
    verifyHostname := argv[10].asBoolean
  else
    raise ESMException.Create('The first parameter (verifyHostname) must be a string');
  if port < 0 then
    if useSSL then port := 5671 else port := 5672;
  if port > 65535 then
    raise ERangeError.Create(
      'Invalid port specified (%d), must be in range 0..65535 or -1 as special "default" value');
  Result := TSMAmqpConnection.Create(
    host, port, username, password, vhost,
    useSSL, pathToCACert, pathToClientKey, pathToClientCert,
    frameMax, verifyHostname);
end;

class procedure TAmqpConnectionProto.RegisterClass(cx: PJSContext;
  AParent: PJSRootedObject);
begin
  defineClass(cx, TSMAmqpConnection, Self, AParent);
end;

{ TAmqpChannelProto }

function TAmqpChannelProto.NewSMInstance(cx: PJSContext; argc: uintN;
  var vp: JSArgRec): TObject;
var
  inst: PSMInstanceRecord;
begin
  if (argc <> 1) then
    raise ESMException.Create('Amqp channel constructor requires exactly 1 parameter');
  if vp.argv[0].isObject and IsInstanceObject(cx, vp.argv[0], inst) and
     (inst.instance is TSMAmqpConnection) then
    Result := TSMAmqpChannel.Create(TAmqpConnection(inst.instance))
  else
    raise EArgumentException.Create(
      'Amqp channel constructor requires TSMAmqpConntection instance as the argument');
end;

class procedure TAmqpChannelProto.RegisterClass(cx: PJSContext;
  AParent: PJSRootedObject);
begin
  defineClass(cx, TSMAmqpChannel, Self, AParent);
end;

{ TAmqpBasicMessageHelper }

function TAmqpBasicMessageHelper.ToJSObject(cx: PJSContext): PJSObject;
var
  obj: PJSRootedObject;
  vo: PJSObject;
begin
  obj := cx.NewRootedObject(cx.NewObject(nil));
  try
    obj.ptr.DefineProperty(cx, 'content',
      Self.Body.ToArrayBuffer(cx).ToJSValue, JSPROP_ENUMERATE, nil, nil);
    vo := cx.NewObject(nil);
    vo.DefineProperty(cx, 'deliveryChannel',
      Self.DeliveryInfo.DeliveryChannel.ToJSVal, JSPROP_ENUMERATE, nil, nil);
    //deliveryTag, a serial deliveryTag for the message;
    vo.DefineProperty(cx, 'deliveryTag',
      Self.DeliveryInfo.DeliveryTag.ToJSVal, JSPROP_ENUMERATE, nil, nil);
    //consumerTag, identifying the consumer for which the message is destined;
    vo.DefineProperty(cx, 'consumerTag',
      Self.DeliveryInfo.ConsumerTag.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    //exchange and routingKey giving the routing information with which the message was published;
    vo.DefineProperty(cx, 'exchange',
      Self.DeliveryInfo.Exchange.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    vo.DefineProperty(cx, 'routingKey',
      Self.DeliveryInfo.RoutingKey.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    //redelivered, which if true indicates that this message has been delivered before and been handed back to the server (e.g., by a nack or recover operation)
    vo.DefineProperty(cx, 'redelivered',
      Self.DeliveryInfo.Redelivered.ToJSVal, JSPROP_ENUMERATE, nil, nil);
    obj.ptr.DefineProperty(cx, 'fields', vo.ToJSValue, JSPROP_ENUMERATE, nil, nil);
    vo := cx.NewObject(nil);
    if Self.IsContentTypeSet then
      vo.DefineProperty(cx, 'contentType',
        Self.ContentType.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsExpirationSet then
      vo.DefineProperty(cx, 'expiration',
        Self.Expiration.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsUserIdSet then
      vo.DefineProperty(cx, 'userId',
        Self.UserId.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsPrioritySet then
      vo.DefineProperty(cx, 'priority',
        Self.Priority.ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsDeliveryModeSet then
      vo.DefineProperty(cx, 'deliveryMode',
        Ord(Self.DeliveryMode).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsContentEncodingSet then
      vo.DefineProperty(cx, 'contentEncoding',
        Self.ContentEncoding.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsHeaderTableSet then
      {vo.DefineProperty(cx, 'headers',
        Self..ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil) -- TODO: implement};
    if Self.IsCorrelationIdSet then
      vo.DefineProperty(cx, 'correlationId',
        Self.CorrelationId.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsReplyToSet then
      vo.DefineProperty(cx, 'replyTo',
        Self.ReplyTo.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsMessageIdSet then
      vo.DefineProperty(cx, 'messageId',
        Self.MessageId.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsTimestampSet then
      vo.DefineProperty(cx, 'timestamp',
        Self.Timestamp.ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsTypeSet then
      vo.DefineProperty(cx, 'type',
        Self.&Type.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    if Self.IsAppIdSet then
      vo.DefineProperty(cx, 'appId',
        Self.AppId.ToJSString(cx).ToJSVal, JSPROP_ENUMERATE, nil, nil);
    obj.ptr.DefineProperty(cx, 'properties', vo.ToJSValue, JSPROP_ENUMERATE, nil, nil);
    Result := obj.ptr;
  finally
    cx.FreeRootedObject(obj);
  end;
end;

end.

