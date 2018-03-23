/* global ubm_form */
let me = ubm_form

const fs = require('fs')
const _ = require('lodash')
const FileBasedStoreLoader = require('@unitybase/base').FileBasedStoreLoader
const csShared = require('@unitybase/cs-shared')
const UBDomain = csShared.UBDomain
const LocalDataStore = csShared.LocalDataStore
const path = require('path')
const App = require('@unitybase/ub').App
const UB = require('@unitybase/ub')
const blobStores = require('@unitybase/ub/blobStores')

me.entity.addMethod('select')
me.entity.addMethod('update')
me.entity.addMethod('insert')

/**
 *  here we store loaded forms
*/
let resultDataCache = null
let modelLoadDate

const DFM_CONTENT_TYPE = 'text/javascript; charset=UTF-8'
const REL_PATH_TAIL = 'forms'
const DEF_FILE_TAIL = '-fm.def'
const JS_FILE_TAIL = '-fm.js'

/**
 * Check integrity of file content. Passed as a callback to FileBasedStore.onBeforeRowAdd
 * @param {FileBasedStoreLoader} loader
 * @param {String} fullFilePath
 * @param {String} content
 * @param {Object} row
 * @return {boolean}
 */
function postProcessing (loader, fullFilePath, content, row) {
  let jsFilePath

  // check entity exist in domain
  let val = row.entity
  if (!App.domainInfo.has(val)) {
    console.error(`ubm_form: Invalid //@entity attribute "${val}". File ${fullFilePath} ignored`)
    return false
  }
  // check fileName = entity code + "-fm.def"
  let fileName = path.basename(fullFilePath)
  if (row.code) { console.warn(`Please, remove a row //@code "${row.code}" from a file ${fileName}. In UB4 form code = file name without -fm.def`) }

  row.code = fileName.substring(0, fileName.length - 7)
  if (row.ID) console.warn(`Please, remove a row "//@ID ${row.ID}" from a file ${fileName}. In UB4 form ID is generated automatically as crc32(code)`)
  row.ID = ncrc32(0, row.code)

  // form can be stored in other model than entity
  // we fill relPath in form "modelName"|"path inside model public folder" as expected by mdb virtual store
  let relPath = (row.model || loader.processingRootFolder.model.name) + '|' + REL_PATH_TAIL
  // fill formDef attribute value
  row.formDef = JSON.stringify({
    fName: fileName,
    origName: fileName,
    ct: DFM_CONTENT_TYPE,
    size: content.length,
    md5: 'fb6a51668017be0950bd18c2fb0474a0',
    relPath: relPath
  })
  if (!row.model) {
    row.model = loader.processingRootFolder.model.name
  }
  // in case form js exist - fill formCode
  fileName = fileName.substring(0, fileName.length - DEF_FILE_TAIL.length) + JS_FILE_TAIL
  jsFilePath = path.join(path.dirname(fullFilePath), fileName)
  if (fs.existsSync(jsFilePath)) { // file exists
    let jsFileStat = fs.statSync(jsFilePath)
    row.formCode = JSON.stringify({
      fName: fileName,
      origName: fileName,
      ct: DFM_CONTENT_TYPE, // JSON_CONTENT_TYPE,
      size: jsFileStat.size,
      md5: 'fb6a51668017be0950bd18c2fb0474a0',
      relPath: relPath
    })
    // check js file modification and if later when def file - replace mi_modifyDate
    if (loader.haveModifyDate && row.mi_modifyDate < jsFileStat.mtime) {
      row.mi_modifyDate = jsFileStat.mtime
    }
  }
  return true
}

function loadAllForms () {
  let modelLastDate = new Date(App.globalCacheGet('UB_STATIC.modelsModifyDate')).getTime()

  console.debug('modelLastDate = ', modelLastDate)
  let models = App.domainInfo.models
  let folders = []

  if (!resultDataCache || modelLoadDate < modelLastDate) {
    console.debug('load ubm_forms from models directory structure')

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
      fileMask: /-fm\.def$/,
      onBeforeRowAdd: postProcessing
    })
    resultDataCache = loader.load()

    modelLoadDate = modelLastDate
  } else {
    console.debug('ubm_form: resultDataCache already loaded')
  }
  return resultDataCache
}

