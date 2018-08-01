unit UBAmqpConnection;

interface

uses
  SysUtils,
  Classes,
  Generics.Collections,
  rabbitmq;

type

  { TAmqpConnection }

  TAmqpConnection = class
  private const
    BROKER_HEARTBEAT = 0;
  private type
    TChannelState = (
      CS_Closed = 0,
      CS_Open, CS_Used
    );
  public type
    TChannel = class
    protected type
      TResponsesList = array of amqp_method_number_t;
    private type
      TFrameQueue = TList<amqp_frame_t>;
    private
      FChannel: amqp_channel_t;
      FConnection: TAmqpConnection;
      FFrames: TFrameQueue;
      FState: TChannelState;
      procedure AddFrameToQueue(frame: amqp_frame_t);
      function GetAmqpConnection: amqp_connection_state_t;
      function GetBrokerHasNewQosBehavior: Boolean;
    protected
      procedure CheckRpcReply(const AReply: amqp_rpc_reply_t);
      procedure NotifyConnectionDestroy; virtual;
      function ProcessStdMethods(const frame: amqp_frame_t): Boolean;
      property Channel: amqp_channel_t read FChannel;
      property AmqpConnection: amqp_connection_state_t read GetAmqpConnection;
      property BrokerHasNewQosBehavior: Boolean read GetBrokerHasNewQosBehavior;
      property State: TChannelState read FState;
    public
      constructor Create(AConnection: TAmqpConnection);
      destructor Destroy; override;
      procedure Close;
      procedure MaybeReleaseBuffersOnChannel;
      procedure Open;
    end;
  private type
    TChannelList = TList<TChannel>;
  private
    FBrokerVersion: UInt32;
    FChannels: TChannelList;
    FConnection: amqp_connection_state_t;
    FIsConnected: Boolean;
    procedure AddToFrameQueue(AFrame: amqp_frame_t);
    class function ComputeBrokerVersion(
      const AState: amqp_connection_state_t): UInt32;
  protected
    procedure CheckRpcReply(AChannel: amqp_channel_t;
      const AReply: amqp_rpc_reply_t);
    procedure DoLogin(const AUser: AnsiString; const APassword: AnsiString;
      AVHost: AnsiString; AFrameMax: Integer);
    procedure FinishCloseChannel(AChannel: amqp_channel_t);
    procedure FinishCloseConnection();
    procedure SetIsConnected(AValue: Boolean); virtual;
  public
    constructor Create(
      const AHost: AnsiString = '127.0.0.1';
      APort: Integer = 5672;
      const AUser: AnsiString = 'guest';
      const APassword: AnsiString = 'guest';
      const AVHost: AnsiString = '/';
      AUseSSL: Boolean = False;
      const APathToCACert: AnsiString = '';
      const APathToClientKey: AnsiString = '';
      const APathToClientCert: AnsiString = '';
      AFrameMax: Integer = 131072;
      AVerifyHostname: Boolean = True);
    destructor Destroy; override;
    class procedure CheckForError(ARet: Integer);
    procedure Close;
    property IsConnected: Boolean read FIsConnected;
  end;

implementation

uses
  Math,
  UBAmqpErrors;

type

  { TResponsesListHelper }

  TResponsesListHelper = record helper for TAmqpConnection.TChannel.TResponsesList
  public
    function Contains(AMethodId: amqp_method_number_t): Boolean;
  end;

function BytesEqual(const r: amqp_bytes_t; const l: amqp_bytes_t): Boolean;
begin
  if (r.len = l.len) then
    if CompareMem(r.bytes, l.bytes, r.len) then
      Exit(True);
  Exit(False);
end;

{ TResponsesListHelper }

function TResponsesListHelper.Contains(AMethodId: amqp_method_number_t): Boolean;
var
  i: Integer;
begin
  for i := Low(Self) to High(Self) do
    if Self[i] = AMethodId then
      Exit(True);
  Result := False;
end;

{ TAmqpConnection.TChannel }

constructor TAmqpConnection.TChannel.Create(AConnection: TAmqpConnection);
var
  next_channel: Integer = 0;
  max_channels: Integer;
