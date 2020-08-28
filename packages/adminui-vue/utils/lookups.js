/**
 * @typedef {object} LookupSubscription
 *
 * @property {number} subscribes Subscribe counter
 * @property {function} onEntityChanged Client local changes listener
 * @property {Set<string>} attrs Lookup attributes
 * @property {array<object>} data Lookup data
 * @property {object} mapById
 * @property {string} descriptionAttrName
 */
const Vue = require('vue')
const UB = require('@unitybase/ub-pub')
const ENUM_ENTITY = 'ubm_enum'
const LOOKUP_LIMIT = 10000 // limit after which a warning is displayed

const instance = new Vue({
  data () {
    return {
      /**
       * @type {object<string, LookupSubscription>}
       */
      entities: {}
    }
  },

  methods: {
    async init () {
      const availableEntities = Object.keys(UB.connection.domain.entities)
      for (const entity of availableEntities) {
        this.$set(this.entities, entity, {
          subscribes: 0,
          onEntityChanged: async response => {
            if (response === undefined) {
              return
            }
            const { ID, method, resultData } = response

            const responseID = resultData ? resultData.ID : ID
            if (responseID === undefined) {
              console.error('Lookups: server response must contain ID')
              return
            }

            const cachedEntity = this.entities[entity]
            if (method === 'delete') {
              const lookupItemIndex = cachedEntity.data.findIndex(item => item.ID === ID)
              cachedEntity.data.splice(lookupItemIndex, 1)
              delete cachedEntity.mapById[ID]
              return
            }

            const attrs = Array.from(cachedEntity.attrs)
            const updatedItem = {}
            const hasAllDataInResponse = attrs.every(attr => attr in resultData)

            if (hasAllDataInResponse) {
              for (const attr of attrs) {
                updatedItem[attr] = resultData[attr]
              }
            } else {
              Object.assign(
                updatedItem,
                await UB.Repository(entity)
                  .attrs(attrs)
                  .selectById(resultData.ID)
              )
            }

            if (method === 'insert') {
              cachedEntity.data.push(updatedItem)
              cachedEntity.mapById[updatedItem.ID] = updatedItem
            }

            if (method === 'update') {
              const lookupItem = cachedEntity.mapById[updatedItem.ID]
              if (lookupItem) {
                Object.assign(lookupItem, updatedItem)
              }
            }
          },
          attrs: new Set(['ID']),
          data: [],
          mapById: {},
          descriptionAttrName: ''
        })
      }

      await this.subscribe(ENUM_ENTITY, ['eGroup', 'code', 'name'])
    },

    async subscribe (entity, attrs = [], whereList) {
      const subscription = this.entities[entity]
      const isFirstSubscription = subscription.subscribes === 0
      const hasAdditionalAttrs = !attrs.every(attr => subscription.attrs.has(attr))

      if (isFirstSubscription) {
        UB.connection.on(`${entity}:changed`, subscription.onEntityChanged)
        subscription.descriptionAttrName = UB.connection.domain.get(entity).getDescriptionAttribute()
        subscription.attrs.add(subscription.descriptionAttrName)
      }
      if (hasAdditionalAttrs) {
        for (const attr of attrs) {
          subscription.attrs.add(attr)
        }
      }

      subscription.subscribes++

      if (isFirstSubscription || hasAdditionalAttrs || whereList) {
        const ubql = {
          entity,
          fieldList: [...subscription.attrs],
          whereList: whereList || {}
        }

        const resultData = await UB.Repository(ubql)
          .limit(LOOKUP_LIMIT + 1)
          .select()

        if (resultData.length > LOOKUP_LIMIT) {
          console.warn(`Lookups: Entity "${entity}" contains more than ${LOOKUP_LIMIT} records. 
          For large amounts of data, performance problems may occur on slower computers`)
        }

        let uniqueData
        if (whereList) {
          const data = resultData.filter(({ ID: resultDataID }) => (
            subscription.data.every(({ ID: dataID }) => dataID !== resultDataID)
          ))
          uniqueData = subscription.data.concat(data)
        } else {
          uniqueData = resultData
        }

        subscription.data.splice(0, subscription.data.length, ...uniqueData)
        uniqueData.forEach(r => { subscription.mapById[r.ID] = r })
      }
    },

    unsubscribe (entity) {
      const subscription = this.entities[entity]
      subscription.subscribes++
      if (subscription.subscribes === 0) {
        UB.connection.removeListener(`${entity}:changed`, subscription.onEntityChanged)
        subscription.data.splice(0, subscription.data.length)
        // remove additional attrs
        subscription.attrs.clear()
      }
    },

    getDescriptionById (entity, ID) {
      const e = this.entities[entity]
      // for safe deleted record
      if (e.mapById[ID] === undefined) {
        return '---'
      }
      return e.mapById[ID][e.descriptionAttrName]
    },

    get (entity, predicate, resultIsRecord = false) {
      if (predicate === null) {
        return resultIsRecord ? {} : null
      }
      let founded
      if (typeof predicate === 'number') {
        founded = this.entities[entity].mapById[predicate]
      } else if (typeof predicate === 'object') {
        const pKeys = Object.keys(predicate)
        founded = this.entities[entity].data.find(
          r => pKeys.every(k => r[k] === predicate[k])
        )
      }

      if (resultIsRecord) {
        return founded || {}
      } else {
        if (founded) {
          return founded[this.entities[entity].descriptionAttrName]
        } else {
          return null
        }
      }
    }
  }
})

const lookupsModule = {
  /**
   * Subscribes local changes of entity.
   * Lookup attrs already includes ID and description attribute for current entity can be extend by attrs param.
   *
   * @param {string} entity Entity name.
   * @param {string[]} [attrs] Additional lookup attrs.
   * @param {object} [whereList] Additional lookup whereList.
   * @returns {Promise<void>}
   */
  subscribe: instance.subscribe,
  /**
   * Unsubscribe entity from lookup. Listener removed only if current subscription is last.
   *
   * @param {string} entity Entity name
   */
  unsubscribe: instance.unsubscribe,
  /**
   * Fill all available domain entities by empty objects and loads enum entity
   *
   * @private
   *
   * @returns {Promise<void>}
   */
  init: instance.init,
  /**
   * Search for cached record inside in-memory entity values cache using predicate
   *
   * @param {string} entity Entity name
   * @param {number|object|null} predicate
   *   In case predicate is of type number - search by ID - O(1)
   *   In case predicate is Object - search for record what match all predicate attributes - O(N)
   * @param {boolean} [resultIsRecord=false]
   *   - if `true` then return record as a result, in other cases - value of entity `displayAttribute`
   * @returns {*}
   */
  get: instance.get,
  /**
   * Fast O(1) lookup by ID. Return value of entity description attribute
   *
   * @param {string} entity Entity name
   * @param {number} ID
   * @returns {*}
   */
  getDescriptionById: instance.getDescriptionById,

  /**
   * Helper for short calling of enum values
   *
   * @param {string} eGroup
   * @param {string} code
   * @returns {string|null}
   */
  getEnum (eGroup, code) {
    return instance.get(ENUM_ENTITY, { eGroup, code })
  }
}

module.exports = {
  ...lookupsModule,
  install (Vue) {
    Vue.prototype.$lookups = lookupsModule
    if (UB.core.UBApp) {
      UB.core.UBApp.on('applicationReady', () => {
        lookupsModule.init()
      })
    }
  }
}
