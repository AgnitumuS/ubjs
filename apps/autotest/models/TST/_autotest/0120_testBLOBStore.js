/**
 * @author pavel.mash
 * Date: 201-03-17
 * Test BLOB stores
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runMDBTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'mdb BLOB store test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  console.debug('test server-side BLOB stores methods')
  testServerSideBLOB(conn)
}

/**
 * @param {SyncConnection} conn
 */
function testServerSideBLOB (conn) {
  const resp = conn.post('testServerSideBLOB', {})
  assert.equal(resp.success, true, resp.reason)
}
