/* global TubDocumentRequest */
/* global TubLoadContentBody */
/* global _ */
/* global Session */

const qs = require('querystring')
const uiSettings = JSON.parse(App.getUISettings() || '{}')

Session.on('login', onlyOfficeOnUserLogin)

/**
 * Write onlyOffice server address to user data. For use on client
 */
function onlyOfficeOnUserLogin () {
  const configuration = getOnlyOfficeConfiguration()
  if (configuration.isConfigured) {
    _.defaults(Session.uData, {
      onlyOfficeServer: configuration.serverIP
    })
  }
}

/**
 * Read onlyOffice configuration section
 * @returns {{isConfigured: boolean, serverIP: string}}
 */
function getOnlyOfficeConfiguration () {
  const configuration = {
    isConfigured: false,
    serverIP: ''
  }

  const onlyOfficeServer = (uiSettings.adminUI && uiSettings.adminUI.onlyOffice) || ''
  const isConfigured = _.isObject(onlyOfficeServer) && _.isString(onlyOfficeServer.serverIP)

  if (isConfigured) {
    configuration.isConfigured = true
    configuration.serverIP = onlyOfficeServer.serverIP
  }

  return configuration
}

/**
 * Required by onlyOffice. If not exists, will throw UI errors on save/autosave
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function notifyDocumentSaved (req, resp) {
  // const requestString = req.read()
  //
  // /** @type {t_notifyDocumentSaved_req_body} */
  // const requestObj = JSON.parse(requestString)
  //
  // if (requestObj.status === 2 && !requestObj.notmodified) {
  //   /** @type {t_getDocumentOffice_req_params} */
  //     // const fileInfo = qs.parse('{"entity":"vp_dfInDocumentAttachment","attribute":"document","ID":5000034595094,"store":"vp_attachments","origName":"healthcheck.docx","filename":"vp_dfInDocumentAttachment5000034595094document"}');
  //   const fileInfo = JSON.parse('{"entity":"vp_dfInDocumentAttachment","attribute":"document","ID":5000034595094,"store":"vp_attachments","origName":"healthcheck.docx","filename":"vp_dfInDocumentAttachment5000034595094document"}')
  //
  //   const http = require('http')
  //   const request = http.request({
  //     URL: requestObj.url,
  //     method: 'GET',
  //     sendTimeout: 30000,
  //     receiveTimeout: 60000,
  //     keepAlive: true,
  //     compressionEnable: true
  //   })
  //
  //   /** @type {THTTPRequest} */
  //   const response = request.end()
  //   const docContent = response.read()
  //
  //   const resultDocDS = new TubDocumentRequest()
  //   resultDocDS.entity = fileInfo.entity
  //   resultDocDS.attribute = fileInfo.attribute
  //   resultDocDS.id = parseInt(fileInfo.ID)
  //   // resultDocDS.fileName  = docID.toString() + '.pdf';
  //   resultDocDS.setContent(docContent)
  //   const docInfo = resultDocDS.writeToTemp()
  //
  //   const documentStore = new TubDataStore(fileInfo.entity)
  //   const params = {__skipSelectAfterUpdate: true, execParams: {ID: fileInfo.ID}}
  //   params[fileInfo.attribute] = docInfo
  //
  //   documentStore.run('update', params)
  // }

  // used to notify document server as everything ok
  // indeed ok we don't do anything here
  const noErrorsResponse = {error: 0}
  resp.statusCode = 200
  resp.writeEnd(JSON.stringify(noErrorsResponse))
}

/**
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDocumentOffice (req, resp) {
  /** @type {t_getDocumentOffice_req_params} */
  const params = qs.parse(req.parameters)

  const resultDocDS = new TubDocumentRequest()
  resultDocDS.id = parseInt(params.ID)
  resultDocDS.entity = params.entity
  resultDocDS.attribute = params.attribute
  resultDocDS.fileName = params.filename
  resultDocDS.isDirty = params.isDirty === 'true'

  const docHandler = resultDocDS.createHandlerObject(false)
  docHandler.loadContent(TubLoadContentBody.No)
  docHandler.fillResponse()
}

/**
 * @typedef {object} t_getDocumentOffice_req_params
 * @property {string} attribute - name of the "Attribute" in "Entity"
 * @property {string} entity - name of "Entity"
 * @property {string} filename - name of file in storage
 * @property {string} ID - of the "Entity"
 * @property {string} isDirty - get stored document or from temporary storage
 * @property {string} origName - name of file when uploaded
 * @property {string} store - name of file storage
 */

/**
 * @typedef {object} t_notifyDocumentSaved_req_body
 * @property {string} key - document identifier
 * @property {number} status - editing result
 * @property {string} url - link to resulting document
 * @property {string=} userdata - custom information (information about document)
 * @property {string[]} users - list of users responsible for changes
 * @property {boolean=} notmodified - document were actually changed
 */

/**
 *
 * @type {{notifyDocumentSaved: notifyDocumentSaved, getDocumentOffice: getDocumentOffice, getOnlyOfficeConfiguration: getOnlyOfficeConfiguration}}
 */
module.exports = {
  notifyDocumentSaved,
  getDocumentOffice,
  getOnlyOfficeConfiguration
}
