const UB = require('@unitybase/ub')
const App = UB.App

// BLOB store performance test endpoint. For TEST environments only
const {getDocumentPerfTestEp} = require('@unitybase/blob-stores/storesPerfTest.js')
App.registerEndpoint('getDocumentPerfTest', getDocumentPerfTestEp, false)

UB.start()
