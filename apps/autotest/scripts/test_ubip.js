const SyncConnection = require('@unitybase/base').SyncConnection
let __pkgConnectionUser

function getPkgUserConnection () {
  if (!__pkgConnectionUser) {
    __pkgConnectionUser = new SyncConnection({
      URL: 'http://localhost:8881',
      useCompression: false,
      sendTimeout: 6000000,
      receiveTimeout: 6000000,
      keepAlive: true
    })
    __pkgConnectionUser.onRequestAuthParams = function () {
      return { authSchema: 'UBIP', login: 'byip' }
    }
  }
  return __pkgConnectionUser
}

debugger
const conn = getPkgUserConnection()
console.log(conn.post('stat'))
