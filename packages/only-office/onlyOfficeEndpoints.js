/**
 * WIP: not finished yet
 * @module onlyOfficeEndpoints
 * @memberOf module:@unitybase/ub
 */
const blobStores = require('@unitybase/blob-stores')
const http = require('http')
const _ = require('lodash')
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session

module.exports = {
  notifyDocumentSaved,
  getDocumentOffice,
  getOnlyOfficeConfiguration,
  setOnlyOfficeDocumentToTempStore
}

const uiSettings = App.serverConfig.uiSettings

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
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function setOnlyOfficeDocumentToTempStore (req, resp) {
  /** @type {t_setOnlyOfficeDocument_params} */
  const params = req.parsedParameters
  const requestString = req.read()

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

  let blobStoreItem = blobStores.putContent(params, docContent)

  resp.statusCode = 200
  resp.writeEnd({ success: true, errMsg: '', result: blobStoreItem })
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
  const params = req.parsedParameters
  const callerIP = Session.callerIP
  const config = getOnlyOfficeConfiguration()

  if (!config.isConfigured || !config.serverIP.startsWith(callerIP)) {
    resp.statusCode = 404
    return
  }

  if (!params.ID || !params.userID) {
    resp.statusCode = 200
    resp.writeHead('Content-Type: text/plain')
    resp.writeEnd(' ', 'utf-8')
    return
  }
  return Session.runAsUser(parseInt(params.userID), () => blobStores.getDocumentEndpoint(req, resp))
}

/**
 * @typedef {object} t_getDocumentOffice_req_params
 * @property {string} attribute - name of the "Attribute" in "Entity"
 * @property {string} entity - name of "Entity"
 * @property {string} filename - name of file in storage
 * @property {string} ID - of the "Entity"
 * @property {string} userID - user id whom initiate request
 * @property {string} isDirty - get stored document or from temporary storage
 * @property {string} origName - name of file when uploaded
 * @property {string} store - name of file storage
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
