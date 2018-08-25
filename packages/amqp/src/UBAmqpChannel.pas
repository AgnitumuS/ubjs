unit UBAmqpChannel;

interface

uses
  SysUtils,
  Classes,
  rabbitmq,
  UBAmqpTable,
  UBAmqpConnection,
  UBAmqpBasicMessage;

type

  { TAmqpChannel }

  TAmqpChannel = class(TAmqpConnection.TChannel)
  private
    procedure CheckResult(AResult: Pointer);
  protected
    procedure CheckIsOpen;
  public
    procedure BasicAck(ADeliveryTag: UInt64);
    procedure BasicCancel(const AConsumerTag: AnsiString);
    function BasicConsume(const AQueueName: AnsiString;
      const AConsumerTag: AnsiString; ANoLocal: Boolean; ANoAck: Boolean;
      AExclusive: Boolean; AArguments: TAmqpTable): AnsiString;
    function BasicConsumeMessage(const AConsumerTag: AnsiString;
      ATimeoutSec: DWord = 0): TAmqpBasicMessage;
    function BasicGet(const AQueueName: AnsiString;
      ANoAck: Boolean): TAmqpBasicMessage;
    procedure BasicNack(ADeliveryTag: UInt64; ARequeue: Boolean);
    procedure BasicPublish(const AExchangeName: AnsiString;
      const ARoutingKey: AnsiString; AData: Pointer; ADataLen: size_t;
      AMandatory: Boolean; AImmediate: Boolean);
    procedure BasicQos(AMessagePrefetchCount: UInt16);
    procedure BasicRecover();
    procedure BasicReject(ADeliveryTag: UInt64; ARequeue: Boolean);
    procedure BindExchange(const ADestination: AnsiString;
      const ASource: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
    procedure BindQueue(const AQueueName: AnsiString;
      const AExchange: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
    procedure DeclareExchange(
      const AExchangeName: AnsiString; const AExchangeType: AnsiString;
      APassive: Boolean; ADurable: Boolean; AAutoDelete: Boolean;
      AInternal: Boolean; AArguments: TAmqpTable);
    function DeclareQueue(const AQueueName: AnsiString;
      out AMessageCount: UInt32; out AConsumerCount: UInt32; APassive: Boolean;
      ADurable: Boolean; AExclusive: Boolean; AAutoDelete: Boolean;
      AArguments: TAmqpTable): AnsiString;
    procedure DeleteExchange(const AExchangeName: AnsiString; AIfUnused: Boolean);
    function DeleteQueue(const AQueueName: AnsiString;
      AIfUnused: Boolean; AIfEmpty: Boolean): Integer;
    procedure PurgeQueue(const AQueueName: AnsiString);
    procedure UnbindExchange(const ADestination: AnsiString;
      const ASource: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
    procedure UnbindQueue(const AQueueName: AnsiString;
      const AExchangeName: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
  end;

implementation

uses
  SynCommons,
  UBAmqpTypes,
  UBAmqpErrors;

type

  { TAmqpMessage }

  TAmqpMessage = class(TAmqpBasicMessage)
  private
    FChannel: TAmqpChannel;
    FMessage: amqp_message_t;
    FDeliveryInfo: TDeliveryInfo;
  protected
    function GetDeliveryInfo: PDeliveryInfo; override;
    function GetMessage: pamqp_message_t; override;
  public
    constructor Create(AChannel: TAmqpChannel; const AMessage: amqp_message_t;
      ADeliveryTag: UInt64; ADeliveryChannel: UInt16;
      const AConsumerTag: TAmqpBytes; const AExchange: TAmqpBytes;
      const ARoutingKey: TAmqpBytes; ARedelivered: Boolean);
    destructor Destroy; override;
  end;

  { TAmqpEnvelope }

  TAmqpEnvelope = class(TAmqpBasicMessage)
  private
    FEnvelope: amqp_envelope_t;
    FDeliveryInfo: TDeliveryInfo;
  protected
    function GetDeliveryInfo: PDeliveryInfo; override;
    function GetMessage: pamqp_message_t; override;
  public
    constructor Create(const AEnvelope: amqp_envelope_t);
    destructor Destroy; override;
  end;

{ TAmqpMessage }

constructor TAmqpMessage.Create(AChannel: TAmqpChannel;
  const AMessage: amqp_message_t; ADeliveryTag: UInt64;
  ADeliveryChannel: UInt16; const AConsumerTag: TAmqpBytes;
  const AExchange: TAmqpBytes; const ARoutingKey: TAmqpBytes;
  ARedelivered: Boolean);
begin
  inherited Create;
  FChannel := AChannel;
  FMessage := AMessage;
  FDeliveryInfo.DeliveryTag := ADeliveryTag;
  FDeliveryInfo.DeliveryChannel := ADeliveryChannel;
  FDeliveryInfo.ConsumerTag := AConsumerTag;
  FDeliveryInfo.Exchange := AExchange;
  FDeliveryInfo.RoutingKey := ARoutingKey;
  FDeliveryInfo.Redelivered := ARedelivered;
end;

destructor TAmqpMessage.Destroy;
begin
  amqp_destroy_message(@FMessage);
  FChannel.MaybeReleaseBuffersOnChannel;
  inherited Destroy;
end;

function TAmqpMessage.GetDeliveryInfo: PDeliveryInfo;
begin
  Result := @FDeliveryInfo;
end;

function TAmqpMessage.GetMessage: pamqp_message_t;
begin
  Result := @FMessage;
end;

{ TAmqpEnvelope }

constructor TAmqpEnvelope.Create(const AEnvelope: amqp_envelope_t);
begin
  inherited Create;
  FEnvelope := AEnvelope;
  FDeliveryInfo.DeliveryTag := AEnvelope.delivery_tag;
  FDeliveryInfo.DeliveryChannel := AEnvelope.channel;
  FDeliveryInfo.ConsumerTag := AEnvelope.consumer_tag;
  FDeliveryInfo.Exchange := AEnvelope.exchange;
  FDeliveryInfo.RoutingKey := AEnvelope.routing_key;
  FDeliveryInfo.Redelivered := AEnvelope.redelivered <> 0;
end;

destructor TAmqpEnvelope.Destroy;
begin
  amqp_destroy_envelope(FEnvelope);
  inherited Destroy;
end;

function TAmqpEnvelope.GetDeliveryInfo: PDeliveryInfo;
begin
  Result := @FDeliveryInfo;
end;

function TAmqpEnvelope.GetMessage: pamqp_message_t;
begin
  Result := @FEnvelope.message;
end;

{ TAmqpChannel }

procedure TAmqpChannel.BasicAck(ADeliveryTag: UInt64);
begin
  CheckIsOpen();
  TAmqpConnection.CheckForError(amqp_basic_ack(
    AmqpConnection, Channel, ADeliveryTag, LongBool(False).ToInteger));
  MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.BasicCancel(const AConsumerTag: AnsiString);
var
  res: pamqp_basic_cancel_ok_t;
begin
  CheckIsOpen();
  res := amqp_basic_cancel(
    AmqpConnection, Channel, amqp_cstring_bytes(PAnsiChar(AConsumerTag)));
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

function TAmqpChannel.BasicConsume(const AQueueName: AnsiString;
  const AConsumerTag: AnsiString; ANoLocal: Boolean; ANoAck: Boolean;
  AExclusive: Boolean; AArguments: TAmqpTable): AnsiString;
var
  data: pamqp_basic_consume_ok_t;
begin
  CheckIsOpen();
  data := amqp_basic_consume(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)),
    amqp_cstring_bytes(PAnsiChar(AConsumerTag)),
    LongBool(ANoLocal).ToInteger, LongBool(ANoAck).ToInteger,
    LongBool(AExclusive).ToInteger, AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(data);
  SetString(Result, data.consumer_tag.bytes, data.consumer_tag.len);
end;

function TAmqpChannel.BasicConsumeMessage(
  const AConsumerTag: AnsiString; ATimeoutSec: DWord): TAmqpBasicMessage;
var
  ret: amqp_rpc_reply_t;
  envelope: amqp_envelope_t;
  frame: amqp_frame_t;
  tv: timeval;
  tvp: ptimeval;
begin
  CheckIsOpen();
  if ATimeoutSec = 0 then
    tvp := nil
  else begin
    tv.tv_sec := ATimeoutSec;
    tv.tv_usec:= 0;
    tvp := @tv;
  end;
  ret := amqp_consume_message(AmqpConnection, envelope, tvp, 0);
  if (AMQP_RESPONSE_NORMAL <> ret.reply_type) then begin
    if (AMQP_RESPONSE_LIBRARY_EXCEPTION = ret.reply_type) and
       (Ord(AMQP_STATUS_UNEXPECTED_STATE) = ret.library_error) then begin
      TAmqpConnection.CheckForError(
        amqp_simple_wait_frame(AmqpConnection, frame));
      if not ProcessStdMethods(frame) then
        raise EInvalidOperation.CreateFmt(
          'An unexpected method was received %h',
          [frame.payload.method.id]);
    end else
      CheckRpcReply(ret);
  end else
    Result := TAmqpEnvelope.Create(envelope);
end;

function TAmqpChannel.BasicGet(const AQueueName: AnsiString;
  ANoAck: Boolean): TAmqpBasicMessage;
var
  reply: amqp_rpc_reply_t;
  message: amqp_message_t;
begin
  CheckIsOpen();
  Result := nil;
  reply := amqp_basic_get(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)), LongBool(ANoAck).ToInteger);
  if reply.reply_type <> AMQP_RESPONSE_NONE then begin
    CheckRpcReply(reply);
    if reply.reply.id = AMQP_BASIC_GET_OK_METHOD then begin
      CheckRpcReply(amqp_read_message(AmqpConnection, Channel, message, 0));
      with pamqp_basic_get_ok_t(reply.reply.decoded)^ do
        Result := TAmqpMessage.Create(Self, message, delivery_tag, Channel,
          amqp_empty_bytes, exchange, routing_key, redelivered <> 0);
    end;
  end;
  // do not destroy buffers: MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.BasicNack(ADeliveryTag: UInt64; ARequeue: Boolean);
begin
  CheckIsOpen();
  TAmqpConnection.CheckForError(amqp_basic_nack(
    AmqpConnection, Channel, ADeliveryTag, LongBool(False).ToInteger,
    LongBool(ARequeue).ToInteger));
  MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.BasicPublish(const AExchangeName: AnsiString;
  const ARoutingKey: AnsiString; AData: Pointer; ADataLen: size_t;
  AMandatory: Boolean; AImmediate: Boolean);
var
  data: amqp_bytes_t;
  props: amqp_basic_properties_t;
  res: Integer;
  //response: amqp_frame_t;
  //message_returned: EAmqpMessageReturnedException;
begin
  CheckIsOpen();

  // TODO:
  data := amqp_bytes_malloc(ADataLen);
  if data.bytes = nil then
    raise EOutOfMemory.Create('');
  try
    Move(AData^, data.bytes^, ADataLen);

    props._flags := AMQP_BASIC_CONTENT_TYPE_FLAG or AMQP_BASIC_DELIVERY_MODE_FLAG;
    props.content_type := amqp_cstring_bytes('text/plain');
    props.delivery_mode := 2; // persistent delivery mode

    res := amqp_basic_publish(
      AmqpConnection, Channel, amqp_cstring_bytes(PAnsiChar(AExchangeName)),
      amqp_cstring_bytes(PAnsiChar(ARoutingKey)),
      LongBool(AMandatory).ToInteger, LongBool(AImmediate).ToInteger,
      @props, data);
  finally
    amqp_bytes_free(data);
  end;
  TAmqpConnection.CheckForError(res);

  // If we've done things correctly we can get one of 4 things back from the
  // broker
  // - basic.ack - our channel is in confirm mode, messsage was 'dealt with' by
  // the broker
  // - basic.return then basic.ack - the message wasn't delievered, but was
  // dealt with
  // - channel.close - probably tried to publish to a non-existant exchange, in
  // any case error!
  // - connection.clsoe - something really bad happened
  //const boost::array<boost::uint32_t, 2> PUBLISH_ACK = {
      {AMQP_BASIC_ACK_METHOD, AMQP_BASIC_RETURN_METHOD}
  //m_impl->GetMethodOnChannel(channels, response, PUBLISH_ACK);
  (*
  if AMQP_BASIC_RETURN_METHOD = response.payload.method.id then begin
    message_returned :=
      EAmqpMessageReturnedException.CreateFmt('Publish error', [])
        //(pamqp_basic_return_t(response.payload.method.decoded)), Channel);

    //const boost::array<boost::uint32_t, 1> BASIC_ACK = {
        {AMQP_BASIC_ACK_METHOD}
    //m_impl->GetMethodOnChannel(channels, response, BASIC_ACK);
    MaybeReleaseBuffersOnChannel();
    raise message_returned;
  end;*)
  MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.BasicQos(AMessagePrefetchCount: UInt16);
var
  res: pamqp_basic_qos_ok_t;
begin
  CheckIsOpen();
  res := amqp_basic_qos(AmqpConnection, Channel, 0, AMessagePrefetchCount,
    LongBool(BrokerHasNewQosBehavior).ToInteger);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

procedure TAmqpChannel.BasicRecover();
var
  res: pamqp_basic_recover_ok_t;
begin
  CheckIsOpen();
  res := amqp_basic_recover(AmqpConnection, Channel, LongBool(True).ToInteger);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

procedure TAmqpChannel.BasicReject(ADeliveryTag: UInt64; ARequeue: Boolean);
begin
  CheckIsOpen();
  TAmqpConnection.CheckForError(amqp_basic_reject(
    AmqpConnection, Channel, ADeliveryTag, LongBool(ARequeue).ToInteger));
  MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.BindExchange(const ADestination: AnsiString;
  const ASource: AnsiString; const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  res: pamqp_exchange_bind_ok_t;
begin
  CheckIsOpen();
  res := amqp_exchange_bind(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(ADestination)),
    amqp_cstring_bytes(PAnsiChar(ASource)),
    amqp_cstring_bytes(PAnsiChar(ARoutingKey)),
    AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

procedure TAmqpChannel.BindQueue(const AQueueName: AnsiString;
  const AExchange: AnsiString; const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  res: pamqp_queue_bind_ok_t;
begin
  CheckIsOpen();
  res := amqp_queue_bind(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)),
    amqp_cstring_bytes(PAnsiChar(AExchange)),
    amqp_cstring_bytes(PAnsiChar(ARoutingKey)), AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
  CheckRpcReply(amqp_get_rpc_reply(AmqpConnection));
end;

procedure TAmqpChannel.CheckResult(AResult: Pointer);
begin
  if not Assigned(AResult) then
    CheckRpcReply(amqp_get_rpc_reply(AmqpConnection));
end;

procedure TAmqpChannel.CheckIsOpen;
begin
  if Assigned(AmqpConnection) and (State = CS_Closed) then
    Open;
end;

procedure TAmqpChannel.DeclareExchange(const AExchangeName: AnsiString;
  const AExchangeType: AnsiString; APassive: Boolean; ADurable: Boolean;
  AAutoDelete: Boolean; AInternal: Boolean; AArguments: TAmqpTable);
var
  res: pamqp_exchange_declare_ok_t;
  reply: amqp_rpc_reply_t;
begin
  CheckIsOpen();
  res := amqp_exchange_declare(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AExchangeName)),
    amqp_cstring_bytes(PAnsiChar(AExchangeType)),
    LongBool(APassive).ToInteger, LongBool(ADurable).ToInteger,
    LongBool(AAutoDelete).ToInteger, LongBool(AInternal).ToInteger,
    AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

function TAmqpChannel.DeclareQueue(
  const AQueueName: AnsiString;
  out AMessageCount: UInt32; out AConsumerCount: UInt32;
  APassive: Boolean; ADurable: Boolean; AExclusive: Boolean;
  AAutoDelete: Boolean; AArguments: TAmqpTable): AnsiString;
var
  data: pamqp_queue_declare_ok_t;
begin
  CheckIsOpen();
  data := amqp_queue_declare(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)),
    LongBool(APassive).ToInteger, LongBool(ADurable).ToInteger,
    LongBool(AExclusive).ToInteger, LongBool(AAutoDelete).ToInteger,
    AArguments.AmqpTable);
  CheckRpcReply(amqp_get_rpc_reply(AmqpConnection));
  SetString(Result, data.queue.bytes, data.queue.len);
  AMessageCount := data.message_count;
  AConsumerCount := data.consumer_count;
  MaybeReleaseBuffersOnChannel();
