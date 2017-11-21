const EventEmitter = require('events').EventEmitter
const UBDomain = require('@unitybase/base').UBDomain
const repositoryFabric = require('@unitybase/base').ServerRepository.fabric // for backward compatibility with UB 1.7
const App = require('./modules/App')
const Session = require('./modules/Session')
const UBFormat = require('@unitybase/base').format

/**
 * The UB namespace (global object) encapsulates some classes, singletons, and utility methods provided by UnityBase server.
 * @namespace UB
 */
let UB = {
  /**
   * If we are in UnityBase server scripting (both -f or server thread) this property is true, if in browser - undefined or false.
   * Use it for check execution context in scripts, shared between client & server.
   * To check we are in server thread use process.isServer.
   * @readonly
   */
  isServer: true
}

/**
 * Server-side Abort exception. To be used in server-side logic in case of HANDLED
 * exception. This errors logged using "Error" log level to prevent unnecessary
 * EXC log entries.
 *
 *       // UB client will show message inside <<<>>> to user (and translate it using UB.i18n)
 *       throw new UB.UBAbort('<<<textToDisplayForClient>>>');
 *       //for API methods we do not need <<<>>>
 *       throw new UB.UBAbort('wrongParameters');
 *
 * @param {String} [message] Message
 * @extends {Error}
 */
// For SM<=45 we use a "exception class" inherit pattern below, but it stop working in SM52, so fallback to Error
UB.UBAbort = function UBAbort (message) {
  this.name = 'UBAbort'
  this.code = 'UBAbort'
  this.message = message || 'UBAbortError'
  // FF, IE 10+ and Safari 6+. Fallback for others
  let tmpStack = (new Error()).stack.split('\n').slice(1)
  let re = /^(.*?)@(.*?):(.*?)$/.exec(tmpStack[1]) // [undef, undef, this.fileName, this.lineNumber] = re
  this.fileName = re[2]
  this.lineNumber = re[3]
  this.stack = tmpStack.join('\n')
  // originat FF version:
  // this.stack = (new Error()).stack;
}
UB.UBAbort.prototype = Object.create(Error.prototype) // new Error();
UB.UBAbort.prototype.constructor = UB.UBAbort

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 *
 *     UB.ns('DOC.Report');
 *     DOC.Report.myReport = function() { ... };
 *
 * @deprecated Try to avoid namespaces in your - instead create a modules and use require()
 * @param {String} namespacePath
 * @return {Object} The namespace object.
 */
UB.ns = function (namespacePath) {
  let root = global
  let parts = namespacePath.split('.')

  for (let j = 0, subLn = parts.length; j < subLn; j++) {
    let part = parts[j]

    if (!root[part]) {
      root[part] = {}
    }
    root = root[part]
  }
  return root
}

// legacy - to be removed in UB6
UB.format = UBFormat

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
  return repositoryFabric(entityName, connection)
}

// TODO - this hack is required for register UB.getWSNotifier. Must be rewrites
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

/**
 * @type Session
 * @deprecated Use const Session = require('@unitybase/ub').Session
 */
global.Session = Session
UB.Session = Session

require('./TubDataStore')

const i18n = require('./modules/i18n')
UB.i18n = i18n.i18n
UB.i18nExtend = i18n.i18nExtend

require('./modules/RLS')

// TODO - remove after rewrite stores to pure JS
UB.virtualStores = {
  fileVirtual: require('./virtualStores/fileVirtual'),
  fileVirtualWritePDF: require('./virtualStores/fileVirtualWritePDF'),
  mdb: require('./virtualStores/mdb')
}
// require('./virtualStores/Custom')

// export BEFORE load models, since models inside can use a UB model
const modelLoader = require('./modules/moledLoader')
UB.loadLegacyModules = modelLoader.loadLegacyModules
UB.App = App

UB.run = function () {
  /**
   * @deprecated Use `const UB = require('@unitybase/ub')`
   */
  global.UB = UB
  /**
   * @deprecated Use `const App = require('@unitybase/ub').App`
   */
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
}

module.exports = UB
