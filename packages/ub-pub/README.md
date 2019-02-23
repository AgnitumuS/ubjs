[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Data layer for accessing UnityBase server from Browser or NodeJS

NodeJS example:

```javascript
global.XMLHttpRequest = require('xhr2')

const UB = require('@unitybase/ub-pub')

let conn = UB.connect({
  host: 'http://localhost:8881',
  onCredentialRequired: function (conn, isRepeat) {
    if (isRepeat) {
      throw new UB.UBAbortError('invalid credential')
    } else {
      return Promise.resolve({authSchema: 'UB', login: 'admin', password: 'admin'})
    }
  },
  onAuthorizationFail: function (reason) {
    console.error(reason)
  }
})
conn.then(function (conn) {
  console.log(`
    Hello, ${conn.userLogin()}!
    We know that you are ${JSON.stringify(conn.userData())}
  `)
  conn.get('stat').then(function (statResp) {
    console.log('Current server statistics:', statResp.data)
  })

  conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption'])
    .limit(2)
    .selectAsObject()
    .then(function (data) {
      console.log('First 2 adminUI shortcuts:')
      console.log(JSON.stringify(data, null, '\t'))
    })
})
```

The same code as above will work in browser (just comment first line
where XMLHttpRequest is required).
