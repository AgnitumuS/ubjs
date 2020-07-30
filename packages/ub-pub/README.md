[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Data layer for accessing UnityBase server from Browser or NodeJS

NodeJS example:

```javascript
global.XMLHttpRequest = require('xhr2')
const UB = require('@unitybase/ub-pub')

const HOST = process.env.UB_HOST || 'http://localhost:8881'
const USER = process.env.UB_USER || 'admin'
const PWD = process.env.UB_PWD || 'admin'

async function call_ub () {
  const conn = await UB.connect({
    host: HOST,
    onCredentialRequired: function (conn, isRepeat) {
      if (isRepeat) {
        throw new UB.UBAbortError('invalid credential')
      } else {
        return Promise.resolve({authSchema: 'UB', login: USER, password: PWD})
      }
    },
    onAuthorizationFail: function (reason) {
      console.error(reason)
    }
  })

  console.log(`
Hello, ${conn.userLogin()}!
We know that you are ${JSON.stringify(conn.userData(), null, ' ')}
`)

  conn.get('stat').then(function (statResp) {
    console.log('Current server statistics:', statResp.data)
  })

  const items = await conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption'])
   .limit(2)
      .selectAsObject()
      .then(function (data) {
        console.log('First 2 adminUI shortcuts:')
        console.log(JSON.stringify(data, null, '\t'))
      })
  console.table(items)
}

try {
  call_ub()
} catch (e) {
  console.error(e)
}
```

The same code as above will work in browser (just comment first line
where XMLHttpRequest is required).
