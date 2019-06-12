module.exports = {
  buildExecParams,
  buildCollectionRequests,
  isExistAttr,
  mapInstanceFields,
  computedVuex,
  mergeStore,
  required,
  transformCollections,
  hookWrap,
  initCollections
}

const UB = require('@unitybase/ub-pub')

/**
 * Build "execParams" out of the state tracked by "instance" module.
 * @param {VuexTrackedObject} trackedObj
 * @return {object|null}
 */
function buildExecParams (trackedObj, entity) {
  if (trackedObj.isNew) {
    return Object.entries(trackedObj.data)
      .reduce((execParams, [attr, value]) => {
        execParams[attr] = value
        return execParams
      }, {})
  }

  if (!Object.keys(trackedObj.originalData).length) {
    return null
  }

  const execParams = {
    ID: trackedObj.data.ID
  }
  const isExistModifyDate = isExistAttr(entity, 'mi_modifyDate')
  if (isExistModifyDate) {
    execParams.mi_modifyDate = trackedObj.data.mi_modifyDate
  }
  for (const key of Object.keys(trackedObj.originalData)) {
    execParams[key] = trackedObj.data[key]
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
 * @param {string} entity
 * @return {Array}
 */
function buildCollectionRequests (collection) {
  const requests = []
  if (collection) {
    if (collection.deleted) {
      for (const deletedItem of collection.deleted) {
        requests.push(buildDeleteRequest(collection.entity, deletedItem.data.ID))
      }
    }
    if (collection.items) {
      for (const item of collection.items) {
        const itemExecParams = buildExecParams(item, collection.entity)
        if (itemExecParams) {
          requests.push({
            entity: collection.entity,
            method: item.isNew ? 'insert' : 'update',
            execParams: itemExecParams,
            fieldList: Object.keys(itemExecParams),
            collection: collection.key
          })
        }
      }
    }
  }
  return requests
}

/**
 * Check is attribute includes in entity
 * @param  {String}  attr   Attribute name
 * @param  {String}  entity Entity name
 * @return {Boolean}
 * @private
 */
function isExistAttr (entity, attr) {
  return !!UB.connection.domain.get(entity).getEntityAttributeInfo(attr)
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

/**
 * Assign source store into target store
 * @param {object} target Target store
 * @param {object} source Source store
 */
function mergeStore (target, source) {
  if (source.state) {
    if (target.state) {
      if (typeof target.state === 'function') {
        target.state = Object.assign({}, target.state(), source.state)
      } else {
        Object.assign(target.state, source.state)
      }
    } else {
      target.state = source.state
    }
  }

  function assignWith (key) {
    if (source[key]) {
      if (target[key]) {
        Object.assign(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }

  assignWith('getters')
  assignWith('mutations')
  assignWith('actions')
}

/**
 * throw error if missing required prop of func
 * @param param
 */
function required (param) {
  throw new Error(`Param ${param} is required`)
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
 * create wrap for store hooks for passing store as param
 * @param {function} hook
 * @param {VuexStore} store
 */
function hookWrap (hook = () => {}, store) {
  hook(store)
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
