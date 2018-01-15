const _ = require('lodash')
const BlobStoreCustom = require('./BlobStoreCustom')
const path = require('path')
const App = require('../modules/App')
const fs = require('fs')
const CryptoJS = require('@unitybase/cryptojs/core')
/**
 *  @classdesc
 *  Blob store implementation for storing content inside models `public` folders.
 *  Key conceptions:
 *
 *    - relative path created in format modelName|relativePathFromModelDir to hide real file place from client
 *    - OS user temp folder used for store temporary content
 *    - delete operation is forbidden since models must be under version control
 *
 *  Used in:
 *
 *    - ubm_form for store form def & js inside /public/forms
 *    - ubm_diagrams for store diagram inside /public/erdiagrams
 *    - e.t.c.
 *
 * @class
 * @extends BlobStoreCustom
 * @singleton
 */
const MdbBlobStore = Object.create(BlobStoreCustom)
/**
 * @private
 */
MdbBlobStore.fileTempInfoExt = '.fti'

/**
 * For MDB blob store relPath === '[modelCode]|folderPath'
 * @private
 * @param {BlobStoreItem} item
 */
MdbBlobStore.getPermanentFileName = function (item) {
  let pathPart = item.relPath.split('|')
  if (pathPart.length !== 2) return '' // this is error
  let model = App.domainInfo.models[pathPart[0]]
  if (!model) throw new Error('MDB blob store - not existed model' + pathPart[0])
  return path.join(model.realPublicPath, pathPart[1], item.fName)
}
/**
 * Fill HTTP response for getDocument request
 *
 * @param {BlobStoreRequest} requestParams
 * @param {BlobStoreItem} blobInfo
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @return {Boolean}
 */
MdbBlobStore.fillResponse = function (requestParams, blobInfo, req, resp) {
  let filePath = requestParams.isDirty ? this.getTempFileName(requestParams) : this.getPermanentFileName(blobInfo)
  if (filePath) {
    resp.statusCode = 200
    resp.writeHead(`Content-Type: !STATICFILE\r\nContent-Type: ${blobInfo.ct}`)
    resp.writeEnd(filePath)
  } else {
    resp.statusCode = 404
    resp.writeEnd('Not found')
  }
}

/**
 * @inheritDoc
 * @param {BlobStoreRequest} request Request params
 * @param {UBEntityAttribute} attribute
 * @param {ArrayBuffer} content
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @returns {BlobStoreItem}
*/
MdbBlobStore.saveContentToTempStore = function (request, attribute, content, req, resp) {
  let fn = this.getTempFileName(request)
  console.debug('temp file is written to', fn)
  fs.writeFileSync(fn, content)
  // TODO md5val = CryptoJS.MD5(content)
  return {
    store: attribute.storeName,
    fName: '',
    origName: '',
    ct: '', // TODO
    size: content.byteLength,
    md5: '',
    isDirty: true
  }
}

/**
 * Retrieve BLOB content from blob store.
 * @abstract
 * @param {BlobStoreRequest} request
 * @param {BlobStoreItem} blobInfo JSON retrieved from a DB.
 * @param {Object} [options]
 * @param {String|Null} [options.encoding] Default to 'bin'. Possible values: 'bin'|'ascii'|'utf-8'
 *   If `undefined` UB will send query to entity anf get it from DB.
 *   At last one parameter {store: storeName} should be defined to prevent loading actual JSON from DB
 * @returns {String|ArrayBuffer}
 */
MdbBlobStore.getContent = function (request, blobInfo, options) {
  let filePath = request.isDirty ? this.getTempFileName(request) : this.getPermanentFileName(blobInfo)
  return fs.readFileSync(filePath, options)
}

/**
 *  Must return true in case no exception
 *  load content and body from temporary file in the this.tempFolder'
 *
 * See {@link UB.virtualStores.Custom#loadContentFromTempStore}
 */
MdbBlobStore.loadContentFromTempStore = function (handler, aWithBody) {
  var
    content = handler.content,
    request = handler.request,
    strCtnt, objCtnt, fn
  console.debug('--========loadContentFromTempStore=====------ for ', handler.attribute.name)
  // toLog('handler = %', handler);

  fn = this.getTempFileName(handler)
  strCtnt = loadFile(fn + this.fileTempInfoExt)
  if (!strCtnt) {
    return // TODO - make difference between insert (do nothing) and update - raise
    // throw new Error('temporary content information not found for ' + handler.attribute.name);
  }
  objCtnt = JSON.parse(strCtnt)
  // move all property from file to handler.content
  _.forEach(objCtnt, function (key, value) {
    content[key] = value
  })
  if (aWithBody === TubLoadContentBody.Yes) {
    request.loadBodyFromFile(fn)
  }
  return true
}
/**
 * @inheritdoc
 */
MdbBlobStore.loadBodyFromEntity = function (handler) {
  var
    request = handler.request,
    content = handler.content,
    filePath = content.isDirty ? this.getTempFileName(handler) : this.getPermanentFileName(handler)

  console.debug('--===== loadBodyFromEntity ===--- try to load body from', filePath)
  return filePath ? request.loadBodyFromFile(filePath) : false
}
/**
 * Do nothing here - just delete content. Content itself must be under external version control system (SVN, fossil)
 */
MdbBlobStore.moveToArchive = function (handler) {
  return true // this.deleteContent(handler);
}
/**
 * Do nothing here - content must be under external version control system (SVN, GIT, fossil)
 */
MdbBlobStore.deleteContent = function () {
  // nothing to do here
  return true
}
/**
 * @inheritDoc
 */
MdbBlobStore.moveToPermanentStore = function (handler, aPrevRelPath) {
  var
    content = handler.content,
    pathPart, oldFilePath, newFilePath,
    fs = require('fs')

  console.debug('--========moveToPermanentStore=====------')
  oldFilePath = this.getTempFileName(handler)

  pathPart = content.relPath.split('|')
  if (pathPart.length !== 2) {
    throw new Error('MDB store expect relPath in form modelName|pathRelativeToModelPublicFolder but got: ' + content.relPath)
  } else {
    newFilePath = path.join(App.domainInfo.models[pathPart[0]].realPublicPath, pathPart[1])
    if (!fs.isDir(newFilePath)) {
      fs.mkdirSync(newFilePath)
    }
    newFilePath = path.join(newFilePath, content.fName)
  }
  console.debug('move from ' + oldFilePath + ' to ' + newFilePath)
  if (!moveFile(oldFilePath, newFilePath)) {
    throw new Error('Can\'t move file to permanent store')
  }
  deleteFile(oldFilePath + this.fileTempInfoExt)
  handler.content.isDirty = false
  return true
}

module.exports = MdbBlobStore
