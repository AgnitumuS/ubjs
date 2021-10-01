/**
 * `fts` mixin implements a Full Text Search index creation and usage for entity.
 * See [Full Text Search tutorial](https://unitybase.info/api/server-v5/tutorial-mixins_fts.html) for details.
 *
 * Configuration
 * "mixins": {
 *   "fts": {
 *     TODO
 *   }
 * }
 *
 *  TODO - add fts service entities inside _hookMetadataTransformation
 *
 * @implements MixinModule
 */

const App = require('../modules/App')
const UB = require('@unitybase/ub')
module.exports = {
  initDomain: initDomainForFts,
  initEntity: initEntityForFts
}

const MIXIN_NAME = 'fts'
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
 * @param {UBfsStoreMixin} mixinCfg Mixin configuration from entity metafile
 */
function initEntityForFts (entity, mixinCfg) {
  /** @type {EntityNamespace} */
  const entityModule = global[entity.name]

  // TODO fill defaults
  // if (mixinCfg.modelBased === undefined) mixinCfg.modelBased = true

  // TODO verify mixin configuration
  // if (!entity.attributes[mixinCfg.naturalKey]) {
  //   throw new Error(`fsStorage for ${entity.name}: naturalKey attribute '${mixinCfg.naturalKey}' not exist`)
  // }

  if (FTS_ENABLED) {
    // add methods wrapped by logEnter / logLeave (to avoid a long try/finally inside method implementation)
    entityModule.on('insert:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.insert:after`, ftsInsertAfter))
    entityModule.on('update:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.update:after`, ftsUpdateAfter))
    entityModule.on('delete:after', wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.delete:after`, ftsDeleteAfter))
    entityModule.fts = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.fts`, ftsFts)
    entityModule.entity.addMethod('fts')
    entityModule.ftsreindex = wrapEnterLeave(`method(${MIXIN_NAME}) ${entity.name}.ftsreindex`, ftsFtsReindex)
    entityModule.entity.addMethod('ftsreindex')
  } else {
    entityModule.fts = entityModule.ftsreindex = function (ctx) { throw new Error("'fts' is disabled in server config") }
  }
  // entityModule.entity.addMethod('fts')
  // entityModule.entity.addMethod('ftsreindex')

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsInsertAfter (ctx) {
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(ctx.mParams.execParams.ID, 'INSERT')
    } else {
      //TODO - eiter App.InternalGatherAndSaveFTSData (for SQLite) or Elastic
    }
  }

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsUpdateAfter (ctx) {
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(ctx.mParams.execParams.ID, 'UPDATE')
    } else {
      //TODO - eiter App.InternalGatherAndSaveFTSData (for SQLite) or Elastic
    }
  }

  /**
   * @private
   * @param {ubMethodParams} ctx
   */
  function ftsDeleteAfter (ctx) {
    if (FTS_IS_ASYNC) {
      scheduleFTSTask(ctx.mParams.execParams.ID, 'DELETE')
    } else {
      //TODO - eiter App.InternalGatherAndSaveFTSData (for SQLite) or Elastic
    }
  }

  function scheduleFTSTask (ID, operation) {
    if (!ID) throw new Error('execParams.ID is required')
    UBQ_STORE.run('insert', {
      execParams: {
        queueCode: 'ASYNCFTS',
        msgCmd: `{"entity":"${entity.name}","ID":${ID},"operation":"${operation}"}`
      }
    })
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
