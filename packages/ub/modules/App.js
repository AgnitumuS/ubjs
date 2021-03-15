/* global _App */
if (typeof _App === 'undefined') {
  throw new Error('(@unitybase/ub).App accessible only inside server thread')
}
const argv = require('@unitybase/base').argv
const path = require('path')
const UBDomain = require('@unitybase/cs-shared').UBDomain
const EventEmitter = require('events').EventEmitter
const THTTPResponse = require('./HTTPResponse')
const THTTPRequest = require('./HTTPRequest')
const createDBConnectionPool = require('@unitybase/base').createDBConnectionPool
const blobStores = require('@unitybase/blob-stores')
const base = require('@unitybase/base')
if (base.ubVersionNum < 5018000) {
  throw new Error('This version of @unitybase/ub package requires UB server to be at least 5.18.0')
}
/**
 * @classdesc
 * Singleton instance of UnityBase application. Allow direct access to the database connections, blob stores,
 * HTTP endpoints (full control on HTTP request & response) registration, read domain and server config.
 *
 * Mixes EventEmitter, and server will emit:
 *
 *  - `endpointName + ':before'` event before endpoint handler  execution
 *  - `endpointName + ':after'` event in case neither exception is raised nor App.preventDefault()
 *  is called inside endpoint handler
 *
 * To prevent endpoint handler execution App.preventDefault() can be used inside `:before` handler.
 *
 * @example
const App = require('@unitybase/ub').App
// Register public (accessible without authentication) endpoint
App.registerEndpoint('echoToFile', echoToFile, false)

// write custom request body to file FIXTURES/req and echo file back to client
// @param {THTTPRequest} req
// @param {THTTPResponse} resp
function echoToFile (req, resp) {
  var fs = require('fs')
  fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))
  resp.statusCode = 200
  resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), {encoding: 'bin'}))
}

//Before getDocument requests
//@param {THTTPRequest} req
//@param {THTTPResponse} resp
function doSomethingBeforeGetDocumentCall(req, resp){
  console.log('User with ID', Session.userID, 'try to get document')
}
// Adds hook called before each call to getDocument endpoint
App.on('getDocument:before', doSomethingBeforeGetDocumentCall)

//
//After getDocument requests
//@param {THTTPRequest} req
//@param {THTTPResponse} resp
function doSomethingAfterGetDocumentCall(req, resp){
  params = req.parsedParameters
  console.log('User with ID', Session.userID, 'obtain document using params',  params)
}
App.on('getDocument:after', doSomethingAfterGetDocumentCall)
 *
 * @class App
 * @mixes EventEmitter
 */
const App = {
  /**
   * Fires for an {@link App App} just after all domain entities (all *.meta) are loaded into server memory
   * and all server-side js are evaluated.
   *
   * On this stage you can subscribe on a cross-model handles.
   *
   * @example:
   *
   App.once('domainIsLoaded', function(){
     for (eName in App.domainInfo.entities) {
        // if entity have attribute mi_fedUnit
        if (App.domainInfo.entities[eName].attributes.mi_fedUnit) {
          let entityObj = global[eName]
          entityObj.on('insert:before', fedBeforeInsert) // add before insert handler
        }
     }
   })
   *
   * @event domainIsLoaded
   */
}

// add eventEmitter to application object
EventEmitter.call(App)
Object.assign(App, EventEmitter.prototype)

let __preventDefault = false
/**
 * Called by native
 * TODO - remove when all App level method will be implemented in JS
 * @param eventName
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 * @returns {boolean}
 */
App.emitWithPrevent = function (eventName, req, resp) {
  __preventDefault = false
  this.emit(eventName, req, resp)
  return __preventDefault
}
/**
 * Accessible inside app-level `:before` event handler. Call to prevent default method handler.
 * In this case developer are responsible to fill response object, otherwise HTTP 400 is returned.
 * @memberOf App
 */
App.preventDefault = function () {
  __preventDefault = true
}

/**
 * Called by native HTTP server worker
 * @param {string} endpointName
 * @private
 * @returns {boolean}
 */
