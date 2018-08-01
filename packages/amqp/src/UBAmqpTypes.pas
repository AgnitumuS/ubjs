unit UBAmqpTypes;

interface

uses
  SysUtils,
  rabbitmq;

type

  { TAmqpBytes }

  TAmqpBytes = amqp_bytes_t;

  TAmqpBytesHelper = record helper for TAmqpBytes
    class function Empty: TAmqpBytes; static;
  end;

  TAmqpConnectionInfo = amqp_connection_info;

  { TAmqpConnectionInfo }

  TAmqpConnectionInfoHelper = record helper for TAmqpConnectionInfo
    class function FromUrl(const AUrl: AnsiString): TAmqpConnectionInfo; static;
  end;

implementation

uses
  UBAmqpErrors;

{ TAmqpBytesHelper }

class function TAmqpBytesHelper.Empty: TAmqpBytes;
begin
  Result := amqp_empty_bytes;
end;

{ TAmqpConnectionInfo }

class function TAmqpConnectionInfoHelper.FromUrl(
  const AUrl: AnsiString): TAmqpConnectionInfo;
begin
  amqp_default_connection_info(Result);
  if (0 <> amqp_parse_url(PAnsiChar(AUrl), Result)) then
    raise EBadUriException.Create();
end;

end.
