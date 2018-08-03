const BlobStoreCustom = require('./blobStoreCustom')
const path = require('path')
const fs = require('fs')
const os = require('os')

// model's public folder may not exists - in this we will create it
// during `getPermanentFileName` and cache verified path's here
const VERIFIED_PATH = {}
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
class MdbBlobStore extends BlobStoreCustom {
  /**
   * @param {Object} storeConfig
   * @param {App} appInstance
   * @param {UBSession} sessionInstance
   * @param storeConfig
   */
  constructor (storeConfig, appInstance, sessionInstance) {
    super(storeConfig, appInstance, sessionInstance)
    if (!this.tempFolder) this.tempFolder = os.tmpdir()
  }
  /**
   * @inheritDoc
   * @param {BlobStoreRequest} request Request params
   * @param {UBEntityAttribute} attribute
   * @param {ArrayBuffer} content
   * @returns {BlobStoreItem}
   */
  saveContentToTempStore (request, attribute, content) {
    let fn = this.getTempFileName(request)
    console.debug('temp file is written to', fn)
    fs.writeFileSync(fn, content)
    // TODO md5val = CryptoJS.MD5(content)
    return {
      store: attribute.storeName,
      fName: request.fileName,
      origName: request.fileName,
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
  getContent (request, blobInfo, options) {
    let filePath = request.isDirty ? this.getTempFileName(request) : this.getPermanentFileName(blobInfo)
    return fs.readFileSync(filePath, options)
  }
  /**
   * Fill HTTP response for getDocument request
   * @param {BlobStoreRequest} requestParams
   * @param {BlobStoreItem} blobItem
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   * @return {Boolean}
   */
  fillResponse (requestParams, blobItem, req, resp) {
    let filePath = requestParams.isDirty ? this.getTempFileName(requestParams) : this.getPermanentFileName(blobItem)
    if (filePath) {
      resp.statusCode = 200
      if (this.PROXY_SEND_FILE_HEADER) {
        let storeRelPath = path.relative(process.configPath, filePath)
        let head = `${this.PROXY_SEND_FILE_HEADER}: /${this.PROXY_SEND_FILE_LOCATION_ROOT}/app/${storeRelPath}`
        console.debug(`<- `, head)
        head += `\r\nContent-Type: ${blobItem.ct}`
        resp.writeHead(head)
        resp.writeEnd('')
      } else {
        resp.writeHead(`Content-Type: !STATICFILE\r\nContent-Type: ${blobItem.ct}`)
        resp.writeEnd(filePath)
      }
    } else {
      return resp.notFound('mdb store item ' + filePath)
    }
  }
  /**
   * Move content defined by `dirtyItem` from temporary to permanent store.
   * In case `oldItem` is present store implementation & parameters should be taken from oldItem.store.
   * Return a new attribute content which describe a place of BLOB in permanent store
   *
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} dirtyItem
   * @param {number} newRevision
   * @return {BlobStoreItem}
   */
  persist (attribute, ID, dirtyItem, newRevision) {
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
  /**
   * @override
   */
  doDeletion (attribute, ID, blobInfo) {
    throw new Error(`${this.name} store not support deletion. Developer must delete file manually`)
  }
  /**
   * For MDB blob store relPath === '[modelCode]|folderPath'
   * @private
   * @param {BlobStoreItem} bsItem
   */
  getPermanentFileName (bsItem) {
    let pathPart = bsItem.relPath.split('|')
    if (pathPart.length !== 2) return '' // this is error
    let model = this.App.domainInfo.models[pathPart[0]]
    if (!model) throw new Error('MDB blob store - not existed model' + pathPart[0])
    let folder = path.join(model.realPublicPath, pathPart[1])
    if (!VERIFIED_PATH[folder]) {
      // verify public path exists
      if (!fs.existsSync(model.realPublicPath)) {
        fs.mkdirSync(model.realPublicPath)
      }
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
      }
      VERIFIED_PATH[folder] = true
    }
    return path.join(folder, bsItem.fName)
  }
}

module.exports = MdbBlobStore
