/**
 * @classdesc

 Abstract interface for Virtual store. Must be implemented in descendants.

 Provide a way to store files in any manner developer want.

 # General explanation

 In any case you define **Entity attribute** of `Document` type and set `storeName` property for this attribute.
 Content of such attributes is a meta-information about file - a serialized {TubDocumentContent} object, not actual file content.

 For non-virtual entity (`dsType`!=='Virtual') UnityBase create varchar(4000) field in database and store
 there {TubDocumentContent} serialized to JSON.

 For Virtual entity developer must implement `select` method and fill content of document type attribute manually
 (for example by parsing file content as done in **ubm_form**).

 In the store definition section of application configuration developer describe stores. Each store must implement interface described below.

 In case `storeType` is `FileSystem` this interface is implemented inside UnityBase server executable, for
 `storeType` == Virtual UnityBase search for JS implementation class named 'UB.virtualStores' + [`implementedBy` property from store config].

 The store class itself must provide storing and retrieving file content (based on meta-information stored in the entity attribute).

 From client-side POV uploading files to server is separated onto two part. Like in gmail when you send mail with
 attachment you can attach file, and gmail send it to server, but you do not send mail itself yet - this is first stage.
 Result of this stage is information about where file on server stored.
 When you send email client pass to server email attributes, body and information about attached files.
 This is the same UnityBase do in the second stage.

 ## Upload file to server

 So in UnityBase upload file to to the server is performed in two stages:

 1. Upload file to temporary store - on this stage client call setDocument/setDocumentMultipart app level method and
 pass file content to server with additional parameter **isDirty=true**, server must store file in the temporary place. To do this server:

 - parse incoming HTTP request and transform it to {@link TubDocumentRequest} object - container for raw document data
 - based on entity attribute UnityBase create {@link TubDocumentHandlerCustom} descendant object - this object able to
 put TubDocumentRequest content to store. During initialization handler calculate md5 checksum of incoming
 document and MIME content type (based of origName file extension or on magic bytes in case extension is unknown)
 - server call {@link UB.virtualStores.Custom#saveContentToTempStore} method passing {@link TubDocumentHandlerCustom handler} as a parameter
 - server return in HTTP response serialized {@link TubDocumentContent}, with {@link TubDocumentContent#isDirty} attribute is set to `true`.
 This information is used on the next step to determinate where to found file .

 2. Client execute `insert` or `update` entity method and pass (with other attributes) string, returned on the first stage as a value of `Document`
 type attribute. On this stage server see what user want to update/insert Document and, based on *Domain* information, know
 what type of store is used for this attribute. Server:

 - load information about previously stored document from entity attribute to {@link TubDocumentContent}.
 Create {@link TubDocumentHandlerCustom} for old file content;
 - in case of `update` and previous revision is exist: if (storeConfig.historyDepth > 0) then
 call {@link UB.virtualStores.Custom#moveToArchive}, else call {@link UB.virtualStores.Custom#deleteContent};
 - load temporary document meta-information from string provided in update/insert method to {@link TubDocumentContent}.
 Create {@link TubDocumentHandlerCustom} for new file content;
 - in case new content {@link TubDocumentContent#isDirty} equal to `true` - call {@link UB.virtualStores.Custom#loadContentFromTempStore}(TubLoadContentBody.No).
 `TubLoadContentBody.No` implies that there is no need to load file into memory. When UnityBase increase {@link TubDocumentContent#revision handler.content.revision}
 and call {@link UB.virtualStores.Custom#moveToPermanentStore}

 3. Finally UnityBase update entity and commit database transaction (in case entity is non-virtual)

 ## Download file from server

 For download file from server client call getDocument app level method. Server:

 - lock document for a time of reading from store (by entity + ID)
 - if dirty copy requested - call {@link UB.virtualStores.Custom#loadContentFromTempStore}(TubLoadContentBody.Yes) else call {@link UB.virtualStores.Custom#loadBodyFromEntity}
 - call {@link UB.virtualStores.Custom#fillResponse}
 - unlock document

 Good example of Virtual store implementation is:

 - **mdb** store placed in `UnityBase\models\UB\virtualStores\mdb.js` - implement read/write files
 from models `public/form` folder;
 - **fileVirtualWritePDF** (`UnityBase\models\UB\virtualStores\fileVirtualWritePDF.js`) - implement file store with
 automatic conversion MS Word, MS Excel and MS Power Point documents into \*.pdf format;

 ### Warning - descendants must be singleton. We can not define parent class as singleton due to Ext specific

 */

const Session = require('../modules/Session')
const path = require('path')

/**
 * Blob store item content (JSON stored in database)
 * @typedef {Object} BlobStoreItem
 * @property {String} store Code of store implementation from application config. If empty - use a store from attribute configuration
 * @property {String} fName File name inside store (auto generated in most case)
 * @property {String} origName Original file name (as user upload it)
 * @property {String} [relPath] Relative path of fName inside store folder (for file-based stores)
 * @property {String} ct Content type
 * @property {Number} size Content size
 * @property {String} md5 Content MD5 checksum
 * @property {Number} revision Content revision
 * @property {Number} isDirty ????
 * @property {Boolean} isPermanent If `true` - do not delete content during history rotation
 */

/**
 * Blob store request (parameters passed to getDocument)
 * @typedef {Object} BlobStoreRequest
 * @property {String} entity
 * @property {String} attribute
 * @property {String} ID
 * @property {String} [isDirty]
 * @property {String} [fileName]
 * @property {Number} [revision]
 */

/**
 * @class BlobStoreCustom
 * @abstract
 */
const BlobStoreCustom = {
  /**
   * -
   * Implementation must save file content to temporary store
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   */
  saveContentToTempStore: function (handler) {
  },

  /**
   * -
   * Implementation must move old file revision to archive according to store historyDepth and delete file from permanent store.
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   * @return {Boolean}
   */
  moveToArchive: function (handler) {
  },

  /**
   * -
   * Implementation must delete file content from permanent store
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   * @return {boolean}
   */
  deleteContent: function (handler) {
  },

  /**
   * -
   *  Load content and (optionally) body from temporary file
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   * @param {TubLoadContentBody} aWithBody
   */
  loadContentFromTempStore: function (handler, aWithBody) {
  },

  /**
   * -
   * Implementation must MOVE file content from temporary store to permanent store
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   * @param {String} aPrevRelPath In case exist prev. file revision this variable contain it relative path
   * @return {boolean}
   */
  moveToPermanentStore: function (handler, aPrevRelPath) {
  },

  /**
   * Fill HTTP response for getDocument request
   *
   * @param {BlobStoreRequest} requestParams
   * @param {BlobStoreItem} blobInfo
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   * @return {Boolean}
   */
  fillResponse: function (requestParams, blobInfo, req, resp) {

  },
  /**
   * -
   * Implementation MUST fill handler.request body by call one of request body-related methods
   * @abstract
   * @param {TubDocumentHandlerCustom} handler
   * @return {boolean}
   */
  loadBodyFromEntity: function (handler) {
    var
      request = handler.request,
      content = handler.content
    request.loadBodyFromFile(filePath)
  },
  /**
   * Path to temp folder
   * @type {String}
   * @private
   */
  tempFolder: (process.env.TEMP || process.env.TMP),
  /**
   * Get path to temporary file and it's name
   * @protected
   * @param {BlobStoreRequest} request
   * @returns {string}
   */
  getTempFileName: function (request) {
    // important to use Session.userID. See UB-617
    return path.join(this.tempFolder, [request.entity, request.attribute, request.ID, Session.userID].join('_'))
  }
}
module.exports = BlobStoreCustom
