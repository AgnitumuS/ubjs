/**
 * @class
 * Mail body type
 * @enum {Number}
 */
UBMail.TubSendMailBodyType = {Text: 0, HTML: 1, Calendar: 2};

/**
 * @class
 * Mail attach kind
 * @enum {Number}
 */
UBMail.TubSendMailAttachKind = {File: 0, Text: 1, Buffer: 2};

/**
 * @class
 * Mail POP3 receiver object
 * @constructor
 * @param {Object} paramsObj parameters object
 * @param {String} paramsObj.host host of mail server
 * @param {String} paramsObj.port port of mail server
 * @param {String} [paramsObj.user = ''] user login on mail server
 * @param {String} [paramsObj.password = ''] user password on mail server
 * @param {Boolean} [paramsObj.tls = false] use tls. In {@link UBMail} tls is
 * not implemented so you will get an exception when set this value true.
 * For using tls use {@link UBMail_openssl} class
 */
UBMail.TubMailReceiver = function(paramsObj) {};

/**
 * Count of messages on server
 *
 * @returns {Number}
 */
UBMail.TubMailReceiver.getMessagesCount = function() {};

/**
 * Get size of message
 *
 * @param {Number} index Index of mail message on server. Indexes starts from 1
 * @returns {Number}
 */
UBMail.TubMailReceiver.getMessageSize = function(index) {};

/**
 * Receive message from server
 *
 * @param {Number} index Index of mail message on server. Indexes starts from 1
 * @returns {UBMail.TUBMimeMess}
 */
UBMail.TubMailReceiver.receive = function(index) {};

/**
 * Receive message headers and first maxLines strings of message
 *
 * @param {Number} index Index of mail message on server. Indexes starts from 1
 * @param {Number} maxLines Count of message lines to receive
 * @returns {UBMail.TUBMimeMess}
 */
UBMail.TubMailReceiver.top = function(index, maxLines) {};

/**
 * Mark the message to delete. The message will be removed indeed, when reconnect to the server
 * or the object is destroyed.
 * For destroy object immediately use freeNative, for reconnect use reconnect() method
 *
 * @param {Number} index Index of mail message on server. Indexes starts from 1
 * @returns {Boolean} True if successfully, in opposite case raise exception
 */
UBMail.TubMailReceiver.deleteMessage = function(index) {};

/**
 * @method reconnect
 * Reconnect to mail server. Get new messages from server, delete marked for delete messages.
 *
 * @returns {Boolean} True if successfully, in opposite case raise exception
 */
UBMail.TubMailReceiver.reconnect = function() {};

/**
 * @class UBMail.TubMailAttach
 * mail attach
 */

/**
 * Mail attach kind
 *
 * @property kind
 * @type {UBMail.TubSendMailAttackKind}
 */

/**
 * Attach data.
 *
 * If kind is File, then String with path to attached file
 *
 * If kind is Text, then String with attach content
 *
 * If kind is Buffer, then ArrayBuffer containing attach content
 *
 * @property data
 * @type {String|ArrayBuffer}
 */

/**
 * Name of attached file.
 *
 * Optional when kind is File
 *
 * @property atachName
 * @type {String}
 */

/**
 *  Is attach data already decoded to Base64
 *
 *  Optional, default false
 *
 *  @property isBase64
 *  @type Boolean
 */

/**
 * @class
 * Mail SMTP sender object
 * @constructor
 * @param {Object} paramsObj parameters object
 * @param {String} paramsObj.host host of mail server
 * @param {String} paramsObj.port port of mail server
 * @param {String} [paramsObj.user = ''] user login on mail server
 * @param {String} [paramsObj.password = ''] user password on mail server
 * @param {Boolean} [paramsObj.tls = false] use tls. In {@link UBMail} tls is
 *    not implemented so you will get an exception when set this value true.
 *    For using tls use {@link UBMail_openssl} class
 * @param {Boolean} [paramsObj.auth = false] is need user authentication
 */
UBMail.TubMailSender = function(paramsObj) {};

/**
 * Last error when last sendMail failed. Empty string last sendMail finished successfully.
 *
 * @property lastError
 * @type {String}
 */
 
