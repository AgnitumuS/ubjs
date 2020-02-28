const UB = require('@unitybase/ub')

const { getOnlyOfficeConfiguration, getDocumentOffice, setOnlyOfficeDocumentToTempStore, notifyDocumentSaved } = require('./onlyOfficeEndpoints.js')

const configuration = getOnlyOfficeConfiguration()
if (configuration.isConfigured) {
  UB.App.registerEndpoint('getDocumentOffice', getDocumentOffice, false)
  UB.App.registerEndpoint('setOnlyOfficeDocumentToTempStore', setOnlyOfficeDocumentToTempStore)
  UB.App.registerEndpoint('notifyDocumentSaved', notifyDocumentSaved, false)
} else {
  console.warn('Included mdoel @unitybase/only-office not configured. ' +
    'Should configure "uiSettings.adminUI.onlyOffice.serverIP" in ubConfig.json')
}