begin
  inherited Create;
  if not Assigned(AConnection) then
    raise EArgumentException.Create('A connection is reqired to create channel');
  FConnection := AConnection;

  while (next_channel < FConnection.FChannels.Count) and
        Assigned(FConnection.FChannels[next_channel]) do
    Inc(next_channel);

  max_channels := amqp_get_channel_max(FConnection);
  if (0 = max_channels) then
    max_channels := FChannel.MaxValue;
  if FConnection.FChannels.Count >= max_channels then
    raise ERangeError.Create('Too many channels open');

  if next_channel < FConnection.FChannels.Count then begin
    FChannel := next_channel;
    FConnection.FChannels[FChannel] := Self;
  end else
    FChannel := amqp_channel_t(FConnection.FChannels.Add(Self));

  FState := CS_Closed;
  FFrames := TFrameQueue.Create;
end;

destructor TAmqpConnection.TChannel.Destroy;
begin
  FreeAndNil(FFrames);
  if Assigned(FConnection) and Assigned(FConnection.FChannels) then
    FConnection.FChannels[FChannel] := nil;
  inherited Destroy;
end;

procedure TAmqpConnection.TChannel.AddFrameToQueue(frame: amqp_frame_t);
begin
  FFrames.Add(frame);
end;

procedure TAmqpConnection.TChannel.Close;
begin
  if Assigned(FConnection) and FConnection.IsConnected and
     (State <> CS_Closed) then
    CheckRpcReply(
      amqp_channel_close(FConnection.FConnection, FChannel, AMQP_REPLY_SUCCESS));
end;

procedure TAmqpConnection.TChannel.CheckRpcReply(const AReply: amqp_rpc_reply_t);
begin
  FConnection.CheckRpcReply(FChannel, AReply);
end;

function TAmqpConnection.TChannel.GetAmqpConnection: amqp_connection_state_t;
begin
  if not Assigned(FConnection) or not FConnection.IsConnected then
    raise EAmqpConnectionClosedException.Create();
  Result := FConnection.FConnection;
end;

function TAmqpConnection.TChannel.GetBrokerHasNewQosBehavior: Boolean;
begin
  Result := $030300 <= FConnection.FBrokerVersion;
end;

procedure TAmqpConnection.TChannel.MaybeReleaseBuffersOnChannel;
begin
  amqp_maybe_release_buffers_on_channel(FConnection, FChannel);
end;

procedure TAmqpConnection.TChannel.NotifyConnectionDestroy;
begin
  FConnection := nil;
end;

procedure TAmqpConnection.TChannel.Open;
begin
  amqp_channel_open(AmqpConnection, FChannel);
  FConnection.CheckRpcReply(FChannel, amqp_get_rpc_reply(AmqpConnection));
  FState := CS_Open;
end;

function TAmqpConnection.TChannel.ProcessStdMethods(
  const frame: amqp_frame_t): Boolean;
var
  message: amqp_message_t;
begin
  if AMQP_FRAME_METHOD = frame.frame_type then
    case frame.payload.method.id of
      AMQP_BASIC_ACK_METHOD:
        // if we've turned publisher confirms on, and we've published a
        // message here is a message being confirmed.
        Result := True;
      AMQP_BASIC_RETURN_METHOD: begin
        // if a published message couldn't be routed and the mandatory
        // flag was set this is what would be returned. The message then
        // needs to be read.
        CheckRpcReply(amqp_read_message(
          AmqpConnection, frame.channel, message, 0));
        amqp_destroy_message(@message);
        Result := True;
      end;
      AMQP_CHANNEL_CLOSE_METHOD: begin
        // a channel.close method happens when a channel exception occurs,
        // this can happen by publishing to an exchange that doesn't exist
        // for example.
        //
        // In this case you would need to open another channel redeclare
        // any queues that were declared auto-delete, and restart any
        // consumers that were attached to the previous channel.
        FConnection.FinishCloseChannel(frame.channel);
        EAmqpException.Throw(
          pamqp_channel_close_t(frame.payload.method.decoded));
      end;
      AMQP_CONNECTION_CLOSE_METHOD: begin
        // a connection.close method happens when a connection exception
        // occurs, this can happen by trying to use a channel that isn't
        // open for example.
        // In this case the whole connection must be restarted.
        FConnection.FinishCloseConnection();
        EAmqpException.Throw(
          pamqp_connection_close_t(frame.payload.method.decoded));
      end;
    end;
  Result := False;
end;

{ TAmqpConnection }

