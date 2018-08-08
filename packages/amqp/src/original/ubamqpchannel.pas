unit UBAmqpChannel;

interface

uses
  Classes,
  SysUtils,
  Math,
  Generics.Collections,
  SynCommons,
  RabbitMQ,
  UBAmqpBasicMessage,
  UBAmqpErrors,
  UBAmqpTable,
  UBAmqpEnvelope;

const
  EXCHANGE_TYPE_DIRECT = 'direct';
  EXCHANGE_TYPE_FANOUT = 'fanout';
  EXCHANGE_TYPE_TOPIC  = 'topic';

type
  { TAmqpChannel }

  TAmqpChannel = class
  private type

    { TAmqpChannelImpl }

    TAmqpChannelImpl = class
    private const
      BROKER_HEARTBEAT = 0;
    public type
      //channel_list_t = TArray<amqp_channel_t>;
      //channel_map_t = THashMap<amqp_channel_t, frame_queue_t>;
      ResponseListType = TArray<UInt32>;
      ChannelListType = TArray<amqp_channel_t>;
    private type
      channel_state_t = (
        CS_Closed = 0,
        CS_Open, CS_Used
        );
    private
      m_connection: amqp_connection_state_t;
      m_frame_queue: TList<amqp_frame_t>;
      m_delivered_messages: TList<TAmqpEnvelope>;
      m_consumer_channel_map: THashMap<AnsiString, amqp_channel_t>;
      m_channels: TList<channel_state_t>;
      m_brokerVersion: UInt32;
      // A channel that is likely to be an CS_Open state
      m_last_used_channel: amqp_channel_t;
      m_is_connected: Boolean;
      class function ComputeBrokerVersion(
        const AState: amqp_connection_state_t): UInt32;
    public
      constructor Create;
      destructor Destroy; override;
      procedure DoLogin(const AUsername: AnsiString;
        const APassword: AnsiString; const AVHost: AnsiString;
        AFrameMax: Integer);
      function GetChannel: amqp_channel_t;
      procedure ReturnChannel(AChannel: amqp_channel_t);
      function IsChannelOpen(AChannel: amqp_channel_t): Boolean;
      function GetNextFrameFromBroker(AFame: amqp_frame_t;
        ATimeout: Int64): Boolean;
      function CheckForQueuedMessageOnChannel(
        AChannel: amqp_channel_t): Boolean;
      procedure AddToFrameQueue(const AFrame: amqp_frame_t);
      function GetNextFrameFromBrokerOnChannel(const AChannels: ChannelListType;
        out AFrameOut: amqp_frame_t; ATimeout: Int64 = Int64.MaxValue): Boolean;
      function GetNextFrameOnChannel(
        AChannel: amqp_channel_t; out AFrame: amqp_frame_t;
        ATimeout: Int64 = Int64.MaxValue): Boolean;
      class function IsOnChannel(
        const AFrame: amqp_frame_t;
        const AChannel: amqp_channel_t): Boolean;
      class function IsFrameTypeOnChannel(const AFrame: amqp_frame_t;
        AFrameType: UInt8; const AChannel: amqp_channel_t): Boolean;
      class function IsMethodOnChannel(const AFrame: amqp_frame_t;
        AMethod: amqp_method_number_t; const AChannel: amqp_channel_t): Boolean;
      class function IsExpectedMethodOnChannel(const AFrame: amqp_frame_t;
        AChannels: ChannelListType; AExpectedResponses: ResponseListType): Boolean;
      function GetMethodOnChannel(
        AChannels: ChannelListType; AFrame: amqp_frame_t;
        AExpectedResponses: ResponseListType;
        ATimeout: Int64 = Int64.MaxValue): Boolean;
      function DoRpcOnChannel(
        AChannel: amqp_channel_t; AMethodId: UInt32;
        var ADecoded; AExpectedResponses: ResponseListType): amqp_frame_t;
      function DoRpc(
        AMethodId: UInt32; var ADecoded;
        AExpectedResponses: ResponseListType): amqp_frame_t;
      class function EnvelopeOnChannel(
        const AEnvelope: TAmqpEnvelope; AChannels: ChannelListType): Boolean;
      function ConsumeMessageOnChannel(AChannels: ChannelListType;
        out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
      function ConsumeMessageOnChannelInner(
        AChannels: ChannelListType; out AMessage: TAmqpEnvelope;
        ATimeout: Integer): Boolean;
      function CreateNewChannel(): amqp_channel_t;
      function GetNextChannelId(): amqp_channel_t;
      procedure CheckRpcReply(AChannel: amqp_channel_t;
        const AReply: amqp_rpc_reply_t);
      procedure CheckForError(ARet: Integer);
      procedure CheckFrameForClose(const AFrame: amqp_frame_t;
        AChannel: amqp_channel_t);
      procedure FinishCloseChannel(AChannel: amqp_channel_t);
      procedure FinishCloseConnection();
      function CreateMessageReturnedException(
        const AReturnMethod: amqp_basic_return_t;
        AChannel: amqp_channel_t): EAmqpMessageReturnedException;
      function ReadContent(AChannel: amqp_channel_t): TAmqpBasicMessage;
      procedure AddConsumer(const AConsumerTag: AnsiString; AChannel: amqp_channel_t);
      function RemoveConsumer(const AConsumerTag: AnsiString): amqp_channel_t;
      function GetConsumerChannel(const AConsumerTag: AnsiString): amqp_channel_t;
      function GetAllConsumerChannels(): TArray<amqp_channel_t>;
      procedure MaybeReleaseBuffersOnChannel(AChannel: amqp_channel_t);
      procedure CheckIsConnected();
      procedure SetIsConnected(AState: Boolean);

      // The RabbitMQ broker changed the way that basic.qos worked as of v3.3.0.
      // See: http://www.rabbitmq.com/consumer-prefetch.html
      // Newer versions of RabbitMQ basic.qos.global set to false applies to new
      // consumers made on the channel, and true applies to all consumers on the
      // channel (not connection).
      function BrokerHasNewQosBehavior(): Boolean;
    end;
  private
    m_impl: TAmqpChannelImpl;
  public
    constructor Create(
      const AHost: AnsiString = '127.0.0.1';
      APort: Integer = 5672;
      const AUsername: AnsiString = 'guest';
      const APassword: AnsiString = 'guest';
      const AVHost: AnsiString = '/';
      AUseSSL: Boolean = False;
      const APathToCACert: AnsiString = '';
      const APathToClientKey: AnsiString = '';
      const APathToClientCert: AnsiString = '';
      AFrameMax: Integer = 131072;
      AVerifyHostname: Boolean = True);
    destructor Destroy; override;
    class function CreateFromUri(
      const AUri: AnsiString;
      const APathToCACert: AnsiString;
      const APathToClientKey: AnsiString = '';
      const APathToClientCert: AnsiString = '';
      AVerifyHostname: Boolean = True;
      AFrameMax: Integer = 131072): TAmqpChannel;
    procedure DeclareExchange(
      const AExchangeName: AnsiString;
      const AExchangeType: AnsiString;
      APassive: Boolean;
      ADurable: Boolean;
      AAutoDelete: Boolean;
      AArguments: TAmqpTable);
    procedure DeleteExchange(const AExchangeName: AnsiString; AIfUnused: Boolean);
    procedure BindExchange(const ADestination: AnsiString;
      const ASource: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable); overload;
    procedure UnbindExchange(const ADestination: AnsiString;
      const ASource: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
    function DeclareQueue(const AQueueName: AnsiString; APassive: Boolean;
      ADurable: Boolean; AExclusive: Boolean; AAutoDelete: Boolean;
      AArguments: TAmqpTable): AnsiString; overload;
    function DeclareQueueWithCounts(const AQueueName: AnsiString; out
      AMessageCount: UInt32; out AConsumerCount: UInt32; APassive: Boolean;
      ADurable: Boolean; AExclusive: Boolean; AAutoDelete: Boolean;
      AArguments: TAmqpTable): AnsiString;
    procedure DeleteQueue(const AQueueName: AnsiString; AIfUnused: Boolean;
      AIfEmpty: Boolean);
    procedure BindQueue(const AQueueName: AnsiString;
      AArguments: TAmqpTable); overload;
    procedure BindQueue(const AQueueName: AnsiString;
      const AExchangeName: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable); overload;
    procedure UnbindQueue(const AQueueName: AnsiString;
      const AExchangeName: AnsiString; const ARoutingKey: AnsiString;
      AArguments: TAmqpTable);
    procedure PurgeQueue(const AQueueName: AnsiString);
    procedure BasicAck(const AMessage: TAmqpEnvelope); overload;
    procedure BasicAck(const AInfo: TAmqpEnvelope.TDeliveryInfo); overload;
    procedure BasicAck(const AInfo: TAmqpEnvelope.TDeliveryInfo;
      AMultiple: Boolean); overload;
    procedure BasicReject(const AMessage: TAmqpEnvelope;
      ARequeue: Boolean; AMultiple: Boolean); overload;
    procedure BasicReject(const AInfo: TAmqpEnvelope.TDeliveryInfo;
      ARequeue: Boolean; AMultiple: Boolean); overload;
    procedure BasicPublish(const AExchangeName: AnsiString;
      const ARoutingKey: AnsiString; const AMessage: TAmqpBasicMessage;
      AMandatory: Boolean; AImmediate: Boolean);
    function BasicGet(out AEnvelope: TAmqpEnvelope; const AQueue: AnsiString;
      ANoAck: Boolean): Boolean;
    procedure BasicRecover(const AConsumer: AnsiString);
    function BasicConsume(const AQueue: AnsiString; const AConsumerTag: AnsiString;
      ANoLocal: Boolean; ANoAck: Boolean; AExclusive: Boolean;
      AMessagePrefetchCount: UInt16; AArguments: TAmqpTable): AnsiString;
    procedure BasicQos(const AConsumerTag: AnsiString;
      AMessagePrefetchCount: UInt16);
    procedure BasicCancel(const AConsumerTag: AnsiString);
    function BasicConsumeMessage(
      const AConsumerTag: AnsiString): TAmqpEnvelope; overload;
    function BasicConsumeMessage(
      const AConsumerTags: array of AnsiString): TAmqpEnvelope; overload;
    function BasicConsumeMessage(): TAmqpEnvelope; overload;
    function BasicConsumeMessage(
      const AConsumerTag: AnsiString;
      out AMessage: TAmqpEnvelope; ATimeout: Integer = -1): Boolean; overload;
    function BasicConsumeMessage(
      AConsumerTags: array of AnsiString;
      out AMessage: TAmqpEnvelope; ATimeout: Integer = -1): Boolean; overload;
    function BasicConsumeMessage(
      out AMessage: TAmqpEnvelope; ATimeout: Integer = -1): Boolean; overload;
  end;


implementation

function BytesEqual(const r: amqp_bytes_t; const l: amqp_bytes_t): Boolean;
begin
  if (r.len = l.len) then
    if CompareMem(r.bytes, l.bytes, r.len) then
      Exit(True);
  Exit(False);
end;

{ TAmqpChannel.TAmqpChannelImpl }

constructor TAmqpChannel.TAmqpChannelImpl.Create;
begin
  inherited Create;
  m_frame_queue := TList<amqp_frame_t>.Create;
  m_delivered_messages := TList<TAmqpEnvelope>.Create;
  m_consumer_channel_map := THashMap<AnsiString, amqp_channel_t>.Create;
  m_channels := TList<channel_state_t>.Create;
  m_last_used_channel := 0;
  m_is_connected := False;
end;

destructor TAmqpChannel.TAmqpChannelImpl.Destroy;
begin
  FreeAndNil(m_frame_queue);
  FreeAndNil(m_delivered_messages);
  FreeAndNil(m_consumer_channel_map);
  FreeAndNil(m_channels);
  inherited Destroy;
end;

procedure TAmqpChannel.TAmqpChannelImpl.DoLogin(const AUsername: AnsiString;
  const APassword: AnsiString; const AVHost: AnsiString; AFrameMax: Integer);
var
  capabilties: array [0..0] of amqp_table_entry_t;
  capability_entry: amqp_table_entry_t;
  client_properties: amqp_table_t;
begin
  capabilties[0].key := amqp_cstring_bytes('consumer_cancel_notify');
  capabilties[0].value.kind := UInt8(AMQP_FIELD_KIND_BOOLEAN);
  capabilties[0].value.value.boolean := 1;

  capability_entry.key := amqp_cstring_bytes('capabilities');
  capability_entry.value.kind := UInt8(AMQP_FIELD_KIND_TABLE);
  capability_entry.value.value.table.num_entries := Length(capabilties);
  capability_entry.value.value.table.entries := capabilties;

  client_properties.num_entries := 1;
  client_properties.entries := @capability_entry;

  CheckRpcReply(0, amqp_login_with_properties(
      m_connection, PAnsiChar(AVHost), 0, AFrameMax,
      BROKER_HEARTBEAT, @client_properties, AMQP_SASL_METHOD_PLAIN,
      PAnsiChar(AUsername), PAnsiChar(APassword)));

  m_brokerVersion := ComputeBrokerVersion(m_connection);
end;

function TAmqpChannel.TAmqpChannelImpl.GetChannel: amqp_channel_t;
var
  idx: Integer;
begin
  if (m_last_used_channel < m_channels.Count) and
     (CS_Open = m_channels[m_last_used_channel]) then begin
    m_channels[m_last_used_channel] := CS_Used;
    Exit(m_last_used_channel);
  end;

  idx := m_channels.IndexOf(CS_Open);
  if idx < 0 then begin
    Result := CreateNewChannel();
    m_channels[Result] := CS_Used;
    Exit;
  end;

  m_channels[idx] := CS_Used;
  Result := idx;
end;

procedure TAmqpChannel.TAmqpChannelImpl.ReturnChannel(AChannel: amqp_channel_t);
begin
  m_channels[AChannel] := CS_Open;
  m_last_used_channel := AChannel;
end;

function TAmqpChannel.TAmqpChannelImpl.IsChannelOpen(AChannel: amqp_channel_t): Boolean;
begin
  Result := CS_Closed <> m_channels[AChannel];
end;

function TAmqpChannel.TAmqpChannelImpl.GetNextFrameFromBroker(
  AFame: amqp_frame_t; ATimeout: Int64): Boolean;
var
  tv_timeout: timeval;
  tvp: ptimeval;
  ret: Integer;
begin
  tvp := nil;
  FillChar(tv_timeout, sizeof(tv_timeout), #0);

  if ATimeout <> Int64.MaxValue then begin{
    // boost::chrono::seconds.count() returns boost::int_atleast64_t,
    // long can be 32 or 64 bit depending on the platform/arch
    // unless the timeout is something absurd cast to long will be ok, but
    // lets guard against the case where someone does something silly
    assert(
        boost::chrono::duration_cast<boost::chrono::seconds>(timeout).count() <
        static_cast<boost::chrono::seconds::rep>(
            std::numeric_limits<long>::max()));
    }
    DivMod(ATimeOut, 1000000, tv_timeout.tv_sec, tv_timeout.tv_usec);

    tvp := @tv_timeout;
  end;

  ret := amqp_simple_wait_frame_noblock(m_connection, AFame, tvp);

  if ret = Integer(AMQP_STATUS_TIMEOUT) then
    Exit(false);

  CheckForError(ret);
  Result := True;
end;

function TAmqpChannel.TAmqpChannelImpl.CheckForQueuedMessageOnChannel(
  AChannel: amqp_channel_t): Boolean;
var
  i, j, k: Integer;
  body_length: UInt64;
  body_received: UInt64;
begin
  for i := 0 to Pred(m_frame_queue.Count) do
    if TAmqpChannelImpl.IsMethodOnChannel(m_frame_queue[i], AMQP_BASIC_DELIVER_METHOD, AChannel) then
      for j := Succ(i) to Pred(m_frame_queue.Count) do
        if TAmqpChannelImpl.IsOnChannel(m_frame_queue[j], AChannel) then begin
          if m_frame_queue[j].frame_type <> AMQP_FRAME_HEADER then
            raise EInvalidOpException.Create('Protocol error');
          body_length := m_frame_queue[j].payload.properties.body_size;
          body_received := 0;
          k := Succ(j);
          while (body_received < body_length) and (k < m_frame_queue.Count) do begin
            if TAmqpChannelImpl.IsOnChannel(m_frame_queue[k], AChannel) then begin
              if m_frame_queue[k].frame_type <> AMQP_FRAME_BODY then
                raise EInvalidOpException.Create('Protocol error');
              Inc(body_received, m_frame_queue[k].payload.body_fragment.len);
            end;
            Inc(k);
          end;
          Result := body_received = body_length;
        end;
  Result := False;
end;

procedure TAmqpChannel.TAmqpChannelImpl.AddToFrameQueue(
  const AFrame: amqp_frame_t);
var
  channels: array of amqp_channel_t;
  envelope: TAmqpEnvelope;
begin
  m_frame_queue.Add(AFrame);

  if (CheckForQueuedMessageOnChannel(AFrame.channel)) then begin
    channels := [ AFrame.channel ];

    if not ConsumeMessageOnChannelInner(channels, envelope, -1) then
      raise EInvalidOpException.Create(
        'ConsumeMessageOnChannelInner returned false unexpectedly');

    m_delivered_messages.add(envelope);
  end;
end;

function TAmqpChannel.TAmqpChannelImpl.GetNextFrameFromBrokerOnChannel(
  const AChannels: ChannelListType; out AFrameOut: amqp_frame_t;
  ATimeout: Int64): Boolean;
begin(*
    boost::chrono::steady_clock::time_point end_point;
    boost::chrono::microseconds timeout_left = timeout;
    if (timeout != boost::chrono::microseconds::max()) {
      end_point = boost::chrono::steady_clock::now() + timeout;
    }

    amqp_frame_t frame;
    while (GetNextFrameFromBroker(frame, timeout_left)) {
      if (channels.end() !=
          std::find(channels.begin(), channels.end(), frame.channel)) {
        frame_out = frame;
        return true;
      }

      if (frame.channel == 0) {
        // Only thing we care to handle on the channel0 is the connection.close
        // method
        if (AMQP_FRAME_METHOD == frame.frame_type &&
            AMQP_CONNECTION_CLOSE_METHOD == frame.payload.method.id) {
          FinishCloseConnection();
          AmqpException::Throw(*reinterpret_cast<amqp_connection_close_t *>(
              frame.payload.method.decoded));
        }
      } else {
        AddToFrameQueue(frame);
      }

      if (timeout != boost::chrono::microseconds::max()) {
        boost::chrono::steady_clock::time_point now =
            boost::chrono::steady_clock::now();
        if (now >= end_point) {
          return false;
        }
        timeout_left =
            boost::chrono::duration_cast<boost::chrono::microseconds>(
                end_point - now);
      }
    }*)
  Result := False;
end;

function TAmqpChannel.TAmqpChannelImpl.GetNextFrameOnChannel(
  AChannel: amqp_channel_t; out AFrame: amqp_frame_t; ATimeout: Int64): Boolean;
var
  i: Integer;
  channels: array of amqp_channel_t;
begin
  for i := 0 to Pred(m_frame_queue.Count) do
    if TAmqpChannelImpl.IsOnChannel(m_frame_queue[i], AChannel) then begin
      AFrame := m_frame_queue[i];
      m_frame_queue.Delete(i);

      if (AMQP_FRAME_METHOD = AFrame.frame_type) and
         (AMQP_CHANNEL_CLOSE_METHOD = AFrame.payload.method.id) then begin
        FinishCloseChannel(AChannel);
        EAmqpException.Throw(pamqp_channel_close_t(AFrame.payload.method.decoded)^);
      end;
      Exit(True);
    end;

  channels := [ AChannel ];
  Result := GetNextFrameFromBrokerOnChannel(channels, AFrame, ATimeout);
end;

class function TAmqpChannel.TAmqpChannelImpl.IsOnChannel(
  const AFrame: amqp_frame_t; const AChannel: amqp_channel_t): Boolean;
begin
  Result := AChannel = AFrame.channel;
end;

class function TAmqpChannel.TAmqpChannelImpl.IsFrameTypeOnChannel(
  const AFrame: amqp_frame_t; AFrameType: UInt8; const AChannel: amqp_channel_t): Boolean;
begin
  Result := (AFrame.frame_type = AFrameType) and (AFrame.channel = AChannel);
end;

class function TAmqpChannel.TAmqpChannelImpl.IsMethodOnChannel(
  const AFrame: amqp_frame_t; AMethod: amqp_method_number_t;
  const AChannel: amqp_channel_t): Boolean;
begin
  Result := (AFrame.channel = AChannel) and
    (AFrame.frame_type = AMQP_FRAME_METHOD) and
    (AFrame.payload.method.id = AMethod);
end;

class function TAmqpChannel.TAmqpChannelImpl.IsExpectedMethodOnChannel(
  const AFrame: amqp_frame_t; AChannels: ChannelListType;
  AExpectedResponses: ResponseListType): Boolean;
var
  i, j: Integer;
begin
  Result := False;
  for i := Low(AChannels) to High(AChannels) do
    if AChannels[i] = AFrame.channel then begin
      if AMQP_FRAME_METHOD = AFrame.frame_type then
        for j := Low(AExpectedResponses) to High(AExpectedResponses) do
          if AExpectedResponses[i] = AFrame.payload.method.id then
            Exit(True);
      Exit(False);
    end;
end;

function TAmqpChannel.TAmqpChannelImpl.GetMethodOnChannel(
  AChannels: ChannelListType; AFrame: amqp_frame_t;
  AExpectedResponses: ResponseListType; ATimeout: Int64): Boolean;
begin
(*
    frame_queue_t::iterator desired_frame = std::find_if(
        m_frame_queue.begin(), m_frame_queue.end(),
        boost::bind(
            &ChannelImpl::is_expected_method_on_channel<ChannelListType,
                                                        ResponseListType>,
            _1, channels, expected_responses));

    if (m_frame_queue.end() != desired_frame) {
      frame = *desired_frame;
      m_frame_queue.erase(desired_frame);
      return true;
    }

    boost::chrono::steady_clock::time_point end_point;
    boost::chrono::microseconds timeout_left = timeout;
    if (timeout != boost::chrono::microseconds::max()) {
      end_point = boost::chrono::steady_clock::now() + timeout;
    }

    amqp_frame_t incoming_frame;
    while (GetNextFrameFromBrokerOnChannel(channels, incoming_frame,
                                           timeout_left)) {
      if (is_expected_method_on_channel(incoming_frame, channels,
                                        expected_responses)) {
        frame = incoming_frame;
        return true;
      }
      if (AMQP_FRAME_METHOD == incoming_frame.frame_type &&
          AMQP_CHANNEL_CLOSE_METHOD == incoming_frame.payload.method.id) {
        FinishCloseChannel(incoming_frame.channel);
        try {
          AmqpException::Throw(*reinterpret_cast<amqp_channel_close_t *>(
              incoming_frame.payload.method.decoded));
        } catch (AmqpException &) {
          MaybeReleaseBuffersOnChannel(incoming_frame.channel);
          throw;
        }
      }
      m_frame_queue.push_back(incoming_frame);

      if (timeout != boost::chrono::microseconds::max()) {
        boost::chrono::steady_clock::time_point now =
            boost::chrono::steady_clock::now();
        if (now >= end_point) {
          return false;
        }
        timeout_left =
            boost::chrono::duration_cast<boost::chrono::microseconds>(
                end_point - now);
      }
    }
    return false;
*)
end;

function TAmqpChannel.TAmqpChannelImpl.DoRpcOnChannel(
  AChannel: amqp_channel_t; AMethodId: UInt32;
  var ADecoded; AExpectedResponses: ResponseListType): amqp_frame_t;
var
  channels: TArray<amqp_channel_t>;
begin
  CheckForError(amqp_send_method(m_connection, AChannel, AMethodId, @ADecoded));

  channels := [ AChannel ];

  GetMethodOnChannel(channels, Result, AExpectedResponses);
end;

function TAmqpChannel.TAmqpChannelImpl.DoRpc(
  AMethodId: UInt32; var ADecoded;
  AExpectedResponses: ResponseListType): amqp_frame_t;
var
  channel: amqp_channel_t;
begin
  channel := GetChannel();
  Result := DoRpcOnChannel(channel, AMethodId, ADecoded, AExpectedResponses);
  ReturnChannel(channel);
end;

class function TAmqpChannel.TAmqpChannelImpl.EnvelopeOnChannel(
  const AEnvelope: TAmqpEnvelope; AChannels: ChannelListType): Boolean;
var
  i: Integer;
begin
  for i := Low(AChannels) to High(AChannels) do
    if AEnvelope.DeliveryChannel = AChannels[i] then
      Exit(True);
  Result := False;
end;

function TAmqpChannel.TAmqpChannelImpl.ConsumeMessageOnChannel(
  AChannels: ChannelListType; out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
var
  i: Integer;
begin
  for i := 0 to Pred(m_delivered_messages.Count) do
    if TAmqpChannelImpl.EnvelopeOnChannel(m_delivered_messages[i], AChannels) then begin
      AMessage := m_delivered_messages[i];
      m_delivered_messages.Delete(i);
      Exit(True);
    end;
  Result := ConsumeMessageOnChannelInner(AChannels, AMessage, ATimeout);
end;

function TAmqpChannel.TAmqpChannelImpl.ConsumeMessageOnChannelInner(
  AChannels: ChannelListType; out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
var
  real_timeout: Int64;
  deliver: amqp_frame_t;
  cancel_method: pamqp_basic_cancel_t;
  consumer_tag: AnsiString;
  deliver_method: pamqp_basic_deliver_t;
  exchange: AnsiString;
  routing_key: AnsiString;
  in_consumer_tag: AnsiString;
  delivery_tag: UInt64;
  redelivered: Boolean;
  content: TAmqpBasicMessage;
begin
  if ATimeout >= 0 then
    real_timeout := ATimeout
  else
    real_timeout := Int64.MaxValue;

  if not GetMethodOnChannel(AChannels, deliver,
    [ AMQP_BASIC_DELIVER_METHOD, AMQP_BASIC_CANCEL_METHOD ], real_timeout) then
    Exit(False);

  if AMQP_BASIC_CANCEL_METHOD = deliver.payload.method.id then begin
    cancel_method := pamqp_basic_cancel_t(deliver.payload.method.decoded);
    SetString(consumer_tag,
      PAnsiChar(cancel_method.consumer_tag.bytes),
      cancel_method.consumer_tag.len);

    RemoveConsumer(consumer_tag);
    ReturnChannel(deliver.channel);
    MaybeReleaseBuffersOnChannel(deliver.channel);

    raise EAmqpConsumerCancelledException(consumer_tag);
  end;

  deliver_method := pamqp_basic_deliver_t(deliver.payload.method.decoded);
  SetString(exchange,
    PAnsiChar(deliver_method.exchange.bytes),
    deliver_method.exchange.len);
  SetString(routing_key,
    PAnsiChar(deliver_method.routing_key.bytes),
    deliver_method.routing_key.len);
  SetString(in_consumer_tag,
    PAnsiChar(deliver_method.consumer_tag.bytes),
    deliver_method.consumer_tag.len);
  delivery_tag := deliver_method.delivery_tag;
  redelivered := deliver_method.redelivered <> 0;
  MaybeReleaseBuffersOnChannel(deliver.channel);

  content := ReadContent(deliver.channel);
  MaybeReleaseBuffersOnChannel(deliver.channel);

  AMessage := TAmqpEnvelope.Create(
    content, in_consumer_tag, delivery_tag, exchange,
    redelivered, routing_key, deliver.channel);
  Result := True;
end;

function TAmqpChannel.TAmqpChannelImpl.CreateNewChannel(): amqp_channel_t;
var
   new_channel: amqp_channel_t;
   channel_open: amqp_channel_open_t;
   confirm_select: amqp_confirm_select_t;
begin
  new_channel := GetNextChannelId();

  amqp_channel_open(m_connection, new_channel);

  CheckRpcReply(new_channel, amqp_get_rpc_reply(m_connection));

//  FillChar(channel_open, sizeof(channel_open), #0);
//  DoRpcOnChannel(new_channel, AMQP_CHANNEL_OPEN_METHOD, channel_open,
//    [ AMQP_CHANNEL_OPEN_OK_METHOD ]);

//  FillChar(confirm_select, sizeof(confirm_select), #0);
//  DoRpcOnChannel(new_channel, AMQP_CONFIRM_SELECT_METHOD, confirm_select,
//    [ AMQP_CONFIRM_SELECT_OK_METHOD ]);

  m_channels[new_channel] := CS_Open;

  Result := new_channel;
end;

function TAmqpChannel.TAmqpChannelImpl.GetNextChannelId(): amqp_channel_t;
var
  unused_channel: Integer;
  max_channels: Integer;
begin
  unused_channel := m_channels.IndexOf(CS_Closed);

  if unused_channel < 0 then begin
    max_channels := amqp_get_channel_max(m_connection);
    if (0 = max_channels) then
      max_channels := UInt16.MaxValue;
    if m_channels.Count > max_channels then
      raise ERangeError.Create('Too many channels open');

    m_channels.Add(CS_Closed);
    unused_channel := Pred(m_channels.Count);
  end;

  Result := unused_channel;
end;

procedure TAmqpChannel.TAmqpChannelImpl.CheckRpcReply(
  AChannel: amqp_channel_t; const AReply: amqp_rpc_reply_t);
begin
  case AReply.reply_type of
    AMQP_RESPONSE_NORMAL: Exit;

    AMQP_RESPONSE_LIBRARY_EXCEPTION:
      // If we're getting this likely is the socket is already closed
      raise EAmqpResponseLibraryException.Create(AReply, '');

    AMQP_RESPONSE_SERVER_EXCEPTION:
      {if AReply.reply.id = AMQP_CHANNEL_CLOSE_METHOD then
        FinishCloseChannel(AChannel)
      else if AReply.reply.id = AMQP_CONNECTION_CLOSE_METHOD then
        FinishCloseConnection()
      else
        EAmqpException.Throw(AReply);}

    else
      EAmqpException.Throw(AReply);
  end;
end;

procedure TAmqpChannel.TAmqpChannelImpl.CheckForError(ARet: Integer);
begin
  if ARet < 0 then
    raise EAmqpLibraryException.Create(ARet);
end;

procedure TAmqpChannel.TAmqpChannelImpl.CheckFrameForClose(
  const AFrame: amqp_frame_t; AChannel: amqp_channel_t);
begin
  if AFrame.frame_type = AMQP_FRAME_METHOD then
    case AFrame.payload.method.id of
      AMQP_CHANNEL_CLOSE_METHOD: begin
        FinishCloseChannel(AChannel);
        EAmqpException.Throw(pamqp_channel_close_t(AFrame.payload.method.decoded)^);
      end;
      AMQP_CONNECTION_CLOSE_METHOD: begin
        FinishCloseConnection();
        EAmqpException.Throw(pamqp_connection_close_t(AFrame.payload.method.decoded)^);
      end;
    end;
end;

procedure TAmqpChannel.TAmqpChannelImpl.FinishCloseChannel(
  AChannel: amqp_channel_t);
var
  close_ok: amqp_channel_close_ok_t;
begin
  m_channels[AChannel] := CS_Closed;

  CheckForError(amqp_send_method(
    m_connection, AChannel, AMQP_CHANNEL_CLOSE_OK_METHOD, @close_ok));
end;

procedure TAmqpChannel.TAmqpChannelImpl.FinishCloseConnection();
var
  close_ok: amqp_connection_close_ok_t;
begin
  SetIsConnected(False);
  amqp_send_method(m_connection, 0, AMQP_CONNECTION_CLOSE_OK_METHOD, @close_ok);
end;

function TAmqpChannel.TAmqpChannelImpl.CreateMessageReturnedException(
  const AReturnMethod: amqp_basic_return_t; AChannel: amqp_channel_t): EAmqpMessageReturnedException;
var
  reply_code: Integer;
  reply_text: AnsiString;
  exchange: AnsiString;
  routing_key: AnsiString;
  content: TAmqpBasicMessage;
begin
  reply_code := AReturnMethod.reply_code;
  SetString(reply_text,
    PAnsiChar(AReturnMethod.reply_text.bytes), AReturnMethod.reply_text.len);
  SetString(exchange,
    PAnsiChar(AReturnMethod.exchange.bytes), AReturnMethod.exchange.len);
  SetString(routing_key,
    PAnsiChar(AReturnMethod.routing_key.bytes), AReturnMethod.routing_key.len);
  content := ReadContent(AChannel);
  Result := EAMqpMessageReturnedException.Create(
    content, reply_code, reply_text, exchange, routing_key);
end;

function TAmqpChannel.TAmqpChannelImpl.ReadContent(AChannel: amqp_channel_t): TAmqpBasicMessage;
var
  frame: amqp_frame_t;
  properties: pamqp_basic_properties_t;
  body_size: size_t;
  received_size: size_t;
  body: amqp_bytes_t;
  body_ptr: Pointer;
begin
  GetNextFrameOnChannel(AChannel, frame);

  if frame.frame_type <> AMQP_FRAME_HEADER then
    // TODO: We should connection.close here
    raise EInvalidOpException.Create(
      'Channel::BasicConsumeMessage: received unexpected frame type (was expected AMQP_FRAME_HEADER)');

  // The memory for this is allocated in a pool associated with the connection
  // The BasicMessage constructor does a deep copy of the properties structure
  properties := pamqp_basic_properties_t(frame.payload.properties.decoded);

  // size_t could possibly be 32-bit, body_size is always 64-bit
  Assert(frame.payload.properties.body_size < size_t.MaxValue);

  body_size := size_t(frame.payload.properties.body_size);
  received_size := 0;

  body := amqp_bytes_malloc(body_size);

  // frame #3 and up:
  while (received_size < body_size) do begin
    GetNextFrameOnChannel(AChannel, frame);

    if frame.frame_type <> AMQP_FRAME_BODY then
      // TODO: we should connection.close here
      raise EInvalidOpException.Create(
        'Channel.BasicConsumeMessage: received unexpected frame type (was expecting AMQP_FRAME_BODY)');

    body_ptr := PAnsiChar(body.bytes) + received_size;
    MoveFast(body_ptr, frame.payload.body_fragment.bytes,
      frame.payload.body_fragment.len);
    Inc(received_size, frame.payload.body_fragment.len);
  end;
  Result := TAmqpBasicMessage.Create(body, properties);
end;

procedure TAmqpChannel.TAmqpChannelImpl.AddConsumer(const AConsumerTag: AnsiString; AChannel: amqp_channel_t);
begin
  m_consumer_channel_map.Add(AConsumerTag, AChannel);
end;

function TAmqpChannel.TAmqpChannelImpl.RemoveConsumer(const AConsumerTag: AnsiString): amqp_channel_t;
begin
  if not m_consumer_channel_map.TryGetValue(AConsumerTag, Result) then
    raise EAmqpConsumerTagNotFoundException.Create();
  m_consumer_channel_map.Remove(AConsumerTag);
end;

function TAmqpChannel.TAmqpChannelImpl.GetConsumerChannel(const AConsumerTag: AnsiString): amqp_channel_t;
begin
  if not m_consumer_channel_map.TryGetValue(AConsumerTag, Result) then
    raise EAmqpConsumerTagNotFoundException.Create();
end;

function TAmqpChannel.TAmqpChannelImpl.GetAllConsumerChannels(): TArray<amqp_channel_t>;
begin
  Result := m_consumer_channel_map.Values.ToArray();
end;

procedure TAmqpChannel.TAmqpChannelImpl.MaybeReleaseBuffersOnChannel(
  AChannel: amqp_channel_t);
var
  i: Integer;
begin
  for i := 0 to Pred(m_frame_queue.Count) do
    if TAmqpChannelImpl.IsOnChannel(m_frame_queue[i], AChannel)then
      Exit;
  amqp_maybe_release_buffers_on_channel(m_connection, AChannel);
end;

procedure TAmqpChannel.TAmqpChannelImpl.CheckIsConnected();
begin
  if not m_is_connected then
    raise EAmqpConnectionClosedException.Create();
end;

procedure TAmqpChannel.TAmqpChannelImpl.SetIsConnected(AState: Boolean);
begin
  m_is_connected := AState;
end;

function TAmqpChannel.TAmqpChannelImpl.BrokerHasNewQosBehavior(): Boolean;
begin
  Result := $030300 <= m_brokerVersion;
end;

class function TAmqpChannel.TAmqpChannelImpl.ComputeBrokerVersion(
  const AState: amqp_connection_state_t): UInt32;
type
  amqp_table_entries_t = array [0..1000000] of amqp_table_entry_t;
  pamqp_table_entries_t = ^amqp_table_entries_t;
var
  properties: pamqp_table_t;
  version: amqp_bytes_t;
  entries: pamqp_table_entries_t;
  version_entry: ^amqp_table_entry_t;
  i: Integer;
  version_string: AnsiString;
  version_components: TStringArray;
  version_major: UInt32;
  version_minor: UInt32;
  version_patch: UInt32;
begin
  properties := amqp_get_server_properties(AState);
  version := amqp_cstring_bytes('version');
  version_entry := nil;

  entries := pamqp_table_entries_t(properties.entries);
  for i := 0 to Pred(properties.num_entries) do
    if BytesEqual(entries[i].key, version) then begin
      version_entry := @entries[i];
      break;
    end;

  if not Assigned(version_entry) then
    Exit(0);

  SetString(version_string,
    PAnsiChar(version_entry.value.value.bytes.bytes),
    version_entry.value.value.bytes.len);
  version_components := version_string.Split(['.']);
  if (Length(version_components) <> 3) or
     not UInt32.TryParse(version_components[0], version_major) or
     not UInt32.TryParse(version_components[1], version_minor) or
     not UInt32.TryParse(version_components[2], version_patch) then
    Exit(0);

  Result :=
    (version_major and $FF) shl 16 or
    (version_minor and $FF) shl 8 or
    (version_patch and $FF);
end;

{ TAmqpChannel }

(**
 * Create a new Channel object from an AMQP URI, possibly secured with SSL.
 * URI should start with amqps:// to use SSL or ampq:// - without SSL
 *
 * @param uri [in] a URI of the form:
 * amqp[s]://[username:password@]{HOSTNAME}[:PORT][/VHOST]
 * HOSTNAME can be either DNS name or IP
 * @param path_to_ca_cert Path to ca certificate file (only for SSL connections)
 * @param path_to_client_key Path to client key file (only for SSL connections)
 * @param path_to_client_cert Path to client certificate file (only for SSL connections)
 * @param verify_hostname Verify the hostname against the certificate when
 * opening the SSL connection.
 * @param frame_max [in] requests that the broker limit the maximum size of
 * any frame to this value
 * @returns a new Channel object
 *)
class function TAmqpChannel.CreateFromUri(
  const AUri: AnsiString;
  const APathToCACert: AnsiString;
  const APathToClientKey: AnsiString;
  const APathToClientCert: AnsiString;
  AVerifyHostname: Boolean;
  AFrameMax: Integer): TAmqpChannel;
var
  info: amqp_connection_info;

  socket: pamqp_socket_t = nil;
  status: Integer;
  impl: TAmqpChannelImpl;
begin
  amqp_default_connection_info(info);

  if (0 <> amqp_parse_url(PAnsiChar(AUri), info)) then
    raise EBadUriException.Create();

  impl := TAmqpChannelImpl.Create;
  try
    impl.m_connection := amqp_new_connection();
    if nil = impl.m_connection then
      raise EOutOfMemory.Create('');

    socket := amqp_tcp_socket_new(impl.m_connection);
    if nil = impl.m_connection then
      raise EOutOfMemory.Create('');

    impl.CheckForError(amqp_socket_open(socket, '127.0.0.1', 5672));

    impl.DoLogin('guest', 'guest', '/', 131072);

    amqp_channel_open(impl.m_connection, 1);
    impl.CheckRpcReply(1, amqp_get_rpc_reply(impl.m_connection));

    amqp_queue_bind(impl.m_connection, 1, amqp_cstring_bytes('default'),
      amqp_cstring_bytes(''), amqp_cstring_bytes(''),
      amqp_empty_table);
    impl.CheckRpcReply(1, amqp_get_rpc_reply(impl.m_connection));

    impl.CheckRpcReply(1, amqp_channel_close(impl.m_connection, 1, AMQP_REPLY_SUCCESS));
    impl.CheckRpcReply(1, amqp_connection_close(impl.m_connection, AMQP_REPLY_SUCCESS));
    impl.CheckForError(amqp_destroy_connection(impl.m_connection));
  finally
    impl.Free;
  end;

  with info do
    Result := Create(host, port, user, password, vhost,
      info.SSL <> 0, APathToCACert, APathToClientKey, APathToClientCert,
      AFrameMax, AVerifyHostname);
  (*
  //Result.m_impl.GetChannel;
  amqp_channel_open(Result.m_impl.m_connection, 1);
  Result.m_impl.CheckRpcReply(1, amqp_get_rpc_reply(Result.m_impl.m_connection));

  amqp_queue_bind(Result.m_impl.m_connection, 1, amqp_cstring_bytes('default'),
    amqp_cstring_bytes(''), amqp_cstring_bytes(''),
    amqp_empty_table);
  Result.m_impl.CheckRpcReply(1, amqp_get_rpc_reply(Result.m_impl.m_connection));

  Result.m_impl.CheckRpcReply(1, amqp_channel_close(Result.m_impl.m_connection, 1, AMQP_REPLY_SUCCESS));
  Result.m_impl.CheckRpcReply(1, amqp_connection_close(Result.m_impl.m_connection, AMQP_REPLY_SUCCESS));
  Result.m_impl.CheckForError(amqp_destroy_connection(Result.m_impl.m_connection));
  *)
end;

{$ifdef SAC_SSL_SUPPORT_ENABLED}
constructor TAmqpChannel.Create(
  const AHost: AnsiString;
  APort: Integer;
  const AUsername: AnsiString;
  const APassword: AnsiString;
  const AVHost: AnsiString;
  AFrameMax: Integer;
  const ASSLParams: TSSLConnectionParams);
var
  socket: pamqp_socket_t;
  sock: Integer;
  status: Integer
begin
  m_impl := TAmqpChannelImpl.Create();
  m_impl.m_connection = amqp_new_connection();
  if NULL = m_impl.m_connection then
    raise EOutOfMemory.Create();

  socket := amqp_ssl_socket_new(m_impl.m_connection);
  if NULL = socket then
    raise EOutOfMemory.Create();

{$if AMQP_VERSION >= 0x00080001}
  amqp_ssl_socket_set_verify_peer(socket, ssl_params.verify_hostname);
  amqp_ssl_socket_set_verify_hostname(socket, ssl_params.verify_hostname);
{$else}
  amqp_ssl_socket_set_verify(socket, ssl_params.verify_hostname);
{$endif}

  try
    status := amqp_ssl_socket_set_cacert(socket, ssl_params.path_to_ca_cert);
    if (status)
      raise EAmqpLibraryException::Create(
          status, 'Error setting CA certificate for socket');

    if (ssl_params.path_to_client_key <> '') and
      (ssl_params.path_to_client_cert <> '') then begin
      status := amqp_ssl_socket_set_key(socket,
        ssl_params.path_to_client_cert,
        ssl_params.path_to_client_key);
      if (status) then
        raise EAmqpLibraryException::Create(
            status, 'Error setting client certificate for socket');
    end;

    status := amqp_socket_open(socket, host, port);
    if (status) then
      raise EAmqpLibraryException::Create(
          status, 'Error setting client certificate for socket');

    m_impl.DoLogin(username, password, vhost, framemax);
  except
    amqp_destroy_connection(m_impl.m_connection);
    raise;
  end;

  m_impl.SetIsConnected(true);
end;
{$else}
constructor TAmqpChannel.Create(
  const AHost: AnsiString;
  APort: Integer;
  const AUsername: AnsiString;
  const APassword: AnsiString;
  const AVHost: AnsiString;
  AUseSSL: Boolean;
  const APathToCACert: AnsiString;
  const APathToClientKey: AnsiString;
  const APathToClientCert: AnsiString;
  AFrameMax: Integer;
  AVerifyHostname: Boolean);
var
  socket: pamqp_socket_t;
  sock: Integer;
begin
  m_impl := TAmqpChannelImpl.Create();
  m_impl.m_connection := amqp_new_connection();
  if nil = m_impl.m_connection then
    raise EOutOfMemory.Create('');

  try
    socket := amqp_tcp_socket_new(m_impl.m_connection);
    if nil = socket then
      raise EOutOfMemory.Create('');

    m_impl.CheckForError(amqp_socket_open(socket, PAnsiChar(AHost), APort));

    m_impl.DoLogin(AUsername, APassword, AVHost, AFrameMax);
  except
    amqp_destroy_connection(m_impl.m_connection);
    raise;
  end;

  m_impl.SetIsConnected(true);
end;
{$endif}

destructor TAmqpChannel.Destroy;
begin
  if Assigned(m_impl) and m_impl.m_is_connected then begin
    amqp_connection_close(m_impl.m_connection, AMQP_REPLY_SUCCESS);
    amqp_destroy_connection(m_impl.m_connection);
  end;
  FreeAndNil(m_impl);
  inherited Destroy;
end;

(**
 * Declares an exchange
 * Creates an exchange on the AMQP broker if it does not already exist
 * @param exchange_name the name of the exchange
 * @param exchange_type the type of exchange to be declared. Defaults to
 * direct
 *  other types that could be used: fanout and topic
 * @param passive Indicates how the broker should react if the exchange does
 * not exist.
 *  If passive is true and the exchange does not exist the broker will
 * respond with an error and
 *  not create the exchange, exchange is created otherwise.
 * @param durable Indicates whether the exchange is durable - e.g., will it
 * survive a broker restart
 * @param auto_delete Indicates whether the exchange will automatically be
 * removed when no queues are
 *  bound to it.
 * @param arguments A table of additional arguments used when creating the
 * exchange
 *)
procedure TAmqpChannel.DeclareExchange(
  const AExchangeName: AnsiString;
  const AExchangeType: AnsiString;
  APassive: Boolean;
  ADurable: Boolean;
  AAutoDelete: Boolean;
  AArguments: TAmqpTable);
var
  declare: amqp_exchange_declare_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(declare, sizeof(declare), #0);
  declare.exchange := amqp_cstring_bytes(PAnsiChar(AExchangeName));
  declare.&type := amqp_cstring_bytes(PAnsiChar(AExchangeType));
  declare.passive :=  LongBool(APassive).ToInteger;
  declare.durable := LongBool(ADurable).ToInteger;
  declare.auto_delete := LongBool(AAutoDelete).ToInteger;
  declare.internal := LongBool(False).ToInteger;
  declare.nowait := LongBool(False).ToInteger;
  declare.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_EXCHANGE_DECLARE_METHOD, declare, [ AMQP_EXCHANGE_DECLARE_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.DeleteExchange(const AExchangeName: AnsiString; AIfUnused: Boolean);
var
  del: amqp_exchange_delete_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(del, sizeof(del), #0);
  del.exchange := amqp_cstring_bytes(PAnsiChar(AExchangeName));
  del.if_unused := LongBool(AIfUnused).ToInteger;
  del.nowait := LongBool(False).ToInteger;

  frame := m_impl.DoRpc(AMQP_EXCHANGE_DELETE_METHOD, del, [ AMQP_EXCHANGE_DELETE_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.BindExchange(
  const ADestination: AnsiString;
  const ASource: AnsiString;
  const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  bind: amqp_exchange_bind_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(bind, sizeof(bind), #0);
  bind.destination := amqp_cstring_bytes(PAnsiChar(ADestination));
  bind.source := amqp_cstring_bytes(PAnsiChar(ASource));
  bind.routing_key := amqp_cstring_bytes(PAnsiChar(ARoutingKey));
  bind.nowait := LongBool(False).ToInteger;
  bind.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_EXCHANGE_BIND_METHOD, bind, [ AMQP_EXCHANGE_BIND_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.UnbindExchange(
  const ADestination: AnsiString;
  const ASource: AnsiString;
  const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  unbind: amqp_exchange_unbind_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(unbind, sizeof(unbind), #0);
  unbind.destination := amqp_cstring_bytes(PAnsiChar(ADestination));
  unbind.source := amqp_cstring_bytes(PAnsiChar(ASource));
  unbind.routing_key := amqp_cstring_bytes(PAnsiChar(ARoutingKey));
  unbind.nowait := LongBool(False).ToInteger;

  unbind.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_EXCHANGE_UNBIND_METHOD, unbind, [ AMQP_EXCHANGE_UNBIND_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

function TAmqpChannel.DeclareQueue(const AQueueName: AnsiString;
  APassive: Boolean; ADurable: Boolean; AExclusive: Boolean;
  AAutoDelete: Boolean; AArguments: TAmqpTable): AnsiString;
var
  message_count: UInt32;
  consumer_count: UInt32;
begin
  Result := DeclareQueueWithCounts(
    AQueueName, message_count, consumer_count,
    APassive, ADurable, AExclusive, AAutoDelete, AArguments);
end;

function TAmqpChannel.DeclareQueueWithCounts(
  const AQueueName: AnsiString;
  out AMessageCount: UInt32; out AConsumerCount: UInt32;
  APassive: Boolean; ADurable: Boolean; AExclusive: Boolean;
  AAutoDelete: Boolean; AArguments: TAmqpTable): AnsiString;
var
  declare: amqp_queue_declare_t;
  frame: amqp_frame_t;
  data: pamqp_queue_declare_ok_t;
begin
  m_impl.CheckIsConnected();

  FillChar(declare, sizeof(declare), #0);
  declare.queue := amqp_cstring_bytes(PAnsiChar(AQueueName));
  declare.passive := LongBool(APassive).ToInteger;
  declare.durable := LongBool(ADurable).ToInteger;
  declare.exclusive := LongBool(AExclusive).ToInteger;
  declare.auto_delete := LongBool(AAutoDelete).ToInteger;
  declare.nowait := LongBool(False).ToInteger;
  declare.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_QUEUE_DECLARE_METHOD, declare, [ AMQP_QUEUE_DECLARE_OK_METHOD ]);

  data := pamqp_queue_declare_ok_t(frame.payload.method.decoded);

  SetString(Result, PAnsiChar(data.queue.bytes), data.queue.len);

  AMessageCount := data.message_count;
  AConsumerCount := data.consumer_count;

  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.DeleteQueue(
  const AQueueName: AnsiString; AIfUnused: Boolean; AIfEmpty: Boolean);
var
  del: amqp_queue_delete_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(del, sizeof(del), #0);
  del.queue := amqp_cstring_bytes(PAnsiChar(AQueueName));
  del.if_unused := LongBool(AIfUnused).ToInteger;
  del.if_empty := LongBool(AIfEmpty).ToInteger;
  del.nowait := LongBool(False).ToInteger;

  frame := m_impl.DoRpc(AMQP_QUEUE_DELETE_METHOD, del, [ AMQP_QUEUE_DELETE_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.BindQueue(
  const AQueueName: AnsiString; const AExchangeName: AnsiString;
  const ARoutingKey: AnsiString; AArguments: TAmqpTable);
var
  bind: amqp_queue_bind_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(bind, sizeof(bind), #0);
  bind.queue := amqp_cstring_bytes(PAnsiChar(AQueueName));
  bind.exchange := amqp_cstring_bytes(PAnsiChar(AExchangeName));
  bind.routing_key := amqp_cstring_bytes(PAnsiChar(ARoutingKey));
  bind.nowait := LongBool(False).ToInteger;
  bind.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_QUEUE_BIND_METHOD, bind, [ AMQP_QUEUE_BIND_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.BindQueue(
  const AQueueName: AnsiString; AArguments: TAmqpTable);
begin
  m_impl.CheckIsConnected();

  amqp_queue_bind(m_impl.m_connection, 1, amqp_cstring_bytes(PAnsiChar(AQueueName)),
    amqp_cstring_bytes(''), amqp_cstring_bytes(''),
    amqp_empty_table);
  m_impl.CheckRpcReply(1, amqp_get_rpc_reply(m_impl.m_connection));

  m_impl.CheckRpcReply(1, amqp_channel_close(m_impl.m_connection, 1, AMQP_REPLY_SUCCESS));
end;

procedure TAmqpChannel.UnbindQueue(
  const AQueueName: AnsiString;
  const AExchangeName: AnsiString;
  const ARoutingKey: AnsiString;
  AArguments: TAmqpTable);
var
  unbind: amqp_queue_unbind_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(unbind, sizeof(unbind), #0);
  unbind.queue := amqp_cstring_bytes(PAnsiChar(AQueueName));
  unbind.exchange := amqp_cstring_bytes(PAnsiChar(AExchangeName));
  unbind.routing_key := amqp_cstring_bytes(PAnsiChar(ARoutingKey));
  unbind.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpc(AMQP_QUEUE_UNBIND_METHOD, unbind, [ AMQP_QUEUE_UNBIND_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.PurgeQueue(const AQueueName: AnsiString);
var
  purge: amqp_queue_purge_t;
  frame: amqp_frame_t;
begin
  m_impl.CheckIsConnected();

  FillChar(purge, sizeof(purge), #0);
  purge.queue := amqp_cstring_bytes(PAnsiChar(AQueueName));
  purge.nowait := LongBool(False).ToInteger;

  frame := m_impl.DoRpc(AMQP_QUEUE_PURGE_METHOD, purge, [ AMQP_QUEUE_PURGE_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(frame.channel);
end;

procedure TAmqpChannel.BasicAck(const AMessage: TAmqpEnvelope);
begin
  BasicAck(AMessage.GetDeliveryInfo());
end;

procedure TAmqpChannel.BasicAck(const AInfo: TAmqpEnvelope.TDeliveryInfo);
begin
  BasicAck(AInfo, False);
end;

procedure TAmqpChannel.BasicAck(
  const AInfo: TAmqpEnvelope.TDeliveryInfo; AMultiple: Boolean);
var
  channel: amqp_channel_t;
begin
  m_impl.CheckIsConnected();
  // Delivery tag is local to the channel, so its important to use
  // that channel, sadly this can cause the channel to throw an exception
  // which will show up as an unrelated exception in a different method
  // that actually waits for a response from the broker
  channel := AInfo.delivery_channel;
  if not m_impl.IsChannelOpen(channel) then
    raise EInvalidOperation.Create(
      'The channel that the message was delivered on has been closed');

  m_impl.CheckForError(amqp_basic_ack(
    m_impl.m_connection, channel, AInfo.delivery_tag,
    LongBool(AMultiple).ToInteger));
end;

procedure TAmqpChannel.BasicReject(
  const AMessage: TAmqpEnvelope; ARequeue: Boolean; AMultiple: Boolean);
begin
  BasicReject(AMessage.GetDeliveryInfo(), ARequeue, AMultiple);
end;

procedure TAmqpChannel.BasicReject(const AInfo: TAmqpEnvelope.TDeliveryInfo;
  ARequeue: Boolean; AMultiple: Boolean);
var
  channel: amqp_channel_t;
  req: amqp_basic_nack_t;
begin
  m_impl.CheckIsConnected();
  // Delivery tag is local to the channel, so its important to use
  // that channel, sadly this can cause the channel to throw an exception
  // which will show up as an unrelated exception in a different method
  // that actually waits for a response from the broker
  channel := AInfo.delivery_channel;
  if not m_impl.IsChannelOpen(channel) then
    raise EInvalidOperation.Create(
        'The channel that the message was delivered on has been closed');

  req.delivery_tag := AInfo.delivery_tag;
  req.multiple := LongBool(AMultiple).ToInteger;
  req.requeue := LongBool(ARequeue).ToInteger;

  m_impl.CheckForError(amqp_send_method(
    m_impl.m_connection, channel, AMQP_BASIC_NACK_METHOD, @req));
end;

procedure TAmqpChannel.BasicPublish(
  const AExchangeName: AnsiString;
  const ARoutingKey: AnsiString;
  const AMessage: TAmqpBasicMessage;
  AMandatory: Boolean; AImmediate: Boolean);
var
  channel: amqp_channel_t;
  frame: amqp_frame_t;
  channels: array of amqp_channel_t;
  message_returned: EAmqpMessageReturnedException;
begin
  m_impl.CheckIsConnected();
  channel := m_impl.GetChannel();

  m_impl.CheckForError(amqp_basic_publish(
      m_impl.m_connection, channel, amqp_cstring_bytes(PAnsiChar(AExchangeName)),
      amqp_cstring_bytes(PAnsiChar(ARoutingKey)),
      LongBool(AMandatory).ToInteger, LongBool(AImmediate).ToInteger,
      AMessage.GetAmqpProperties(), AMessage.GetAmqpBody()));

  // If we've done things correctly we can get one of 4 things back from the
  // broker
  // - basic.ack - our channel is in confirm mode, messsage was 'dealt with' by
  // the broker
  // - basic.return then basic.ack - the message wasn't delievered, but was
  // dealt with
  // - channel.close - probably tried to publish to a non-existant exchange, in
  // any case error!
  // - connection.clsoe - something really bad happened
  channels := [ channel ];
  m_impl.GetMethodOnChannel(channels, frame,
    [ AMQP_BASIC_ACK_METHOD, AMQP_BASIC_RETURN_METHOD ]);

  if (AMQP_BASIC_RETURN_METHOD = frame.payload.method.id) then begin
    message_returned :=
        m_impl.CreateMessageReturnedException(
            pamqp_basic_return_t(frame.payload.method.decoded)^,
            channel);

    m_impl.GetMethodOnChannel(channels, frame, [ AMQP_BASIC_ACK_METHOD ]);
    m_impl.ReturnChannel(channel);
    m_impl.MaybeReleaseBuffersOnChannel(channel);
    raise message_returned;
  end;

  m_impl.ReturnChannel(channel);
  m_impl.MaybeReleaseBuffersOnChannel(channel);
end;

function TAmqpChannel.BasicGet(out AEnvelope: TAmqpEnvelope;
  const AQueue: AnsiString; ANoAck: Boolean): Boolean;
var
  get: amqp_basic_get_t;
  channel: amqp_channel_t;
  frame: amqp_frame_t;
  get_ok: pamqp_basic_get_ok_t;
  delivery_tag: UInt64;
  redelivered: Boolean;
  exchange: AnsiString;
  routing_key: AnsiString;
  message: TAmqpBasicMessage;
begin
  m_impl.CheckIsConnected();

  FillChar(get, sizeof(get), #0);
  get.queue := amqp_cstring_bytes(PAnsiChar(AQueue));
  get.no_ack := ANoAck.ToInteger;

  channel := m_impl.GetChannel();
  frame := m_impl.DoRpcOnChannel(channel, AMQP_BASIC_GET_METHOD, get,
    [ AMQP_BASIC_GET_OK_METHOD, AMQP_BASIC_GET_EMPTY_METHOD ]);

  if (AMQP_BASIC_GET_EMPTY_METHOD = frame.payload.method.id) then begin
    m_impl.ReturnChannel(channel);
    m_impl.MaybeReleaseBuffersOnChannel(channel);
    Exit(False);
  end;

  get_ok := pamqp_basic_get_ok_t(frame.payload.method.decoded);
  delivery_tag := get_ok.delivery_tag;
  redelivered := get_ok.redelivered <> 0;
  SetString(exchange,
    PAnsiChar(get_ok.exchange.bytes), get_ok.exchange.len);
  SetString(routing_key,
    PAnsiChar(get_ok.routing_key.bytes), get_ok.routing_key.len);

  message := m_impl.ReadContent(channel);
  AEnvelope := TAmqpEnvelope.Create(
    message, '', delivery_tag, exchange, redelivered, routing_key, channel);

  m_impl.ReturnChannel(channel);
  m_impl.MaybeReleaseBuffersOnChannel(channel);
  Result := True;
end;

procedure TAmqpChannel.BasicRecover(const AConsumer: AnsiString);
var
  recover: amqp_basic_recover_t;
  channel: amqp_channel_t;
begin
  m_impl.CheckIsConnected();

  FillChar(recover, sizeof(recover), #0);
  recover.requeue := LongBool(True).ToInteger;

  channel := m_impl.GetConsumerChannel(AConsumer);

  m_impl.DoRpcOnChannel(channel, AMQP_BASIC_RECOVER_METHOD, recover,
    [ AMQP_BASIC_RECOVER_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(channel);
end;

function TAmqpChannel.BasicConsume(
  const AQueue: AnsiString; const AConsumerTag: AnsiString;
  ANoLocal: Boolean; ANoAck: Boolean; AExclusive: Boolean;
  AMessagePrefetchCount: UInt16; AArguments: TAmqpTable): AnsiString;
var
  channel: amqp_channel_t;
  qos: amqp_basic_qos_t;
  consume: amqp_basic_consume_t;
  frame: amqp_frame_t;
  data: pamqp_basic_consume_ok_t;
  tag: AnsiString;
begin
  m_impl.CheckIsConnected();
  channel := m_impl.GetChannel();

  // Set this before starting the consume as it may have been set by a previous
  // consumer
  FillChar(qos, sizeof(qos), #0);
  qos.prefetch_size := 0;
  qos.prefetch_count := AMessagePrefetchCount;
  qos.global := LongBool(m_impl.BrokerHasNewQosBehavior()).ToInteger;

  m_impl.DoRpcOnChannel(channel, AMQP_BASIC_QOS_METHOD, qos,
    [ AMQP_BASIC_QOS_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(channel);

  FillChar(consume, sizeof(consume), #0);
  consume.queue := amqp_cstring_bytes(PAnsiChar(AQueue));
  consume.consumer_tag := amqp_cstring_bytes(PAnsiChar(AConsumerTag));
  consume.no_local := LongBool(ANoLocal).ToInteger;
  consume.no_ack := LongBool(ANoAck).ToInteger;
  consume.exclusive := LongBool(AExclusive).ToInteger;
  consume.nowait := LongBool(False).ToInteger;
  consume.arguments.AssignFrom(AArguments);

  frame := m_impl.DoRpcOnChannel(channel, AMQP_BASIC_CONSUME_METHOD, consume,
    [ AMQP_BASIC_CONSUME_OK_METHOD ]);

  data := pamqp_basic_consume_ok_t(frame.payload.method.decoded);
  SetString(tag, PAnsiChar(data.consumer_tag.bytes), data.consumer_tag.len);
  m_impl.MaybeReleaseBuffersOnChannel(channel);

  m_impl.AddConsumer(tag, channel);

  Result := tag;
end;

procedure TAmqpChannel.BasicQos(
  const AConsumerTag: AnsiString; AMessagePrefetchCount: UInt16);
var
  channel: amqp_channel_t;
  qos: amqp_basic_qos_t;
begin
  m_impl.CheckIsConnected();
  channel := m_impl.GetConsumerChannel(AConsumerTag);

  FillChar(qos, sizeof(qos), #0);
  qos.prefetch_size := 0;
  qos.prefetch_count := AMessagePrefetchCount;
  qos.global := LongBool(m_impl.BrokerHasNewQosBehavior()).ToInteger;

  m_impl.DoRpcOnChannel(channel, AMQP_BASIC_QOS_METHOD, qos,
    [ AMQP_BASIC_QOS_OK_METHOD ]);
  m_impl.MaybeReleaseBuffersOnChannel(channel);
end;

procedure TAmqpChannel.BasicCancel(const AConsumerTag: AnsiString);
var
  channel: amqp_channel_t;
  cancel: amqp_basic_cancel_t;
begin
  m_impl.CheckIsConnected();
  channel := m_impl.GetConsumerChannel(AConsumerTag);

  FillChar(cancel, sizeof(cancel), #0);
  cancel.consumer_tag := amqp_cstring_bytes(PAnsiChar(AConsumerTag));
  cancel.nowait := LongBool(False).ToInteger;

  m_impl.DoRpcOnChannel(channel, AMQP_BASIC_CANCEL_METHOD, cancel,
    [ AMQP_BASIC_CANCEL_OK_METHOD ]);

  m_impl.RemoveConsumer(AConsumerTag);

  // Lets go hunting to make sure we don't have any queued frames lying around
  // Otherwise these frames will potentially hang around when we don't want them
  // to
  // TODO: Implement queue purge
  m_impl.ReturnChannel(channel);
  m_impl.MaybeReleaseBuffersOnChannel(channel);
end;

function TAmqpChannel.BasicConsumeMessage(
  const AConsumerTag: AnsiString): TAmqpEnvelope;
begin
  BasicConsumeMessage(AConsumerTag, Result);
end;

function TAmqpChannel.BasicConsumeMessage(
  const AConsumerTags: array of AnsiString): TAmqpEnvelope;
begin
  BasicConsumeMessage(AConsumerTags, Result);
end;

function TAmqpChannel.BasicConsumeMessage(): TAmqpEnvelope;
begin
  BasicConsumeMessage(Result);
end;

function TAmqpChannel.BasicConsumeMessage(
  const AConsumerTag: AnsiString;
  out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
var
  channel: amqp_channel_t;
  channels: array of amqp_channel_t;
begin
  m_impl.CheckIsConnected();
  channel := m_impl.GetConsumerChannel(AConsumerTag);

  channels := [ channel ];

  Result := m_impl.ConsumeMessageOnChannel(channels, AMessage, ATimeout);
end;

function TAmqpChannel.BasicConsumeMessage(
  AConsumerTags: array of AnsiString;
  out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
var
  i: Integer;
  channels: array of amqp_channel_t;
begin
  m_impl.CheckIsConnected();

  SetLength(channels, Length(AConsumerTags));

  for i := Low(AConsumerTags) to High(AConsumerTags) do
    channels[i] := m_impl.GetConsumerChannel(AConsumerTags[i]);

  Result := m_impl.ConsumeMessageOnChannel(channels, AMessage, ATimeout);
end;

function TAmqpChannel.BasicConsumeMessage(
  out AMessage: TAmqpEnvelope; ATimeout: Integer): Boolean;
var
  channels: array of amqp_channel_t;
begin
  m_impl.CheckIsConnected();

  channels := m_impl.GetAllConsumerChannels();

  if Length(channels) = 0 then
    raise EamqpConsumerTagNotFoundException.Create();

  Result := m_impl.ConsumeMessageOnChannel(channels, AMessage, ATimeout);
end;

end.

