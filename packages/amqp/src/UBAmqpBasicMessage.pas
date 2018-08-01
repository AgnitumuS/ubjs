unit UBAmqpBasicMessage;

interface

uses
  SysUtils,
  rabbitmq,
  UBAmqpTypes;

type
  { TAmqpBasicMessage }

  TAmqpBasicMessage = class
  public type
    TAmqpDeliveryMode =
      ( admUnknown = 0, admNonpersistent = 1, admPersistent = 2 );
    TDeliveryInfo = record
      DeliveryTag: UInt64;
      DeliveryChannel: UInt16;
      ConsumerTag: TAmqpBytes;
      Exchange: TAmqpBytes;
      RoutingKey: TAmqpBytes;
      Redelivered: Boolean;
    end;
    PDeliveryInfo = ^TDeliveryInfo;
  private
    function GetAppId: TAmqpBytes;
    function GetBody: TAmqpBytes;
    function GetClusterId: TAmqpBytes;
    function GetContentEncoding: TAmqpBytes;
    function GetContentType: TAmqpBytes;
    function GetCorrelationId: TAmqpBytes;
    function GetDeliveryMode: TAmqpDeliveryMode;
    function GetExpiration: TAmqpBytes;
    function GetIsAppIdSet: Boolean;
    function GetIsClusterIdSet: Boolean;
    function GetIsContentEncodingSet: Boolean;
    function GetIsContentTypeSet: Boolean;
    function GetIsCorrelationIdSet: Boolean;
    function GetIsDeliveryModeSet: Boolean;
    function GetIsExpirationSet: Boolean;
    function GetIsHeaderTableSet: Boolean;
    function GetIsMessageIdSet: Boolean;
    function GetIsPrioritySet: Boolean;
    function GetIsReplyToSet: Boolean;
    function GetIsTimestampSet: Boolean;
    function GetIsTypeSet: Boolean;
    function GetIsUserIdSet: Boolean;
    function GetMessageId: TAmqpBytes;
    function GetPriority: UInt8;
    function GetReplyTo: TAmqpBytes;
    function GetTimestamp: UInt64;
    function GetType: TAmqpBytes;
    function GetUserId: TAmqpBytes;
  protected
    function GetDeliveryInfo: PDeliveryInfo; virtual; abstract;
    function GetMessage: pamqp_message_t; virtual; abstract;
  public
    property AppId: TAmqpBytes read GetAppId;
    property Body: TAmqpBytes read GetBody;
    property ClusterId: TAmqpBytes read GetClusterId;
    property ContentEncoding: TAmqpBytes read GetContentEncoding;
    property ContentType: TAmqpBytes read GetContentType;
    property CorrelationId: TAmqpBytes read GetCorrelationId;
    property DeliveryInfo: PDeliveryInfo read GetDeliveryInfo;
    property DeliveryMode: TAmqpDeliveryMode read GetDeliveryMode;
    property Expiration: TAmqpBytes read GetExpiration;
    //property HeaderTable: TArray<amqp_table_entry_t_> read Get;
    property IsAppIdSet: Boolean read GetIsAppIdSet;
    property IsClusterIdSet: Boolean read GetIsClusterIdSet;
    property IsContentEncodingSet: Boolean read GetIsContentEncodingSet;
    property IsContentTypeSet: Boolean read GetIsContentTypeSet;
    property IsCorrelationIdSet: Boolean read GetIsCorrelationIdSet;
    property IsDeliveryModeSet: Boolean read GetIsDeliveryModeSet;
    property IsExpirationSet: Boolean read GetIsExpirationSet;
    property IsHeaderTableSet: Boolean read GetIsHeaderTableSet;
    property IsMessageIdSet: Boolean read GetIsMessageIdSet;
    property IsPrioritySet: Boolean read GetIsPrioritySet;
    property IsReplyToSet: Boolean read GetIsReplyToSet;
    property IsTimestampSet: Boolean read GetIsTimestampSet;
    property IsTypeSet: Boolean read GetIsTypeSet;
    property IsUserIdSet: Boolean read GetIsUserIdSet;
    property MessageId: TAmqpBytes read GetMessageId;
    property Priority: UInt8 read GetPriority;
    property ReplyTo: TAmqpBytes read GetReplyTo;
    property Timestamp: UInt64 read GetTimestamp;
    property &Type: TAmqpBytes read GetType;
    property UserId: TAmqpBytes read GetUserId;
  end;

implementation

{ TAmqpBasicMessage }

function TAmqpBasicMessage.GetAppId: TAmqpBytes;
begin
  if IsAppIdSet and Assigned(GetMessage.properties.app_id.bytes) then
    Result := TAmqpBytes(GetMessage.properties.app_id)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetBody: TAmqpBytes;
begin
  if Assigned(GetMessage.body.bytes) then
    Result := TAmqpBytes(GetMessage.body)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetClusterId: TAmqpBytes;
begin
  if IsClusterIdSet and Assigned(GetMessage.properties.cluster_id.bytes) then
    Result := TAmqpBytes(GetMessage.properties.cluster_id)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetContentEncoding: TAmqpBytes;