App.launchEndpoint = function (endpointName) {
  __preventDefault = false
  const req = new THTTPRequest()
  const resp = new THTTPResponse()
  try {
    this.emit(endpointName + ':before', req, resp)
    if (!__preventDefault) {
      const handler = appBinding.endpoints[endpointName]
      if (handler) { // JS endpoint
        handler(req, resp)
      } else { // native endpoint
        appBinding.launchNativeEndpoint()
      }
      this.emit(endpointName + ':after', req, resp)
    }
  } finally {
    App.endpointContext = {} // allow GC to release possible context data ASAP
  }
}

/**
 * Called by native RLS mixin. Task of method is to either run a rls.func or eval a rls.expression for ctxt.dataStore.Entity
 * @param {ubMethodParams} ctxt
 * @private
 */
App.launchRLS = function (ctxt) {
  const rlsMixin = ctxt.dataStore.entity.mixins.rls
  if (rlsMixin.func) { // functional RLS
    if (!rlsMixin.__funcVar) { // parse func namespace 'uba_user.somefunc' (string) -> uba_user.somefunc (function)
      const fPath = rlsMixin.func.split('.')
      let f = global[fPath[0]]
      for (let i = 1, L = fPath.length; i < L; i++) {
        f = f[fPath[i]]
      }
      if (typeof f !== 'function') throw new Error(`${ctxt.dataStore.entity.name} rls func "${rlsMixin.func}" is not a function`)
      rlsMixin.__funcVar = f
    }
    console.debug('Call func', rlsMixin.func)
    rlsMixin.__funcVar.call(global[ctxt.dataStore.entity.name], ctxt) // call RLS function using entity namespace as this
  } else { // expression
    const mParams = ctxt.mParams
    const expr = eval(rlsMixin.expression)
    console.debug('Eval rls expression to', expr)
    if (!mParams.whereList) {
      mParams.whereList = {}
    }
    mParams.whereList[`rls${Date.now()}`] = {
      expression: expr,
      condition: 'custom'
    }
  }
}

const appBinding = process.binding('ub_app')
/**
 * Register a server endpoint.
 * One of the endpoints can be default endpoint - it will be used as a fallback
 * in case URL do not start with any of known endpoints name.
 *
 * Exceptions inside endpoint handler are intercepted by UB server. In case exception is occurred
 * server will rollback any active DB transactions and serialize an exception message
 * to response depending on server execution mode:
 *  - for `dev` mode - original exception text will be serialized (for debugging purpose)
 *  - for production mode - in case exception message is wrapped into `<<<..>>>` then this message will be serialized,
 *  if not - text will be always `Internal server error` (for security reason)
 *
 *  Recommended way to throw an handled error inside endpoint handler is `throw new UB.UBAbort('.....')`
 *
 * @example

 // Write a custom request body to file FIXTURES/req and echo file back to client
 // @param {THTTPRequest} req
 // @param {THTTPResponse} resp
 //
 function echoToFile(req, resp) {
   var fs = require('fs');
   fs.writeFileSync(FIXTURES + 'req', req.read('bin'));
   resp.statusCode = 200;
   resp.writeEnd(fs.readFileSync(FIXTURES + 'req', {encoding: 'bin'}));
 }
 App.registerEndpoint('echoToFile', echoToFile);

 *
 * @param {String} endpointName
 * @param {Function} handler
 * @param {boolean} [authorizationRequired=true] If `true` UB will check for valid Authorization header before
 *  execute endpoint handler
 * @param {boolean} [isDefault=false]
 * @memberOf App
 */
App.registerEndpoint = function (endpointName, handler, authorizationRequired, isDefault) {
  if (!appBinding.endpoints[endpointName]) {
    appBinding.endpoints[endpointName] = handler
    return appBinding.registerEndpoint(
      endpointName,
      authorizationRequired === undefined ? true : authorizationRequired,
      isDefault === true
    )
  }
}

/**
 * Grant endpoint to role
 * @param {String} endpointName
 * @param {String} roleCode
 * @return {boolean} true if endpoint exists and role not already granted, false otherwise
 * @memberOf App
 */
App.grantEndpointToRole = function (endpointName, roleCode) {
  return appBinding.grantEndpointToRole(endpointName, roleCode)
}

