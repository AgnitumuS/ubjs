/**
 * @author pavel.mash
 * Date: 2021-03-15
 * Test server-side reporting
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runJSMixinsTests (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'server-side report test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  console.debug('Server-side reporting test')
  conn.xhr({
    endpoint: 'rest/tst_service/testServerRendering',
    data: {
      reportCode: "test", responseType: "html", reportParams: {}
    }
  })
}