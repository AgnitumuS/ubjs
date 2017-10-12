/* global Session, TubDocumentRequest, TubLoadContentBody */

const qs = require('querystring')

/**
 * @param {TubDocumentRequest} docRequest
 * @private
 */
function _doReadDocument (docRequest) {
  const docHandler = docRequest.createHandlerObject(false)
  docHandler.loadContent(TubLoadContentBody.Yes)
  docHandler.fillResponse()
}

/**
 * Returns requested document for OnlyOffice server
 * Used to bypass security and must be changed
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDocumentOffice (req, resp) {
  /** @type {t_getDocumentOffice_req_params} */
  const params = qs.parse(req.parameters)

  if (!params.ID) {
    resp.statusCode = 200
    resp.writeHead('Content-Type: text/plain')
    resp.writeEnd(' ', 'utf-8')
    return
  }

  const docRequest = new TubDocumentRequest()
  docRequest.id = parseInt(params.ID)
  docRequest.entity = params.entity
  docRequest.attribute = params.attribute
  docRequest.isDirty = params.isDirty === 'true'
  docRequest.fileName = params.filename
  docRequest.store = params.store

  // when file stored in "temporary" section, userID used to create file name
  // but this endpoint public and always called as "anonymous" user
  if (params.isDirty === 'true') {
    Session.runAsUser(parseInt(params.user), () => { _doReadDocument(docRequest) })
  } else {
    _doReadDocument(docRequest)
  }
}

module.exports = getDocumentOffice

/**
 * @typedef {object} t_getDocumentOffice_req_params
 * @property {string} attribute - name of the "Attribute" in "Entity"
 * @property {string} entity - name of "Entity"
 * @property {string} filename - name of file in storage
 * @property {string} ID - of the "Entity"
 * @property {string} isDirty - get stored document or from temporary storage
 * @property {string} origName - name of file when uploaded
 * @property {string} store - name of file storage
 * @property {string} user - userID
 */
