/* global App, Session */
// this block will create endpoints for onlyOffice if it configured
const getOnlyOfficeConfiguration = require('./modules/configuration')

if (getOnlyOfficeConfiguration().isConfigured) {
  const getDocumentOffice = require('./modules/getDocumentOnlyOffice')
  App.registerEndpoint('getDocumentOffice', getDocumentOffice, false)

  const notifyDocumentSaved = require('./modules/notifyOnlyOffice')
  App.registerEndpoint('onlyoffice/notifyDocumentSaved', notifyDocumentSaved, false)

  const setDocumentOnlyOffice = require('./modules/setDocumentOnlyOffice')
  App.registerEndpoint('setOnlyOfficeDocumentToTempStore', setDocumentOnlyOffice, false)

  const onlyOfficeOnUserLogin = require('./modules/clientConfiguration')
  Session.on('login', onlyOfficeOnUserLogin)
}
