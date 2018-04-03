/**
 * User: pavel.mash
 * Date: 17.10.14
 * Test HTTP communication layer
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const http = require('http')

module.exports = function runHTTPTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', 'uData test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  // console.log('orig options:', options)
  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection
  let domain = conn.getDomainInfo()
  try {
    testHTTP(conn, domain, session)
    testRest(conn)
    testUnicode(conn)
  } finally {
    session.logout()
  }
}
/**
 *
 * @param {SyncConnection} conn
 * @param {UBDomain} domain
 * @param {ServerSession} session
 */
function testHTTP (conn, domain, session) {
  let req = http.request({
    URL: session.HOST + '/echoToFile',
    method: 'POST'
  })
  let data = 'Строка по русски'
  let resp = req.end(data)

  assert.equal(resp.statusCode, 200, 'echo text string - response status is 200')
  assert.equal(resp.read(), data, 'got the same text as send')

  data = new Uint8Array(255)
  for (let n = 0; n < 255; n++) {
    data[n] = n
  }
  resp = req.end(data)
  assert.equal(resp.statusCode, 200, 'echo binary - response status is 200')
  assert.deepEqual(resp.read('bin'), data.buffer, 'got the same text as send')

  let t = Date.now()
  conn.xhr({
    endpoint: 'rest/tst_service/sleep3sec',
    method: 'POST',
    URLParams: {async: true},
    data: {test: 1}
  })
  assert.ok(Date.now() - t < 1000, 'async call should respond quickly')
}

/**
 * @param {SyncConnection} conn
 */
function testRest (conn) {
  function invalidRestCall () {
    return conn.xhr({
      endpoint: 'rest/tst_service',
      HTTPMethod: 'POST'
    })
  }
  assert.throws(invalidRestCall, /Not Implemented/, 'Should throw on rest without method')
  let d = conn.xhr({
    endpoint: 'rest/tst_service/restTest',
    HTTPMethod: 'POST'
  })
  assert.ok(typeof d === 'object', 'rest call convention fail')
}

/**
 * @param {SyncConnection} conn
 */
function testUnicode (conn) {
  function unicodeExc () {
    conn.query({entity: 'tst_service', method: 'throwTest', isUnicode: true})
  }
  assert.throws(unicodeExc, /Підтримується/, 'Should throw unicode error')
}
