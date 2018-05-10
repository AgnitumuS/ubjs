global.XMLHttpRequest = require('xhr2')

const UB = require('@unitybase/ub-pub')

let conn = UB.connect({
  host: 'http://localhost:8881',
  onCredentialRequired: function (conn, isRepeat) {
    if (isRepeat) {
      throw new UB.UBAbortError('invalid')
    } else {
      return Promise.resolve({authSchema: 'UB', login: 'admin', password: 'admin'})
    }
  },
  onAuthorizationFail: function (reason) {
    console.error(reason)
  }
})
conn.then(function (conn) {
  conn.get('stat').then(function (statResp) {
    console.log('Stat:', statResp.data)
  })

  conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption'])
    .limit(2)
    .selectAsObject()
    .then(function (data) {
      console.log('First 2 adminUI shortcuts:')
      console.log(JSON.stringify(data, null, '\t'))
    })
})
