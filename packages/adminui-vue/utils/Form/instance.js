module.exports = createInstanceModule

const Vue = require('vue')
const moment = require('moment')
const { SET } = require('./helpers')

/**
 * @typedef {object} VuexTrackedInstance
 * @property {boolean} isNew        Whether master instance was loaded or it is newly created
 * @property {object}  data         Master record instance, current values, as shall be shown on UI
 * @property {object}  originalData Shadow copy of modified attributes
 * @property {object<string, VuexTrackedCollection>} collections   List of tracked detain collections
 */

/**
 * @typedef {object} VuexTrackedCollection
 * @property {string} entity                     Entity code
 * @property {string} key                        Unique collection identifier
 * @property {Array<VuexTrackedObject>} items    Current items, as it shall be shown on UI
 * @property {Array<VuexTrackedObject>} deleted  Deleted items, except items which are added
 *   (not originally loaded)
 * @property {string} key Custom unique key which is set on init collection
 * @property {string} entity Entity code
 */

/**
 * @typedef {object} VuexTrackedObject
 * @property {boolean} isNew         Indicator of whether master instance was loaded or it is newly created
 * @property {object}  data          Master record instance, current values, as shall be shown on UI
 * @property {object}  originalData  Shadow copy of modified attributes
 */

/**
 * A helper method to equal 2 params, can equal arrays or dates
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
    if (!Array.isArray(arg1) || !Array.isArray(arg2)) {
      return false
    }
    if (arg1.find(i => !arg2.includes(i))) {
      return false
    }
    if (arg2.find(i => !arg1.includes(i))) {
      return false
    }
    return true
  } else if (isDate(arg1) || isDate(arg2)) {
    return moment(arg1).isSame(arg2)
  } else if (isObject(arg1) || isObject(arg2)) {
    if (arg1 === undefined) {
      arg1 = {}
    }
    if (arg2 === undefined) {
      arg2 = {}
    }
    return _.isEqual(arg1, arg2)
  } else {
    return arg1 === arg2
  }
}

/**
 * Check if value is a Date
 * @param  {*} value
 * @return {boolean}
 */
function isDate (value) {
  return value instanceof Date && !isNaN(value)
}

/**
 * Check if value is an object
 * @param value
 */
function isObject (value) {
  return typeof value === 'object' && value !== null
}

/**
 * Check obj is empty
 * @param  {*} obj
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
 * @param {string} [path]
 */
function change (state, key, value, path) {
  let currentValue = state.data[key]
  if (path !== undefined) {
    currentValue = _.get(currentValue, path)
  }
  if (isEqual(currentValue, value)) {
    return
  }

  if (!(key in state.originalData)) {
    // No value in "originalData" - edited for the first time, so save old value to "originalData"
    // TODO: for object types, need to create clone
    Vue.set(state.originalData, key, _.clone(state.data[key]))
  }

  if (path === undefined) {
    Vue.set(state.data, key, value)
  } else {
    if (typeof state.data[key] !== 'object' || state.data[key] === null) {
      // Create an object, if current value is not a valid object
      Vue.set(state.data, key, {})
    }

    const jsonAttr = state.data[key]
    if (value !== undefined) {
      Vue.set(jsonAttr, path, value)
    } else {
      Vue.delete(jsonAttr, path)
    }
  }

  if (isEqual(state.originalData[key], state.data[key])) {
    // After and only after setting value, check if we got the same value as in originalData
    // If set value to its original value, means reverting any changes made, so delete it from "originalData"
    Vue.delete(state.originalData, key)
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
 * @return {Object}       Modified store config
 */
function createInstanceModule () {
  return {
    /**
     * @type {VuexTrackedInstance}
     */
    state: {
      /**
       * Whether master instance was loaded or it is newly created
       */
      isNew: false,
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
      SET,

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
       * Update value of attribute for master record or a record of a details collection item.
       * The mutation uses "data" and "originalData" object to correctly track object state.
       *
       * @param {VuexTrackedInstance} state
       * @param {object} payload
       * @param {string} [payload.collection]  Name of collection, optional
       * @param {number} [payload.index]       Index of item, optional, shall only be specified, if collection is specified.
       * @param {string} payload.key           Key of changed attribute
       * @param {string} [payload.path]        Path (for JSON attributes) of the value
       * @param {*}      payload.value         Value attribute is changed to.
       */
      SET_DATA (state, { collection, index, key, value, path }) {
        if (typeof collection !== 'string') {
          // Change the Master record
          change(state, key, value, path)
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
        change(collectionInstance.items[index], key, value, path)
      },

      /**
       * Just like "SET_DATA", but assign multiple values at once passed as an object.
       * @param {VuexTrackedInstance} state
       * @param {object} payload
       * @param {object} [payload.collection] optional collection (if not passed update master store)
       * @param {object} [payload.index] optional collection item index. required in case collection is passed
       * @param {object} payload.loadedState
       */
      ASSIGN_DATA (state, { collection, index, loadedState }) {
        let stateToChange
        if (collection) {
          if (!(collection in state.collections)) {
            throw new Error(`Collection "${collection}" was not loaded or created!`)
          }
          const collectionInstance = state.collections[collection]
          if (!(index in collectionInstance.items)) {
            throw new Error(`Collection "${collection}" does not have index: ${index}!`)
          }
          stateToChange = collectionInstance.items[index]
        } else {
          stateToChange = state
        }

        for (const [key, value] of Object.entries(loadedState)) {
          change(stateToChange, key, value)
        }
      },

      /**
       * Set original state of collection items
       * @param {VuexTrackedInstance} state
       * @param {object} payload
       * @param {string} payload.collection
       * @param {VuexTrackedObject[]} payload.items
       * @param {string} payload.entity
       */
      LOAD_COLLECTION (state, { collection, items: itemStates, entity }) {
        const items = itemStates.map(item => ({
          data: item,
          originalData: {}
        }))
        const collectionObj = { items, deleted: [], key: collection, entity }
        Vue.set(state.collections, collection, collectionObj)
      },

      /**
       * Update collection data.
       * Removed originalData for props which updated
       * Remove isNew status.
       * @param {VuexTrackedInstance} state
       * @param {object} payload
       * @param {string} payload.collection  collection
       * @param {number} payload.index       index in collection
       * @param {object} payload.loadedState loaded state
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
       * @param {object} payload
       * @param {string} payload.collection Collection name
       * @param {object} payload.item       Item state (a regular JS object)
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
       * If remove an added item, no need to track the deletion.
       * If remove originally loaded record, remember the
       * deletion to track it as a change.
       * @param {VuexTrackedInstance} state
       * @param {object} payload
       * @param {string} payload.collection  Collection name
       * @param {number} payload.index       Index of item inside a collection to remove
       */
      DELETE_COLLECTION_ITEM (state, { collection, index }) {
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
      },

      /**
       * Remove all items from a collection.
       * If remove an added item, no need to track the deletion.
       * If remove originally loaded record, remember the
       * deletion to track it as a change.
       * @param state
       * @param {string} collectionName Name of collection
       */
      DELETE_ALL_COLLECTION_ITEMS (state, collectionName) {
        if (collectionName in state.collections) {
          const collection = state.collections[collectionName]
          const deleted = collection.items
            .splice(0, collection.items.length)
            .filter(i => !i.isNew)
          collection.deleted.push(...deleted)
        }
      }
    }
  }
}
