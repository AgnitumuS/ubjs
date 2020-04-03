/**
 * @author pavel.mash
 * Date: 22.10.14
 * Test server side implementations from serverSide folder
 */
const path = require('path')
const fs = require('fs')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'Server-side tests'

module.exports = function runOTPTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  // if (!session.__serverStartedByMe) {
  //   throw new Error('Shut down server before run this test')
  // }
  const conn = session.connection

  console.debug('start ' + TEST_NAME)
  testServerSide()

  function testServerSide () {
    const folder = path.dirname(__filename)
    const tests = fs.readdirSync(path.join(folder, 'serverSide'))

    console.debug('test Server-side js')
    tests.forEach((test) => {
      if (!test.endsWith('.js') || test.charAt(0) === '_') return
      const fullPath = path.join(folder, 'serverSide', test).replace(/\\/g, '/')
      const content = `return require('${fullPath}')`
      console.debug('Eval a ' + test)
      let result = { success: false }
      try {
        result = conn.post('evaluateScript', content)
      } catch (e) {
        throw new Error(`Error in server-side script ${test}: ${JSON.stringify(result)}`)
      }
      if (!result.success) {
        console.error('Test', fullPath, 'fails with reason', result.reason)
        throw new Error(result.reason)
      }
    })
  }
}
