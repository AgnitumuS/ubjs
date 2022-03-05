require('./UBAppConfig')
require('./UBStoreManager')

/**
 * Enum manager
 */
Ext.define('UB.core.UBEnumManager', {
  singleton: true,

  /**
   *
   * @param {string} eGroup
   * @returns {Ext.data.ArrayStore}
   */
  getArrayStore: function (eGroup) {
    const storeId = UB.core.UBUtil.getNameMd5('ubm_enum', eGroup)
    const modelName = UB.ux.data.UBStore.entityModelName(storeId)

    if (!Ext.ModelManager.getModel(modelName)) {
      Ext.define(modelName, {
        extend: 'Ext.data.Model',
        idProperty: 'code',
        fields: [
          'code',
          'name',
          'shortName',
          'sortOrder'
        ]
      })
    }
    const store = Ext.create('Ext.data.ArrayStore', {
      // storeId: storeId,
      model: modelName,
      autoDestroy: true,
      data: this.getGroupData(eGroup)
    })

    store.sort('sortOrder')

    return store
  },

  /**
   *
   * @param {string} eGroup
   * @param {string} field
   * @returns {object}
   */
  getDictionary: function (eGroup, field) {
    const
      data = {}
    const store = UB.core.UBStoreManager.getEnumStore()

    store.each(function (item) {
      if (item.get('eGroup') === eGroup) {
        data[item.get('code')] = item.get(field || 'name')
      }
    })

    return data
  },

  /**
   *
   * @param {string} eGroup
   * @returns {Ext.data.ArrayStore}
   */
  getStore: function (eGroup) {
    return this.getArrayStore(eGroup)
  },

  /**
   *
   * @param {string} eGroup
   * @param {object} options Config object for UB.ux.data.UBStore
   * @returns {UB.ux.data.UBStore}
   */
  getUBStore: function (eGroup, options) {
    const store = Ext.create('UB.ux.data.UBStore', _.defaults(options || {}, {
      ubRequest: {
        entity: 'ubm_enum',
        method: UB.core.UBCommand.methodName.SELECT,
        fieldList: ['eGroup', 'code', 'name', 'shortName', 'sortOrder'],
        whereList: {
          eGroup: {
            expression: '[eGroup]',
            condition: 'equal',
            values: { eGroup: eGroup }
          }
        },
        orderList: { byName: { expression: 'name', order: 'asc' } }
      },
      autoLoad: false,
      autoDestroy: true,
      disablePaging: true,
      idProperty: 'code'
    }))
    store.load()
    return store
  },

  /**
   *
   * @param {string} eGroup
   * @returns {Array}
   */
  getGroupData: function (eGroup) {
    const
      data = []
    const store = UB.core.UBStoreManager.getEnumStore()

    store.each(function (item) {
      if (item.get('eGroup') === eGroup) {
        data.push([
          item.get('code'),
          item.get('name'),
          item.get('shortName'),
          item.get('sortOrder')
        ])
      }
    })

    return data
  },

  /**
   *
   * @param {string} eGroup
   * @param {string} value
   * @returns {Ext.data.Model}
   */
  getById: function (eGroup, value) {
    const
      store = UB.core.UBEnumManager.getStore(eGroup)

    return store.getById(value)
  }
})
