
/**
 * Created by pavel.mash on 17.01.2017.
 */

const assert = require('assert')
const ok = assert.ok
const fs = require('fs')
const path = require('path')
const argv = require('@unitybase/base/argv')

console.debug('Start clientRequire Endpoint test')
let session = argv.establishConnectionFromCmdLineAttributes()
let conn = session.connection

function testClientRequireEndpoint () {
  let winDir = process.env.windir
  assert.throws(
    () => conn.get(`clientRequire/${winDir}/win.ini`),
    /Bad Request/, 'Endpoint clientRequire must restrict access to absolute path'
  )

  assert.throws(
    () => conn.get(`clientRequire//driveRoot.txt`),
    /Bad Request/, 'Endpoint clientRequire must restrict access to ablolute path (drive root)'
  )

  assert.throws(
    () => conn.get(`clientRequire/@unitybase/ub/../../../ubConfig.json`),
    /Not Found/, 'Endpoint clientRequire must restrict access folder up from resolved'
  )

  assert.throws(
    () => conn.get(`clientRequire/@unitybase/ub/../../ubConfig.json`),
    /Not Found/, 'Endpoint clientRequire must restrict access folder up from resolved'
  )

  assert.throws(
    () => conn.get(`clientRequire/lerna`),
    /Bad Request/, 'Endpoint clientRequire must restrict access to modules outside app node_modules folder'
  )

  assert.throws(
    () => conn.get(`clientRequire/@unitybase/ub/_autotest/0080_clientRequireEndpoint.js`),
    /Bad Request/, 'Endpoint clientRequire must restrict access to non-public model folders'
  )

  ok(conn.get(`clientRequire/@unitybase/ub/public/locale/lang-en.js`))
}

try {
  testClientRequireEndpoint()
} finally {
  session.logout()
}
