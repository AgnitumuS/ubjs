/**
 * `fts` mixin implements a Full Text Search index creation and usage for entity.
 * See [Full Text Search tutorial](https://unitybase.info/api/server-v5/tutorial-mixins_fts.html) for details.
 *
 * Configuration
 * "mixins": {
 *   "fts": {
 *     "scope": "Connection|Entity",
 *     "connectionName": "",
 *     "dataProvider": "Mixin|Entity", // For Mixin - pd attributes from `indexedAttributes` into FTS, for Entity - call `getFTSData` entity method
 *     "indexedAttributes": [""],
 *     "descriptionAttribute": "",
 *     "dateAttribute": "",
 *   }
 * }
 *
 *  TODO - add fts service entities inside _hookMetadataTransformation
 *
 * @implements MixinModule
 */

/**
 * Blob store request (parameters passed to get|setDocument)
 * @typedef {UBEntityMixin} UBFtsMixin
 * @property {String} scope
 * @property {String} [connectionName='ftsDefault']
 * @property {String} dataProvider
 * @property {Array<string>} [indexedAttributes]
 * @property {string} [descriptionAttribute]
 * @property {string} [dateAttribute]
 */

const UBDomain = require('@unitybase/cs-shared').UBDomain
const App = require('../modules/App')
const UB = require('@unitybase/ub')
module.exports = {
  initDomain: initDomainForFts,
  initEntity: initEntityForFts
}

const MIXIN_NAME = 'fts'
const ERR_ID_IS_REQUIRED = 'execParams.ID is required'
const FTS_ENABLED = App.serverConfig.application.fts && App.serverConfig.application.fts.enabled
const FTS_IS_ASYNC = FTS_ENABLED && App.serverConfig.application.fts.async

/** @type {TubDataStore} */
let UBQ_STORE
/**
 * Verify domain config for FTS
 */
function initDomainForFts () {
  if (FTS_IS_ASYNC && !App.domainInfo.has('ubq_messages')) {
    throw new Error("FTS: for async mode (application.fts.async: true in config) entity 'ubq_messages' must be in Domain (added by '@unitybase/ubq' model)")
  }
  UBQ_STORE = UB.DataStore('ubq_messages')
}