end;

procedure TAmqpChannel.DeleteExchange(const AExchangeName: AnsiString;
  AIfUnused: Boolean);
var
  res: pamqp_exchange_delete_ok_t;
begin
  CheckIsOpen();
  res := amqp_exchange_delete(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AExchangeName)),
    LongBool(AIfUnused).ToInteger);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

function TAmqpChannel.DeleteQueue(const AQueueName: AnsiString;
  AIfUnused: Boolean; AIfEmpty: Boolean): Integer;
var
  data: pamqp_queue_delete_ok_t;
begin
  CheckIsOpen();
  data := amqp_queue_delete(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)),
    LongBool(AIfUnused).ToInteger, LongBool(AIfEmpty).ToInteger);
  MaybeReleaseBuffersOnChannel();
  CheckResult(data);
  Result := data.message_count
end;

procedure TAmqpChannel.PurgeQueue(const AQueueName: AnsiString);
var
  res: pamqp_queue_purge_ok_t;
begin
  CheckIsOpen();
  res := amqp_queue_purge(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)));
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

procedure TAmqpChannel.UnbindExchange(const ADestination: AnsiString;
  const ASource: AnsiString; const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  res: pamqp_exchange_unbind_ok_t;
begin
  CheckIsOpen();
  res := amqp_exchange_unbind(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(ADestination)),
    amqp_cstring_bytes(PAnsiChar(ASource)),
    amqp_cstring_bytes(PAnsiChar(ARoutingKey)),
    AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

procedure TAmqpChannel.UnbindQueue(const AQueueName: AnsiString;
  const AExchangeName: AnsiString; const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  res: pamqp_queue_unbind_ok_t;
begin
  CheckIsOpen();
  res := amqp_queue_unbind(AmqpConnection, Channel,
    amqp_cstring_bytes(PAnsiChar(AQueueName)),
    amqp_cstring_bytes(PAnsiChar(AExchangeName)),
    amqp_cstring_bytes(PAnsiChar(ARoutingKey)),
    AArguments.AmqpTable);
  MaybeReleaseBuffersOnChannel();
  CheckResult(res);
end;

end.

