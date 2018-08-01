unit UBAmqpErrors;

interface

uses
  Classes,
  SysUtils,
  rabbitmq,
  UBAmqpBasicMessage;

type
  { EBadUriException }

  EBadUriException = class(Exception)
  public
    constructor Create();
  end;

  { EAmqpLibraryException }

  EAmqpLibraryException = class(Exception)
  private
    FErrorCode: Integer;
  public
    constructor Create(AErrorCode: Integer); overload;
    constructor Create(AErrorCode: Integer; const AContext: String); overload;
    property ErrorCode: Integer read FErrorCode;
  end;

  { EAmqpMessageReturnedException }

  EAmqpMessageReturnedException = class(Exception)
  private
    FMessage: TAmqpBasicMessage;
    FReplyCode: uint32;
    FReplyText: AnsiString;
    FExchange: AnsiString;
    FRoutingKey: AnsiString;
    {mutable} FWhat: AnsiString;
  public
    constructor Create(
      const AMessage: TAmqpBasicMessage;
      AReplyCode: UInt32; const AReplyText: AnsiString;
      const AExchange: AnsiString; const ARoutingKey: AnsiString);

    property Message: TAmqpBasicMessage read FMessage;
    property ReplyCode: UInt32 read FReplyCode;
    property ReplyText: AnsiString read FReplyText;
    property Exchange: AnsiString read FExchange;
    property RoutingKey: AnsiString read FRoutingKey;
  end;

  { EAmqpConsumerTagNotFoundException }

  EAmqpConsumerTagNotFoundException = class(Exception)
  public
    constructor Create();
  end;

  { EAmqpConsumerCancelledException }

  EAmqpConsumerCancelledException = class(Exception)
  private
    FConsumerTag: AnsiString;
  public
    constructor Create(AConsumerTag: AnsiString);
    property ConsumerTag: AnsiString read FConsumerTag;
  end;

  { EAmqpResponseLibraryException }

  EAmqpResponseLibraryException = class(Exception)
  public
    constructor Create(
      const AReply: amqp_rpc_reply_t_; const AContext: AnsiString);
  end;

  { EAmqpConnectionClosedException }

  EAmqpConnectionClosedException = class(Exception)
  public
    constructor Create();
  end;

  { EAmqpException }

  EAmqpException = class(Exception)
  protected
    FClassId: UInt16;
    FMethodId: UInt16;
    FReplyText: AnsiString;
    function GetClassId(): UInt16; virtual;
    function GetMethodId(): UInt16; virtual;
    function GetReplyCode(): UInt16; virtual; abstract;
    function GetReplyText(): String; virtual;
  public
    class procedure Throw(const AReply: amqp_rpc_reply_t); overload;
    class procedure Throw(const AReply: pamqp_channel_close_t); overload;
    class procedure Throw(const AReply: pamqp_connection_close_t); overload;

    constructor Create(const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);

    function IsSoftError(): Boolean; virtual; abstract;

    property ReplyCode: UInt16 read GetReplyCode;
    property ClassId: UInt16 read GetClassId;
    property MethodId: UInt16 read GetMethodId;
    property ReplyText: AnsiString read GetReplyText;
  end;

  { EAmqpConnectionException }

  EAmqpConnectionException = class(EAmqpException)
  public
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
    function IsSoftError(): Boolean; override;
  end;

  { EAmqpChannelException }

  EAmqpChannelException = class(EAmqpException)
  public
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
    function IsSoftError(): Boolean; override;
  end;

  { EAmqpConnectionForcedException }

  EAmqpConnectionForcedException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_CONNECTION_FORCED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpInvalidPathException }

  EAmqpInvalidPathException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_INVALID_PATH;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpFrameErrorException }

  EAmqpFrameErrorException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_FRAME_ERROR;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpSyntaxErrorException }

  EAmqpSyntaxErrorException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_SYNTAX_ERROR;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpCommandInvalidException }

  EAmqpCommandInvalidException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_COMMAND_INVALID;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpChannelErrorException }

  EAmqpChannelErrorException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_CHANNEL_ERROR;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpUnexpectedFrameException }

  EAmqpUnexpectedFrameException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_UNEXPECTED_FRAME;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpResourceErrorException }

  EAmqpResourceErrorException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_RESOURCE_ERROR;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpNotAllowedException }

  EAmqpNotAllowedException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_NOT_ALLOWED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpNotImplementedException }

  EAmqpNotImplementedException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_NOT_IMPLEMENTED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpInternalErrorException }

  EAmqpInternalErrorException = class(EAmqpConnectionException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_INTERNAL_ERROR;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpContentTooLargeException }

  EAmqpContentTooLargeException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_CONTENT_TOO_LARGE;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpNoRouteException }

  EAmqpNoRouteException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_NO_ROUTE;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpNoConsumersException }

  EAmqpNoConsumersException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_NO_CONSUMERS;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpAccessRefusedException }

  EAmqpAccessRefusedException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_ACCESS_REFUSED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpNotFoundException }

  EAmqpNotFoundException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_NOT_FOUND;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpResourceLockedException }

  EAmqpResourceLockedException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_RESOURCE_LOCKED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

  { EAmqpPreconditionFailedException }

  EAmqpPreconditionFailedException = class(EAmqpChannelException)
  protected
    function GetReplyCode(): UInt16; override;
  public
    const REPLY_CODE = AMQP_PRECONDITION_FAILED;
    constructor Create(
      const AWhat: AnsiString; const AReplyText: AnsiString;
      AClassId: UInt16; AMethodId: UInt16);
  end;

