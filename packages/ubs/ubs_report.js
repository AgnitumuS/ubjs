/* global ubs_report ncrc32 */
// eslint-disable-next-line camelcase
const me = ubs_report
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const FileBasedStoreLoader = require('@unitybase/base').FileBasedStoreLoader
const csShared = require('@unitybase/cs-shared')
const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore
const UB = require('@unitybase/ub')
const App = UB.App
const mStorage = UB.mixins.mStorage

me.entity.addMethod('select')
me.entity.addMethod('update')
me.entity.addMethod('insert')
me.entity.addMethod('addnew')
if (process.isDebug) {
  me.entity.addMethod('testServerRendering')
}

// here we store loaded reports
let resultDataCache = null
let modelLoadDate

const TEMPLATE_CONTENT_TYPE = 'application/ubreport'
const SCRIPT_CONTENT_TYPE = 'application/def'
const REL_PATH_TAIL = 'reports'
const TEMPLATE_EXTENSION = '.template'
const SCRIPT_EXTENSION = '.js'

const REPORT_BODY_TPL = `
exports.reportCode = {
  /**
  * This function should be defined in report code block.
  *
  * Inside function you should:
  * 1) Prepare data
  * 2) Run method this.buildHTML(reportData); where reportData is data for mustache template
  * 3) If need create PDF run method this.transformToPdf(htmlReport); where htmlReport is HTML
  * 4) If is server side function should return report as string otherwise Promise or string
  *
  * @cfg {function} buildReport
  * @params {[]|{}} reportParams
  * @returns {Promise|Object} If code run on server method should return report data.
  * Promise object should be resolved report code
  */
  buildReport: function(reportParams){
    var result = this.buildHTML(reportParams)
    if (this.reportType === 'pdf') {
        result = this.transformToPdf(result)
    }
    return result
  }
}
`
/**
 * Check integrity of file content. Passed as a callback to FileBasedStore.onBeforeRowAdd
 * @private
 * @param {FileBasedStoreLoader} loader
 * @param {String} fullFilePath
 * @param {String} content
 * @param {Object} row
 * @return {boolean}
 */
function postProcessing (loader, fullFilePath, content, row) {
  // we fill relPath in form "modelName"|"path inside model public folder" as expected by mdb virtual store
  let relPath = loader.processingRootFolder.model.name + '|' + REL_PATH_TAIL

  // fill model attribute by current folder model name
  row.model = loader.processingRootFolder.model.name

  // fill name attribute with file name w/o ".xml" extension
  let fileName = path.basename(fullFilePath)
  row.report_code = fileName.substring(0, fileName.length - TEMPLATE_EXTENSION.length)

  if (row.ID) console.warn(`Please, remove a row "<!--@ID "${row.ID}"-->" from a file ${fileName}. In UB4 report ID is generated automatically as crc32(fileNameWoExtension)`)
  row.ID = ncrc32(0, row.report_code)

    // fill formDef attribute value
  row.template = JSON.stringify({
    fName: fileName,
    origName: fileName,
    ct: TEMPLATE_CONTENT_TYPE,
    size: content.length,
    md5: 'fakemd50000000000000000000000000',
    relPath: relPath
  })

  fileName = fileName.substring(0, fileName.length - TEMPLATE_EXTENSION.length) + SCRIPT_EXTENSION
  let jsFilePath = path.join(path.dirname(fullFilePath), fileName)
  if (fs.existsSync(jsFilePath)) {
    let jsFileStat = fs.statSync(jsFilePath)
    row.code = JSON.stringify({
      fName: fileName,
      origName: fileName,
      ct: SCRIPT_CONTENT_TYPE,
      size: jsFileStat.size,
      md5: 'fakemd50000000000000000000000000',
      relPath: relPath
    })
    // check js file modification and if later when def file - replace mi_modifyDate
    if (loader.haveModifyDate && row.mi_modifyDate < jsFileStat.mtime) {
      row.mi_modifyDate = jsFileStat.mtime
    }
  }

  return true
}