/**
 * Adds insert/update/delete :after handler for all entities with FTS mixin (for server >= 5.20.8)
 * In ASYNC mode handlers schedule an AFYNCFTS task into ubq_messages, in synch mode - call FTS index update immediately
 *
 * @param {UBEntity} entity Entity for initialization
 * @param {UBFtsMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForFts (entity, mixinCfg) {
  /** @type {EntityNamespace} */
  const entityModule = global[entity.name]
  if (!FTS_ENABLED) {
    entityModule.fts = entityModule.ftsreindex = function (ctx) { throw new Error("'fts' feature is disabled in server config") }
    entityModule.entity.addMethod('fts')
    entityModule.entity.addMethod('ftsreindex')
    return
  }

  if (!mixinCfg.connectionName) mixinCfg.connectionName = 'ftsDefault'
  const ftsConn = App.domainInfo.connections.find(c => c.name === mixinCfg.connectionName)
  if (!ftsConn) throw new Error(`FTS mixin: database connection with name '${mixinCfg.connectionName}' not in ubConfig but defined as FTS connection for '${entity.name}'`)

  const isElastic = ftsConn.dialect === 'Elastic'

  // begin mixin config validation
  if ((mixinCfg.scope !== 'Connection') && (mixinCfg.scope !== 'Entity')) {
    throw new Error(`FTS mixin: 'scope' must be one of Connection|Entity but '${mixinCfg.scope}' is defined for '${entity.name}'`)
  }
  if ((mixinCfg.dataProvider !== 'Mixin') && (mixinCfg.dataProvider !== 'Entity')) {
    throw new Error(`FTS mixin: 'dataProvider' must be one of Mixin|Entity but '${mixinCfg.dataProvider}' is defined for '${entity.name}'`)
  }
  if (mixinCfg.dateAttribute) {
    const attr = entity.attributes[mixinCfg.dateAttribute]
    if (!attr) throw new Error(`FTS mixin: attribute ${mixinCfg.dateAttribute} defined in 'dateAttribute' mixin prop. not exist in '${entity.name}'`)
    if (attr.dataType !== UBDomain.ubDataTypes.Date && attr.dataType !== UBDomain.ubDataTypes.DateTime) {
      throw new Error(`FTS mixin: attribute '${entity.name}.${mixinCfg.dateAttribute}' must be of type Date|DateTime to use it as a 'dateAttribute' mixin prop.`)
    }
  }
  if (mixinCfg.dataProvider === 'Mixin') { // for Entity dataProvider getFtsData function must care about description
    if (!mixinCfg.descriptionAttribute) mixinCfg.descriptionAttribute = entity.descriptionAttribute
    if (!mixinCfg.descriptionAttribute) throw new Error(`FTS mixin: 'descriptionAttribute' prop must be defined if dataProvider === 'Mixin' for '${entity.name}'`)
    const dAttr = entity.attributes[mixinCfg.descriptionAttribute]
    if (!dAttr) throw new Error(`FTS mixin: attribute ${mixinCfg.descriptionAttribute} defined in 'descriptionAttribute' mixin prop. not exist in '${entity.name}'`)
    if (dAttr.dataType !== UBDomain.ubDataTypes.String) {
      throw new Error(`FTS mixin: attribute '${entity.name}.${mixinCfg.descriptionAttribute}' must be of type 'String' to use it as a 'descriptionAttribute' mixin prop.`)
    }
    if (!Array.isArray(mixinCfg.indexedAttributes)) throw new Error(`FTS mixin: 'indexedAttributes' must be an array of string for '${entity.name}'`)
  }
  // end of validation block

  // add methods wrapped by logEnter / logLeave (to avoid a long try/finally inside method implementation)
  entityModule.on('insert:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.insert:after`, ftsInsertAfter))
  entityModule.on('update:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.update:after`, ftsUpdateAfter))
  entityModule.on('delete:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.delete:after`, ftsDeleteAfter))
  entityModule.fts = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.fts`, ftsFts)
  entityModule.entity.addMethod('fts')
  entityModule.ftsreindex = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.ftsreindex`, ftsFtsReindex)
  entityModule.entity.addMethod('ftsreindex')
  entityModule.entity.addMethod('fts')
  entityModule.entity.addMethod('ftsreindex')

  function idFromExecParamsOrThrow (ctx) {
    const ID = ctx.mParams.execParams.ID
    if (!ID) throw new Error(ERR_ID_IS_REQUIRED)
    return ID
  }

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsInsertAfter (ctx) {
    const instanceID = idFromExecParamsOrThrow(ctx)
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(ctx.mParams.execParams.ID, 'INSERT')
    } else {
      if (isElastic) {
        // TODO - Elastic INSERT
      } else {
        App.updateFTSIndex(entity.name, instanceID)
      }
    }
  }

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsUpdateAfter (ctx) {
    const instanceID = idFromExecParamsOrThrow(ctx)
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(instanceID, 'UPDATE')
    } else {
      if (isElastic) {
        // TODO - Elastic UPDATE
      } else {
        App.updateFTSIndex(entity.name, instanceID)
      }
    }
  }

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsDeleteAfter (ctx) {
    const instanceID = idFromExecParamsOrThrow(ctx)
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(instanceID, 'DELETE')
    } else {
      if (isElastic) {
        // TODO - Elastic DELETE
      } else {
        App.deleteFromFTSIndex(entity.name, instanceID)
      }
    }
  }

  /**
   * Schedule async FTS operation
   * @private
   * @param ID
   * @param operation
   */
  function scheduleFTSTask (ID, operation) {
    if (!ID) throw new Error('execParams.ID is required')
    UBQ_STORE.run('insert', {
      execParams: {
        queueCode: 'ASYNCFTS',
        msgCmd: `{"entity":"${entity.name}","ID":${ID},"operation":"${operation}"}`
      }
    })
  }

  function ftsFts (ctx) {
    if (isElastic) {
      console.log('DO ELASTIC SEARCH')
    } else {
      // TODO - App._fts
    }
  }

  function ftsFtsReindex (ctx) {
    if (isElastic) {
      console.log('DO ELASTIC ftsReindex')
    } else {
      // TODO - either App._ftsReindex or ReIndexByConnection
    }
  }
}

function wrapEnterLeave (enterText, methodImpl) {
  return function logEnterLeave (ctx) {
    App.logEnter(enterText)
    try {
      methodImpl(ctx)
    } finally {
      App.logLeave()
    }
  }
}
