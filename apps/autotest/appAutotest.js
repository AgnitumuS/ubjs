const UB = require('@unitybase/ub')
const App = UB.App

// BLOB store performance test endpoints. For TEST environments only
const {getDocumentPerfTestEp, setDocumentPerfTestEp} = require('@unitybase/blob-stores/storesPerfTest.js')
App.registerEndpoint('getDocumentPerfTest', getDocumentPerfTestEp, false)
App.registerEndpoint('setDocumentPerfTest', setDocumentPerfTestEp, false)

UB.start()
