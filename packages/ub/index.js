const argv = require('@unitybase/base').argv
const EventEmitter = require('events').EventEmitter
const {ServerRepository} = require('@unitybase/base').ServerRepository // for backward compatibility with UB 1.7
/**
 * Create new instance of {@link ServerRepository}
 *
 * @param {String} entityName
 * @param {Object} [cfg]
 * @param {UBConnection} [connection] Pass in case of remote UnityBase server connection.
 * @returns {ServerRepository}
 */
UB.Repository = function (entityName, cfg, connection) {
  connection = connection || global.conn
  if (connection) {
    return new ServerRepository(connection, entityName, cfg)
  } else {
    return new ServerRepository(null, entityName, cfg)
  }
}

/**
 * Server configuration (result of argv.getServerConfiguration() execution)
 * @type {Object}
 * @memberOf App
 */
App.serverConfig = undefined
try {
  App.serverConfig = argv.getServerConfiguration()
} catch (e) {
  console.error(e)
}

// TODO - this hack is required for register UB.getWSNotifier. Must be rewrited
const ws = require('./modules/web-sockets')
UB.getWSNotifier = ws.getWSNotifier

const UBDomain = require('@unitybase/base').UBDomain
const {getDomainInfo} = process.binding('ub_app')
let domain_
/**
 * Extended information about application domain
 * @property {UBDomain} domainInfo
 * @memberOf App
 */
Object.defineProperty(App, 'domainInfo', {
  enumerable: true,
  get: function () {
    if (!domain_) {
      domain_ = (new UBDomain(JSON.parse(getDomainInfo(true)))) // get extended domain information
    }
    return domain_
  }
})

// normalize ENUMS TubCacheType = {Entity: 1, SessionEntity: 2} => {Entity: 'Entity', SessionEntity: 'SessionEntity'}
let enums = ['TubftsScope', 'TubCacheType', 'TubEntityDataSourceType', 'TubEntityDataSourceType',
  'TubAttrDataType', 'TubSQLExpressionType', 'TubSQLDialect', 'TubSQLDriver']
enums.forEach(eN => {
  let e = global[eN]
  if (!e) return
  let vals = Object.keys(e)
  vals.forEach(k => { e[k] = k })
})

// domain initialization
const {addEntityMethod} = process.binding('ub_app')
// create scope for all domain objects
const tempDomain = new UBDomain(JSON.parse(getDomainInfo(true)))
tempDomain.eachEntity(entity => {
  let e = global[entity.code] = {
    entity: entity
  }
  EventEmitter.call(e)
  Object.assign(e, EventEmitter.prototype)
  e.entity.addMethod = (function (entityCode) {
    return function (methodCode) {
      addEntityMethod(entityCode, methodCode)
    }
  })(entity.code)
})

const appBinding = process.binding('ub_app')

let __preventDefault = false
// add eventEmitter to application object
EventEmitter.call(App)
Object.assign(App, EventEmitter.prototype)
App.emitWithPrevent = function (type, req, resp) {
  __preventDefault = false
  this.emit(type, req, resp)
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

App.launchEndpoint = function (endpointName, req, resp) {
  __preventDefault = false
  this.emit(endpointName + ':before', req, resp)
  if (!__preventDefault) {
    appBinding.endpoints[endpointName](req, resp)
    this.emit(endpointName + ':after', req, resp)
  }
}

/**
 * Register a server endpoint. By default access to endpoint require authentication
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
 * @memberOf App
 */
App.registerEndpoint = function (endpointName, handler, requireAuthentication) {
  if (!appBinding.endpoints[endpointName]) {
    appBinding.endpoints[endpointName] = handler
    return appBinding.registerEndpoint(endpointName, requireAuthentication === undefined ? true : requireAuthentication)
  }
}

/**
 * @param {String} methodName
 * @method addAppLevelMethod
 * @deprecated Use {@link App.registerEndpoint} instead
 * @memberOf App
 */
App.addAppLevelMethod = function (methodName) {
  if (!appBinding.endpoints[methodName]) {
    appBinding.endpoints[methodName] = global[methodName]
    return appBinding.registerEndpoint(methodName, true)
  }
}
/**
 * @param {String} methodName
 * @method serviceMethodByPassAuthentication
 * @deprecated Use {@link App.registerEndpoint} instead
 * @memberOf App
 */
App.serviceMethodByPassAuthentication = function (methodName) {
  return appBinding.setEndpointByPassAuthentication(methodName)
}

const sessionBinding = process.binding('ub_session')

// add EventEmitter to Session object
EventEmitter.call(Session)
Object.assign(Session, EventEmitter.prototype)

/**
 * Create new session for userID
 * @deprecated use runAsUser instead this
 * @method
 * @param {Number} userID ID of  user
 * @param {String} [secret] secret word. If defined then session secretWord is `JSON.parse(returns).result+secret`
 * @returns {String} JSON string like answer on auth request
 */
Session.setUser = sessionBinding.switchUser
/**
 * Call function as admin.
 * Built-in "always alive"(newer expired) `admin` session is always created when the application starts,
 * so this is very cheap method - it will not trigger Session.login event every time context is switched (Session.setUser and Session.runAsUser does)
 * Can be used in scheduled tasks, not-authorized methods, etc. to obtain a `admin` Session context
 * @param {Function} func Function to be called in admin context
 * @returns {*}
 */
Session.runAsAdmin = function (func) {
  let result
  sessionBinding.switchToAdmin()
  try {
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}
/**
 * Call function as custom user.
 * New session will be created. Will fire `login` event.
 * @param userID ID of  user
 * @param func Function to be called in user's session.
 * @returns {*}
 */
Session.runAsUser = function (userID, func) {
  let result
  sessionBinding.switchUser(userID)
  try {
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}

// ENDPOINTS
const {clientRequire, models, getAppInfo, getDomainInfoEp} = require('./modules/endpoints')

App.registerEndpoint('getAppInfo', getAppInfo, false)
App.registerEndpoint('models', models, false)
App.registerEndpoint('clientRequire', clientRequire, false)
App.registerEndpoint('getDomainInfo', getDomainInfoEp, true)

require('./modules/i18n')
require('./modules/RLS')