/** Retrieve data from resultDataCache and init ctxt.dataStore
 *  caller MUST set dataStore.currentDataName before call doSelect
 * @param {ubMethodParams} ctxt
 */
function doSelect (ctxt) {
  let mP = ctxt.mParams
  let aID = mP.ID

  let cachedData = loadAllForms()
  let cType = ctxt.dataStore.entity.cacheType
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
 * Check form code start from form entity code and entity exist in domain. throw exception on fail
 * TODO - check mi_modifyDate in case entity.mixins.mStorage.simpleAudit and !runParams.skipOptimisticLock
 * @param {Number} aID
 * @param {String} formCode
 * @param {String} formEntity
 */
function validateInput (aID, formCode, formEntity) {
  if (!App.domainInfo.has(formEntity)) {
    throw new Error(`<<<entity "${formEntity}" not exist in Domain>>>`)
  }

  if (!aID) throw new Error('No ID parameter passed in execParams')

  if (formCode.length < formEntity.length ||
    (formCode.length === formEntity.length && formCode !== formEntity) ||
    (formCode.length !== formEntity.length && formCode.substring(0, formEntity.length + 1) !== formEntity + '-')
  ) {
    throw new Error(`<<<Invalid form code format. Must be "${formEntity}-FormVersion" where FormVersion is any character string>>>`)
  }
  let theSameCode = LocalDataStore.doFilterAndSort(resultDataCache, {whereList: {
    byID: {expression: 'ID', condition: 'notEqual', values: {ID: aID}},
    byCode: {expression: 'code', condition: 'equal', values: {code: formCode}}
  }})
  if (theSameCode.total !== 0) {
    throw new Error('<<<Form with code "' + formCode + '" already exist>>>')
  }
}

/**
 * Return form body template from UBM/_templates/fileName is any or defaultBody
 * @param {String} fileName
 * @param {String} [defaultBody]
 */
function getFormBodyTpl (fileName, defaultBody) {
  let filePath = path.join(App.domainInfo.models['UBM'].realPublicPath, '_templates', fileName)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : defaultBody
}

/**
 *
 * @param {ubMethodParams} ctxt
 * @param {Object} storedValue
 * @param {boolean} isInsert
 * @return {boolean}
 */
function doUpdateInsert (ctxt, storedValue, isInsert) {
  console.debug('--==== ubm_forms.doUpdateInsert ===-')
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
  let formEntity = App.domainInfo.get(storedValue.entity)
  let newFormDefMeta = newValues.formDef
  let newFormCodeMeta = newValues.formCode
  let codeOfModelToStore = storedValue.model || formEntity.modelName
  let formDefBody
  let formScriptBody
  if (isInsert) { // for insert operation create a boilerplate for form definition & form script
    if (storedValue.formType === 'auto') {
      formDefBody = getFormBodyTpl('new_autoFormDef.mustache', 'exports.formDef = {\r\n\titems:[\r\n\t\t/*put your items here*/\r\n\t]\r\n};')
    } else if (storedValue.formType === 'custom') {
      let codeParts = storedValue.code.split('-')
      let className = formEntity.modelName + '.' + (codeParts[1] ? codeParts[1] : 'BetterToSetFormCodeToEntity-ClassName')
      formDefBody = getFormBodyTpl('new_customForm.mustache', '').replace('{{className}}', className)
    } else if (storedValue.formType === 'vue') {
      formDefBody = getFormBodyTpl('new_vueFormDef.mustache', '')
    }
    // and for form script
    if (storedValue.formType === 'auto') {
      formScriptBody = getFormBodyTpl('new_autoFormJS.mustache', 'exports.formCode = {\r\n}')
    } else if (storedValue.formType === 'vue') {
      formScriptBody = getFormBodyTpl('new_vueFormJS.mustache', 'exports.formCode = {\r\n\tinitUBComponent: function () {\r\n\r\n\t}\r\n}')
    }
    let formCodeInfo = blobStores.putContent({
      entity: entity.name,
      attribute: 'formCode',
      ID: ID,
      fileName: storedValue.code + JS_FILE_TAIL,
      relPath: codeOfModelToStore + '|' + REL_PATH_TAIL
    }, formScriptBody)
    newFormCodeMeta = JSON.stringify(formCodeInfo)
  } else { // for update operation load form definition body from store (temp or persistent if not modified)
    if (newFormDefMeta) { // if form definition modified
      formDefBody = blobStores.getContent({
        entity: entity.name,
        attribute: 'formDef',
        ID: ID,
        isDirty: true
      }, {encoding: 'utf-8'})
    } else {
      formDefBody = blobStores.getContent({
        entity: entity.name,
        attribute: 'formDef',
        ID: ID,
        isDirty: false
      }, {encoding: 'utf-8'}) //, JSON.parse(storedValue.formDef),
    }
  }

  // replace comments in the beginning of form definition to the new one
  let clearAttrReg = /^\/\/[ \t]?@(.+) "(.*)"[ \t]*\r?\n/gm // seek for //@ "bla bla" CRLF
  formDefBody = formDefBody.replace(clearAttrReg, '') // remove all old entity attributes
  let addedAttr = ''
  for (let attrCode in entity.attributes) {
    let attr = entity.attributes[attrCode]
    if (attr.dataType !== UBDomain.ubDataTypes.Document && attr.defaultView && attrCode !== 'ID' && attrCode !== 'code') {
      addedAttr = '// @' + attrCode + ' "' + storedValue[attrCode] + '"\r\n' + addedAttr
    }
  }
  formDefBody = '// @! "do not remove comments below unless you know what you do!"\r\n' + addedAttr + formDefBody

  // save modified form definition to the temp store
  let formDefInfo = blobStores.putContent({
    entity: entity.name,
    attribute: 'formDef',
    ID: ID,
    fileName: storedValue.code + DEF_FILE_TAIL
    // ct.fName = storedValue.code + DEF_FILE_TAIL
    // ct.relPath = codeOfModelToStore + '|' + REL_PATH_TAIL
    // ct.ct = JSON_CONTENT_TYPE
  }, formDefBody)
  // add a relPath
  formDefInfo.relPath = codeOfModelToStore + '|' + REL_PATH_TAIL
  // and update an attribute value to the new blob info
  storedValue.formDef = JSON.stringify(formDefInfo)

  if (newFormCodeMeta) { // in case form script is modified add a relPath
    let parsed = JSON.parse(newFormCodeMeta)
    parsed.relPath = codeOfModelToStore + '|' + REL_PATH_TAIL
    parsed.fName = storedValue.code + JS_FILE_TAIL
    newFormCodeMeta = JSON.stringify(parsed)
    storedValue.formCode = newFormCodeMeta
  } else {
    delete storedValue.formCode
  }

  // commit BLOB store changes
  let fakeCtx = {
    dataStore: null,
    mParams: {
      execParams: storedValue
    }
  }
  ctxt.dataStore.commitBLOBStores(fakeCtx, isInsert === false)

  console.debug('--== ubm_form: resultDataCache cleared ==--')
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

  console.debug('!!ubm_form.update-----------------')
  let cachedData = loadAllForms()
  let storedValue = LocalDataStore.byID(cachedData, ID)
  if (storedValue.total !== 1) {
    throw new Error('Record with ID=' + ID + 'not found')
  }
  storedValue = LocalDataStore.selectResultToArrayOfObjects(storedValue)[0]

  validateInput(ID, inParams.code || storedValue.code, inParams.entity || storedValue.entity)

  if (inParams.code && inParams.code !== storedValue.code) {
    throw new Error('<<<To change form code rename both *.def & *.js files & change "//@code "formCode" comment inside new def file>>>')
  }
  doUpdateInsert(ctxt, storedValue, false)
  ctxt.preventDefault()
  return true // everything is OK
}

me.on('delete:before', function () {
  throw new UB.UBAbort(`<<<To delete Form you must manually delete corresponding ${DEF_FILE_TAIL} and ${JS_FILE_TAIL} file(s) from model folder>>>`)
})

/**
 * Check ID is unique and perform insertion
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
me.insert = function (ctxt) {
  let inParams = ctxt.mParams.execParams
  let aID = inParams.ID

  console.debug('--====== ubm_form.insert ====--')
  let cachedData = loadAllForms()

  validateInput(aID, inParams.code, inParams.entity)
  let row = LocalDataStore.byID(cachedData, aID)
  if (row.total) {
    throw new UB.UBAbort(`<<<Form with ID ${aID} already exist in domain>>>`)
  }

  let oldValue = {}
  doUpdateInsert(ctxt, oldValue, true)
  ctxt.preventDefault()
  return true // everything is OK
}
