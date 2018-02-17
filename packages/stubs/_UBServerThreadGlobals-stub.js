/*
  Purpose of this file is to describe objects and functions added to server-side JavaScript thread(s) by UnityBase server.
  All described here is native UB objects imported to SpiderMonkey (i.e. realisation is in Pascal or C).
  This file provide correct syntax check, code insight and documentation if we edit models in IDE like JetBrains, eclipse e.t.c.
  Also server-side documentation generated based on this file.

  Author: pavel.mash
  Date: 10.08.13
*/

/**
 * @classdesc
 * Entity communication class. Use it to:
 *
 *  - execute any entity method using {@link TubDataStore#run}
 *  - execute any SQL statement using {@link TubDataStore#runSQL} or {@link TubDataStore.execSQL} (we strongly recommend usage of ORM instead SQL)
 *  - store several named data collection using {@link TubDataStore#currentDataName} (data stored inside server memory, not in JS, this is very good for GC)
 *  - iterate other collection rows using {@link TubDataStore#next}, eof, e.t.c and retrieve row data using TubDataStore.get
 *  - serialize data to XML or JSON
 *
 *  To retrieve data from database using build-in ORM (to execute entity `select` method) preffered way is to use {@link UB.Repository} fabric function.
 *
 * @class TubDataStore
 * @param {String|TubEntity} entity
 * @constructor
 */
function TubDataStore (entity) {}
TubDataStore.prototype = {
    /**
     * Run any entity method.
     * @example
     *
     * var store = new TubDataStore('doc_attachment');
     * store.run('update', {execParams: {
     *          ID: 1,
     *          approved: 0
     *      }
     * });
     *
     * store.run('anyEntityMethod', {param1: 'valueOfParam1', ...});
     *
     * @param {String} methodName
     * @param {Object|TubList} params
     * @return {Boolean} True in case of success, else raise exception
     */
  run: function (methodName, params) {},
    /**
     * Execute SQL with parameters and place result into dataStore. This method expect SQL statement have **result**.
     *
     * To execute SQL statement without result (`insert` for example) - use TubDataStore.execSQL instead.
     *
     * @param {String} sql SQL statement to run
     * @param {Object|TubList} params SQL parameters list
     */
  runSQL: function (sql, params) {},
    /**
     * Execute SQL with parameters. Not wait result data
     * @param {String} sql SQL statement to run
     * @param {Object|TubList} params SQL parameters list
     */
  execSQL: function (sql, params) {},
    /**
     * init dataStore content from JSON string
     * If you need to init dataStore w/o rows:
     *
     *      var ds = new TubDataStore('myEntityCode');
     *      ds.initFromJSON({"fieldCount":1,"values":["ID"],"rowCount":0});
     *      console.log(ds.initialized); // TRUE
     *
     * WARNING!!! during initFromJSON UnityBase determinate field types from vield values,
     *  so if some data column contain only numeric values it becode Number (even if in source it String).
     *
     * @param source
     */
  initFromJSON: function (source) {},

    /**
     * Return zero based index of fieldName from current data store (-1 if not found)
     * @example

            var r = UB.Repository('cdn_organization').attrs(['ID', 'mi_owner.name']).where('[ID]', '=', 3000000002801).select();
            console.log(r.fieldIndexByName('mi_owner.name')); // 1
            console.log(r.fieldIndexByName('unexistedAttr')); // -1

     * @param {String} fieldName
     */
  fieldIndexByName: function (fieldName) {},
    /**
     * Return value of attribute.
     *
     * In case store initialized using TubDataStore.run style we can return Number or String type,
     * but in case it initialized using runSQL columns data types is unknown and you must cast value do required type directly.
     *
     * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
     * @return {Number|String}
     */
  'get': function (attrib) {},
    /**
     * Return value of attribute as ArrayBuffer.
     *
     * You can apply this method to blob fields only
     *
     * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
     * @return {ArrayBuffer}
     */
  'getAsBuffer': function (attrib) {},
    /** Move next */
  next: function () {},
    /** Move prev */
  prev: function () {},
    /** Move first */
  first: function () {},
    /** Move last */
  last: function () {},
    /**
     * Indicate current position in data collection is on the begining of collection
     * @type {Boolean}
     */
  bof: true,
    /**
     * Indicate current position in data collection is on the end of collection.
     * @type {Boolean}
     */
  eof: true,

    /**
     * Generate a new identifier (int64)
     * @return {Number}
     */
  generateID: function () {},

    /**
     * Is store initialized
     * @type {Boolean}
     */
  initialized: false,
    /**
     * Return string representation of Instance in format `[{attr1: value1, attr2: value2},... ]`
     * @type {String}
     */
  asJSONObject: '[{attr1: value1, attr2: value2},... ]',
    /**
     * Return string representation of Instance in `Array of array` format
     * @type {String}
     */
  asJSONArray: '[[value1, value2,..],..[]]',
    /**
     * Return XML representation of Instance in MS DataSet format
     * @type {String}
     */
  asXMLPersistent: 'MS dataset xml format',
  /**
   * Active dataset name we work with. There is some predefined dataNames - see TubDataStore.prototype.DATA_NAMES
   * @type {String}
   */
  currentDataName: '',
  /**
   * Record count. If DataStore is not initialized or empty will return 0.
   * @type {Number}
   */
  rowCount: 0,
  /**
   * Total record count if store are filled with withTotal() option.
   * If DataStore is not initialized or empty or inited without withTotal() will return -1.
   * @type {Number}
   */
  totalRowCount: 0,
  /**
   * Row position inside currentDataName dataset. Read/write
   * @type {Number}
   */
  rowPos: 0,
  /**
   * Release all internal resources. Store became unusable after call to `freeNative()`
   */
  freeNative: function () {}
}

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
  dataStore: new TubDataStore(),
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
   * In case statusCode === 2000 and response body length > 64 will
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

/**
 * Entity attributes data type
 * @enum {Number}
 * @readonly
 */
TubAttrDataType = {Unknown: 0,
  String: 1,
  Int: 2,
  BigInt: 3,
  Float: 4,
  Currency: 5,
  Boolean: 6,
  DateTime: 7,
  Text: 8,
  ID: 9,
  Entity: 10,
  Document: 11,
  Many: 12,
  TimeLog: 13,
  Enum: 14,
  BLOB: 15,
  Date: 16}

/**
 * Entity cache type
 * @enum {Number}
 * @readonly
 */
TubCacheType = {None: 0, SessionEntity: 1, Entity: 2, Session: 3}

/**
 * Supported SQL dialects
 * @enum {Number}
 * @readonly
 */
TubSQLDialect = {AnsiSQL: 0,
  Oracle: 1,
  Oracle9: 2,
  Oracle10: 3,
  Oracle11: 4,
  MSSQL: 5,
  MSSQL2008: 6,
  MSSQL2012: 7,
  SQLite3: 8,
  PostgreSQL: 9,
  Firebird: 10}

/**
 * Entity dataSource types
 * @enum {Number}
 * @readonly
 */
TubEntityDataSourceType = {Normal: 0, External: 1, System: 2, Virtual: 3}

/**
 * SQL expression types
 * @enum {Number}
 * @readonly
 */
TubSQLExpressionType = {Field: 0, Expression: 1}