begin
  if IsContentEncodingSet and Assigned(GetMessage.properties.content_encoding.bytes) then
    Result := TAmqpBytes(GetMessage.properties.content_encoding)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetContentType: TAmqpBytes;
begin
  if IsContentTypeSet and Assigned(GetMessage.properties.content_type.bytes) then
    Result := TAmqpBytes(GetMessage.properties.content_type)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetCorrelationId: TAmqpBytes;
begin
  if IsCorrelationIdSet and Assigned(GetMessage.properties.correlation_id.bytes) then
    Result := TAmqpBytes(GetMessage.properties.correlation_id)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetDeliveryMode: TAmqpDeliveryMode;
begin
  if IsDeliveryModeSet then
    Result := TAmqpDeliveryMode(GetMessage.properties.delivery_mode)
  else
    Result := admUnknown;
end;

function TAmqpBasicMessage.GetExpiration: TAmqpBytes;
begin
  if IsExpirationSet and Assigned(GetMessage.properties.expiration.bytes) then
    Result := TAmqpBytes(GetMessage.properties.expiration)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetIsAppIdSet: Boolean;
begin
  Result := AMQP_BASIC_APP_ID_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_APP_ID_FLAG);
end;

function TAmqpBasicMessage.GetIsClusterIdSet: Boolean;
begin
  Result := AMQP_BASIC_CLUSTER_ID_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_CLUSTER_ID_FLAG);
end;

function TAmqpBasicMessage.GetIsContentEncodingSet: Boolean;
begin
  Result := AMQP_BASIC_CONTENT_ENCODING_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_CONTENT_ENCODING_FLAG);
end;

function TAmqpBasicMessage.GetIsContentTypeSet: Boolean;
begin
  Result := AMQP_BASIC_CONTENT_TYPE_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_CONTENT_TYPE_FLAG);
end;

function TAmqpBasicMessage.GetIsCorrelationIdSet: Boolean;
begin
  Result := AMQP_BASIC_CORRELATION_ID_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_CORRELATION_ID_FLAG);
end;

function TAmqpBasicMessage.GetIsDeliveryModeSet: Boolean;
begin
  Result := AMQP_BASIC_DELIVERY_MODE_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_DELIVERY_MODE_FLAG);
end;

function TAmqpBasicMessage.GetIsExpirationSet: Boolean;
begin
  Result := AMQP_BASIC_EXPIRATION_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_EXPIRATION_FLAG);
end;

function TAmqpBasicMessage.GetIsHeaderTableSet: Boolean;
begin
  Result := AMQP_BASIC_HEADERS_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_HEADERS_FLAG);
end;

function TAmqpBasicMessage.GetIsMessageIdSet: Boolean;
begin
  Result := AMQP_BASIC_MESSAGE_ID_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_MESSAGE_ID_FLAG);
end;

function TAmqpBasicMessage.GetIsPrioritySet: Boolean;
begin
  Result := AMQP_BASIC_PRIORITY_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_PRIORITY_FLAG);
end;

function TAmqpBasicMessage.GetIsReplyToSet: Boolean;
begin
  Result := AMQP_BASIC_REPLY_TO_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_REPLY_TO_FLAG);
end;

function TAmqpBasicMessage.GetIsTimestampSet: Boolean;
begin
  Result := AMQP_BASIC_TIMESTAMP_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_TIMESTAMP_FLAG);
end;

function TAmqpBasicMessage.GetIsTypeSet: Boolean;
begin
  Result := AMQP_BASIC_TYPE_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_TYPE_FLAG);
end;

function TAmqpBasicMessage.GetIsUserIdSet: Boolean;
begin
  Result := AMQP_BASIC_USER_ID_FLAG =
    (GetMessage.properties._flags and AMQP_BASIC_USER_ID_FLAG);
end;

function TAmqpBasicMessage.GetMessageId: TAmqpBytes;
begin
  if IsMessageIdSet and Assigned(GetMessage.properties.message_id.bytes) then
    Result := TAmqpBytes(GetMessage.properties.message_id)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetPriority: UInt8;
begin
  if IsPrioritySet then
    Result := GetMessage.properties.priority
  else
    Result := 0;
end;

function TAmqpBasicMessage.GetReplyTo: TAmqpBytes;
begin
  if IsReplyToSet and Assigned(GetMessage.properties.reply_to.bytes) then
    Result := TAmqpBytes(GetMessage.properties.reply_to)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetTimestamp: UInt64;
begin
  if IsTimestampSet then
    Result := GetMessage.properties.timestamp
  else
    Result := 0;
end;

function TAmqpBasicMessage.GetType: TAmqpBytes;
begin
  if IsTypeSet and Assigned(GetMessage.properties.&type.bytes) then
    Result := TAmqpBytes(GetMessage.properties.&type)
  else
    Result := TAmqpBytes.Empty;
end;

function TAmqpBasicMessage.GetUserId: TAmqpBytes;
begin
  if IsUserIdSet and Assigned(GetMessage.properties.user_id.bytes) then
    Result := TAmqpBytes(GetMessage.properties.user_id)
  else
    Result := TAmqpBytes.Empty;
end;

end.

