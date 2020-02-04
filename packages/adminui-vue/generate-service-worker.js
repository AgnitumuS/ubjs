global.XMLHttpRequest = require('xhr2')

const UB = require('@unitybase/ub-pub')
const http = require('http')
const fs = require('fs')
const repos = require('./styleguide-src/repositories.js')
UB.connect({
  host: 'http://localhost:8881',
  onCredentialRequired: (conn, isRepeat) => {
    if (isRepeat) {
      throw new UB.UBAbortError('invalid credential')
    } else {
      return Promise.resolve()
    }
  },
  onAuthorizationFail: reason => {
    console.error(reason)
  }
}).then(conn => {
  // console.log(`
  //   Hello, ${conn.userLogin()}!
  //   We know that you are ${JSON.stringify(conn.userData())}
  // `)
  // conn.get('stat').then(function (statResp) {
  //   console.log('Current server statistics:', statResp.data)
  // })

  // conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption'])
  //   .limit(2)
  //   .selectAsObject()
  //   .then(function (data) {
  //     console.log('First 2 adminUI shortcuts:')
  //     console.log(JSON.stringify(data, null, '\t'))
  //   })

  // console.log(conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption']).ubql())
  if (fs.existsSync('styleguide/service-worker-generated.js')) {
    fs.unlinkSync('styleguide/service-worker-generated.js')
  }
  const stream = fs.createWriteStream('styleguide/service-worker-generated.js', { flags: 'a' })
  const ubqls = repos(conn).map(repo => repo.ubql()).map(ubql => JSON.stringify([ubql]))

  ubqls.forEach(ubql => sendUBQLAndWriteResponse(ubql, stream))
}).catch(error => console.log(error))

/**
 *
 * @param {String} data
 * @param {WriteStream} stream
 */
const sendUBQLAndWriteResponse = (data, stream) => {
  const options = {
    hostname: 'localhost',
    port: 8881,
    path: '/ubql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  const req = http.request(options, (res) => {
    res.setEncoding('utf8')
    let body = ''
    res.on('data', chunk => {
      body += chunk
    })
    res.on('end', () => {
      stream.write(body)
    })
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`)
  })

  req.write(data)
  req.end()
}
