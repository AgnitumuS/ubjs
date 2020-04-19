/**
 * @author pavel.mash
 * Date: 2021-04-15
 * Test case for select method override by select:before propagate a __totalRecCount (if requested)
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runMixinsTests (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'Mixins test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection
  // limit query result to ensure __totalRecCount actually calculated
  const resp = conn.query(conn.Repository('tst_document')
    .using('runSelectInJSContext').attrs('ID').limit(100).withTotal(true)
    .ubql()
  )
  assert.ok(resp.__totalRecCount > 101, `Should got __totalRecCount > 101 but actual is ${resp.__totalRecCount}`)
}
