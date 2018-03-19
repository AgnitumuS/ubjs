let me = ubm_diagram

const FileBasedStoreLoader = require('@unitybase/base').FileBasedStoreLoader
const csShared = require('@unitybase/cs-shared')
const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore
const UB = require('@unitybase/ub')
const App = UB.App
const blobStores = require('@unitybase/ub/blobStores')

const path = require('path')
const _ = require('lodash')

const DIAGRAM_CONTENT_TYPE = 'application/m3metadiag'
const REL_PATH_TAIL = 'erdiagrams'
const XML_EXTENSION = '.xml'

me.entity.addMethod('select')
me.entity.addMethod('update')
me.entity.addMethod('insert')

me.on('delete:before', function () {
  throw new UB.UBAbort('<<<To delete ER-diagram you must manually delete corresponding xml file from model folder>>>')
})

/**
 *  here we store loaded forms
 */
let resultDataCache = null
let modelLoadDate

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
  row.name = fileName.substring(0, fileName.length - XML_EXTENSION.length)

  // fill formDef attribute value
  row.document = JSON.stringify({
    fName: fileName,
    origName: fileName,
    ct: DIAGRAM_CONTENT_TYPE,
    size: content.length,
    md5: 'fakemd50000000000000000000000000',
    relPath: relPath
  })
  return true
}

function loadAllDiagrams () {
  let models = App.domainInfo.models
  let folders = []
  let modelLastDate = new Date(App.globalCacheGet('UB_STATIC.modelsModifyDate')).getTime()

  console.debug('modelLastDate = ', modelLastDate)
  if (!resultDataCache || modelLoadDate < modelLastDate) {
    console.debug('load diagrams from models directory structure')

    resultDataCache = []
    for (let modelName in models) {
      let model = models[modelName]
      let mPath = path.join(model.realPublicPath, REL_PATH_TAIL)
      folders.push({
        path: mPath,
        model: model // used for fill Document content for `mdb` store in postProcessing
      })
    }
    let loader = new FileBasedStoreLoader({
      entity: me.entity,
      foldersConfig: folders,
      fileMask: new RegExp(XML_EXTENSION + '$'),
      attributeRegExpString: FileBasedStoreLoader.XML_ATTRIBURE_REGEXP,
      onBeforeRowAdd: postProcessing
    })
    resultDataCache = loader.load()

    modelLoadDate = modelLastDate
  } else {
    console.debug('ubm_diagram: resultDataCache already loaded')
  }
  return resultDataCache
}

/**
 * Retrieve data from resultDataCache and init ctxt.dataStore
 * caller MUST set dataStore.currentDataName before call doSelect
 * @param {ubMethodParams} ctxt
 */
function doSelect (ctxt) {
  let mP = ctxt.mParams
  let aID = mP.ID
  let cType = ctxt.dataStore.entity.cacheType

  let cachedData = loadAllDiagrams()

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
  ctxt.dataStore.initFromJSON(resp)
}

/**
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
me.validateInput = function (aID, modelName) {
  let model = App.domainInfo.models[modelName]
  if (!model) {
    throw new Error(`ubm_diagram: Invalid model attribute value "${modelName}". Model not exist in domain`)
  }
  if (!aID) throw new Error('No ID parameter passed in execParams')
}

/**
 * @param {ubMethodParams} ctxt
 * @param {Object} storedValue
 * @param {Boolean} isInsert
 * @return {boolean}
 */
function doUpdateInsert (ctxt, storedValue, isInsert) {
  console.debug('--==== ubm_diagram.doUpdateInsert ===-')
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
  let newDocument = newValues.document
  let diagramBody = blobStores.getFromBlobStore(
    {
      entity: entity.name,
      attribute: 'document',
      ID: ID,
      isDirty: Boolean(newDocument)
    },
    {encoding: 'utf-8'}
  )
  if (!diagramBody) {
    diagramBody = `<!--@ID "${ID}"-->\r\n<mxGraphModel><root></root></mxGraphModel>`
  } else {
    let clearAttrReg = new RegExp(FileBasedStoreLoader.XML_ATTRIBURE_REGEXP, 'gm') // seek for <!--@attr "bla bla"-->CRLF
    diagramBody = '<!--@ID "' + ID + '"-->\r\n' + diagramBody.replace(clearAttrReg, '') // remove all old entity attributes
  }
  let docInfo = blobStores.putToBlobStore({
    entity: entity.name,
    attribute: 'document',
    ID: ID,
    fileName: storedValue.name + XML_EXTENSION,
    ct: DIAGRAM_CONTENT_TYPE
  }, diagramBody)
  // add a relPath
  docInfo.relPath = storedValue.model + '|' + REL_PATH_TAIL
  // and update an attribute value to the new blob info
  storedValue.document = JSON.stringify(docInfo)

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
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.update = function (ctxt) {
  let inParams = ctxt.mParams.execParams || {}
  let ID = inParams.ID
  let cachedData = loadAllDiagrams()
  let storedValue = LocalDataStore.byID(cachedData, ID)
  if (storedValue.total !== 1) {
    throw new Error(`Record with ID=${ID} not found`)
  }
  storedValue = LocalDataStore.selectResultToArrayOfObjects(storedValue)[0]
  me.validateInput(ID, inParams.model || storedValue.model)
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

  let cachedData = loadAllDiagrams()
  me.validateInput(ID, inParams.model)

  let row = LocalDataStore.byID(cachedData, ID)
  if (row.total) {
    throw new Error(`Diagram with ID ${ID} already exist`)
  }
  let oldValue = {}
  doUpdateInsert(ctxt, oldValue, true)
  ctxt.preventDefault()
  return true // everything is OK
}
