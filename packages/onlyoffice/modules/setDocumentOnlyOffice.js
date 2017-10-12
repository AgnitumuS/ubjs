/* global TubDocumentRequest */

const qs = require('querystring')

function setDocumentOnlyOffice (req, resp) {
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

module.exports = setDocumentOnlyOffice

/**
 * @typedef {object} t_setOnlyOfficeDocument_params
 * @property {string} entity - name of "Entity"
 * @property {string} attribute - name of the "Attribute" in "Entity"
 * @property {string} ID - of the "Entity"
 * @property {string} filename - name of file in storage
 */
