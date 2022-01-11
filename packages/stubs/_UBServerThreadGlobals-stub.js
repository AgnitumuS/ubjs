/* eslint-disable no-unused-vars */
/* global TubDataStore */
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
   *
   * @param name
   * @returns {Number|String|TubList}
   */
  byName: function (name) {},

  /**
   * Stringified JSON representation of named collection
   *
   * @type {string}
   */
  asJSON: '',
  /**
   * Number of named collection items
   *
   * @type {Number}
   */
  count: 0,
  /**
   * Array of collection items
   *
   * @type {Array}
   */
  items: [],
  /**
   * Array of collection item names
   *
   * @type {Array}
   */
  strings: []
}

/**
 * @classdesc
 * Structure passed as a parameter for all entity level scripting methods
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
   * Do not check row modification date while execute statement
   *
   * @type {boolean}
   */
  skipOptimisticLock: false,
  /**
   * Data Store associated with current method execution context. If initialized - will be added to client response
   *
   * @type {TubDataStore}
   * @readonly
   */
  dataStore: null,
  /**
   * Params caller pass to HTTP request
   *
   * @type {TubList}
   */
  originalParams: null,
  /**
   * In/Out method parameters. All parameters added or modified in this object is passed back to client.
   * In case method is called from client `mParams` is a serialized request body
   *
   * @type {TubList}
   */
  mParams: null,
  /**
   * Indicate current method execution initiated by external caller (client). If false - this method is called from server
   *
   * @type {boolean}
   * @readonly
   */
  externalCall: true
}

/**
 * Structure for calling WebSocket handlers
 *
 * @class
 */
function WebSocketConnection () {}
WebSocketConnection.prototype = {
  /**
   * Current logged-in user session
   *
   * @type {Session}
   * @readonly
   */
  session: null,
  /**
   * Send message to caller
   *
   * @param {String|object|ArrayBuffer} data
   */
  send: function (data) {},
  /**
   * Close caller connection
   *
   * @param {string} [reason]
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
 * @augments EventEmitter
 */
class EntityNamespace extends EventEmitter {
  constructor () {
    super()
    /**
     * Reference to entity metadata
     *
     * @type {UBEntity}
     */
    this.entity = new UBEntity()
  }
}

/**
 * Mixin. Provide CRUID operations for entity database persistent (ORM) using `ubql` query syntax
 *
 * @mixin
 */
const mStorage = {
  /**
   * ORM query for read records
   *
   * @published
   * @param {ubMethodParams} ctx
   * @param {UBQL} ctx.mParams ORM query in UBQL format
   */
  select: function (ctx) {},
  /**
   * New record insertion
   *
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Insert method parameters
   * @param {object} ctx.mParams.execParams Pairs of attributeName: attributeValue to be inserted
   * @param {array<string>} [ctx.mParams.fieldList] Optional attributes names. Values of this attributes will be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to insert
   */
  insert: function (ctx) {},
  /**
   * Update existed record
   *
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Update method parameters
   * @param {Object<string, *>} ctx.mParams.execParams Pairs of attributeName: attributeValue to be updated
   * @param {number} ctx.mParams.execParams.ID ID of instance we update
   * @param {array<string>} [ctx.fieldList] Optional attributes names. Values of this attributes will be returned in result.
   *   Additional DB query is required to return values, so if caller do not need it better to not pass a fieldList to update
   */
  update: function (ctx) {},
  /**
   * Delete record by ID
   *
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Delete method parameters
   * @param {object} ctx.mParams.execParams
   * @param {number} ctx.mParams.execParams.ID Instance ID to be deleted
   */
  delete: function (ctx) {},
  /**
   * Create record with filled default values and return it to caller.
   * Newly created record is not inserted to database. For inserting record to the database `insert` method should be called
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} [ctx.mParams] Optional values for attributes of new record
   */
  addNew: function (ctx) {}
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
   * Lock record. If record is not locked then `update` & `delete` operation are not permitted
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Method parameters
   * @param {number} ctx.mParams.ID Record ID to lock
   * @param {string} ctx.mParams.lockType Either 'Temp' or 'Persist'
   */
  lock: function (ctx) {},
  /**
   * Unlock record
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Method parameters
   * @param {number} ctx.mParams.lockID ID of lock to remove
   */
  unlock: function (ctx) {},
  /**
   * Renew existed lock
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Method parameters
   * @param {number} ctx.mParams.lockID ID of lock to remove
   */
  renewLock: function (ctx) {},
  /**
   * Check record is locked
   * @published
   * @param {ubMethodParams} ctx
   * @param {object} ctx.mParams Method parameters
   * @param {number} ctx.mParams.ID Record ID
   */
  isLocked: function (ctx) {}
}

/**
 * Mixin. Provide Row Level Security.
 *
 * Will override `select` method and add a SQL expression returned by function specified in `rls.expression`
 * to `where` section for each `select` operation.
 *
 * Scenarios where RLS might be useful:
 *    Show only tasks assigned to a current user, disallow to see any other tasks
 *    Show only menu items, available to the roles of the current ser
 *    Show only documents, where the current user is a participant
 *
 * See tutorial {@tutorial mixin_rls} for details.
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
   * @param {ubMethodParams} ctx
   */
  getallroles: function (ctx) {},
  /**
   * Must be implemented in entity. Method should return all possible states
   * @published
   * @abstract
   * @param {ubMethodParams} ctx
   */
  getallstates: function (ctx) {}
}