function loadAll () {
  const models = App.domainInfo.models
  let folders = []
  let modelLastDate = new Date(App.globalCacheGet('UB_STATIC.modelsModifyDate')).getTime()

  console.debug('modelLastDate = ', modelLastDate)
  if (!resultDataCache || modelLoadDate < modelLastDate) {
    console.debug('load reports from models directory structure')

    for (let modelCode in models) {
      let model = models[modelCode]
      let mPath = path.join(model.realPublicPath, REL_PATH_TAIL)
      folders.push({
        path: mPath,
        model: model // used for fill Document content for `mdb` store in postProcessing
      })
    }
    let loader = new FileBasedStoreLoader({
      entity: me.entity,
      foldersConfig: folders,
      fileMask: new RegExp(TEMPLATE_EXTENSION + '$'),
      attributeRegExpString: FileBasedStoreLoader.XML_ATTRIBURE_REGEXP,
      onBeforeRowAdd: postProcessing
    })
    resultDataCache = loader.load()

    modelLoadDate = modelLastDate
  } else {
    console.debug('ubs_report: resultDataCache already loaded')
  }
  return resultDataCache
}

/**
 * Retrieve data from resultDataCache and init ctxt.dataStore.
 * Caller MUST set dataStore.currentDataName before call doSelect function
 * @private
 * @param {ubMethodParams} ctxt
 */
