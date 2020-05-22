/**
 * @typedef {object} LookupSubscription
 *
 * @property {number} subscribes Subscribe counter
 * @property {function} onEntityChanged Client local changes listener
 * @property {set} attrs Lookup attributes
 * @property {array<object>} data Lookup data
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
          onEntityChanged: response => {
            for (const { method, resultData } of response) {
              if (resultData.ID === undefined) {
                console.error('Lookups: server response must contain ID')
                return
              }

              const { data, attrs: lookupAttrs } = this.entities[entity]
              const updatedItem = Object.keys(resultData)
                .filter(attr => lookupAttrs.has(attr))
                .reduce((accum, attr) => {
                  accum[attr] = resultData[attr]
                  return accum
                }, {})

              if (method === 'insert') {
                data.push(updatedItem)
              }

              if (method === 'update') {
                const lookupItem = data.find(item => item.ID === resultData.ID)
                if (lookupItem) {
                  Object.assign(lookupItem, updatedItem)
                }
              }

              if (method === 'delete') {
                const lookupItemIndex = data.findIndex(item => item.ID === resultData.ID)
                data.splice(lookupItemIndex, 1)
              }
            }
          },
          attrs: new Set(['ID']),
          data: []
        })
      }

      await this.subscribe(ENUM_ENTITY, ['eGroup', 'code', 'name'])
    },

    async subscribe (entity, attrs = []) {
      const subscription = this.entities[entity]
      const isFirstSubscription = subscription.subscribes === 0
      const hasAdditionalAttrs = !attrs.every(attr => subscription.attrs.has(attr))

      if (isFirstSubscription) {
        UB.connection.on(`${entity}:changed`, subscription.onEntityChanged)
        subscription.attrs.add(UB.connection.domain.get(entity).getDescriptionAttribute())
      }
      if (hasAdditionalAttrs) {
        for (const attr of attrs) {
          subscription.attrs.add(attr)
        }
      }

      subscription.subscribes++

      if (isFirstSubscription || hasAdditionalAttrs) {
        const resultData = await UB.Repository(entity)
          .attrs([...subscription.attrs])
          .select()

        if (resultData.length > LOOKUP_LIMIT) {
          console.warn(`Lookups: Entity "${entity}" contains more than ${LOOKUP_LIMIT} records. 
          For large amounts of data, performance problems may occur on slower computers`)
        }
        subscription.data.splice(0, subscription.data.length, ...resultData)
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
        subscription.attrs.add('ID')
        subscription.attrs.add(UB.connection.domain.get(entity).getDescriptionAttribute())
      }
    },

    get (entity, value, displayAttr) {
      const returnsRecord = displayAttr === true
      if (value === null) {
        return returnsRecord ? {} : null
      }
      const query = {}
      if (typeof value === 'number') {
        query.ID = value
      }
      if (typeof value === 'object') {
        Object.assign(query, value)
      }
      const record = this.entities[entity].data.find(
        record => Object.entries(query)
          .every(([attrCode, attrValue]) => record[attrCode] === attrValue)
      ) || {}

      if (returnsRecord) {
        return record
      } else {
        if (record) {
          const descriptionAttr = UB.connection.domain.get(entity).getDescriptionAttribute()
          return record[descriptionAttr]
        } else {
          return {}
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
   * Lookup getter
   *
   * @param {string} entity
   *   Entity name
   * @param {number|object|null} value
   *   Search lookup record by ID.
   *   In case passed object search for an object in which the key is an attribute
   *   and the value is the value of this attribute.
   *   Can be search by several attributes, for example {eGroup: 'AUDIT_ACTIONS', code: 'INSERT'}
   * @param {string|boolean} [displayAttr]
   *   Display attribute name.
   *   If is not equal to description attribute of current entity - it must contained in attrs on subscribe.
   *   If passed true will return the entire record.
   *
   * @returns {*}
   */
  get: instance.get
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
