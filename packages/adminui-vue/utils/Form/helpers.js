module.exports = {
  buildExecParams,
  buildCollectionRequests,
  mapInstanceFields,
  computedVuex,
  mergeStore,
  required,
  transformCollections,
  initCollections,
  SET
}

const UB = require('@unitybase/ub-pub')

const SYSTEM_FIELDS = new Set([
  'mi_createDate',
  'mi_createUser',
  'mi_deleteDate',
  'mi_deleteUser',
  'mi_modifyUser',
  'mi_owner'
])

/**
 * "execParams" and "fieldList"
 *
 * @typedef {object} UbQueryParams
 * @property {object} execParams
 * @property {array} fieldList
 */

/**
 * Build "execParams" out of the state tracked by "instance" module.
 *
 * @param {VuexTrackedObject} trackedObj
 * @param {string} entity
 * @return {object|null}
 */
function buildExecParams (trackedObj, entity) {
  const execParams = {}
  const schema = UB.connection.domain.get(entity)
  if (trackedObj.isNew) {
    for (const [key, value] of Object.entries(trackedObj.data)) {
      if (!SYSTEM_FIELDS.has(key) && !key.includes('.')) {
        execParams[key] = value
      }
    }
    return execParams
  }

  if (!Object.keys(trackedObj.originalData).length) {
    return null
  }

  execParams.ID = trackedObj.data.ID
  if (schema.attributes['mi_modifyDate']) {
    execParams.mi_modifyDate = trackedObj.data.mi_modifyDate
  }

  for (const key of Object.keys(trackedObj.originalData)) {
    if (!key.includes('.')) {
      execParams[key] = trackedObj.data[key]
    }
  }
  return execParams
}

function buildDeleteRequest (entity, ID) {
  return {
    entity,
    method: 'delete',
    execParams: {
      ID
    }
  }
}

/**
 * @param {VuexTrackedCollection} collection
 * @param {object} state
 * @param {object} collectionInfo
 * @return {Array<object>}
 */
function buildCollectionRequests (state, collection, collectionInfo) {
  const fieldList = collectionInfo.repository.fieldList
  const requests = []
  if (collection) {
    if (collection.deleted) {
      for (const deletedItem of collection.deleted) {
        requests.push(typeof collectionInfo.buildDeleteRequest === 'function'
          ? collectionInfo.buildDeleteRequest({state, collection, item: deletedItem})
          : buildDeleteRequest(collection.entity, deletedItem.data.ID))
      }
    }
    if (collection.items) {
      for (const item of collection.items) {
        const execParams = buildExecParams(item, collection.entity)
        if (execParams) {
          const request = typeof collectionInfo.buildRequest === 'function'
            ? collectionInfo.buildRequest({state, collection, execParams, fieldList, item})
            : {
              entity: collection.entity,
              method: item.isNew ? 'insert' : 'update',
              execParams,
              fieldList,
              collection: collection.key
            }
          requests.push(request)
        }
      }
    }
  }
  return requests
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
          return this.$store.state[module].data[key]
        } else {
          return this.$store.state.data[key]
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
 * Making dynamic set(), get() method for state of vuex.
 * Vuex store or module which you want to use this function
 * need to includes SET mutation (from helpers).
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

/**
 * Assign source store into target store
 * @param {object} target Target store
 * @param {object} source Source store
 */
function mergeStore (target, source) {
  const sourceState = typeof source.state === 'function'
    ? source.state()
    : source.state

  function assignWith (key) {
    target[key] = Object.assign({}, source[key], target[key])
  }

  target.state = Object.assign({}, sourceState, target.state)
  assignWith('getters')
  assignWith('mutations')
  assignWith('actions')
  assignWith('modules')

  // merge plugins
  if (source.plugins) {
    if (!target.plugins) {
      target.plugins = []
    }
    target.plugins.push(...source.plugins)
  }

  // merge strict mode
  if (source.strict !== undefined) {
    target.strict = source.strict
  }
}

/**
 * throw error if missing required prop of func
 * @param param
 */
function required (param) {
  throw new Error(`Parameter "${param}" is required`)
}

/**
 * Transform's each collection object to
 * `key: {
 *   repository: UB.Repository(),
 *   lazy: true/false
 * }`
 *
 * @param {object} collections
 * @return {void}
 */
function transformCollections (collections) {
  const entries = Object.entries(collections)
  for (const [coll, collData] of entries) {
    if (isRepository(collData)) {
      collections[coll] = {
        repository: collData,
        lazy: false
      }
    } else if (collData.repository && isRepository(collData.repository)) {
      collData.lazy = collData.lazy === true
    } else {
      throw new UB.UBError(`Can't find ClientRepository in "${coll}" collection`)
    }
  }
}

function isRepository (obj) {
  return obj instanceof UB.ClientRepository
}

/**
 * for each collection init empty data in store
 * @param {function} commit Vuex store.commit
 * @param {object} collections Collections
 */
function initCollections (commit, collections) {
  for (const [key, collData] of Object.entries(collections)) {
    commit('LOAD_COLLECTION', {
      collection: key,
      entity: collData.repository.entityName,
      lazy: collData.lazy,
      items: []
    })
  }
}

/**
 * This mutation is needed in order to reuse it in the store modules,
 * since computedVuex will not work in the store module without such a mutation
 * Set base state values
 * @param {VuexTrackedInstance} state
 * @param {object} payload
 * @param {String} payload.key state key
 * @param {*} payload.value value
 */
function SET (state, { key, value }) {
  state[key] = value
}
