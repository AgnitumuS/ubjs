/* global ubq_scheduler ncrc32 */
// eslint-disable-next-line camelcase
let me = ubq_scheduler

const fs = require('fs')
const path = require('path')
const LocalDataStore = require('@unitybase/cs-shared').LocalDataStore
const argv = require('@unitybase/base').argv
const UBDomain = require('@unitybase/cs-shared').UBDomain
const UB = require('@unitybase/ub')
const App = UB.App
const _ = require('lodash')

me.entity.addMethod('select')

// here we store loaded schedulers
let resultDataCache = null
const FILE_NAME_TEMPLATE = '_schedulers.json'

// calculate default value for entity attributes
let attributes = me.entity.attributes
/**
 * Load a schedulers from a file. Override a already loaded schedulers if need
 * @private
 * @param {UBModel} model
 * @param {Array<Object>} loadedData Data already loaded
 */
function loadOneFile (model, loadedData) {
  if (!model.realPath) return // model with public path only
  let fn = path.join(model.realPath, FILE_NAME_TEMPLATE)
  let modelName = model.name

  if (!fs.existsSync(fn)) { return }
  let schedulersEnabled = (!(App.serverConfig.application.schedulers && (App.serverConfig.application.schedulers.enabled === false)))
  const FALSE_CONDITION = 'false //disabled in app config'
  try {
    let content = argv.safeParseJSONfile(fn)
    if (!Array.isArray(content)) {
      console.error('SCHEDULER: invalid config in %. Must be a array ob objects', fn)
      return
    }
    for (let i = 0, L = content.length; i < L; i++) {
      let item = content[i]
      let existedItem = _.find(loadedData, {name: item.name})
      _.defaults(item, defaultValues)
      item.actualModel = modelName
      if (!schedulersEnabled) {
        item.schedulingCondition = FALSE_CONDITION
      }
      if (existedItem) { // override
        _.assign(existedItem, item)
        existedItem.overridden = '1'
      } else {
        item.ID = ncrc32(0, item.name)
        loadedData.push(item)
      }
    }
  } catch (e) {
    console.error('SCHEDULER: Invalid config in %. Error: %. File is ignored', fn, e.toString())
  }
}

let defaultValues = _(attributes).toArray().filter('defaultValue').value()
  .reduce(function (result, attr) {
    result[attr.name] = attr.defaultValue
    return result
  }, {})

function loadAll () {
  let models = App.domainInfo.models
  let loadedData = []

  if (!resultDataCache) {
    console.debug('load schedulers from models directory structure')
    for (let modelName in models) {
      let model = models[modelName]
      loadOneFile(model, loadedData)
    }

    let attrList = Object.keys(attributes)
    resultDataCache = {
      version: 0,
      fields: attrList,
      data: LocalDataStore.arrayOfObjectsToSelectResult(loadedData, attrList)
    }
  } else {
    console.debug('ubq_scheduler: already loaded')
  }
  return resultDataCache
}

/**
 * Retrieve data from resultDataCache and init ctx.dataStore
 * caller MUST set dataStore.currentDataName before call doSelect function
 * @private
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 */
function doSelect (ctx) {
  let mP = ctx.mParams
  let aID = mP.ID
  let cType = ctx.dataStore.entity.cacheType
  let cachedData = loadAll()

  if (!(aID && (aID > -1)) && (cType === UBDomain.EntityCacheTypes.Entity || cType === UBDomain.EntityCacheTypes.SessionEntity) && (!mP.skipCache)) {
    let reqVersion = mP.version
    mP.version = resultDataCache.version
    if (reqVersion === resultDataCache.version) {
      mP.resultData = {}
      mP.resultData.notModified = true
      return
    }
  }
  let filteredData = LocalDataStore.doFilterAndSort(cachedData, mP)
  // return as asked in fieldList using compact format  {fieldCount: 2, rowCount: 2, values: ["ID", "name", 1, "ss", 2, "dfd"]}
  let resp = LocalDataStore.flatten(mP.fieldList, filteredData.resultData)
  ctx.dataStore.initFromJSON(resp)
}

/**
 * Virtual `select` implementation. Actual data are stored in `_schedulers.json` files from models folders
 * @method select
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @return {Boolean}
 * @memberOf ubq_scheduler_ns.prototype
 * @memberOfModule @unitybase/ubq
 * @published
 */
me.select = function (ctx) {
  ctx.dataStore.currentDataName = 'select' // do we need it????
  doSelect(ctx)
  ctx.preventDefault()
  return true // everything is OK
}
