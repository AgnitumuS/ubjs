/**
 * Date: 25.09.16
 * Test DDL generator
 */
const assert = require('assert')
const argv = require('@unitybase/base').argv
const cmdLineOpt = require('@unitybase/base').options
const TEST_NAME = 'DDL generator'

module.exports = function runFTSTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('Start ' + TEST_NAME)
  runTest(conn)
}

/**
 *
 * @param {SyncConnection} conn
 */
function runTest (conn) {
  let dictID = conn.lookup('tst_dictionary', 'ID', { expression: 'code', condition: 'equal', values: { code: 'code10' } })
  assert.throws(function () {
    conn.run({
      entity: 'tst_dictionary',
      method: 'delete',
      execParams: { ID: dictID }
    })
  }, /ERR_REFERENCE_ERROR/, 'Referential constraint in database must fail for tst_dictionaly with code="code10" deletion')

  let data = conn.Repository('tst_dictionary').attrs(['mi_modifyDate']).where('ID', '=', dictID).selectAsObject()
  assert.throws(function () {
    conn.run({
      entity: 'tst_dictionary',
      method: 'update',
      execParams: { ID: dictID, code: 'code20', mi_modifyDate: data[0].mi_modifyDate }
    })
  }, /VALUE_MUST_BE_UNIQUE/, 'Unique constraint in database must fail for tst_dictionaly update from "code10" to "code20"')

  console.log('check ubm_desktop is overrided by TST model')
  data = conn.Repository('ubm_desktop').attrs(['ID', 'overrided']).limit(1).selectAsObject()

  // testcase for TubDataStore.generateDDL() call in case data store is created in one context but called in other
  conn.get('getIDTest')
}
