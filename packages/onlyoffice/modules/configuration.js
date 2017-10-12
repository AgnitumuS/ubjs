/* global App */

const lodash = require('lodash')
const uiSettings = JSON.parse(App.getUISettings() || '{}')

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
  const isConfigured = lodash.isObject(onlyOfficeServer) && lodash.isString(onlyOfficeServer.serverIP)

  if (isConfigured) {
    configuration.isConfigured = true
    configuration.serverIP = onlyOfficeServer.serverIP
  }

  return configuration
}

module.exports = getOnlyOfficeConfiguration
