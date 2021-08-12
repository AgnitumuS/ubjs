/**
 * @author pavel.mash
 * Date: 2020-12-17
 * Test simulations insets
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'Simulations Insert Test'

module.exports = function runSimulationsInsertTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({ short: 'n', long: 'iter', param: 'iterationCnt', defaultValue: 1000, help: 'Iteration count' })
      .add({ short: 'r', long: 'codePrefix', param: 'codePrefix', help: 'Code attribute Prefix' })
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  console.debug(`Start ${TEST_NAME} with ${options.iter} iterations`)

  const tstDictIDs = conn.Repository('tst_dictionary').attrs('ID').selectAsArrayOfValues()
  const L = tstDictIDs.length
  console.log(L)

  console.time('MANY INSERTS')
  for(let i = 0; i < options.iter; i++) {
    conn.insert({
      entity: 'tst_maindata',
      execParams: {
        code: `si_test_${options.codePrefix}-${i}}`,
        nonNullDict_ID: tstDictIDs[Math.round(Math.random() * (L-1))],
        manyValue: '1,2',
        manyValue2: '3,4'
      }
    })
  }
  console.timeEnd('MANY INSERTS')
}