/**
 * @method addAppLevelMethod
 * @deprecated Use {@link class:App.registerEndpoint App.registerEndpoint} instead
 * @memberOf App
 */
App.addAppLevelMethod = function () {
  throw new Error('App.addAppLevelMethod is obsolete. Use App.registerEndpoint instead')
}

/**
 * @method serviceMethodByPassAuthentication
 * @deprecated Use {@link class:App.registerEndpoint App.registerEndpoint} instead
 * @memberOf App
 */
App.serviceMethodByPassAuthentication = function () {
  throw new Error('App.serviceMethodByPassAuthentication is obsolete. Use App.registerEndpoint instead')
}

/**
 * Server configuration - result of {@link module:argv~getServerConfiguration argv.getServerConfiguration}
 * @readonly
 * @type {Object}
 * @property {Object} httpServer HTTP server config
 * @property {Object} application
 * @property {string} application.name
 * @property {string} application.defaultLang
 * @property {Object} application.domain
 * @property {Array} application.domain.models
 * @property {Array<string>} application.domain.supportedLanguages
 * @property {Object} application.customSettings
 * @property {Object} uiSettings Section `uiSettings` of ubConfig
 * @property {Object} security
 */
App.serverConfig = undefined
try {
  App.serverConfig = argv.getServerConfiguration()
} catch (e) {
  console.error(e)
}

/**
 * Application `package.json` content (parsed)
 * @type {Object}
 */
App.package = require(path.join(process.configPath, 'package.json'))

/**
 * Full path to application static folder if any, '' if static folder not set
 * @type {String}
 * @readonly
 */
App.staticPath = ''
if (App.serverConfig.httpServer && App.serverConfig.httpServer['inetPub'] &&
  App.serverConfig.httpServer['inetPub'].trim()) {
  let sp = App.serverConfig.httpServer['inetPub']
  App.staticPath = path.isAbsolute(sp)
    ? sp
    : path.join(process.configPath, sp)
}

/**
 * Application default language
 * @type {String}
 * @readonly
 */
App.defaultLang = App.serverConfig.application.defaultLang

/**
 * Custom settings for application from ubConfig.app.customSettings
 * @deprecated Use App.serverConfig.application.customSettings: Object instead
 * @type {String}
 */
Object.defineProperty(App, 'customSettings', {
  enumerable: true,
  get: function () {
    console.warn('App.customSettings is deprecated. Use App.serverConfig.application.customSettings instead')
    return JSON.stringify(App.serverConfig.application.customSettings)
  }
})

/**
 * Return stringified JSON specified in serverConfig.uiSettings
 * @deprecated Use App.serverConfig.uiSettings: Object instead
 * @return {string}
 */
App.getUISettings = function () {
  console.warn('App.getUISettings is deprecated. Use App.serverConfig.uiSettings: Object instead')
  return JSON.stringify(App.serverConfig.uiSettings)
}

/**
 * Full URl HTTP server is listen on (if HTTP server enabled, else - empty string)
 * @type {String}
 * @readonly
 */
App.serverURL = argv.serverURLFromConfig(App.serverConfig)

/**
 * URL that the User from the internet will use to access your server. To be used in case server is behind a reverse proxy
 * @type {String}
 * @readonly
 */
App.externalURL = App.serverConfig.httpServer.externalURL || App.serverURL

/**
 * List of a local server IP addresses CRLF (or CR for non-windows) separated
 */
App.localIPs = _App.localIPs

/**
 * Current application Domain
 * @deprecated UB >=4 use a App.domainInfo - a pure JS domain representation
 * @readonly
 */
Object.defineProperty(App, 'domain', {
  enumerable: true,
  get: function () {
    throw new Error('App.domain is obsolete. Use App.domainInfo')
  }
})

/**
 * For UB EE return true in case product license is exceed. For UB Se always `false`
 * @type {String}
 */
Object.defineProperty(App, 'isLicenseExceed', {
  enumerable: true,
  get: function () {
    return typeof appBinding.isLicenseExceed === 'function'
      ? appBinding.isLicenseExceed()
      : false
  }
})

const getDomainInfo = appBinding.getDomainInfo
let _domainCache
/**
 * Extended information about application domain (metadata)
 * @memberOf App
 * @member {UBDomain} domainInfo
 */
