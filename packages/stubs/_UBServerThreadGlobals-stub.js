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
 * @classdesc
 * During initialization phrase UnityBase load application domain {@link UBDomain} and create a global
 * variable for each entity from domain. Name of such global variable equal to entity name.
 * `EntityNamespace` pseudo class is a accessor for such namespaces.
 *
 * The main task of this class is to provide a code insight in IDEs like WebStorm or VSCode.
 * `ubcli createCodeInsightHelper` command will create a stubs for all entities in model.
 *
 * @extends EventEmitter
 */
class EntityNamespace extends EventEmitter {
  constructor () {
    super()
    /**
     * Reference to entity metadata
     * @type {UBEntity}
     */
    this.entity = new UBEntity()
  }
}

// TODO - mixin documentation
/**
 * Mixin. Provide CRUID operations for entity database persistent (ORM) using `ubql` query syntax
 * @mixin
 */
const mStorage = {
  /**
   * Read entity data
   * @published
   * @param {ubMethodParams} ctxt
   */
  select: function (ctxt) {},
  /**
   * Insert data
   * @published
   * @param {ubMethodParams} ctxt
   */
  insert: function (ctxt) {},
  /**
   * Update data
   * @published
   * @param {ubMethodParams} ctxt
   */
  update: function (ctxt) {},
  /**
   * Delete data
   * @published
   * @param {ubMethodParams} ctxt
   */
  delete: function (ctxt) {},
  /**
   * Create record with filled default values and return it to caller.
   * Newly created record not inserted to database. For inserting record to the database `insert` method should be called
   * @published
   * @param {ubMethodParams} ctxt
   */
  addNew: function (ctxt) {}
}

/**
 * Mixin. Implements inheritance for ORM. Override `insert`, `update` and `delete` methods and
 * synchronize content of current entity attributes subset (defined in `unity.attributeList` config)
 * with entity specified in `unity.entity` mixin configuration parameter.
 *
 * Configuration can accept optional `unity.mapping` and `unity.defaults`
 * @mixin
 */
const unity = {

}

/**
 * Mixin. Enabled by default. All insert/update/delete low level operation will be logged to `uba_auditTrail`
 * @mixin
 */
const audit = {

}

/**
 * Mixin. Pessimistic Lock implementation
 * @mixin
 */
const softLock = {
  /**
   * Lock entity row. In case entity row not locked `update` & `delete` operation are not permitted
   * @published
   * @param {ubMethodParams} ctxt
   * @param {number} ctxt.mParams.ID
   */
  lock: function (ctxt) {},
  /**
   * Unlock entity row.
   * @published
   * @param {ubMethodParams} ctxt
   * @param {number} ctxt.mParams.ID
   */
  unlock: function (ctxt) {},
  /**
   * @published
   * @param {ubMethodParams} ctxt
   */
  renewLock: function (ctxt) {},
  /**
   * @published
   * @param {ubMethodParams} ctxt
   */
  isLocked: function (ctxt) {}
}

/**
 * Mixin. Provide Row Level Security. See {@tutorial rls} for details.
 * Will override `select` method and add a SQL expression returned by function specified in `rls.expression`
 * to `where` section of each `select` operation
 * @mixin
 */
const rls = {

}

/**
 * Mixin. Provide Row Level Security based on Access Control List
 * @mixin
 */
const aclRls = {

}

/**
 * Mixin. Provide Attribute Level Security
 * @mixin
 */
const als = {
  /**
   * Must be implemented in entity. Method should return all possible roles
   * @published
   * @abstract
   * @param {ubMethodParams} ctxt
   */
  getallroles: function (ctxt) {},
  /**
   * Must be implemented in entity. Method should return all possible states
   * @published
   * @abstract
   * @param {ubMethodParams} ctxt
   */
  getallstates: function (ctxt) {}
}

/**
 * Mixin. Provide historical data storage
 * @mixin
 */
const dataHistory = {
  /**
   * Create new version of specified record
   * @published
   * @param {ubMethodParams} ctxt
   */
  newversion: function (ctxt) {}
}

/**
 * Mixin. Implements Materialized path.
 * Will add mi_treePath to entity attribute and store where current row Materialized path - a string
 * representing row hierarchy rootID/textLevelID/.../currentRowID
 *
 * @mixin
 */
const tree = {

}

/**
 * Mixin. Full Text Search. See {@tutorial fts} for details
 *
 * @mixin
 */
const fts = {
  /**
   * Full text search query
   * @published
   * @param {ubMethodParams} ctxt
   */
  fts: function (ctxt) {},
  /**
   * Ce-create entity FTS index
   * @published
   * @param {ubMethodParams} ctxt
   */
  ftsreindex: function (ctxt) {}
}

/**
 * Mixin for truncate `clob` field data to short string (mostly for Oracle)
 *
 * @mixin
 */
const clobTruncate = {

}