/**
 * Mixin. Provide historical data storage
 * @mixin
 */
const dataHistory = {
  /**
   * Create new version of specified record
   * @published
   * @param {ubMethodParams} ctx
   */
  newversion: function (ctx) {}
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
 * Mixin. Full Text Search. See {@tutorial mixins_fts} for details
 *
 * @mixin
 */
const fts = {
  /**
   * Full text search query
   * @published
   * @param {ubMethodParams} ctx
   */
  fts: function (ctx) {},
  /**
   * Re-create entity FTS index
   * @published
   * @param {ubMethodParams} ctx
   */
  ftsreindex: function (ctx) {}
}

/**
 * Mixin for truncate `clob` field data to short string (mostly for Oracle)
 *
 * @mixin
 */
const clobTruncate = {

}

// WebStorm do not understand JSDoc without real method declaration, so create a subs here
/**
 * Return zero based index of fieldName from current data store (-1 if not found)
 * @example

 let r = UB.Repository('cdn_organization').attrs(['ID', 'mi_owner.name'])
   .where('[ID]', '=', 3000000002801)
   .select()
 console.log(r.fieldIndexByName('mi_owner.name')) // 1
 console.log(r.fieldIndexByName('unexistedAttr')) // -1

 * @method fieldIndexByName
 * @memberOf TubDataStore.prototype
 * @param {string} fieldName
 */
TubDataStore.fieldIndexByName = function (fieldName) {}

/**
 * Set name for column. New name will be used during serialization to JSON or response
 * @example
// change column name in HTTP response for select method
entity.on('select:after', ctx => {
  const ccIdx = ctx.mParams.fieldList.indexOf('category.code')
  if (ccIdx !== -1) {
    ctx.dataStore.setColumnName(ccIdx, 'categoryCode')
  }
})

// change column name in HTTP response for custom method
entity.customSelect = function (ctx) {
  UB.Repository('tst_document').attrs('ID', 'category.code').limit(10).select(ctx.dataStore)
  ctx.dataStore.setColumnName(1, 'categoryCode')
  // caller got categoryCode instead of category.code
}

// change column name for custom SQL
store = new UB.DataStore('my_entity')
store.runSQL('select 1 from dual', {})
store.setColumnName(0, 'dummy')
const obj = store.getAsJsObject() // obj will be [{dummy: 1}]

 * @since UB 5.22.2
 * @method setColumnName
 * @memberOf TubDataStore.prototype
 * @param {number} columnIdx
 * @param {string} newColumnName
 */
TubDataStore.setColumnName = function (columnIdx, newColumnName) {}

/**
 * Run any entity method.
 * @example

let store = new TubDataStore('doc_attachment');
store.run('update', {
  execParams: {
    ID: 1,
    approved: 0
  }
})
store.run('anyEntityMethod', {param1: 'valueOfParam1', ...})

 * @param {string} methodName
 * @param {Object|TubList} params
 * @return {boolean} True in case of success, else raise exception
 * @method run
 * @memberOf TubDataStore.prototype
 */
TubDataStore.run = function (methodName, params) {}
/**
 * Execute SQL with parameters and place result into dataStore. This method expect SQL statement have **result**.
 *
 * To execute SQL statement without result (`insert` for example) - use TubDataStore.execSQL instead.
 *
 * @param {string} sql SQL statement to run
 * @param {Object|TubList} params SQL parameters list
 * @param {boolean} [useReplica=false] Prefer a replica DB if configured
 * @method runSQL
 * @memberOf TubDataStore.prototype
 */
TubDataStore.runSQL = function (sql, params, useReplica) {}
/**
 * Execute SQL with parameters. Not wait result data
 * @param {string} sql SQL statement to run
 * @param {Object|TubList} params SQL parameters list
 * @memberOf TubDataStore.prototype
 * @method execSQL
 */
TubDataStore.execSQL = function (sql, params) {}
/**
 * init dataStore content from JSON string.
 * WARNING!!! during initFromJSON UnityBase determinate field types from vield values,
 *  so if some data column contain only numeric values it becode Number (even if in source it String).
 * @example

const UB = require('@unitybase/ub')
let ds = UB.DataStore('myEntityCode')
ds.initFromJSON({"fieldCount":1,"values":["ID"],"rowCount":0});
console.log(ds.initialized); // TRUE

 * @deprecated Use `TubDataStore.initialize` instead
 * @param source
 * @method initFromJSON
 * @memberOf TubDataStore.prototype
 */
TubDataStore.initFromJSON = function (source) {}
/**
 * Return value of attribute.
 *
 * In case store initialized using TubDataStore.run style we can return Number or String type,
 * but in case it initialized using runSQL columns data types is unknown and you must cast value do required type directly.
 *
 * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
 * @return {Number|String}
 * @method get
 * @memberOf TubDataStore.prototype
 */
TubDataStore.get = function (attrib) {}
/**
 * Return value of attribute as ArrayBuffer.
 *
 * You can apply this method to blob fields only
 *
 * @param {Number|String} attrib attribute index or name. Index is faster but less readable.
 * @return {ArrayBuffer}
 * @method getAsBuffer
 * @memberOf TubDataStore.prototype
 */
TubDataStore.getAsBuffer = function (attrib) {}
/**
 * Move next
 * @method next
 * @memberOf TubDataStore.prototype
 */
TubDataStore.next = function () {}
/**
 * Move prev
 * @method prev
 * @memberOf TubDataStore.prototype
 */
TubDataStore.prev = function () {}
/**
 * Move first
 * @method first
 * @memberOf TubDataStore.prototype
 */
TubDataStore.first = function () {}
/**
 * Move last
 * @method last
 * @memberOf TubDataStore.prototype
 */
TubDataStore.last = function () {}
/**
 * Indicate current position in data collection is on the beginning of collection
 * @member {boolean} bof
 * @memberOf TubDataStore.prototype
 */
TubDataStore.bof = false
/**
 * Indicate current position in data collection is on the end of collection.
 * @member {boolean} eof
 * @memberOf TubDataStore.prototype
 */
TubDataStore.eof = false
/**
 * Generate a new identifier (int64)
 * @return {Number}
 * @method generateID
 * @memberOf TubDataStore.prototype
 */
TubDataStore.generateID = function () {}
/**
 * Is store initialized
 * @member {boolean} initialized
 * @memberOf TubDataStore.prototype
 */
TubDataStore.initialized = false
/**
 * Return string representation of Instance in format `[{attr1: value1, attr2: value2},... ]`.
 * To get a JavaScript object use `getAsJsObject()` method
 *
 * @memberOf TubDataStore.prototype
 * @returns {string}
 */
TubDataStore.getAsTextInObjectNotation = function () {}
/**
 * Return string representation of Instance in format `[{attr1: value1, attr2: value2},... ]`
 * @deprecated Consider to replace JSON.parse(store.asJSONObject) -> store.getAsJsObject(). getAsJsObject() method return a plain JS object instead of string and 25% faster
 * @member {string} asJSONObject
 * @memberOf TubDataStore.prototype
 */
TubDataStore.asJSONObject = '[{},{}]'
/**
 * Return string representation of Instance in format `[{attr1: value1, attr2: value2},... ]`.
 * To get a JavaScript object use getAsJsArray() method
 *
 * @memberOf TubDataStore.prototype
 * @returns {string}
 */
TubDataStore.getAsTextInArrayNotation = function () {}
/**
 * Return string representation of Instance in `Array of array` format
 * @deprecated Consider to replace `JSON.parse(store.asJSONArray) -> store.getAsJsArray()` which returns a plain JS object instead of string and 25% faster
 * @member {string} asJSONArray
 * @memberOf TubDataStore.prototype
 */
TubDataStore.asJSONArray = '[[],[]]'
/**
 * Return XML representation of Instance in MS DataSet format
 * @member {string} asXMLPersistent
 * @memberOf TubDataStore.prototype
 */
TubDataStore.asXMLPersistent = '<xml>...</xml>'
/**
 * Return JavaScript Object representation of Instance in format `[{attr1: value1, attr2: value2},... ]`
 * @member {string} getAsJsObject
 * @memberOf TubDataStore.prototype
 */
TubDataStore.getAsJsObject = function () {}
/**
 * Return JavaScript Object representation of Instance in `Array of array` format
 * @member {string} getAsJsArray
 * @memberOf TubDataStore.prototype
 */
TubDataStore.getAsJsArray = function () {}
/**
 * Active dataset name we work with. There is some predefined
 * dataNames - see {@link TubDataStore#DATA_NAMES TubDataStore.DATA_NAMES}
 * @member {string} currentDataName
 * @memberOf TubDataStore.prototype
 */
TubDataStore.currentDataName = '<xml>...</xml>'
/**
 * Record count. If DataStore is not initialized or empty will return 0.
 * @member {Number} rowCount
 * @memberOf TubDataStore.prototype
 */
TubDataStore.rowCount = 0
/**
 * Total record count if store are filled with {@link class:CustomRepository#withTotal Repository.withTotal()} option.
 * If DataStore is not initialized or empty or initialized without withTotal() will return -1.
 * @member {Number} totalRowCount
 * @memberOf TubDataStore.prototype
 */
TubDataStore.totalRowCount = 0
/**
 * Row position inside currentDataName dataset. Read/write
 * @member {Number} rowPos
 * @memberOf TubDataStore.prototype
 */
TubDataStore.rowPos = 0
/**
 * Release all internal resources. Store became unusable after call to `freeNative()`
 * @method freeNative
 * @memberOf TubDataStore.prototype
 */
TubDataStore.freeNative = function () {}
