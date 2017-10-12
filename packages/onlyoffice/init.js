/* global App, Session */
// this block will create endpoints for onlyOffice if it configured
const getOnlyOfficeConfiguration = require('./modules/configuration')

if (getOnlyOfficeConfiguration().isConfigured) {
  // endpoint used by onlyOffice to get document
  const getDocumentOffice = require('./modules/getDocumentOnlyOffice')
  App.registerEndpoint('getDocumentOffice', getDocumentOffice, false)

  // endpoint used by onlyOffice to notify about document modifications and end of editing
  const notifyDocumentSaved = require('./modules/notifyOnlyOffice')
  App.registerEndpoint('onlyoffice/notifyDocumentSaved', notifyDocumentSaved, false)

  // endpoint called from component UB.ux.UBOnlyOffice (adminui-pub/_src/app/ux/UBOnlyOffice.js)
  // places document to temp store
  const setDocumentOnlyOffice = require('./modules/setDocumentOnlyOffice')
  App.registerEndpoint('setOnlyOfficeDocumentToTempStore', setDocumentOnlyOffice, false)

  // adds onlyOffice configuration info into client userData
  // used by UB.ux.UBOnlyOffice to bootstrap and UB.ux.UBDocument to modify list of available editors
  const onlyOfficeOnUserLogin = require('./modules/clientConfiguration')
  Session.on('login', onlyOfficeOnUserLogin)
}
