require('../ux/data/UBStore')
require('./UBCommand')
require('./UBAppConfig')
require('./UBUtil')

/**
 * Load data nto Ext store
 * @deprecated
 *
 * author: Igor Nozhenko
 */
Ext.define('UB.core.UBDataLoader', {
  singleton: true,

  /**
 * Load single instance by ID.
 * @deprecated Use UB.Repository.selectById or UB.Repository.selectSingle instead
 * @param {Object} cfg
 * @param {String} cfg.entityName name of entity to load from
 * @param {Array.<string>} cfg.fieldList list of attribute name's
 * @param {Number} cfg.id ID of entity instance
 * @param {function} cfg.callback function called in case of success loading. Accept one argument record: Ext.data.Model
 * @param {Object} cfg.scope scope for callback
 * @param {String} [cfg.lockType] type of lock 'ltNone'|'ltPersist'|'ltTemp'
 * @return (Promise) Resolved to {Ext.data.Model|null}
 */
  loadInstance: function (cfg) {
    var
      ubRequest = {
        entity: cfg.entityName,
        method: UB.core.UBCommand.methodName.SELECT,
        fieldList: cfg.fieldList,
        alsNeed: cfg.alsNeed,
        // MPV  do not add where list in case of ID passed - see https://pdb.softline.kiev.ua/jira/browse/MIII-511
        ID: cfg.id
      }
    if (cfg.lockType) {
      ubRequest.lockType = cfg.lockType
    }
    var store = Ext.create('UB.ux.data.UBStore', {
      ubRequest: ubRequest,
      autoDestroy: true,
      autoLoad: false
    })

    return store.load()
      .then(function () {
        var record
        if (store.getCount() > 0) {
          record = store.getAt(0)
          record.resultLock = store.resultLock
          record.resultAls = store.resultAls
        }
        if (cfg.callback) {
          UB.logDebug('UBDataLoader.loadInstance with callback is DEPRECATED. Use UBDataLoader.loadInstance(..).then(..).catch(..) style')
          Ext.callback(cfg.callback, cfg.scope, [record])
        }
        return record
      })
  },

  /**
 * If callback not passed - return promise resolved to array of Store, else call callback
 * loadStores({
 *     ubRequests: Array[ubRequest, ubRequest, ..., ubRequest],
 *     setStoreId: Boolean, // If true - storeId will be assigned to store, and store become a subject of Ext.StoreManager...
 *     callback: Function,
 *     scope: Object
 * });
 *
 * @deprecated
 * @param {Object} params
 * @param {Array} params.ubRequests Array of ubRequest object
 * @param {Boolean} params.setStoreId
 * @param {Function} [params.callback]
 * @param {Object} [params.scope]
 * @returns {Promise}
 */
  loadStores: function (params) {
    var
      config
    var storeMd5
    var stores = {}
    var storesToLoad = []
    var ubRequests = params.ubRequests

    if (Array.isArray(ubRequests) && ubRequests.length) {
      for (var i = 0, len = ubRequests.length; i < len; ++i) {
        config = {
          ubRequest: ubRequests[i],
          autoLoad: false,
          disablePaging: true
        }
        storeMd5 = config.ubRequest.requestName || UB.core.UBUtil.getNameMd5(config.ubRequest.entity, config.ubRequest.fieldList, config.ubRequest.whereList)
        if (params.setStoreId) {
          config.storeId = storeMd5
        }
        stores[storeMd5] = Ext.create('UB.ux.data.UBStore', config)
        storesToLoad.push(stores[storeMd5].load())
      }
      return Promise.all(storesToLoad).then(function (storeArray) {
        if (params.callback) {
          UB.logDebug('callback style of UBDataLoader.loadStores is deprecated. loadStores().then(...) or UBConnection methods or store.load().then(...)')
          Ext.callback(params.callback, params.scope || this, [stores])
        } else {
          return storeArray
        }
      })
    } else {
      throw new Error('Non-empty array must be passed to loadStores')
    }
  },

  /**
 * @deprecated
 * xmax  Get result data ignore UB Domain. Return all fields in fieldlist
 */
  loadStoresSimple: function (params) {
    var
      request, modelName, i, len
    for (i = 0, len = params.ubRequests.length; i < len; ++i) {
      request = params.ubRequests[i]
      modelName = request.requestName ? request.requestName : 'req' + (++UB.core.UBService.TRANSACTION_ID)

      if (!request.model) {
        request.model = Ext.define(modelName, {
          extend: 'Ext.data.Model',
          idProperty: 'ID',
          fields: request.fieldList
        })
      }
    }
    return UB.core.UBDataLoader.loadStores(params)
  }

})
