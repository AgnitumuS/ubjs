/* global ubq_scheduler ncrc32 */
// eslint-disable-next-line camelcase
const me = ubq_scheduler

const fs = require('fs')
const path = require('path')
const LocalDataStore = require('@unitybase/cs-shared').LocalDataStore
const argv = require('@unitybase/base').argv
const UBDomain = require('@unitybase/cs-shared').UBDomain
const UB = require('@unitybase/ub')
const App = UB.App
const _ = require('lodash')

me.entity.addMethod('select')
me.entity.addMethod('estimateCronSchedule')

// here we store loaded schedulers
let resultDataCache = null
const FILE_NAME_TEMPLATE = '_schedulers.json'
const ATTRIBUTES_NAMES = me.entity.getAttributeNames()

const defaultValues = {}
ATTRIBUTES_NAMES.forEach(attrName => {
  const attr = me.entity.attributes[attrName]
  if (attr.defaultValue) {
    defaultValues[attrName] = attr.defaultValue
  }
})

/**
 * Load a schedulers from a file. Override a already loaded schedulers if need
 * @private
 * @param {UBModel} model
 * @param {Array<Object>} loadedData Data already loaded
 */
function loadOneFile (model, loadedData) {
  if (!model.realPath) return // model with public path only
  const fn = path.join(model.realPath, FILE_NAME_TEMPLATE)
  const modelName = model.name

  if (!fs.existsSync(fn)) { return }
  const schedulersEnabled = (!(App.serverConfig.application.schedulers && (App.serverConfig.application.schedulers.enabled === false)))
  const FALSE_CONDITION = 'false //disabled in app config'
  try {
    const content = argv.safeParseJSONfile(fn)
    if (!Array.isArray(content)) {
      console.error('SCHEDULER: invalid config in %. Must be a array ob objects', fn)
      return
    }
    for (let i = 0, L = content.length; i < L; i++) {
      const item = content[i]
      const existedItem = _.find(loadedData, { name: item.name })
      if (!existedItem) { // assign defaults for new items only
        _.defaults(item, defaultValues)
      } else {
        existedItem.originalModel = existedItem.actualModel
      }
      item.actualModel = modelName
      if (!schedulersEnabled) {
        item.schedulingCondition = FALSE_CONDITION
      }
      if (existedItem) { // override
        Object.assign(existedItem, item)
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

function loadAll () {
  const models = App.domainInfo.models
  const loadedData = []

  if (!resultDataCache) {
    console.debug('load schedulers from models directory structure')
    for (const modelName in models) {
      const model = models[modelName]
      loadOneFile(model, loadedData)
    }

    resultDataCache = {
      version: 0,
      fields: ATTRIBUTES_NAMES,
      data: LocalDataStore.arrayOfObjectsToSelectResult(loadedData, ATTRIBUTES_NAMES)
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
  const mP = ctx.mParams
  const aID = mP.ID
  const cType = ctx.dataStore.entity.cacheType
  const cachedData = loadAll()

  if (!(aID && (aID > -1)) && (cType === UBDomain.EntityCacheTypes.Entity || cType === UBDomain.EntityCacheTypes.SessionEntity) && (!mP.skipCache)) {
    const reqVersion = mP.version
    mP.version = resultDataCache.version
    if (reqVersion === resultDataCache.version) {
      mP.resultData = {}
      mP.resultData.notModified = true
      return
    }
  }
  const filteredData = LocalDataStore.doFilterAndSort(cachedData, mP)
  // return as asked in fieldList using compact format  {fieldCount: 2, rowCount: 2, values: ["ID", "name", 1, "ss", 2, "dfd"]}
  const resp = LocalDataStore.flatten(mP.fieldList, filteredData.resultData)
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
  return true // everything is OK
}

/**
 *  Return next resultCount execution dates for specified cronExpression;
 *  Supports non-standard 7-part cron expression syntax, where last field `@occurrence` mean - fires on every x occurrence
 *  Example - `0 0 1 * * 1 @2` = At 01:00 AM, only on Monday, once per 2 occurrence (every second Monday)
 *
 * @param {string} cronExpression Cron expression; support for non-standard `@occurrence` expression syntax
 * @param {Date} [initialDate] initial date. Default is now
 * @param {number} [resultCount=1]
 * @param {boolean} [isFirstExecution=true] skip oncePer for first execution.
 *   In case today is monday, and we need each second (@2) monday - first occurrence should be today (initialDate should be 00:00:01)
 * @returns {Date[]|Date} if resultCount=1 - return Date, else - array of dates
 */
me.calculateNextCronTerm = function (cronExpression, initialDate, resultCount = 1, isFirstExecution = true) {
  const parser = require('cron-parser') // lazy load inside method because it needed rarely
  let cronDate = initialDate || new Date()
  let cnt = resultCount || 1
  const res = []

  const oncePerIdx = cronExpression.indexOf('@')
  let oncePer = oncePerIdx !== -1 ? parseInt(cronExpression.substring(oncePerIdx + 1), 10) : 1
  if (oncePer < 1) {
    oncePer = 1
  } else if (oncePer > 10) {
    oncePer = 10
  }
  if (oncePerIdx !== -1) {
    cronExpression = cronExpression.substring(0, oncePerIdx)
  }
  const crontab = parser.parseExpression(cronExpression, { currentDate: cronDate })
  while (cnt--) {
    cronDate = crontab.next()
    if (isFirstExecution) { // skip oncePer for first execution. In case today is monday, and we need each second (@2) monday - first occurrence should be today
      isFirstExecution = false
    } else {
      for (let i = 0; i < oncePer - 1; i++) {
        cronDate = crontab.next()
      }
    }
    if (!resultCount || resultCount === 1) {
      return cronDate
    } else {
      res.push(cronDate)
    }
  }
  return res
}

/**
 * Estimate matched dates for cron expression
 * @method select
 * @param {ubMethodParams} ctx
 * @param {object} ctx.mParams
 * @param {string} ctx.mParams.cronExpression
 * @param {string} [ctx.mParams.currentDate] initial date in ISO8601 format
 * @param {number} [ctx.mParams.cnt=1] matched dates count, max = 20
 * @return {Boolean}
 * @memberOf ubq_scheduler_ns.prototype
 * @memberOfModule @unitybase/ubq
 * @published
 */
me.estimateCronSchedule = function (ctx) {
  const expression = ctx.mParams.cronExpression
  const currentDate = ctx.mParams.currentDate
  const cronDate = currentDate ? new Date(currentDate) : new Date()
  let cnt = ctx.mParams.cnt || 1
  if (cnt > 20) cnt = 20
  let res = me.calculateNextCronTerm(expression, cronDate, cnt)
  if (Array.isArray(res)) {
    res = res.map(d => d.toISOString())
  } else {
    res = res.toISOString()
  }
  ctx.mParams.dates = res
  return true // everything is OK
}
