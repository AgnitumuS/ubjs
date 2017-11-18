const EventEmitter = require('events').EventEmitter
const UBDomain = require('@unitybase/base').UBDomain
const {ServerRepository} = require('@unitybase/base').ServerRepository // for backward compatibility with UB 1.7
const App = require('./modules/App')
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

// TODO - this hack is required for register UB.getWSNotifier. Must be rewrited
const ws = require('./modules/web-sockets')
UB.getWSNotifier = ws.getWSNotifier

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
const {getDomainInfo} = process.binding('ub_app')
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

require('./TubDataStore')
require('./modules/i18n')
require('./modules/RLS')

// TODO - remove after rewrite stores to pure JS
require('./virtualStores/Custom')
require('./virtualStores/fileVirtual')
require('./virtualStores/fileVirtualWritePDF')
require('./virtualStores/mdb')

// export BEFORE load models, since models inside can use a UB model
const modelLoader = require('./modules/moledLoader')
module.exports = {
  loadLegacyModules: modelLoader.loadLegacyModules
}

global.App = App
// for each model: 
// - load all entities modules
// - require a model itself
let orderedModels = App.domainInfo.orderedModels
orderedModels.forEach((model) => {
  if (model.realPath && (model.name !== 'UB')) { // UB already loaded by UB.js
    modelLoader.loadEntitiesModules(model.realPath)
    require(model.realPath)
  }
})
App.emit('domainIsLoaded')

// ENDPOINTS
const {clientRequire, models, getAppInfo, getDomainInfoEp} = require('./modules/endpoints')

App.registerEndpoint('getAppInfo', getAppInfo, false)
App.registerEndpoint('models', models, false)
App.registerEndpoint('clientRequire', clientRequire, false)
App.registerEndpoint('getDomainInfo', getDomainInfoEp, true)