constructor TAmqpConnection.Create(const AHost: AnsiString; APort: Integer;
  const AUser: AnsiString; const APassword: AnsiString;
  const AVHost: AnsiString; AUseSSL: Boolean; const APathToCACert: AnsiString;
  const APathToClientKey: AnsiString; const APathToClientCert: AnsiString;
  AFrameMax: Integer; AVerifyHostname: Boolean);
var
  socket: pamqp_socket_t;
begin
  inherited Create();
  FChannels := TChannelList.Create();
  FConnection := amqp_new_connection();
  if nil = FConnection then
    raise EOutOfMemory.Create('');
  try
    socket := amqp_tcp_socket_new(FConnection);
    if nil = socket then
      raise EOutOfMemory.Create('');
    CheckForError(amqp_socket_open(socket, PAnsiChar(AHost), APort));
    DoLogin(AUser, APassword, AVHost, AFrameMax);
  except
    amqp_destroy_connection(FConnection);
    raise;
  end;
  SetIsConnected(True);
   // Adding dummy channel as a placeholder for unsupported channel #0;
  FChannels.Add(TChannel.Create(Self));
end;

destructor TAmqpConnection.Destroy;
var
  i: Integer;
  cl: TChannelList;
begin
  cl := FChannels;
  FChannels := nil;
  if Assigned(cl) then begin
    for i := 0 to Pred(cl.Count) do
      if Assigned(cl[i]) then
        cl[i].NotifyConnectionDestroy;
    cl.Free;
  end;
  Close();
  inherited Destroy;
end;

procedure TAmqpConnection.Close;
begin
  if IsConnected then begin
    SetIsConnected(False);
    amqp_connection_close(FConnection, AMQP_REPLY_SUCCESS);
    amqp_destroy_connection(FConnection);
  end;
end;

class procedure TAmqpConnection.CheckForError(ARet: Integer);
begin
  if ARet < 0 then
    raise EAmqpLibraryException.Create(ARet);
end;

procedure TAmqpConnection.CheckRpcReply(
  AChannel: amqp_channel_t; const AReply: amqp_rpc_reply_t);
begin
  case AReply.reply_type of
    AMQP_RESPONSE_NORMAL: Exit;

    AMQP_RESPONSE_LIBRARY_EXCEPTION:
      // If we're getting this likely is the socket is already closed
      raise EAmqpResponseLibraryException.Create(AReply, '');

    AMQP_RESPONSE_SERVER_EXCEPTION: begin
      case AReply.reply.id of
        AMQP_CHANNEL_CLOSE_METHOD:
          FinishCloseChannel(AChannel);
        AMQP_CONNECTION_CLOSE_METHOD:
          FinishCloseConnection();
      end;
      EAmqpException.Throw(AReply);
    end;

    else
      EAmqpException.Throw(AReply);
  end;
end;

procedure TAmqpConnection.AddToFrameQueue(AFrame: amqp_frame_t);
begin
  if AFrame.channel < FChannels.Count then
    FChannels[AFrame.channel].AddFrameToQueue(AFrame);
  // else raise error ???
end;

class function TAmqpConnection.ComputeBrokerVersion(
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

procedure TAmqpConnection.DoLogin(const AUser: AnsiString;
  const APassword: AnsiString; AVHost: AnsiString; AFrameMax: Integer);
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
      FConnection, PAnsiChar(AVHost), 0, AFrameMax,
      BROKER_HEARTBEAT, @client_properties, AMQP_SASL_METHOD_PLAIN,
      PAnsiChar(AUser), PAnsiChar(APassword)));

  FBrokerVersion := ComputeBrokerVersion(FConnection);
end;

procedure TAmqpConnection.FinishCloseChannel(
  AChannel: amqp_channel_t);
var
  close_ok: amqp_channel_close_ok_t;
begin
  FChannels[AChannel].FState := CS_Closed;

  CheckForError(amqp_send_method(
    FConnection, AChannel, AMQP_CHANNEL_CLOSE_OK_METHOD, @close_ok));
end;

procedure TAmqpConnection.FinishCloseConnection();
var
  close_ok: amqp_connection_close_ok_t;
begin
  SetIsConnected(False);
  amqp_send_method(FConnection, 0, AMQP_CONNECTION_CLOSE_OK_METHOD, @close_ok);
end;

procedure TAmqpConnection.SetIsConnected(AValue: Boolean);
begin
  FIsConnected := AValue;
end;

end.

