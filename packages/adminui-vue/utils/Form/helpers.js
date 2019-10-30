module.exports = {
  buildExecParams,
  mapInstanceFields,
  computedVuex,
  mergeStore,
  required,
  transformCollections,
  buildDeleteRequest,
  enrichFieldList,
  SET
}

const UB = require('@unitybase/ub-pub')
const truncTimeToUTCNull = UB.truncTimeToUtcNull
const UB_DATA_TYPES = require('@unitybase/cs-shared').UBDomain.ubDataTypes

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
      const attr = schema.attributes[key]
      if (!(attr && attr.readOnly) && !key.includes('.')) {
        execParams[key] = value
      }
    }
    if (schema.hasMixin('dataHistory')) {
      // Let server fill historical attributes
      ['mi_data_id', 'mi_dateFrom', 'mi_dateTo'].forEach(f => {
        if (!execParams[f]) delete execParams[f]
      })
    }
    replaceMultilangParams(execParams)
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
      let attr = schema.attributes[key]
      if (trackedObj.data[key] && attr && attr.dataType === UB_DATA_TYPES.Date) {
        execParams[key] = truncTimeToUTCNull(trackedObj.data[key])
      } else {
        execParams[key] = trackedObj.data[key]
      }
    }
  }
  replaceMultilangParams(execParams)
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
 *   repository: store => UB.Repository(),
 *   lazy: true/false
 * }`
 *
 * @param {object} collections
 * @return {void}
 */
function transformCollections (collections) {
  for (let [key, collectionInfo] of Object.entries(collections)) {
    // Replace shorthand syntax, when collection is defined by repository to full collection info object
    if (isRepository(collectionInfo) || typeof collectionInfo === 'function') {
      collectionInfo = collections[key] = {
        repository: collectionInfo,
        lazy: false
      }
    }

    // Replace ClientRepository with a factory function, and output a warning for developers
    if (isRepository(collectionInfo.repository)) {
      if (window.isDeveloperMode) {
        console.warn(
          'Use factory function for building collection requests, not ready Repository objects!  collection: %s, entity',
          key, collectionInfo.repository.entityName
        )
      }
      const repositoryInstance = collectionInfo.repository
      collectionInfo.repository = () => repositoryInstance
    }

    if (typeof collectionInfo.repository !== 'function') {
      throw new UB.UBError(`Can't find ClientRepository in "${key}" collection`)
    }

    collectionInfo.lazy = collectionInfo.lazy === true
  }
}

function isRepository (obj) {
  return obj instanceof UB.ClientRepository
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

/**
 * @param {UBEntity} entitySchema
 * @param {string[]} fieldList
 * @param {string[]} requiredAttrs
 * @return {string[]}
 */
function enrichFieldList (entitySchema, fieldList, requiredAttrs) {
  const fieldsToAppend = requiredAttrs.filter(attr => fieldList.indexOf(attr) === -1 && entitySchema.attributes[attr])
  return fieldList.concat(fieldsToAppend)
}

const langParamRegex = /(\S+)_\S+\^/

/**
 * If execParams includes locale params
 * will replace the locale param with base param.
 *
 * For example in case userLang === 'en'
 * and execParams includes key 'name_uk^'
 * will replace key name to 'name_en^'
 *
 * @param {object} execParams
 */
function replaceMultilangParams (execParams) {
  const langParams = Object.keys(execParams)
    .filter(a => a.includes('^'))
  const userLang = UB.connection.userLang()

  langParams.forEach(p => {
    const res = p.match(langParamRegex)
    if (res && res[1] in execParams) {
      const key = res[1]
      const localeKey = key + '_' + userLang + '^'
      execParams[localeKey] = execParams[key]
      delete execParams[key]
    }
  })
}
