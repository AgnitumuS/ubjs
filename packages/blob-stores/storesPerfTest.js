/**
 * Endpoints for BLOB stores performance test
 *
 * 1) Add test endpoint to the app (for example in the application main file)
 *
 *
 *    const UB = require('@unitybase/ub')
 *    const App = UB.App
 *
 *    const {getDocumentPerfTestEp} = require('@unitybase/blob-stores/storesPerfTest.js')
 *    App.registerEndpoint('getDocumentPerfTest', getDocumentPerfTestEp, false)
 *
 * 2) For a real-life results ensure reverseProxy.kind="nginx" in config
 *
 * 2) Consider we interest in measurement of BLOB store configured for `tst_maindata.fileStoreSimple` attribute
 *   In console:
 *   ensure endpoint works as expected:
 *   curl 'http://app.url/getDocumentPerfTest?entity=tst_maindata&attribute=fileStoreSimple'
 *
 *   run a load test
 *   wrk 'http://app.url/getDocumentPerfTest?entity=tst_maindata&attribute=fileStoreSimple'
 *
 */

const UB = require('@unitybase/ub')
const Session = UB.Session
const blobStores = require('./blobStores')
const queryString = require('querystring')

module.exports = {
  getDocumentPerfTestEp,
  setDocumentPerfTestEp
}

const MAX_ROWS = 11
const idsCache = {
  //entityName: [1, 2, 3] // last MAX_ROWS IDs
}
/**
 * Obtains a random (one of last MAX_ROWS (10_000) row) document from specified entity and attribute and send it to response.
 *
 *  GET /testGetDocument?entity=myEntity&attribute=documentAttr
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function getDocumentPerfTestEp(req, resp) {
  const {entity, attribute} = queryString.parse(req.parameters)

  if (!App.domainInfo.has(entity)) {
    return resp.badRequest('unknown entity')
  }
  if (!idsCache[entity]) {
    console.log(`Load last ${MAX_ROWS} IDs from entity '${entity}'`)
    idsCache[entity] = UB.Repository(entity).attrs('ID').orderByDesc('ID').limit(MAX_ROWS).selectAsArrayOfValues()
  }

  const bsReq = {
    ID: idsCache[entity][Math.round(Math.random()*(idsCache[entity].length-1))],
    entity,
    attribute
  }
  console.debug('Return a document for ', bsReq)
  return Session.runAsAdmin(() => blobStores.writeDocumentToResp(bsReq, req, resp))
}

/**
 * Write a file of random ( 1000 - 500_000 bytes) size value to the BLOB store for specified entity and attribute
 * Warning!!
 *
 *  GET /testGetDocument?entity=myEntity&attribute=documentAttr
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function setDocumentPerfTestEp(req, resp) {
  return resp.notImplemented('not implemented yet')
}