/**
 * send a email message
 *
 * @param {Object} mailObj sending mail object
 * @param {String} [mailObj.subject] mail subject
 * @param {UBMail.TubSendMailBodyType} [mailObj.bodyType = UBMail.TubSendMailBodyType.Text] mail body type
 * @param {String} [mailObj.body = ''] mail body. If bodyType is Calendar then valid *.ics file
 * @param {String} [mailObj.fromAddr = ''] sender address
 * @param {Array.<String>} [mailObj.toAddr = []] array of receivers addresses
 * @param {Array.<UBMail.TubMailAttach>} [mailObj.attaches = []] array of attaches. Ignoreg when bodyType is Calendar.
 * @returns {Boolean} True if successfully
 */
UBMail.TubMailSender.sendMail = function(mailObj) {};

/**
 * @class UBMail.TUBMimeMess
 * Received message
 */
    UBMail.TUBMimeMess = function () {};

/**
 * Main mime part of message
 *
 * @type {UBMail.TMimePart}
 */
    UBMail.TUBMimeMess.messagePart = {};
/**
 * Full text of message
 *
 * @type UBMail.StringCollection
 */
    UBMail.TUBMimeMess.fullText = {};

/**
 * Header of message
 *
 * @type UBMail.TMessHeader
 */
    UBMail.TUBMimeMess.header = {};

/**
 * class for storing strings list
 *
 * @class UBMail.StringCollection
 * @implements {UBReader}
 */
    UBMail.StringCollection = function () {};
/**
 * Length content in bytes
 *
 * @type {Number}
 */
    UBMail.StringCollection.byteLength = 0;

/**
 * Count of lines in list
 *
 * @type {Number}
 */
    UBMail.StringCollection.linesCount = 0;

/**
 * @method readLn
 * Get string with custom index from list as String or ArrayBuffer
 *
 * @param {Number} index Index of string
 * @param {String} [encoding] Optional encoding of source. Default to 'utf-8'.
 *						        If 'bin' - return ArrayBuffer source representation without any conversion.
 *							  	If 'base64' - transform base64 encoded content of source to ArrayBuffer
 * @returns {ArrayBuffer|String} Return String in case no encoding passed or ArrayBuffer
 */
    UBMail.StringCollection.readLn = function(index, encoding) {};

/**
 * @method read
 * @inheritdoc UBReader#read
 * @inheritDoc {UBReader#read}
 */

    UBMail.StringCollection.read = function(encoding) {};

/**
 * @class UBMail.TMessHeader
 */
    UBMail.TMessHeader = function () {};

/**
 * Sender of message
 *
 * @type {String}
 */
    UBMail.TMessHeader.from = '';

/**
 * Receivers of message (one per line)
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMessHeader.toList = {};

/**
 * Carbon Copy receivers of message (one per line)
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMessHeader.cCList = {};

/**
 * Subject of message
 *
 * @type {String}
 */
    UBMail.TMessHeader.subject = '';

/**
 * Organization string
 *
 * @type {String}
 */
    UBMail.TMessHeader.organization = '';

/**
 * After decoding contains all headers lines witch not have parsed to any
 * other structures in this object
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMessHeader.customHeaders = {};

/**
 * Date and time of message
 *
 * @type {Date}
 */
    UBMail.TMessHeader.date = new Date();

/**
 * Mailer identification
 *
 * @type {String}
 */
    UBMail.TMessHeader.xMailer = '';

/**
 * Address for replies
 *
 * @type {String}
 */
    UBMail.TMessHeader.replyTo = '';

/**
 * Message indetifier
 *
 * @type {String}
 */
    UBMail.TMessHeader.messageID = '';

/**
 * Message priority
 *
 * Can take the values​​: MP_unknown, MP_low, MP_normal, MP_high
 *
 * @type {String}
 */
    UBMail.TMessHeader.priority = '';

/**
 * Specify base charset. By default is used system charset
 *
 * @type {String}
 */
    UBMail.TMessHeader.charsetCode = '';

/**
 * Mime part of message
 *
 * @class UBMail.TMimePart
 */
    UBMail.TMimePart = function() {};

/**
 * Primary Mime type of part. (i.e. 'application')
 *
 * @type {String}
 */
    UBMail.TMimePart.primary = '';

/**
 * String representation of used Mime encoding in part. (i.e. 'base64')
 *
 * @type {String}
 */
    UBMail.TMimePart.encoding = '';

/**
 * String representation of used Mime charset in part. (i.e. 'iso-8859-1')
 * Writing to this property automaticly generate value of @link(CharsetCode).
 * Charset is used only for text parts.
 *
 * @type {String}
 */
    UBMail.TMimePart.charset = '';

