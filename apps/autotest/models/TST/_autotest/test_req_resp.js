/**
 * @author pavel.mash
 * Date: 17.10.14
 * Test HTTP communication layer
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const http = require('http')

module.exports = function runHTTPTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'uData test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  // console.log('orig options:', options)
  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection
  const domain = conn.getDomainInfo()
  try {
    testReqJson(conn, session)
    testHTTP(conn, domain, session)
    testRest(conn)
    testUnicode(conn)
    testHandledException(conn)
  } finally {
    session.logout()
  }
}

/**
 * @param {SyncConnection} conn
 * @param {ServerSession} session
 */
function testReqJson (conn, session) {
  const req = http.request({
    URL: session.HOST + '/bodyJson',
    method: 'POST'
  })
  let data = ''
  let resp = req.end(data)
  assert.strictEqual(resp.statusCode, 200, 'req.json() from empty string - response status is 200')
  let j = resp.json()
  assert.strictEqual(j, null, 'reps.json() must be null for empty body but got ' + j)

  data = '{"a": 1}'
  resp = req.end(data)
  j = resp.json()
  assert.strictEqual(j && j.a, 1, 'reps.json() expect object {a: 1} but got ' + JSON.stringify(j))

  data = Buffer.cpFrom('{"invalidUTF": "Привет"}', 1251)
  resp = req.end(data)
  j = resp.json()
  assert.ok(j && j.error && /JSON.parse/.test(j.error), 'reps.json() expect object {error: "JSON.parse: unterminated string literal at line 1 column 17 of the JSON data"} but got ' + JSON.stringify(j))
}
/**
 *
 * @param {SyncConnection} conn
 * @param {UBDomain} domain
 * @param {ServerSession} session
 */
function testHTTP (conn, domain, session) {
  const req = http.request({
    URL: session.HOST + '/echoToFile',
    method: 'POST'
  })
  let data = 'Строка по русски'
  let resp = req.end(data)

  assert.strictEqual(resp.statusCode, 200, 'echo text string - response status is 200')
  assert.strictEqual(resp.read(), data, 'got the same text as send')

  data = new Uint8Array(255000)
  for (let n = 0, L = data.byteLength; n < L; n++) {
    data[n] = n % 254 + 1
  }
  resp = req.end(data)
  assert.strictEqual(resp.statusCode, 200, 'echo binary - response status is 200')
  assert.deepEqual(resp.read('bin'), data.buffer, 'got the same text as send')

  req.setPath('/echoToFile?append=true&part=1')
  resp = req.end('123')
  assert.strictEqual(resp.statusCode, 200, 'echo binary append - response status is 200')
  req.setPath('/echoToFile?append=true&part=2')
  resp = req.end('456')
  assert.strictEqual(resp.statusCode, 200, 'echo binary append2 - response status is 200')
  const appended = resp.read('utf-8')
  assert.strictEqual(appended, '123456', `req.append - got ${appended} but should be 123456`)

  // let t = Date.now()
  // conn.xhr({
  //   endpoint: 'rest/tst_service/sleep3sec',
  //   method: 'POST',
  //   URLParams: {async: true},
  //   data: {test: 1}
  // })
  // assert.ok(Date.now() - t < 2000, 'async call should respond quickly')
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
  const d = conn.xhr({
    endpoint: 'rest/tst_service/restTest',
    HTTPMethod: 'PUT',
    data: 'put test data'
  })
  assert.ok(typeof d === 'object', 'rest call convention fail')
  const d1 = conn.xhr({
    endpoint: 'rest/tst_service/restTest',
    HTTPMethod: 'GET',
    data: 'put test data'
  })
  assert.ok(typeof d1 === 'object', 'rest call convention fail')
  const d2 = conn.xhr({
    endpoint: 'rest/tst_service/restTest',
    HTTPMethod: 'POST',
    data: 'put test data'
  })
  assert.ok(typeof d2 === 'object', 'rest call convention fail')
}

/**
 * @param {SyncConnection} conn
 */
function testUnicode (conn) {
  function unicodeExc () {
    conn.query({ entity: 'tst_service', method: 'throwTest', isUnicode: true })
  }
  assert.throws(unicodeExc, /<<<Підтримується>>>/, 'Should throw unicode error')
  function systemExc () {
    conn.query({ entity: 'tst_service', method: 'throwTest', isSystem: true })
  }
  assert.throws(systemExc, /HTTP Error 500 - Internal Server Error/, 'Should hide system errors in production mode')
  function usualExc () {
    conn.query({ entity: 'tst_service', method: 'throwTest' })
  }
  assert.throws(usualExc, /HTTP Error 500 - Internal Server Error/, 'Should hide JS errors in production mode')
}

/**
 * Exception throws by native and catch in JS must not force HTTP response to 500
 * @param {SyncConnection} conn
 */
function testHandledException (conn) {
  let resp
  assert.doesNotThrow(() => {
    resp = conn.post('/verifyThrowCatch')
  }, 'Exception throws by native and catch in JS must not force HTTP response to 500')
  assert.strictEqual(resp.catched, true, 'Expect { catched: true } but got ' + JSON.stringify(resp))
}
