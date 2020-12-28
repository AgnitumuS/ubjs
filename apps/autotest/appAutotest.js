const UB = require('@unitybase/ub')
const App = UB.App

// BLOB store performance test endpoints. For TEST environments only
const { getDocumentPerfTestEp, setDocumentPerfTestEp } = require('@unitybase/blob-stores/storesPerfTest.js')
App.registerEndpoint('getDocumentPerfTest', getDocumentPerfTestEp, false)
App.registerEndpoint('setDocumentPerfTest', setDocumentPerfTestEp, false)

App.registerEndpoint('upload', (req, resp) => {
  console.log(req.headers)
  resp.writeEnd(req.headers)
  resp.statusCode = 200
}, false)

App.registerEndpoint('pdfsign', testPdfSignerSpeed, false)

/**
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testPdfSignerSpeed (req, resp) {
  const pdfsignTest = require('@ub-e/pdfsign/_autotest/test_TubSigner.js')
  pdfsignTest()
  resp.statusCode = 200
}

UB.start()

console.log('Verify adding of 50 listeners not produce a ERR in console');
for (let i=0; i < 50; i++) {
  uba_user.on('select:after', function(){})
}
