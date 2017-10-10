/* global TubDocumentRequest, TubLoadContentBody */
/* global Session, App */

/**
 * @type {{notifyDocumentSaved: notifyDocumentSaved, getDocumentOffice: getDocumentOffice, getOnlyOfficeConfiguration: getOnlyOfficeConfiguration}}
 */
module.exports = {
  notifyDocumentSaved,
  getDocumentOffice,
  getOnlyOfficeConfiguration,
  setOnlyOfficeDocumentToTempStore
}

const qs = require('querystring')
const _ = require('lodash')
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

function setOnlyOfficeDocumentToTempStore (req, resp) {
  /** @type {t_setOnlyOfficeDocument_params} */
  const params = qs.parse(req.parameters)
  const requestString = req.read()

  const http = require('http')
  const requestParams = {
    URL: requestString,
    method: 'GET',
    sendTimeout: 30000,
    receiveTimeout: 60000,
    keepAlive: true,
    compressionEnable: true
  }
  /** @type{ClientRequest} */
  const request = http.request(requestParams)
  request.setHeader('accept', 'application/octet-stream')
  /** @type {THTTPRequest} */
  const response = request.end()
  const docContent = response.read('bin')

  const resultDocDS = new TubDocumentRequest()
  resultDocDS.entity = params.entity
  resultDocDS.attribute = params.attribute
  resultDocDS.id = parseInt(params.ID)
  resultDocDS.fileName = params.filename
  resultDocDS.setContent(docContent)
  const docInfo = resultDocDS.writeToTemp()

  resp.statusCode = 200
  const result = {result: docInfo}
  resp.writeEnd(result)
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
  // used to notify document server that everything is ok
  // indeed ok we don't do anything here
  const noErrorsResponse = {error: 0}
  resp.statusCode = 200
  resp.writeEnd(JSON.stringify(noErrorsResponse))
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

  // const callerIP = Session.callerIP
  // const config = getOnlyOfficeConfiguration()
  // will fail in case of UB configured to listen on %COMPUTERNAME%
  // if (!config.isConfigured || !config.serverIP.startsWith(callerIP)) {
  //   resp.statusCode = 404
  //   return
  // }

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

/**
 * @typedef {object} t_notifyDocumentSaved_req_body
 * @property {string} key - document identifier
 * @property {number} status - editing result
 * @property {string} url - link to resulting document
 * @property {string} userdata - custom information (information about document)
 * @property {string[]} users - list of users responsible for changes
 * @property {boolean} notmodified - document were actually changed
 */

/**
 * @typedef {object} t_setOnlyOfficeDocument_params
 * @property {string} entity - name of "Entity"
 * @property {string} attribute - name of the "Attribute" in "Entity"
 * @property {string} ID - of the "Entity"
 * @property {string} filename - name of file in storage
 */