Object.defineProperty(App, 'domainInfo', {
  enumerable: true,
  get: function () {
    if (!_domainCache) {
      _domainCache = (new UBDomain(getDomainInfo(true))) // get extended domain information
    }
    return _domainCache
  }
})

/**
 * Get value from global cache. Global cache shared between all threads.
 *
 * Return '' (empty string) in case key not present in cache.
 *
 * @param {String} key Key to retrive
 * @return {String}
 */
App.globalCacheGet = function (key) {
  return _App.globalCacheGet(key)
}
/**
 * Put value to global cache.
 * @param {String} key  Key to put into
 * @param {String|null} value Value to put into this key. If === null then key will be remover from cache
 */
App.globalCachePut = function (key, value) {
  _App.globalCachePut(key, value)
}

/**
 * Delete row from FTS index for exemplar with `instanceID` of entity `entityName` (mixin `fts` must be enabled for entity)
 * @param {String} entityName
 * @param {Number} instanceID
 */
App.deleteFromFTSIndex = function (entityName, instanceID) {
  _App.deleteFromFTSIndex(entityName, instanceID)
}
/**
 * Update FTS index for for exemplar with `instanceID` of entity `entityName` (mixin `fts` must be enabled for entity).
 * In case row dose not exist in FTS perform insert action automatically.
 *
 * @param {String} entityName
 * @param {Number} instanceID
 */
App.updateFTSIndex = function (entityName, instanceID) {
  _App.updateFTSIndex(entityName, instanceID)
}

/**
 * Databases connections pool
 * @type {Object<string, DBConnection>}
 */
App.dbConnections = createDBConnectionPool(App.domainInfo.connections)

/**
 * Check database are used in current endpoint context and DB transaction is already active.
 * @param {String} connectionName
 * @return {Boolean}
 */
App.dbInTransaction = function (connectionName) {
  return _App.dbInTransaction(connectionName)
}
/**
 * Commit active database transaction if any.
 * In case `connectionName` is not passed will commit all active transactions for all connections.
 * Return `true` if transaction is committed, or `false` if database not in use or no active transaction.
 * @param {String} [connectionName]
 * @return {Boolean}
 */
App.dbCommit = function (connectionName) {
  return connectionName ? _App.dbCommit(connectionName) : _App.dbCommit()
}
/**
 * Rollback active database transaction if any.
 * In case `connectionName` is not passed will rollback all active transactions for all connections.
 * Return `true` if transaction is rollback'ed, or `false` if database not in use or no active transaction.
 * @param {String} [connectionName]
 * @return {Boolean}
 */
App.dbRollback = function (connectionName) {
  return connectionName ? _App.dbRollback(connectionName) : _App.dbRollback()
}
/**
 * Start a transaction for a specified database. If database is not used in this context will
 * create a connection to the database and start transaction.
 *
 * For Oracle with DBLink first statement to DBLink'ed table must be
 * either update/insert/delete or you MUST manually start transaction
 * to prevent "ORA-01453: SET TRANSACTION be first statement"
 *
 * @param {String} connectionName
 * @return {Boolean}
 */
App.dbStartTransaction = function (connectionName) {
  return _App.dbStartTransaction(connectionName)
}

/**
 * Try retrieve  or create new session from request headers.
 * Return `true` if success, `false` if more auth handshakes is required.
 * In case of invalid credential throw security exception.
 * @param {boolean} noHTTPBodyInResp If true do not write a uData to the HTTP response
 * @param {boolean} doSetOutCookie If true set a out authorization cookie on success response (Negotiate only)
 * @return {Boolean}
 */
App.authFromRequest = function (noHTTPBodyInResp = false, doSetOutCookie = false) {
  return _App.authFromRequest(noHTTPBodyInResp, doSetOutCookie)
}
/**
 * Logout (kill stored Sessions) all users with the same as
 * currently logged (except currently logged user)
 */
App.logoutAllWithTheSameNameExceptMe = function () {
  return _App.logoutAllWithTheSameNameExceptMe()
}
/**
 * Logout (kill stored Sessions) current session user
 */
