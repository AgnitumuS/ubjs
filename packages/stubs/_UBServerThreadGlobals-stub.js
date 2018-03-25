/*
  Purpose of this file is to describe objects and functions added to server-side JavaScript thread(s) by UnityBase server.
  All described here is native UB objects imported to SpiderMonkey (i.e. realisation is in Pascal or C).
  This file provide correct syntax check, code insight and documentation if we edit models in IDE like JetBrains, eclipse e.t.c.
  Also server-side documentation generated based on this file.

  Author: pavel.mash
  Date: 10.08.13
*/

/**
 * Collection of named items
 * @class TubNamedCollection
 */
function TubNamedCollection () {}
TubNamedCollection.prototype = {
  /**
   * Get list element by name
   * @param name
   * @returns {Number|String|TubList}
   */
  byName: function (name) {},

  /**
   * Stringified JSON representation of named collection
   * @type {String}
   */
  asJSON: '',
  /**
   * Number of named collection items
   * @type {Number}
   */
  count: 0,
  /**
   * Array of collection items
   * @type {Array}
   */
  items: [],
  /**
   * Array of collection item names
   * @type {Array}
   */
  strings: []
}

/**
 * @classdesc
 * Structure passed as parameter to all entity level scripting methods
 * @class ubMethodParams
 */
function ubMethodParams () {}
ubMethodParams.prototype = {
  /**
   * Do not call methods of other mixins with <b>the same method name</b>.
   * This mean if preventDefault() is called in the overridden `beforeselect`, only `beforeselect` of mixin method will not be called.
   * Useful if we want to override original method implementation by our own implementation.
   *
   * See ubm_form.update implementation for usage sample.
   */
  preventDefault: function () {},
  /**
   * Do not check row modification date while execute statement.
   * @type {Boolean}
   */
  skipOptimisticLock: false,
  /**
   * Data Store associated with current method execution context. If initialized - will be added to client response
   * @type {TubDataStore}
   * @readonly
   */
  dataStore: null,
  /**
   * Params caller pass to HTTP request.
   * @type {TubList}
   */
  originalParams: null,
  /**
   * In/Out method parameters. All parameters added or modified in this object is passed back to client
   * @type {TubList}
   */
  mParams: null,
  /**
   * Indicate current method execution initiated by external caller (client). If false - this method is called from server.
   * @type {Boolean}
   * @readonly
   */
  externalCall: true
}

/** Structure for direct read HTTP request properties. Passed as parameter to endpoints handler.
 * Also accessible in in entity level scripting methods while in rest mode
 * @class
 * @implements {UBReader}
 */
function THTTPRequest () {}
THTTPRequest.prototype = {
  /** HTTP request headers
   * @type {String}
   * @readonly
   */
  headers: '{header:value\\n\\r}',
  /** HTTP request method GET|POST|PUT......
   * @type {String}
   * @readonly
   */
  method: 'POST',
  /** full request URL with app name, method name and parameters
   * for request http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
   * - return ub/rest/doc_document/report?id=1&param2=asdas
   * @type {String}
   * @readonly
   */
  url: 'URL',

  /** request URI - URL WITHOUT appName and method name
   * - return doc_document/report
   * @type {String}
   * @readonly
   */
  uri: 'uri',
  /**
   * The same as uri, but URLDecode'd
   *
   *      req.uri === "TripPinServiceRW/My%20People"
   *      //
   *      req.decodedUri === "TripPinServiceRW/My People"
   *
   * @type {String}
   * @readonly
   */
  decodedUri: 'URLDEcoded uri',

  /** request parameters if any
   * - return id=1&param2=asdas
   * @type {String}
   * @readonly
   */
  parameters: '',
  /**
   * URLDecoded request parameters if any
   *
   *      req.parameters === "$filter=Name%20eq%20%27John%27"
   *      //
   *      req.decodedParameters === "$filter=Name eq 'John'"
   *
   * @type {String}
   * @readonly
   */
  decodedParameters: 'params',
  /** @inheritdoc
   * @param {String} [encoding]
   */
  read: function (encoding) {},
  /** HTTP request body
   * @type {String}
   * @deprecated Since 1.8 use {@link THTTPRequest#read} instead
   */
  body: ''
}

/** Structure for direct write HTTP response. Passed as parameter to application level scripting methods (see App.registerEndpoint )
 * also accessible in in entity level scripting methods while in rest mode.
 *
 * Implements string writer.
 *
 * Caller MUST call writeEnd once in the end and set response statusCode
 *
 * To send file content as a response without loading file into memory the following code can be used:
 *
      // Replace this comments by JSDocs style comment
      // param {THTTPRequest} req
      // param {THTTPResponse} resp
      function getPublicDocument(req, resp){
        resp.statusCode = 200;
        resp.writeHead('Content-Type: !STATICFILE\r\nContent-Type: text/plain'); // !STATICFILE is a special content type - will be removed from headers by server during sending
        resp.writeEnd('c:\\myFilesWithPasswords.txt');
      }

 * @class
 * @implements {UBWriter}
 */
function THTTPResponse () {}
THTTPResponse.prototype = {
  /** Add response header(s). Can be called several times for DIFFERENT header
   *
   *    resp.writeHead('Content-Type: text/css; charset=UTF-8\r\nOther-header: value')
   *
   * @param {String} header one header or #13#10 separated headers
   */
  writeHead: function (header) {},
  /**
   * @inheritdoc
   */
  write: function (data, encoding) {},
  /**
   * Write base64 encoded data as a binary representation (will decode from base64 to binary before write to response)
   * @param {String} base64Data
   */
  writeBinaryBase64: function (base64Data) {},
  /** Write to internal buffer and set buffer content as HTTP response.
   * See {UBWriter.wrote} for parameter details
   * @param {ArrayBuffer|Object|String} data
   * @param {String} [encoding]
   */
  writeEnd: function (data, encoding) {},
   /** response HTTP status code
   * @type {Number} */
  statusCode: 400,
  /**
   * Perform a ETag based HTTP response caching.
   * Must be called after writeEnd called and and statusCode is defined.
   *
   * In case statusCode === 200 and response body length > 64 will
   *  - if request contains a IF-NONE-MATCH header, and it value equal to response crc32
   * will mutate a statusCode to 304 (not modified) and clear the response body
   *  - in other case will add a ETag header with value = hex representation of crc32(responseBody).
   */
  validateETag: function () {}
}

/**
 * Structure for calling WebSocket handlers
 * @class
 */
function WebSocketConnection () {}
WebSocketConnection.prototype = {
  /**
   * Current logged in user session
   * @type {Session}
   * @readonly
   */
  session: null,
  /**
   * Send message to caller
   * @param {String|Object|ArrayBuffer} data
   */
  send: function (data) {},
  /**
   * Close caller connection
   * @param {String} [reason]
   */
  close: function (reason) {}
}
