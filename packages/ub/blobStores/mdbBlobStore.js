const BlobStoreCustom = require('./BlobStoreCustom')
const path = require('path')
const App = require('../modules/App')
const fs = require('fs')

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
    fName: request.fileName,
    origName: request.fileName,
    relPath: request.relPath,
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
 * Move content defined by `dirtyItem` from temporary to permanent store.
 * In case `oldItem` is present store implementation & parameters should be taken from oldItem.store.
 * Return a new attribute content which describe a place of BLOB in permanent store
 *
 * @param {UBEntityAttribute} attribute
 * @param {Number} ID
 * @param {BlobStoreItem} dirtyItem
 * @param {BlobStoreItem} oldItem
 * @return {BlobStoreItem}
 */
MdbBlobStore.doCommit = function (attribute, ID, dirtyItem, oldItem) {
  let tempPath = this.getTempFileName({
    entity: attribute.entity.name,
    attribute: attribute.name,
    ID: ID
  })
  let permanentPath = this.getPermanentFileName(dirtyItem)
  fs.renameSync(tempPath, permanentPath)
  let nameWoPath = path.basename(permanentPath)
  return {
    store: attribute.storeName,
    fName: nameWoPath,
    origName: nameWoPath,
    relPath: dirtyItem.relPath,
    ct: dirtyItem.ct,
    size: dirtyItem.size,
    md5: dirtyItem.md5
  }
}

module.exports = MdbBlobStore