App.logout = function () {
  return _App.logout()
}
/**
 * Check Entity-Level-Security for specified entity/method
 *
 *      if App.els('uba_user', 'insert'){
   *          // do something
   *      }
 *
 * @param {String} entityCode
 * @param {String} methodCode
 * @return {boolean}
 */
App.els = function (entityCode, methodCode) {
  return _App.els(entityCode, methodCode)
}

/**
 * Register a named critical section. Can be done only in initialization mode.
 * In case section with the same name already registered in another thread - returns existed CS index
 *
 * All threads MUST register section in the same way, do not put call into condition what may evaluates
 * too the different values in the different threads.
 *
 * @example
   const App = require('@unitybase/ub').App
   // critical section must be registered once in the moment modules are evaluated without any conditions
   const MY_CS = App.registerCriticalSection('SHARED_FILE_ACCESS')

   function concurrentFileAccess() {
    // prevents mutual access to the same file from the different threads
    App.enterCriticalSection(FSSTORAGE_CS)
    try {
      const data = fs.readfileSync('/tmp/concurrent.txt', 'utf8')
      // do some operation what modify data
      fs.writefileSync('/tmp/concurrent.txt', data)
    } finally {
      // important to leave critical section in finally block to prevent forever lock
      App.leaveCriticalSection(FSSTORAGE_CS)
    }
  }
 * @param {string} csName Critical section name
 * @return {number}
 */
App.registerCriticalSection = appBinding.registerCriticalSection
/**
 * Waits for ownership of the specified critical section object. The function returns when the calling thread is granted ownership.
 *
 * ** IMPORTANT** A thread must call `App.leaveCriticalSection` once for each time that it entered the critical section.
 *
 * @param {number} csIndex A critical section index returned by `App.registerCriticalSection`
 */
App.enterCriticalSection = appBinding.enterCriticalSection
/**
 * Releases ownership of the specified critical section
 *
 * @param {number} csIndex
 */
App.leaveCriticalSection = appBinding.leaveCriticalSection

/**
 * Enter a log recursion call.
 * ** IMPORTANT** A thread must call `App.logLeave` once for each time that it entered the log recursion
 * @example

 function wrapEnterLeave(enterText, originalMethod) {
    return function(ctx) {
      App.logEnter(enterText)
      try {
        originalMethod(ctx)
      } finally {
        App.logLeave()
      }
    }
  }

 * @param {string} methodName
 */
App.logEnter = appBinding.logEnter
/**
 * Exit a log recursion call
 */
App.logLeave = appBinding.logLeave

/**
 * Is event emitter enabled for App singleton. Default is `false`
 * @deprecated Starting from 1.11 this property ignored (always TRUE)
 * @type {Boolean}
 */
App.emitterEnabled = true

/**
 * Defense edition only,
 * Base64 encoded public server certificate
 *
 * Contains non empty value in case `security.dstu.trafficEncryption` === `true` and
 * key name defined in `security.dstu.novaLib.keyName`
 *
 * @type {string}
 */
App.serverPublicCert = _App.serverPublicCert

/**
 * BLOB stores methods. Usage:
 *  - {@link module:@unitybase/blob-stores~getContent App.blobStores.getContent} to get BLOB content
 *  - {@link module:@unitybase/blob-stores~getContentPath App.blobStores.getContentPath} to get a path to file based store BLOB content
 *  - {@link module:@unitybase/blob-stores~putContent App.blobStores.putContent} to put BLOB content
 *  - {@link module:@unitybase/blob-stores~markRevisionAsPermanent App.blobStores.markRevisionAsPermanent} to mark revision as permanent
 */
App.blobStores = {
  getContent: blobStores.getContent,
  getContentPath: blobStores.getContentPath,
  putContent: blobStores.putContent,
  markRevisionAsPermanent: blobStores.markRevisionAsPermanent
}

/**
 * Endpoint context. Application logic can store here some data what required during single HTTP method call;
 * Starting from UB@5.17.9 server reset `App.endpointContext` to {} after endpoint implementation execution,
 * so in the beginning of execution it's always empty
 *
 *    App.endpointContext.MYMODEL_mykey = 'some value we need to share between different methods during a single user request handling'
 *
 * @type {Object}
 * @since UB@5.17.9
 */
App.endpointContext = {}

module.exports = App
