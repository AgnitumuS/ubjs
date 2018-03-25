/* global _App */
if (typeof _App === 'undefined') {
  throw new Error('(@unitybase/ub).App accessible only inside server thread')
}
const argv = require('@unitybase/base').argv
const path = require('path')
const fs = require('fs')
const UBDomain = require('@unitybase/cs-shared').UBDomain
const EventEmitter = require('events').EventEmitter

/**
 * UnityBase application
 *
 *    const App = require('@unitybase/ub').App
 *
 * Developer can add his own application level methods using {@link App.registerEndpoint App.registerEndpoint}
 * and take a full control on HTTP request & response.
 *
 * Mixes EventEmitter, and server will emit:
 *
 *  - `endpointName + ':before'` event before endpoint handler  execution
 *  - `endpointName + ':after'` event in case neither exception is raised nor App.preventDefault() is called inside endpoint handler
 *
 * @Example:
 *
 //Before getDocument requests
 //@param {THTTPRequest} req
 //@param {THTTPResponse} resp
 function doSomethingBeforeGetDocumentCall(req, resp){
        console.log('User with ID', Session.userID, 'try to get document');
     }
 App.on('getDocument:before', doSomethingBeforeGetDocumentCall);

 const querystring = require('querystring')
 //
 //After getDocument requests
 //@param {THTTPRequest} req
 //@param {THTTPResponse} resp
 function doSomethingAfterGetDocumentCall(req, resp){
       params = querystring.parse(req.parameters)
       console.log('User with ID', Session.userID, 'obtain document using params',  params)
     }
 App.on('getDocument:after', doSomethingAfterGetDocumentCall);

 * To prevent endpoint handler execution App.preventDefault() can be used inside `:before` handler.
 *
 * @namespace App
 * @mixes EventEmitter
 */
const App = {
  /**
   * Fires for an {@link App App} just after all domain entities (all *.meta) are in server memory, and all server-side js are evaluated.
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
 * Called by native
 * TODO - remove when all App level method will be implemented in JS
 * @param endpointName
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 * @returns {boolean}
 */
App.launchEndpoint = function (endpointName, req, resp) {
  __preventDefault = false
  this.emit(endpointName + ':before', req, resp)
  if (!__preventDefault) {
    appBinding.endpoints[endpointName](req, resp)
    this.emit(endpointName + ':after', req, resp)
  }
}

const appBinding = process.binding('ub_app')
/**
 * Register a server endpoint.
 * One on endpoint can be default - this endpoint will be used as a fallback in case URL do not start with eny of known endpoints.
 * @example
 *
 * // Write a custom request body to file FIXTURES/req and echo file back to client
 * // @param {THTTPRequest} req
 * // @param {THTTPResponse} resp
 * //
 * function echoToFile(req, resp) {
   *    var fs = require('fs');
   *    fs.writeFileSync(FIXTURES + 'req', req.read('bin'));
   *    resp.statusCode = 200;
   *    resp.writeEnd(fs.readFileSync(FIXTURES + 'req', {encoding: 'bin'}));
   * }
 * App.registerEndpoint('echoToFile', echoToFile);
 *
 * @param {String} endpointName
 * @param {Function} handler
 * @param {boolean} [requireAuthentication=true]
 * @param {boolean} [isDefault=false]
 * @memberOf App
 */
App.registerEndpoint = function (endpointName, handler, requireAuthentication, isDefault) {
  if (!appBinding.endpoints[endpointName]) {
    appBinding.endpoints[endpointName] = handler
    return appBinding.registerEndpoint(endpointName, requireAuthentication === undefined ? true : requireAuthentication , isDefault === true)
  }
}

/**
 * @param {String} methodName
 * @method addAppLevelMethod
 * @deprecated Use {@link App.registerEndpoint} instead
 * @memberOf App
 */
App.addAppLevelMethod = function (methodName) {
  throw new Error('App.addAppLevelMethod is obsolete. Use App.registerEndpoint instead')
}
/**
 * @param {String} methodName
 * @method serviceMethodByPassAuthentication
 * @deprecated Use {@link App.registerEndpoint} instead
 * @memberOf App
 */
App.serviceMethodByPassAuthentication = function (methodName) {
  throw new Error('App.serviceMethodByPassAuthentication is obsolete. Use App.registerEndpoint instead')
}

/**
 * Server configuration (result of argv.getServerConfiguration() execution)
 * @readonly
 * @type {Object}
 * @property {Object} httpServer HTTP server config
 * @property {Object} uiSettings Section `uiSettings` of ubConfig
 */
App.serverConfig = undefined
try {
  App.serverConfig = argv.getServerConfiguration()
} catch (e) {
  console.error(e)
}

let pkgFile = path.join(process.configPath, 'package.json')
let appPkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
/**
 * Application package.json content (parsed)
 * @type {Object}
 */
App.package = appPkg

/**
 * Full path to application static folder if any, '' if static folder not set
 * @type {String}
 * @readonly
 */
App.staticPath = ''
if (App.serverConfig.httpServer && App.serverConfig.httpServer['inetPub']) {
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
 * List of a local server IP addresses CRLF (or CR for non-windows) separated
 */
App.localIPs = _App.localIPs

/**
 *  Resolve aRequestedFile to real file path.
 *  Internally analyse request and if it start with `model/` - resolve it to model public folder
 *  else - to `inetPub` folder.
 *  Will return '' in case of error (filePath not under `inetPub` or `model/`) to prevent ../../ attack
 * @param {String} aRequestedFile
 * @returns {String}
 */
App.resolveStatic = function (aRequestedFile) {
  return _App.resolveStatic(aRequestedFile)
}

/**
 * First check in global cache for a entry "UB_GLOBAL_CACHE_CHECKSUM + filePath"
 * and if not exists - calculate a checksum using algorithm defined in
 * CONTROLLER.serverConfig.HTTPServer.watchFileChanges.hashingStrategy
 * if server in dev mode always return current timestamp
 * values from cache will be cleared in directoryNotifiers
 * @param {String} pathToFile
 * @returns {string}
 */
App.fileChecksum = function (pathToFile) {
  return _App.fileChecksum(pathToFile)
}

/**
 * A folder checksum (see fileChecksum for algorithm details)
 * @param pathToFolder
 * @returns {string}
 */
App.folderChecksum = function (pathToFolder) {
  return _App.folderChecksum(pathToFolder)
}

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

const {getDomainInfo} = process.binding('ub_app')
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
      _domainCache = (new UBDomain(JSON.parse(getDomainInfo(true)))) // get extended domain information
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
 * @param {String} value Value To put into this key
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
 * Check database are used in current endpoint context and DB transaction is already active
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
 * Try retrieve  or create new session from request header
 * Return true if success
 * @return {Boolean}
 */
App.authFromRequest = function () {
  return _App.authFromRequest()
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
 * Is event emitter enabled for App singleton. Default is false
 * @deprecated Starting from 1.11 this property ignored (always TRUE)
 * @type {Boolean}
 */
App.emitterEnabled = true

/**
 * Defense edition only,
 * Base64 encoded public server certificate
 *
 * Contains non empty value in case security.dstu.trafficEncryption === true and
 * key name defined in security.dstu.novaLib.keyName
 *
 * @type {string}
 */
App.serverPublicCert = _App.serverPublicCert

module.exports = App
