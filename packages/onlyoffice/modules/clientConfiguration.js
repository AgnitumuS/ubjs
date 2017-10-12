/* global Session */

const getOnlyOfficeConfiguration = require('./configuration')
const lodash = require('lodash')

/**
 * Write onlyOffice server address to user data. For use on client
 */
function onlyOfficeOnUserLogin () {
  const configuration = getOnlyOfficeConfiguration()
  if (configuration.isConfigured) {
    lodash.defaults(Session.uData, { onlyOfficeServer: configuration.serverIP })
  }
}

module.exports = onlyOfficeOnUserLogin