implementation

{ EBadUriException }

constructor EBadUriException.Create();
begin
  inherited Create('URI is malformed');
end;

{ EAmqpLibraryException }

constructor EAmqpLibraryException.Create(AErrorCode: Integer);
begin
  Create(AErrorCode, '');
end;

constructor EAmqpLibraryException.Create(AErrorCode: Integer;
  const AContext: String);
var
  Msg: String;
begin
  FErrorCode := AErrorCode;
  if AContext <> '' then
    Msg := Format('%s: %s', [AContext, amqp_error_string2(AErrorCode)])
  else
    Msg := String(amqp_error_string2(AErrorCode));
  inherited Create(Msg);
end;

{ EAmqpMessageReturnedException }

constructor EAmqpMessageReturnedException.Create(
  const AMessage: TAmqpBasicMessage; AReplyCode: UInt32;
  const AReplyText: AnsiString; const AExchange: AnsiString;
  const ARoutingKey: AnsiString);
begin

end;

{ EAmqpConsumerTagNotFoundException }

constructor EAmqpConsumerTagNotFoundException.Create();
begin
  inherited Create('The specified consumer tag is unknown');
end;

{ EAmqpConsumerCancelledException }

constructor EAmqpConsumerCancelledException.Create(AConsumerTag: AnsiString);
begin
  inherited CreateFmt('Consumer was cancelled: %s', [AConsumerTag]);
  FConsumerTag := AConsumerTag;
end;

{ EAmqpResponseLibraryException }

constructor EAmqpResponseLibraryException.Create(
  const AReply: amqp_rpc_reply_t_; const AContext: AnsiString);
begin
  if AContext <> '' then
    inherited CreateFmt('%s: %s',
      [AContext, amqp_error_string2(AReply.library_error)])
  else
    inherited Create(amqp_error_string2(AReply.library_error));
end;

{ EAmqpConnectionClosedException }

constructor EAmqpConnectionClosedException.Create();
begin
  inherited Create('Connection is closed');
end;

{ EAmqpException }

function EAmqpException.GetClassId: UInt16;
begin
  Result := FClassId;
end;

function EAmqpException.GetMethodId: UInt16;
begin
  Result := FMethodId;
end;

function EAmqpException.GetReplyText: AnsiString;
begin
  Result := FReplyText;
end;

class procedure EAmqpException.Throw(const AReply: amqp_rpc_reply_t);
begin
  Assert(AReply.reply_type = AMQP_RESPONSE_SERVER_EXCEPTION);
  case AReply.reply.id of
    AMQP_CONNECTION_CLOSE_METHOD:
      Throw(pamqp_connection_close_t(AReply.reply.decoded));
    AMQP_CHANNEL_CLOSE_METHOD:
      Throw(pamqp_channel_close_t(AReply.reply.decoded));
    else
      raise EInvalidOpException.CreateFmt(
        'Programming error: unknown server exception class/method %d',
        [AReply.reply.id]);
  end;
end;

class procedure EAmqpException.Throw(const AReply: pamqp_channel_close_t);
var
  what: String;
  reply_text: String;
  method_name: PAnsiChar;
begin
  what := '';
  if Assigned(AReply.reply_text.bytes) then
    SetString(reply_text,
      PAnsiChar(AReply.reply_text.bytes), AReply.reply_text.len);

  method_name := amqp_method_name((AReply.class_id shl 16) or AReply.method_id);
  if Assigned(method_name) then
    what := Format('channel error: %d: %s caused: %s',
      [AReply.reply_code, method_name, reply_text])
  else
    what := Format('channel error: %d: %s', [AReply.reply_code, reply_text]);

  case AReply.reply_code of
    EAmqpContentTooLargeException.REPLY_CODE:
      raise EAmqpContentTooLargeException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpNoRouteException.REPLY_CODE:
      raise EAmqpNoRouteException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpNoConsumersException.REPLY_CODE:
      raise EAmqpNoConsumersException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpAccessRefusedException.REPLY_CODE:
      raise EAmqpAccessRefusedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpNotFoundException.REPLY_CODE:
      raise EAmqpNotFoundException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpResourceLockedException.REPLY_CODE:
      raise EAmqpResourceLockedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpPreconditionFailedException.REPLY_CODE:
      raise EAmqpPreconditionFailedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    else
      raise EInvalidOpException.CreateFmt(
        'Programming error: unknown channel reply code: %d',
        [AReply.reply_code]);
  end;
