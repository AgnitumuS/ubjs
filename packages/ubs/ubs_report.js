// noinspection Eslint
const me = ubs_report
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const FileBasedStoreLoader = require('@unitybase/base').FileBasedStoreLoader
const LocalDataStore = require('@unitybase/base').LocalDataStore
const UBDomain = require('@unitybase/base').UBDomain
const App = require('@unitybase/ub').App
const blobStores = require('@unitybase/ub/blobStores')

me.entity.addMethod('select')
me.entity.addMethod('update')
me.entity.addMethod('insert')
me.entity.addMethod('testServerRendering')

me.on('delete:before', function () {
  throw new Error('<<<To delete Report you must manually delete corresponding xml file from modelFolder/public/reports folder>>>')
})

/**
 *  here we store loaded forms
 */
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
  * This function must be defined in report code block.
  *
  * Inside function you must:
  * 1) Prepare data
  * 2) Run method this.buildHTML(reportData); where reportData is data for mustache template
  * 3) If need create PDF run method this.transformToPdf(htmlReport); where htmlReport is HTML
  * 4) If is server side function must return report as string otherwise Promise or string
  *
  * @cfg {function} buildReport
  * @params {[]|{}} reportParams
  * @returns {Promise|Object} If code run on server method must return report data.
  * Promise object must be resolved report code
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
  let jsFileStat = fs.statSync(jsFilePath)
  if (jsFileStat) { // file exists
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

/** Retrieve data from resultDataCache and init ctxt.dataStore
 *  caller MUST set dataStore.currentDataName before call doSelect function
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
  ctxt.dataStore.initFromJSON(resp)
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @return {Boolean}
 */
me.select = function (ctxt) {
  ctxt.dataStore.currentDataName = 'select' // TODO надо или нет????
  doSelect(ctxt)
  ctxt.preventDefault()
  return true // everything is OK
}

/**
 * Check model exists
 * @param {Number} aID
 * @param {String} modelName
 */
function validateInput (aID, modelName) {
  let model = App.domainInfo.models[modelName]
  if (!model) {
    throw new Error(`ubs_report: Invalid model attribute value "${modelName}". Model not exist in domain`)
  }

  if (!aID) {
    throw new Error('No ID parameter passed in execParams')
  }
}

/**
 *
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
  let reportBody = blobStores.getFromBlobStore(
    {
      entity: entity.name,
      attribute: 'template',
      ID: ID,
      isDirty: Boolean(newTemplateInfo)
    },
    {encoding: 'utf-8'}
  )
  if (!reportBody) {
    reportBody = `<!--@ID "${ID}"-->\r\n`
  } else {
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
  let docInfo = blobStores.putToBlobStore({
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
    let reportCodeInfo = blobStores.putToBlobStore({
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

  resultDataCache = null // drop cache. afterInsert call select and restore cache
  return true
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.update = function (ctxt) {
  let inParams = ctxt.mParams.execParams || {}
  let ID = inParams.ID

  let cachedData = loadAll()
  let storedValue = LocalDataStore.byID(cachedData, ID)
  if (storedValue.total !== 1) {
    throw new Error('Record with ID=' + ID + 'not found')
  }
  storedValue = LocalDataStore.selectResultToArrayOfObjects(storedValue)[0]

  validateInput(ID, inParams.model || storedValue.model)

  doUpdateInsert(ctxt, storedValue, false)

  ctxt.preventDefault()
  return true // everything is OK
}

/**
 * Check ID is unique and perform insertion
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.insert = function (ctxt) {
  let inParams = ctxt.mParams.execParams
  let ID = inParams.ID
  let oldValue = {}

  let cachedData = loadAll()
  validateInput(ID, inParams.model)

  let row = LocalDataStore.byID(cachedData, ID)
  if (row.total) {
    throw new Error(`<<<Report with ID ${ID} already exist>>>`)
  }

  doUpdateInsert(ctxt, oldValue, true)
  ctxt.preventDefault()
  return true // everything is OK
}

const mime = require('mime-types')
/**
 * REST endpoint for Report test purpose
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
  resp.writeHead(resp.writeHead('Content-Type: ' + mime.lookup(result.reportType)))
  resp.statusCode = 200

}
