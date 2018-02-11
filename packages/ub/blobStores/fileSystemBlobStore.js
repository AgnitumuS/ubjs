const BlobStoreCustom = require('./BlobStoreCustom')
const path = require('path')
const fs = require('fs')
const mime = require('mime-types')

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
 *    - ubs_report for store report template inside /public/reports
 *    - e.t.c.
 *
 * @singleton
 */
class FileSystemBlobStore extends BlobStoreCustom {
  constructor (storeConfig) {
    super(storeConfig)
    let storePath = this.config.path
    if (!path.isAbsolute(storePath)) {
      storePath = path.join(process.configPath, storePath)
    }
    if (!fs.existsSync(storePath)) {
      throw new Error(`Folder "${storePath}" for BLOB store "${this.name}" doesn't exist. Either check "path" or run ">ubcli createStore" to create folder and it internal structure`)
    }
    let fStat = fs.statSync(storePath)
    if (!fStat.isDirectory()) {
      throw new Error(`BLOB store "${this.name}" path "${storePath}" is not a folder`)
    }
    /**
     * Normalized path to the store root
     */
    this.fullStorePath = storePath
    this.keepOriginalFileNames = this.config.keepOriginalFileNames === false
    this.historyDepth = this.config.historyDepth || 0
    this.storeSize = this.config.storeSize || 'Simple'
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
  saveContentToTempStore (request, attribute, content, req, resp) {
    let fn = this.getTempFileName(request)
    console.debug('temp file is written to', fn)
    fs.writeFileSync(fn, content)
    // TODO md5val = CryptoJS.MD5(content)
    let origFn = request.fileName
    let ct = mime.contentType(path.extname(origFn))
    return {
      store: attribute.storeName,
      fName: origFn,
      origName: origFn,
      ct: ct,
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
  getContent (request, blobInfo, options) {
    let filePath = request.isDirty ? this.getTempFileName(request) : this.getPermanentFileName(blobInfo)
    return fs.readFileSync(filePath, options)
  }
  /**
   * Fill HTTP response for getDocument request
   * @param {BlobStoreRequest} requestParams
   * @param {BlobStoreItem} blobInfo Document metadata. Not used for dirty requests
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   * @return {Boolean}
   */
  fillResponse (requestParams, blobInfo, req, resp) {
    let filePath, ct
    if (requestParams.isDirty) {
      filePath = this.getTempFileName(requestParams)
      if (requestParams.fileName) {
        ct = mime.contentType(path.extname(requestParams.fileName))
      }
    } else {
      filePath = this.getPermanentFileName(blobInfo)
      ct = blobInfo.ct
    }
    if (!ct) ct = 'application/octet-stream'
    if (filePath) {
      resp.statusCode = 200
      resp.writeHead(`Content-Type: !STATICFILE\r\nContent-Type: ${ct}`)
      resp.writeEnd(filePath)
    } else {
      resp.statusCode = 404
      resp.writeEnd('Not found')
    }
  }
  /**
   * Move content defined by `dirtyItem` from temporary to permanent store.
   * TODO - think about it. New items should be putted to the new store (old one can be read-only for example or full)
   * TODO if old item present we should TRY delete it?
   * In case `oldItem` is present then store implementation & parameters should be taken from oldItem.store.
   * Return a new attribute content which describe a place of BLOB in permanent store
   *
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} dirtyItem
   * @param {BlobStoreItem} oldItem
   * @return {BlobStoreItem}
   */
  doCommit (attribute, ID, dirtyItem, oldItem) {
    if (!dirtyItem.isDirty) throw new Error('Committing of non dirty BLOBs is forbidden')
    let tempPath = this.getTempFileName({
      entity: attribute.entity.name,
      attribute: attribute.name,
      ID: ID
    })
    let newRelPath = '' // TODO construct
    let newFN
    if (this.keepOriginalFileNames) {
      newFN = dirtyItem.origName
    } else {
      // TODO construct
      throw new Error('Not implemented file name construction')
    }
    let permanentPath = this.getPermanentFileName({
      relPath: newRelPath,
      fName: newFN
    })
    fs.renameSync(tempPath, permanentPath)
    let nameWoPath = path.basename(permanentPath)
    let ct = mime.contentType(path.extname(nameWoPath))
    let stat = fs.statSync(permanentPath)
    return {
      store: attribute.storeName,
      fName: nameWoPath,
      origName: dirtyItem.origName,  // TODO - depend on store keepOriginalFileName
      relPath: newRelPath,
      ct: ct,
      size: stat.size,
      md5: dirtyItem.md5 // TODO - calc it here (do not trust client)
    }
  }
  /**
   * For file based store:
   *   - store.path + relativePath (depends on store size) + fileName (depends on keepOriginalFileNames)
   * @private
   * @param {BlobStoreItem} blobItem
   */
  getPermanentFileName (blobItem) {
    let result = ''
    let fn = blobItem.fName
    let relPath = blobItem.relPath || ''
    if (this.keepOriginalFileNames) {
      result = path.join(this.fullStorePath, relPath, fn)
    } else {
      throw new Error('not implemented')
    }
    return result
  }
}

module.exports = FileSystemBlobStore
