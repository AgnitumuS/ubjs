/* global nhashFile */
const BlobStoreCustom = require('./blobStoreCustom')
const path = require('path')
const fs = require('fs')
const mime = require('mime-types')

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max))
}
const STORE_SUBFOLDER_COUNT = 400
const MAX_COUNTER = Math.pow(2, 31)

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
  /**
   * @param {Object} storeConfig
   * @param {App} appInstance
   * @param {UBSession} sessionInstance
   */
  constructor (storeConfig, appInstance, sessionInstance) {
    super(storeConfig, appInstance, sessionInstance)
    let storePath = this.config.path // already normalized inside argv
    if (!fs.existsSync(storePath)) throw new Error(`BLOB store "${this.name}" path "${storePath}" not exists`)
    let fStat = fs.statSync(storePath)
    if (!fStat.isDirectory()) {
      throw new Error(`BLOB store "${this.name}" path "${storePath}" is not a folder`)
    }
    /**
     * Normalized path to the store root
     */
    this.fullStorePath = storePath

    let tmpFolder = this.tempFolder // already normalized inside argv
    if (!fs.existsSync(tmpFolder)) {
      throw new Error(`Temp folder "${tmpFolder}" for BLOB store "${this.name}" doesn't exist. Check a "tempPath" store config parameter`)
    } else {
      this.tempFolder = tmpFolder
    }
    this.keepOriginalFileNames = (this.config.keepOriginalFileNames === true)
    this.storeSize = this.config.storeSize || 'Simple'
    this._folderCounter = 0
    this.SIZES = {
      Simple: 'Simple', Medium: 'Medium', Large: 'Large', Monthly: 'Monthly', Daily: 'Daily'
    }
    if (!this.SIZES[this.storeSize]) {
      throw new Error(`Invalid storeSize "${this.storeSize}" for BLOB store "${this.name}"`)
    }
    if (this.storeSize === this.SIZES.Medium) {
      this._folderCounter = getRandomInt(STORE_SUBFOLDER_COUNT) + 100
    } else if (this.storeSize === this.SIZES.Large) {
      this._folderCounter = (getRandomInt(STORE_SUBFOLDER_COUNT) + 1) * (getRandomInt(STORE_SUBFOLDER_COUNT) + 1)
    }
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
    try {
      fs.writeFileSync(fn, content)
    } catch (e) {
      if (fs.existsSync(fn)) fs.unlinkSync(fn)
      throw e
    }
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
   * @param {BlobStoreRequest} request
   * @param {BlobStoreItem} blobInfo JSON retrieved from a DB.
   * @param {Object} [options]
   * @param {String|Null} [options.encoding] Default to 'bin'. Possible values: 'bin'|'ascii'|'utf-8'
   *   If `undefined` UB will send query to entity anf get it from DB.
   *   At last one parameter {store: storeName} should be defined to prevent loading actual JSON from DB
   * @returns {String|ArrayBuffer}
   */
  getContent (request, blobInfo, options) {
    let filePath = request.isDirty ? this.getTempFileName(request) : this.getPermanentFileName(blobInfo, request)
    return filePath ? fs.readFileSync(filePath, options) : undefined
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
      filePath = this.getPermanentFileName(blobInfo, requestParams)
      ct = blobInfo.ct
    }
    if (!ct) ct = 'application/octet-stream'
    if (filePath) {
      resp.statusCode = 200
      if (this.PROXY_SEND_FILE_HEADER) {
        let storeRelPath = path.relative(this.fullStorePath, filePath)
        let head = `${this.PROXY_SEND_FILE_HEADER}: /${this.PROXY_SEND_FILE_LOCATION_ROOT}/${this.name}/${storeRelPath}`
        head += `\r\nContent-Type: ${ct}`
        if (blobInfo && blobInfo.origName) {
          head += `\r\nContent-Disposition: attachment;filename="${blobInfo.origName}"`
        }
        console.debug(`<- `, head)
        resp.writeHead(head)
        resp.writeEnd('')
      } else {
        if (blobInfo && blobInfo.origName) {
          resp.writeHead(`Content-Type: !STATICFILE\r\nContent-Type: ${ct}\r\nContent-Disposition: attachment;filename="${blobInfo.origName}"`)
        } else {
          resp.writeHead(`Content-Type: !STATICFILE\r\nContent-Type: ${ct}`)
        }
        resp.writeEnd(filePath)
      }
    } else {
      resp.statusCode = 404
      resp.writeEnd('Not found')
    }
  }
  /**
   * Move content defined by `dirtyItem` from temporary to permanent store.
   * TIPS: in v0 (UB<5) if file updated then implementation takes a store from old item.
   *   This raise a problem - old store may be in archive state (readonly)
   * So in UB5 we change implementation to use a store defined in the attribute for new items
   *
   * Return a new attribute content which describe a place of BLOB in permanent store
   *
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} dirtyItem
   * @param {number} newRevision
   * @return {BlobStoreItem|null}
   */
  persist (attribute, ID, dirtyItem, newRevision) {
    if (dirtyItem.deleting) {
      let tempPath = this.getTempFileName({
        entity: attribute.entity.name,
        attribute: attribute.name,
        ID: ID
      })
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
      return null
    }
    let tempPath = this.getTempFileName({
      entity: attribute.entity.name,
      attribute: attribute.name,
      ID: ID
    })
    let newPlacement = this.genNewPlacement(attribute, dirtyItem, ID)
    fs.renameSync(tempPath, newPlacement.fullFn)
    let newMD5 = nhashFile(newPlacement.fullFn, 'MD5')
    let ct = mime.contentType(newPlacement.ext)
    let stat = fs.statSync(newPlacement.fullFn)
    let resp = {
      v: 1,
      store: attribute.storeName,
      fName: newPlacement.fn,
      origName: dirtyItem.origName,
      relPath: newPlacement.relPath,
      ct: ct,
      size: stat.size,
      md5: newMD5,
      revision: newRevision
    }
    if (dirtyItem.isPermanent) resp.isPermanent = true
    return resp
  }

  safeIncFolderCounter () {
    this._folderCounter++
    if (this._folderCounter > MAX_COUNTER) this._folderCounter = 100
    return this._folderCounter
  }

  /**
   * @override
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} blobInfo
   */
  doDeletion (attribute, ID, blobInfo) {
    let fn
    try {
      fn = this.getPermanentFileName(blobInfo)
      if (fn && fs.existsSync(fn)) fs.unlinkSync(fn)
    } catch (e) {
      console.error(`BLOB store "${this.name}" - can't delete file "${fn}":`, e)
    }
  }

  /**
   * Calculate a relative path & file name for a new BLOB item.
   * If new folder dose not exists - create it
   * @protected
   * @param {UBEntityAttribute} attribute
   * @param {BlobStoreItem} dirtyItem
   * @param {Number} ID
   * @return {{fn: string, ext: string, relPath: string, fullFn: string}}
   */
  genNewPlacement (attribute, dirtyItem, ID) {
    // generate file name for storing file
    let fn = this.keepOriginalFileNames ? dirtyItem.origName : ''
    let ext = path.extname(dirtyItem.origName)
    if (!fn) {
      let entropy = (Date.now() & 0x0000FFFF).toString(16)
      fn = `${attribute.entity.sqlAlias || attribute.entity.code}-${attribute.code}${ID}${entropy}${ext}`
    }
    let l1subfolder = ''
    let l2subfolder = ''
    if (this.storeSize === this.SIZES.Medium) {
      let c = this.safeIncFolderCounter()
      l1subfolder = '' + (c % STORE_SUBFOLDER_COUNT + 100)
    } else if (this.storeSize === this.SIZES.Large) {
      let c = this.safeIncFolderCounter()
      l1subfolder = '' + (Math.floor(c / STORE_SUBFOLDER_COUNT) % STORE_SUBFOLDER_COUNT + 100)
      l2subfolder = '' + (c % STORE_SUBFOLDER_COUNT + 100)
    } else if (this.storeSize === this.SIZES.Monthly || this.storeSize === this.SIZES.Daily) {
      let today = new Date()
      let year = today.getFullYear().toString()
      let month = today.getMonth().toString().padStart(2, '0')
      l1subfolder = `${year}${month}`
      if (this.storeSize === this.SIZES.Daily) {
        l2subfolder = today.getDay().toString().padStart(2, '0')
      }
    }
    // check target folder exists. Create if possible
    // use a global cache for already verified folder
    let fullFn = this.fullStorePath
    let relPath = ''
    if (l1subfolder) {
      fullFn = path.join(this.fullStorePath, l1subfolder)
      let cacheKey = `BSFCACHE#${this.name}#${l1subfolder}`
      let verified = this.App.globalCacheGet(cacheKey) === '1'
      if (!verified) {
        if (!fs.existsSync(fullFn)) fs.mkdirSync(fullFn, '0777')
        this.App.globalCachePut(cacheKey, '1')
      }
      relPath = l1subfolder
      if (l2subfolder) {
        fullFn = path.join(fullFn, l2subfolder)
        cacheKey = `BSFCACHE#${this.name}#${l1subfolder}#${l2subfolder}`
        let verified = this.App.globalCacheGet(cacheKey) === '1'
        if (!verified) {
          if (!fs.existsSync(fullFn)) fs.mkdirSync(fullFn, '0777')
          this.App.globalCachePut(cacheKey, '1')
        }
        relPath = path.join(relPath, l2subfolder)
      }
    }
    fullFn = path.join(fullFn, fn)
    return {
      fn: fn,
      ext: ext,
      relPath: relPath,
      fullFn: fullFn
    }
  }
  /**
   * For file based store:
   *   - store.path + relativePath  + fileName
   * @protected
   * @param {BlobStoreItem} blobItem
   * @param {BlobStoreRequest} [request] Optional request to get a revision
   * @return {String} In case of item not exists - return empty string ''
   */
  getPermanentFileName (blobItem, request) {
    let fn = blobItem.fName
    let relPath = blobItem.relPath || ''
    // v:0 create a folder FormatUTF8('% % %%', [Attribute.Entity.name, Attribute.name, Request.ID])
    // and place where file with name = revisionNumber+ext
    // sample: {"store":"documents","fName":"doc_outdoc document 3000019161319.pdf","origName":"3000019161319.pdf","relPath":"101\\","ct":"application/pdf","size":499546,"md5":"5224456db8d3c47f5681c5e970826211","revision":5}
    if (!blobItem.v) { // UB <5
      let ext = path.extname(fn)
      let fileFolder = path.basename(fn, ext) // file name without ext
      fn = `${blobItem.revision || 0}${ext}` // actual file name is `revision number + ext`
      relPath = path.join(relPath, fileFolder)
    }
    if (process.platform === 'nix') {
      if (relPath.indexOf('\\') !== -1) { // in case file written from Windows relPath contains win separator
        relPath = relPath.replace(/\\/g, '/')
      }
    }
    return path.join(this.fullStorePath, relPath, fn)
  }
}

module.exports = FileSystemBlobStore