end;

class procedure EAmqpException.Throw(const AReply: pamqp_connection_close_t);
var
  what: String;
  reply_text: String;
  method_name: PAnsiChar;
begin
  method_name := amqp_method_name(((AReply.class_id shl 16) or AReply.method_id));

  if Assigned(AReply.reply_text.bytes) then
    SetString(reply_text,
      PAnsiChar(AReply.reply_text.bytes), AReply.reply_text.len);

  if Assigned(method_name) then
    what:= Format('connection error: %d: %s caused: %s',
      [AReply.reply_code, method_name, reply_text])
  else
    what := Format('connection error: %d: %s', [AReply.reply_code, reply_text]);

  case AReply.reply_code of
    EAmqpConnectionForcedException.REPLY_CODE:
      raise EAmqpConnectionForcedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpInvalidPathException.REPLY_CODE:
      raise EAmqpInvalidPathException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpFrameErrorException.REPLY_CODE:
      raise EAmqpFrameErrorException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpSyntaxErrorException.REPLY_CODE:
      raise EAmqpSyntaxErrorException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpCommandInvalidException.REPLY_CODE:
      raise EAmqpCommandInvalidException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpChannelErrorException.REPLY_CODE:
      raise EAmqpChannelErrorException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpUnexpectedFrameException.REPLY_CODE:
      raise EAmqpUnexpectedFrameException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpResourceErrorException.REPLY_CODE:
      raise EAmqpResourceErrorException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpNotAllowedException.REPLY_CODE:
      raise EAmqpNotAllowedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpNotImplementedException.REPLY_CODE:
      raise EAmqpNotImplementedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpInternalErrorException.REPLY_CODE:
      raise EAmqpInternalErrorException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    EAmqpAccessRefusedException.REPLY_CODE:
      raise EAmqpAccessRefusedException.Create(
        what, reply_text, AReply.class_id, AReply.method_id);
    else
      raise EInvalidOpException.CreateFmt(
        'Programming error: unknown connection reply code: %d',
        [AReply.reply_code]);
  end;
end;

constructor EAmqpException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat);
  FReplyText := AReplyText;
  FClassId := AClassId;
  FMethodId := AMethodId;
end;

{ EAnqpConnectionException }

constructor EAmqpConnectionException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpConnectionException.IsSoftError(): Boolean;
begin
  Result := False;
end;

{ EAmqpChannelException }

constructor EAmqpChannelException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpChannelException.IsSoftError();
begin
  Result := True;
end;

{ EAmqpConnectionForcedException }

constructor EAmqpConnectionForcedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpConnectionForcedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpInvalidPathException }

constructor EAmqpInvalidPathException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpInvalidPathException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpFrameErrorException }

constructor EAmqpFrameErrorException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpFrameErrorException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpSyntaxErrorException }

constructor EAmqpSyntaxErrorException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpSyntaxErrorException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpCommandInvalidException }

constructor EAmqpCommandInvalidException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpCommandInvalidException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpChannelErrorException }

constructor EAmqpChannelErrorException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpChannelErrorException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpUnexpectedFrameException }

constructor EAmqpUnexpectedFrameException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpUnexpectedFrameException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpResourceErrorException }

constructor EAmqpResourceErrorException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpResourceErrorException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpNotAllowedException }

constructor EAmqpNotAllowedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpNotAllowedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpNotImplementedException }

constructor EAmqpNotImplementedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpNotImplementedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpInternalErrorException }

constructor EAmqpInternalErrorException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpInternalErrorException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpContentTooLargeException }

constructor EAmqpContentTooLargeException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpContentTooLargeException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpNoRouteException }

constructor EAmqpNoRouteException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpNoRouteException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpNoConsumersException }

constructor EAmqpNoConsumersException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpNoConsumersException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpAccessRefusedException }

constructor EAmqpAccessRefusedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpAccessRefusedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpNotFoundException }

constructor EAmqpNotFoundException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpNotFoundException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpResourceLockedException }

constructor EAmqpResourceLockedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpResourceLockedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

{ EAmqpPreconditionFailedException }

constructor EAmqpPreconditionFailedException.Create(const AWhat: AnsiString;
  const AReplyText: AnsiString; AClassId: UInt16; AMethodId: UInt16);
begin
  inherited Create(AWhat, AReplyText, AClassId, AMethodId);
end;

function EAmqpPreconditionFailedException.GetReplyCode(): UInt16;
begin
  Result := REPLY_CODE;
end;

end.

