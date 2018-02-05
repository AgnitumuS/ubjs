/**
 * User: pavel.mash
 * Date: 06.02.2018
 * Test mdb blob store
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runELSTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', 'mdb BLOB store test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('test ubm_form')
  testUbmForm(conn)
}

/**
 * @param {UBConnection} conn
 */
function testUbmForm (conn) {
  let tstClobFormRow = conn.Repository('ubm_form').attrs(['ID', 'code', 'formDef', 'formCode']).where('code', '=', 'tst_clob').selectSingle()
  if (!tstClobFormRow) throw new Error('Form with code `tst_clob` not found')
  let defJson = JSON.parse(tstClobFormRow.formDef)
  let codeJson = JSON.parse(tstClobFormRow.formCode)
  let defContent = conn.getDocument({entity: 'ubm_form', attribute: 'formDef', id: tstClobFormRow.ID}, {resultIsBinary: true})
  assert.equal(defContent.byteLength, defJson.size, `Size of actual form def content should be the same as stored in metadata`)
}
