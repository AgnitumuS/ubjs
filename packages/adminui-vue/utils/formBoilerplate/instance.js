module.exports = {
  createInstanceModule,
  mapInstanceFields,
  computedVuex
}

const Vue = require('vue')
const moment = require('moment')
/**
 * @typedef {object} VuexTrackedInstance
 * @property {boolean} isNew        Indicator of whether master instance was loaded or it is newly created
 * @property {object} data          Master record instance, current values, as shall be shown on UI
 * @property {object} originalData  Shadow copy of modified attributes
 * @property {object<string, VuexTrackedCollection>} collections   List of tracked detain collections
 */

/**
 * @typedef {object} VuexTrackedCollection
 * @property {Array<VuexTrackedObject>} items    Current items, as it shall be shown on UI
 * @property {Array<VuexTrackedObject>} deleted  Deleted items, except items which are added
 *   (not originally loaded)
 */

/**
 * @typedef {object} VuexTrackedObject
 * @property {boolean} isNew        Indicator of whether master instance was loaded or it is newly created
 * @property {object} data          Master record instance, current values, as shall be shown on UI
 * @property {object} originalData  Shadow copy of modified attributes
 */

/**
 * A helper method to equal 2 params, can equal arrays.
 * @param {*} arg1
 * @param {*} arg2
 */

function isEqual (arg1, arg2) {
  if (Array.isArray(arg1) || Array.isArray(arg2)) {
    if (arg1 === undefined) {
      arg1 = []
    }
    if (arg2 === undefined) {
      arg2 = []
    }
    return arg1.filter(i => !arg2.includes(i))
      .concat(arg2.filter(i => !arg1.includes(i))).length === 0
  } else if (isDate(arg1) || isDate(arg2)) {
    return moment(arg1).isSame(arg2)
  } else {
    return arg1 === arg2
  }
}

/**
 * Check value is Date
 * @param  {Date}    date
 * @return {Boolean}
 */
function isDate (date) {
  return date instanceof Date && !isNaN(date)
}

/**
 * Check obj is empty
 * @param  {Any}     obj
 * @return {Boolean}
 */
function isEmpty (obj) {
  if (obj === null) return true
  return typeof obj === 'object' && Object.keys(obj).length === 0
}

/**
 * A helper method to update the "tracked" object property.
 * @param {VuexTrackedObject} state
 * @param {string} key
 * @param {*} value
 */

function change (state, key, value) {
  if (!isEqual(state.data[key], value)) {
    if (!(key in state.originalData)) {
      // No value in "originalData" - edited for the first time, so save old value to "originalData"
      Vue.set(state.originalData, key, state.data[key])
    } else if (isEqual(state.originalData[key], value)) {
      // If set value to its original value, means reverting any changes made, so delete it from "originalData"
      Vue.delete(state.originalData, key)
    }

    Vue.set(state.data, key, value)
  }
}

/**
 * Create an unified object for tracking edited object state.
 *
 * The state consists of the following properties:
 * - data: it is an object with actual (to be shown on UI) data values, regardless if values are untouched by user
 *     or already edited.
 * - originalData: this object is initially empty, but as user starts editing, it is filled by original values, as
 *     they loaded from DB, so that it would be always possible to say if a certain attribute was changed or not.
 *     If after some editing, value returned to its original state, value is deleted from this object.
 *     When this object is has no attributes, we know there is nothing to save.
 * - collections: this is a property for complex object, objects which consist of one master record and collection or
 *     multiple collections of detail records.
 *     Each collection tracks added, changed and deleted items, so that we know if there is any change to save
 *     in the collection.
 *     Collection item is tracked just like the master record, using the same technique -
 *     "data" and "originalData" properties for item.  Item also has "isNew" property, indicating if item was added
 *     after original loading of collection or not.
 *     The "deleted"
 *
 * merge base store with instance module store
 * @param  {Object} store Vuex store config
 * @return {Object}       Modified store config
 */