/**
 * Define default charset for decoding text MIME parts without charset
 * specification. Default value is 'ISO-8859-1' by RCF documents.
 * But Microsoft Outlook use windows codings as default. This property allows
 * properly decode textual parts from some broken versions of Microsoft
 * Outlook.
 *
 * @type {String}
 */
    UBMail.TMimePart.defaultCharset = '';

/**
 * Decoded primary type. Possible values are: MP_TEXT, MP_MULTIPART,
 * MP_MESSAGE and MP_BINARY. If type not recognised, result is MP_BINARY.
 *
 * @type {String}
 */
    UBMail.TMimePart.primaryCode = '';

/**
 * Decoded encoding type. Possible values are: ME_7BIT, ME_8BIT,
 * ME_QUOTED_PRINTABLE and ME_BASE64. If type not recognised, result is
 * ME_7BIT.
 *
 * @type {String}
 */
    UBMail.TMimePart.encodingCode = '';

/**
 * Decoded charset type.
 *
 * @type {String}
 */
    UBMail.TMimePart.charsetCode = '';

/**
 * System charset type. Default value is charset used by default in your
 * operating system.
 *
 * @type {String}
 */
    UBMail.TMimePart.targetCharset = '';

/**
 * If True, then do internal charset translation of part content between CharsetCode
 * and TargetCharset
 *
 * @type {Boolean}
 */
    UBMail.TMimePart.convertCharset = '';

/**
 * If True, then allways do internal charset translation of HTML parts
 * by MIME even it have their own charset in META tag. Default is False.
 *
 * @type {Boolean}
 */
    UBMail.TMimePart.forcedHTMLConvert = '';

/**
 * Secondary Mime type of part. (i.e. 'mixed')
 *
 * @type {String}
 */
    UBMail.TMimePart.secondary = '';

/**
 * Description of Mime part.
 *
 * @type {String}
 */
    UBMail.TMimePart.description = '';

/**
 * Value of content disposition field. (i.e. 'INLINE' or 'ATTACHMENT')
 *
 * @type {String}
 */
    UBMail.TMimePart.disposition = '';

/**
 * Content ID.
 *
 * @type {String}
 */
    UBMail.TMimePart.contentID = '';

/**
 * Boundary delimiter of multipart Mime part. Used only in multipart part.
 *
 * @type {String}
 */
    UBMail.TMimePart.boundary = '';

/**
 * Filename of file in binary part.
 * @type {String}
 */
    UBMail.TMimePart.fileName = '';

/**
 * String list with lines contains mime part (It can be a full message).
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMimePart.lines = {};

/**
 * Encoded form of MIME part data.
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMimePart.partBody = {};

/**
 * All header lines of MIME part.
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMimePart.headers = {};

/**
 * On multipart this contains part of message between first line of message
 * and first boundary.
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMimePart.prePart = {};

/**
 * On multipart this contains part of message between last boundary and end
 * of message.
 *
 * @type {UBMail.StringCollection}
 */
    UBMail.TMimePart.postPart = {};

/**
 * Show nested level in subpart tree. Value 0 means root part. 1 means
 * subpart from this root. etc.
 *
 * @type {Number}
 */
    UBMail.TMimePart.subLevel = 0;

/**
 * Specify maximum sublevel value for decomposing.
 *
 * @type {Number}
 */
    UBMail.TMimePart.maxSubLevel = 0;

/**
 * When is True, then this part maybe(!) have included some uuencoded binary
 * data
 *
 * @type {Boolean}
 */
    UBMail.TMimePart.attachInside = false;

/**
 * Here you can specify maximum line length for encoding of MIME part.
 * If line is longer, then is splitted by standard of MIME. Correct MIME
 * mailers can de-split this line into original length.
 *
 * @type {Boolean}
 */
    UBMail.TMimePart.maxLineLength = 0;

/**
 * Subparts of MimePart
 *
 * @type {Array.<UBMail.TMimePart>}
 */
    UBMail.TMimePart.subPart = [];

/**
 * Implementation of UBMail with openssl. This module loading time is more then 2 seconds. So if you not need use ssl use UBMail.
 *
 * You need OpenSSL libraries version >= 0.9.7 to be installed and libraries libssl32.dll, libeay32.dll, ssleay32.dll must be in the PATH
 *
 * See {@link UBMail} for details
 *
 * @class UBMail_openssl
 */
UBMail_openssl = UBMail

