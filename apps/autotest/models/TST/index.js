const UB = require('@unitybase/ub')
UB.loadLegacyModules(__dirname)

let shouldNotThrowOnSecondThreadInitialize = UB.Repository('uba_user').attrs('ID', 'name').select()
// const Worker = require('@unitybase/base').Worker
//
// new Worker({
//   name: 'numCounter',
//   moduleName: '@unitybase/ubs/_autotest/_numCounterWorker.js'
// })
return
// const WebDav = require('@ub-e/web-dav')
// const WebDavBlobStoreProvider = require('@ub-e/web-dav/providers/webDavBlobStoreProvider')
// const WebDavFsProvider = require('@ub-e/web-dav/providers/webDavFileSystemProvider')
// WebDav.registerEndpoint('folders')
//   .addProvider(new WebDavBlobStoreProvider({
//     name: 'doc',
//     entities: ['tst_document']
//   }))
//   .addProvider(new WebDavFsProvider({
//     name: 'fs',
//     path: process.configPath
//   }))