function createInstanceModule (store = {}) {
  return {
    /**
     * @type {VuexTrackedInstance}
     */
    state: {
      ...(typeof store.state === 'function' ? store.state() : store.state),

      /**
       * Properties as they are in DB.
       */
      data: {},

      /**
       * This contains old (originally loaded) values of updated properties.
       */
      originalData: {},

      /**
       * Detailed collections (if any)
       */
      collections: {}
    },

    getters: {
      ...store.getters,

      /**
       * @param {VuexTrackedInstance} state
       * @return {boolean}
       */
      isDirty (state) {
        if (!isEmpty(state.originalData)) {
          return true
        }
        for (const collection of Object.values(state.collections)) {
          if (collection.deleted.length) {
            return true
          }
          for (const item of collection.items) {
            if (item.isNew || !isEmpty(item.originalData)) {
              return true
            }
          }
        }
        return false
      }
    },

    mutations: {
      ...store.mutations,

      /**
       * Set base state values
       * @param {VuexTrackedInstance} state
       * @param {String} options.key   state key
       * @param {Any} options.value value
       */
      SET (state, { key, value }) {
        state[key] = value
      },

      /**
       * Load initial state of tracked master entity, all at once.
       * @param {VuexTrackedInstance} state
       * @param {object} loadedState
       */
      LOAD_DATA (state, loadedState) {
        state.data = loadedState
        Vue.set(state, 'originalData', {})
      },

      /**
       * After insert, update or other server calls, which update entity, need to inform module about new server state.
       * @param {VuexTrackedInstance} state
       * @param {object} loadedState
       */
      LOAD_DATA_PARTIAL (state, loadedState) {
        for (const [key, value] of Object.entries(loadedState)) {
          change(state, key, value)
          Vue.delete(state.originalData, key)
        }
      },

      /**
       * Update value of attribute for master record, or for a record of a detail collection item.
       * The mutation uses "data" and "originalData" object to correctly track object state.
       *
       * @param {VuexTrackedInstance} state
       * @param {string} collection  Name of collection, optional
       * @param {number} index       Index of item, optional, shall only be specified, if collection is specified.
       * @param {string} key         Key of changed attribute
       * @param {*}      value       Value attribute is changed to.
       */
      SET_DATA (state, { collection, index, key, value }) {
        if (typeof collection !== 'string') {
          // Change the Master record
          change(state, key, value)
          return
        }

        // Item of a detail collection
        if (!(collection in state.collections)) {
          throw new Error(`Collection "${collection}" was not loaded or created!`)
        }
        const collectionInstance = state.collections[collection]
        if (!(index in collectionInstance.items)) {
          throw new Error(`Collection "${collection}" does not have index: ${index}!`)
        }
        change(collectionInstance.items[index], key, value)
      },

      /**
       * Just like "SET", but assign multiple values at once passed as an object.
       * @param {VuexTrackedInstance} state
       * @param {object} loadedState
       */
      ASSIGN_DATA (state, { collection, index, loadedState }) {
        for (const [key, value] of Object.entries(loadedState)) {
          if (typeof collection !== 'string') {
            // Change the Master record
            change(state, key, value)
            return
          }

          // Item of a detail collection
          if (!(collection in state.collections)) {
            throw new Error(`Collection "${collection}" was not loaded or created!`)
          }
          const collectionInstance = state.collections[collection]
          if (!(index in collectionInstance.items)) {
            throw new Error(`Collection "${collection}" does not have index: ${index}!`)
          }
          change(collectionInstance.items[index], key, value)
        }
      },

      /**
       * Set original state of collection items
       * @param {VuexTrackedInstance} state
       * @param {String} collection
       * @param {Array} items
       * @param {String} entity
       */
      LOAD_COLLECTION (state, { collection, items: itemStates, entity }) {
        const items = itemStates.map(item => ({
          data: item,
          originalData: {}
        }))
        const collectionObj = { items, deleted: [], entity, key: collection }
        Vue.set(state.collections, collection, collectionObj)
      },

      /**
       * Update collection data.
       * Removed originalData for props which updated
       * Remove isNew status.
       * @param {VuexTrackedInstance} state
       * @param {String} options.collection  collection
       * @param {Number} options.index       index in collection
       * @param {Object} options.loadedState loaded state
       */
      LOAD_COLLECTION_PARTIAL (state, { collection, index, loadedState }) {
        const collectionInstance = state.collections[collection]

        for (const [key, value] of Object.entries(loadedState)) {
          change(collectionInstance.items[index], key, value)
          Vue.delete(collectionInstance.items[index].originalData, key)
          collectionInstance.items[index].isNew = false
        }
      },

      /**
       * Add a new item to a collection.  Added item will be marked as "isNew".
       * @param {VuexTrackedInstance} state
       * @param {string} collection  Collection name.
       * @param {object} itemState   Item state (a regular JS object).
       */
      ADD_COLLECTION_ITEM (state, { collection, item: itemState }) {
        if (!(collection in state.collections)) {
          // Lazy create collection
          Vue.set(state.collections, collection, { items: [], deleted: [] })
        }
        state.collections[collection].items.push({ data: itemState, originalData: {}, isNew: true })
      },

      /**
       * Remove an item from a collection.
       * If remove an added item, no need to track the deletion.  If remove originally loaded record, remember the
       * deletion to track it as a change.
       * @param {VuexTrackedInstance} state
       * @param {string} collection  Collection name.
       * @param {number} index       Index of item inside collection to remove.
       */
      REMOVE_COLLECTION_ITEM (state, { collection, index }) {
        if (collection in state.collections) {
          const removedItem = state.collections[collection].items.splice(index, 1)[0]
          if (removedItem && !removedItem.isNew) {
            state.collections[collection].deleted.push(removedItem)
          }
        }
      },

      /**
       * Clear deleted items in all collections, after sending removal requests
       * @param {VuexTrackedInstance} state
       */
      CLEAR_ALL_DELETED_ITEMS (state) {
        for (const collection of Object.keys(state.collections)) {
          Vue.set(state.collections[collection], 'deleted', [])
        }
      }
    },

    actions: {
      ...store.actions
    }
  }
}

