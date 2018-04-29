const EventEmitter = require('events').EventEmitter
const UBDomain = require('@unitybase/cs-shared').UBDomain
const ServerRepository = require('@unitybase/base').ServerRepository
const repositoryFabric = ServerRepository.fabric // for backward compatibility with UB 1.7
const App = require('./modules/App')
const Session = require('./modules/Session')
const UBFormat = require('@unitybase/base').format
const blobStores = require('./blobStores')
const TubDataStore = require('./TubDataStore')
const Errors = require('./modules/ubErrors')

//if (typeof global['UB'] !== 'undefined') throw new Error('@unitybase/ub already required')

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

UB.UBAbort = Errors.UBAbort
UB.ESecurityException = Errors.ESecurityException

/**
 * Creates namespaces to be used for scoping variables and classes so that they are not global.
 *
 *     UB.ns('DOC.Report');
 *     DOC.Report.myReport = function() { ... };
 *
 * @deprecated Try to avoid namespaces - instead create a modules and use require()
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
 * @param {SyncConnection} [connection] Pass in case of remote UnityBase server connection.
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
// TODO - validate domain
// 1) if (FAttr.dataType = adtDocument) and (FAttr.storeName <> '') and
// ubLog.Add.Log(sllError, 'DomainLoad: Error loading entity "%". A storeName="%" specified in attribute "%" not in defined in application.blobStore config)',
// 2) fLog.Log(sllInfo, 'Check blob store "%" folder "%": folder exists', [fAppConfig.blobStores[i].name, fAppConfig.blobStores[i].path]);

/**
 * @type Session
 * @deprecated Use const Session = require('@unitybase/ub').Session
 */
global.Session = Session
UB.Session = Session

/**
 * Construct new data store
 * @param {string} entityCode
 * @return {TubDataStore}
 * @constructor
 */
UB.DataStore = function (entityCode) {
  return new TubDataStore(entityCode)
}

const mI18n = require('./modules/i18n')
/**
 * Translate message specified language using data, prepared by `UB.i18nExtend`
 * To add model-depended values in your model:
 *
 *    const UB = require('@unitybase/ub')
 *    UB.i18nExtend({
 *      "en": {yourMessage: "yourTranslation", ...},
 *      "ru": {yourMessage: "yourTranslation", ...},
 *       ....
 *    })
 *
 * @param {String} msg Message to translate
 * @param {String} [lang] language to translate to. if not passed - current user session language used, or default application language if not logged in
 */
UB.i18n = function i18n (msg, lang) {
  lang = lang || Session.userLang || App.defaultLang
  let res = mI18n.lookup(lang, msg)
  return res || msg
}
UB.i18nExtend = mI18n.extend

require('./modules/RLS')

// export BEFORE load models, since models inside can use a UB model
const modelLoader = require('./modules/modelLoader')
UB.loadLegacyModules = modelLoader.loadLegacyModules
/**
 * Application instance
 * @type {App}
 */
UB.App = App

/**
 * Initialize UnityBase application by require all models defined in config
 * and registering endpoints
 */
UB.start = function () {
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
  const {clientRequireEp, modelsEp, getAppInfoEp, getDomainInfoEp, staticEp, runSQLEp, restEp} = require('./modules/endpoints')
  App.registerEndpoint('getAppInfo', getAppInfoEp, false)
  App.registerEndpoint('models', modelsEp, false)
  App.registerEndpoint('clientRequire', clientRequireEp, false)
  App.registerEndpoint('getDomainInfo', getDomainInfoEp, true)
  App.registerEndpoint('getDocument', blobStores.getDocumentEndpoint, true)
  App.registerEndpoint('setDocument', blobStores.setDocumentEndpoint, true)
  App.registerEndpoint('runSQL', runSQLEp, true)
  App.registerEndpoint('rest', restEp, true)
  App.registerEndpoint('statics', staticEp, false, true)
}

module.exports = UB
