/**
 * Will test IIT cryptography .
 *
 * @author xmax
 * @created 25.09.2015
 */
const Worker = require('@unitybase/base').Worker
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'IIT cryptography thread test'
const serverConfig = argv.getServerConfiguration()
const serverURL = argv.serverURLFromConfig(serverConfig)

module.exports = function runIITCryptoTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({short: 't', long: 'numThreads', param: 'numThreads', defaultValue: 2, help: 'Thread count'})
    options = opts.parseVerbose({}, true)
    if (!options) return
  } else {
    options.numThreads = 2
  }
  if (!serverConfig.security || !serverConfig.security.dstu) {
    console.log('Skip IIT CRYPTOGRAPHY test: serverConfig.security.dstu.iit section in server config not exists')
  }

  // start a server for workers (if stopped)
  argv.establishConnectionFromCmdLineAttributes(options)

  let numThreads = parseInt(options.numThreads, 10)
  console.debug('start ', numThreads, TEST_NAME)

  let workers = []
  // create threads
  let signerPath = require.resolve('./_IIT_workerCrypto.js')
  signerPath = signerPath.replace(/\\/g, '/')
  for (let i = 0; i < numThreads; i++) {
    workers.push(new Worker({
      name: `wcrypt${i}`,
      moduleName: signerPath
    }))
    console.debug('Create worker ', i)
  }

  let i = 0
  workers.forEach((worker) => {
    worker.postMessage({signal: 'start', thread: i, serverURL: serverURL})
    console.log('Worker', i, 'started')
    i++
  })
  // wait for done
  workers.forEach((worker) => {
    let workerMessage = worker.waitMessage(100000)
    assert.ok(workerMessage.signal !== 'error', workerMessage.message)
  })
}
