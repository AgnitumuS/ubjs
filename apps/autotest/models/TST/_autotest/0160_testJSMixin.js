/**
 * @author pavel.mash
 * Date: 2021-03-05
 * Test JS mixin "testMixin"
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runJSMixinsTests (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'JS Mixins test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  const tstDictAddNew = conn.query({
    entity: 'tst_dictionary',
    method: 'addnew',
    fieldList: ['ID', 'code']
  })
  let defValues = tstDictAddNew.resultData.data[0]
  assert.strictEqual(defValues[1], 'val_tst_dict', `testMixin should sets 'val_tst_dict' as code default for tst_dictionary but got  ${defValues[1]}`)

  const tstIDMapAddNew = conn.query({
    entity: 'tst_IDMapping',
    method: 'addnew',
    fieldList: ['ID', 'code']
  })
  defValues = tstIDMapAddNew.resultData.data[0]
  assert.strictEqual(defValues[1], 'val-tst_idmap', `testMixin should sets 'val-tst_idmap' as code default for tst_IDMapping but got  ${defValues[1]}`)
}