function doSelect (ctxt) {
  const cType = ctxt.dataStore.entity.cacheType
  let mP = ctxt.mParams
  let aID = mP.ID

  let cachedData = loadAll()

  if (!(aID && (aID > -1)) && (cType === UBDomain.EntityCacheTypes.Entity || cType === UBDomain.EntityCacheTypes.Entity) && (!mP.skipCache)) {
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
  ctxt.dataStore.initialize(resp)
}

/**
 * @method select
 * @memberOf ubs_report_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @published
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @return {Boolean}
 */
me.select = function (ctx) {
  ctx.dataStore.currentDataName = 'select'
  doSelect(ctx)
  return true // everything is OK
}

/**
 * Check model exists
 * @private
 * @param {string} reportCode
 * @param {String} modelName
 */
function validateInput (reportCode, modelName) {
  let model = App.domainInfo.models[modelName]
  if (!model) {
    throw new Error(`ubs_report: Invalid model attribute value "${modelName}". Model not exist in domain`)
  }
  if (!reportCode) {
    throw new Error('Parameter "report_code" not passed in execParams')
  }
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 * @param {Object} storedValue
 * @param {Boolean} isInsert
 * @return {boolean}
 */
function doUpdateInsert (ctxt, storedValue, isInsert) {
  console.debug('--==== ubs_report.doUpdateInsert ===-')
  let entity = me.entity
  let mP = ctxt.mParams
  let newValues = mP.execParams || {}
  let ID = newValues.ID

  // move all attributes from execParams to storedValue
  _.forEach(newValues, function (val, key) {
    let attr = entity.attributes[key]
    if (attr && (attr.dataType !== UBDomain.ubDataTypes.Document)) {
      storedValue[key] = val
    }
  })
  let newTemplateInfo = newValues.template
  let reportBody
  if (isInsert || !newTemplateInfo) {
    reportBody = ''
  } else {
    reportBody = App.blobStores.getContent(
      {
        entity: entity.name,
        attribute: 'template',
        ID: ID,
        isDirty: Boolean(newTemplateInfo)
      },
      {encoding: 'utf-8'}
    )
    let clearAttrReg = new RegExp(FileBasedStoreLoader.XML_ATTRIBURE_REGEXP, 'gm') // seek for <!--@attr "bla bla"-->CRLF
    reportBody = reportBody.replace(clearAttrReg, '') // remove all old entity attributes
    let attributes = entity.attributes
    for (let attrName in attributes) {
      let attr = attributes[attrName]
      if (attr.dataType !== UBDomain.ubDataTypes.Document && (attr.defaultView || attrName === 'ID')) {
        reportBody = '<!--@' + attrName + ' "' + storedValue[attrName] + '"-->\r\n' + reportBody
      }
    }
  }
  let docInfo = App.blobStores.putContent({
    entity: entity.name,
    attribute: 'template',
    ID: ID,
    fileName: storedValue.report_code + TEMPLATE_EXTENSION,
    ct: TEMPLATE_CONTENT_TYPE
  }, reportBody)
  // add a relPath
  docInfo.relPath = storedValue.model + '|' + REL_PATH_TAIL
  // and update an attribute value to the new blob info
  storedValue.template = JSON.stringify(docInfo)

  if (isInsert) {
    let reportCodeInfo = App.blobStores.putContent({
      entity: entity.name,
      attribute: 'code',
      ID: ID,
      fileName: storedValue.report_code + SCRIPT_EXTENSION
    }, REPORT_BODY_TPL)
    newValues.code = JSON.stringify(reportCodeInfo)
  }
  let newCode = newValues.code
  if (newCode) { // in case report script is modified add a relPath
    let parsed = JSON.parse(newCode)
    parsed.relPath = storedValue.model + '|' + REL_PATH_TAIL
    parsed.fName = storedValue.report_code + SCRIPT_EXTENSION
    parsed.ct = SCRIPT_CONTENT_TYPE
    storedValue.code = JSON.stringify(parsed)
  } else {
    delete storedValue.code
  }

  // commit BLOB store changes
  let fakeCtx = {
    dataStore: null,
    mParams: {
      execParams: storedValue
    }
  }
  ctxt.dataStore.commitBLOBStores(fakeCtx, isInsert === false)
  ctxt.dataStore.initialize([storedValue])

  resultDataCache = null // drop cache. afterInsert call select and restore cache
  return true
}

/**
 * @method update
 * @memberOf ubs_report_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @published
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.update = function (ctxt) {
  let inParams = ctxt.mParams.execParams || {}
  let ID = inParams.ID

  let cachedData = loadAll()
  let storedValue = LocalDataStore.byID(cachedData, ID)
  if (storedValue.total !== 1) {
    throw new Error(`Record with ID=${ID} not found`)
  }
  storedValue = LocalDataStore.selectResultToArrayOfObjects(storedValue)[0]

  validateInput(inParams.report_code || storedValue.report_code, inParams.model || storedValue.model)

  doUpdateInsert(ctxt, storedValue, false)
  return true // everything is OK
}

/**
 * Check ID is unique and perform insertion
 * @method insert
 * @memberOf ubs_report_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @published
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.insert = function (ctxt) {
  let inParams = ctxt.mParams.execParams

  let cachedData = loadAll()
  let newReportCode = inParams.report_code
  let ID = ncrc32(0, newReportCode)
  inParams.ID = ID
  validateInput(inParams.report_code, inParams.model)

  let row = LocalDataStore.byID(cachedData, ID)
  if (row.total) {
    throw new Error(`<<<Report with ID ${ID} already exist>>>`)
  }

  let oldValue = {}
  doUpdateInsert(ctxt, oldValue, true)
  return true
}

const mime = require('mime-types')

if (process.isDebug) {
  /**
   * REST endpoint for Report test purpose. Available in `-dev` mode only.
   * Expect POST request with JSON on body {reportCode: 'reportCode', responseType: 'pdf'|'html', reportParams: {paramName: paramValue, ...}}
   * Return a HTML/PDF
   * @param {null} ctxt
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   */
  me.testServerRendering = function (ctxt, req, resp) {
    let body = req.read()
    let params = JSON.parse(body)
    const UBServerReport = require('./modules/UBServerReport')
    let result = UBServerReport.makeReport(params.reportCode, params.responseType, params.reportParams)

    if (result.reportType === 'pdf') {
      console.debug('Generate a PDF report of size=', result.reportData.byteLength)
    } else {
      console.debug('Generate a HTML report of size=', result.reportData.length)
    }
    resp.writeEnd(result.reportData)
    resp.writeHead('Content-Type: ' + mime.lookup(result.reportType))
    resp.statusCode = 200
  }
}

/**
 * New report
 * @method addNew
 * @memberOf ubm_form_ns.prototype
 * @memberOfModule @unitybase/ubm
 * @published
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.addnew = mStorage.addNew
