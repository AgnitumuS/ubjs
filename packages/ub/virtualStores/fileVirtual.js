const VirtualStoreCustom = require('./Custom')
/**
 * @classdesc
 * Virtual store implementation for storing documents into the file system.
 * Since this is primary type of store for most systems, almost all methods is a proxy to `native` implementation for performance reason.
 *
 * @class
 * @extends VirtualStoreCustom
 * @singleton
 */
const VirtualStoreFiles = Object.create(VirtualStoreCustom)

/**
 * Save file content to temporary file store
 * @param {TubDocumentHandlerCustom} handler
 */
VirtualStoreFiles.saveContentToTempStore = function (handler) {
  return this.saveContentToTempFileStore(handler)
}
/**
 * Move old file revision to file archive according to store historyDepth and delete file from permanent store.
 * @param {TubDocumentHandlerCustom} handler
 * @return {Boolean}
 */
VirtualStoreFiles.moveToArchive = function (handler) {
  return this.moveToFileArchive(handler)
}
/**
 * Delete file content from permanent file store
 * @param {TubDocumentHandlerCustom} handler
 * @return {boolean}
 */
VirtualStoreFiles.deleteContent = function (handler) {
  return this.deleteFileContent(handler)
}
/**
 * Load content and (optionally) body from temporary file
 * @param {TubDocumentHandlerCustom} handler
 * @param {TubLoadContentBody} aWithBody
 */
VirtualStoreFiles.loadContentFromTempStore = function (handler, aWithBody) {
  this.loadContentFromTempFileStore(handler, aWithBody)
}
/**
 * Move file content from temporary file store to permanent file store
 * @param {TubDocumentHandlerCustom} handler
 * @param {String} aPrevRelPath In case exist prev. file revision this variable contain it relative path
 * @return {boolean}
 */
VirtualStoreFiles.moveToPermanentStore = function (handler, aPrevRelPath) {
  this.moveToPermanentFileStore(handler, aPrevRelPath)
}
/**
 * Returns null and fill response from file storage
 * @inheritDoc
 */
VirtualStoreFiles.fillResponse = function (handler) {
  return this.fillFileResponse(handler)
}
/**
 * Fill handler.request body from file storage
 * @param {TubDocumentHandlerCustom} handler
 * @return {boolean}
 */
VirtualStoreFiles.loadBodyFromEntity = function (handler) {
  return this.loadBodyFromFile(handler)
}
/**
 * Returns config of selected file revision
 * @param {TubDocumentHandlerCustom} handler
 * @param {Number} aRevision
 * @param {String} aRelPath
 * @return {String} JSON config
 */
VirtualStoreFiles.getRevisionConfig = function (handler, aRevision, aRelPath) {
  return this.getRevisionConfigFromFileStore(handler, aRevision, aRelPath)
}
/**
 * Change isPermanent flag of revision
 * @param {Object} params parameters object
 * @param {String} params.entity
 * @param {String} params.attribute
 * @param {Number} params.id
 * @param {Number} params.revision
 * @param {Boolean} params.isPermanent
 */
VirtualStoreFiles.setRevisionIsPermanent = function (params) {
  var request = new TubDocumentRequest(),
    path = require('path'),
    fs = require('fs'),
    fnUbfti,
    ubfti,
    handler
  request.entity = params.entity
  request.attribute = params.attribute
  request.id = params.id
  handler = request.createHandlerObject(true)
  handler.getLastRevisionContent(false, handler.content)
  fnUbfti = handler.storeConfig.path + handler.content.relPath +
        handler.content.fName.slice(0, -path.extname(handler.content.fName).length) + '\\' + params.revision + '.ubfti'
  ubfti = JSON.parse(fs.readFileSync(fnUbfti))
  if (ubfti.isPermanent !== params.isPermanent) {
    ubfti.isPermanent = params.isPermanent
    fs.writeFileSync(fnUbfti, ubfti)
  }
}
/**
 * Is temp content exists.
 * @param {TubDocumentHandlerCustom} handler
 * @return {Boolean}
 */
VirtualStoreFiles.tempContentExists = function (handler) {
  return this.tempFileContentExists(handler)
}

module.exports = VirtualStoreFiles