/**
 * Making dynamic set(), get() method for state of vuex
 * for instance fields
 * @param {string[]|string} moduleOrArr
 * @param {string[]} [arr]
 */
function mapInstanceFields (moduleOrArr, arr) {
  let module, properties
  if (Array.isArray(moduleOrArr)) {
    module = null
    properties = moduleOrArr
  } else {
    module = moduleOrArr
    properties = arr
  }

  const obj = {}
  for (const key of properties) {
    obj[key] = {
      get () {
        if (module) {
          return this.$store.state[module].data[key] || ''
        } else {
          return this.$store.state.data[key] || ''
        }
      },
      set (value) {
        if (this.$v && key in this.$v) {
          this.$v[key].$touch()
        }
        if (module) {
          this.$store.commit(`${module}/SET_DATA`, { key, value })
        } else {
          this.$store.commit(`SET_DATA`, { key, value })
        }
      }
    }
  }
  return obj
}

/**
 * Making dynamic set(), get() method for state of vuex
 * @param {string|string[]} arg1
 * @param {string[]} [arg2]
 */
function computedVuex (arg1, arg2) {
  const isModule = typeof arg1 === 'string'
  const moduleName = isModule ? arg1 : ''
  const arr = isModule ? arg2 : arg1

  const obj = {}
  for (const key of arr) {
    obj[key] = {
      get () {
        return moduleName ? this.$store.state[moduleName][key] : this.$store.state[key]
      },
      set (value) {
        this.$store.commit(moduleName ? moduleName + '/SET' : 'SET', { key, value })
      }
    }
  }
  return obj
}
