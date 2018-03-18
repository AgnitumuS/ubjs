const Session = require('../modules/Session')
const path = require('path')
const os = require('os')

/**
 * @classdesc

 Abstract interface for Virtual store. Must be implemented in descendants.

 Provide a way to store files in any manner developer want.

 # General explanation

 **Entity attribute** of `Document` type with `storeName` property for this attribute should be defined.
 Content (data stored in database) of such attributes is a meta-information about file - a serialized {@link BlobStoreItem} object, not an actual file content.

 For non-virtual entity (`dsType`!=='Virtual') UnityBase create nvarchar(2000) field in database and store
 there {BlobStoreItem} serialized to JSON.

 For Virtual entity developer should implement `select` method and fill {@link BlobStoreItem} manually
 (for example by parsing file content as done in **ubm_form**).

 In the store definition section of application configuration developer describe stores. Each store must implement interface described below.

 The store class itself must provide storing and retrieving file content (based on meta-information stored in the entity attribute).

 From client-side POV uploading files to server is separated onto two part. Like in gmail when you send mail with
 attachment you can attach file, and gmail send it to server, but you do not send mail itself yet - this is first stage.
 Result of this stage is information about where file on server stored.
 When you send email client pass to server email attributes, body and information about attached files.
 This is the same UnityBase do in the second stage.

 ## Upload file to server

 So in UnityBase upload file to to the server is performed in two stages:

 1. Upload file to temporary store - on this stage client call setDocument app level method and
 pass file content to server with additional parameter **isDirty=true**, server store file in the temporary place.

 2. Client execute `insert` or `update` entity method and pass (with other attributes) string, returned on the first stage as a value of `Document`
 type attribute. On this stage server see what user want to update/insert Document and, based on *Domain* information, know
 what type of store is used for this attribute. Server:

 3. Finally UnityBase update entity and commit database transaction (in case entity is non-virtual)

 ## Download file from server

 For download file from server client call `getDocument` endpoint

 */

/* BlobStoreItem sample:
{"store":"documents","fName":"contr_contractdoc document 3000000405832.pdf",
  "origName":"Contract #01T.pdf",
  "relPath":"435\\",
  "ct":"application/pdf",
  "size":2057405,
  "md5":"3b44f38f6b120615604846b67150fcb0",
  "revision":2}
*/
class BlobStoreCustom {
  constructor (storeConfig) {
    /**
     * Store parameters as defined in ubConfig
     */
    this.config = Object.assign({}, storeConfig)
    /**
     * Name of store (from app config)
     */
    this.name = this.config.name
    /**
     * Path to temp folder
     * @type {String}
     * @private
     */
    this.tempFolder = (this.config['tempPath'] || os.tmpdir())
    /**
     * How many previous revision is stored
     * @type {number}
     */
    this.historyDepth = this.config.historyDepth || 0
  }
  /**
   * Implementation must save file content to temporary store
   * @abstract
   * @param {BlobStoreRequest} request Request params
   * @param {UBEntityAttribute} attribute
   * @param {ArrayBuffer} content
   * @returns {BlobStoreItem}
   */
  saveContentToTempStore (request, attribute, content) {}
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
  getContent (request, blobInfo, options) {}
  /**
   * Fill HTTP response for getDocument request
   * @abstract
   * @param {BlobStoreRequest} requestParams
   * @param {BlobStoreItem} blobInfo
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   * @return {Boolean}
   */
  fillResponse (requestParams, blobInfo, req, resp) { }
  /**
   * Move content defined by `dirtyItem` from temporary to permanent store.
   * Return a new attribute content which describe a place of BLOB in permanent store
   * @abstract
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} dirtyItem
   * @param {number} newRevision
   * @return {BlobStoreItem}
   */
  persist (attribute, ID, dirtyItem, newRevision) { }

  /**
   * Do something with BLOB content during archiving. For example - move to slow drive etc.
   * Default implementation do nothing.
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} blobInfo
   * @returns {BlobStoreItem}
   */
  doArchive (attribute, ID, blobInfo) {
    return blobInfo
  }
  /**
   * Delete persisted BLOB content
   * @abstract
   * @param {UBEntityAttribute} attribute
   * @param {Number} ID
   * @param {BlobStoreItem} blobInfo
   */
  doDeletion (attribute, ID, blobInfo) { }
  /**
   * Get path to temporary file and it's name
   * @protected
   * @param {BlobStoreRequest} request
   * @returns {string}
   */
  getTempFileName (request) {
    // important to use Session.userID. See UB-617
    return path.join(this.tempFolder, `${request.entity}_${request.attribute}_${request.ID}_${Session.userID}`)
  }
}

module.exports = BlobStoreCustom
