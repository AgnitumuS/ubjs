/* global App */

const lodash = require('lodash')
const uiSettings = JSON.parse(App.getUISettings() || '{}')

/**
 * Read onlyOffice configuration section
 * @returns {{isConfigured: boolean, documentServerURL: string}}
 */
function getOnlyOfficeConfiguration () {
  const configuration = {
    isConfigured: false,
    documentServerURL: ''
  }

  const onlyOfficeServer = (uiSettings.adminUI && uiSettings.adminUI.onlyOffice) || ''
  const isConfigured = onlyOfficeServer && onlyOfficeServer.documentServerURL

  if (isConfigured) {
    configuration.isConfigured = true
    configuration.documentServerURL = onlyOfficeServer.documentServerURL
    _checkServerIsRunning(configuration.documentServerURL)
  }

  return configuration
}

/**
 * Try to get version from onlyoffice server to check it's running
 * @param {string} documentServerURL
 * @return {boolean}
 * @private
 */
function _checkServerIsRunning (documentServerURL) {
  const http = require('http')
  const payload = JSON.stringify({ 'c': 'version' }) // command to service
  const servicePath = documentServerURL + '/coauthoring/CommandService.ashx' // service address
  console.log('Querying OnlyOffice server on ' + servicePath)

  const request = http.request({
    URL: servicePath,
    method: 'POST',
    sendTimeout: 5000,
    receiveTimeout: 10000,
    keepAlive: true,
    compressionEnable: true
  })
  request.setHeader('Content-Type', 'application/json')
  request.write(payload)

  try {
    const response = request.end()
    const responsePayload = response.read()
    console.log('OnlyOffice responded with status:' + response.statusCode + ' payload: ' + responsePayload)

    // response expected to be like { "error": 0, "version": "4.3.1.4" }
    if (lodash.isString(responsePayload)) {
      const result = JSON.parse(responsePayload)
      const isExpectedResponse = !lodash.isUndefined(result.error) && !lodash.isUndefined(result.version)

      if (!isExpectedResponse) {
        _writeInfoToConsole(documentServerURL, servicePath)
      }
      return isExpectedResponse
    }
  } catch (exc) {
    _writeInfoToConsole(documentServerURL, servicePath)
  }

  return false
}

function _writeInfoToConsole (documentServerURL, servicePath) {
  console.warn('OnlyOffice configured to listen on "' + documentServerURL + '" but call to command service at "' + servicePath + '" were unsuccessful.')
  console.warn('If it\'s running in docker container - it may still be booting.')
  console.warn('Please check that server address is correct (usually found in uiSettings->adminUI->onlyOffice->documentServerURL).')
  console.warn('And that server is running (if you using docker image - type "docker ps" in console to list running containers)')
}

module.exports = getOnlyOfficeConfiguration
