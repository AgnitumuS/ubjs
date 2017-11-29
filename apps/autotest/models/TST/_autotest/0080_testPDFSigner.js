/**
 * Will test PDF signing.
 *
 * Unity base must be running in -c mode
 *
 * UB ./models/tst/_autotest/0080_testPDFSigner.js -cfg ubConfig.json -app autotest -u admin -p admin  -t 5
 *
 * @author mpv
 * @created 04.11.2015
 */

const Worker = require('@unitybase/base').Worker
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'PDF signing thread test'
const serverURL = argv.serverURLFromConfig(argv.getServerConfiguration())

module.exports = function runPDFSignTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({short: 't', long: 'numThreads', param: 'numThreads', defaultValue: 2, help: 'Thread count'})
    options = opts.parseVerbose({}, true)
    if (!options) return
  } else {
    options.numThreads = 2
  }

  // start a server for workers (if stopped)
  argv.establishConnectionFromCmdLineAttributes(options)

  let numThreads = parseInt(options.numThreads, 10)
  console.debug('start ', numThreads, TEST_NAME)

  let workers = []
  let signerPath = require.resolve('./_FTS_workerWriter.js')
  signerPath = signerPath.replace(/\\/g, '/')
  // create threads
  for (let i = 0; i < numThreads; i++) {
    workers.push(new Worker({
      name: `signer${i}`,
      moduleName: signerPath
    }))
    console.log('Create worker ', i)
  }

  let i = 0
  workers.forEach(function (worker) {
    worker.postMessage({signal: 'start', thread: i, serverURL: serverURL})
    console.log('Worker ', i, 'started')
    i++
  })
  // wait for done
  workers.forEach(function (worker) {
    let workerMessage = worker.waitMessage(100000)
    assert.ok(workerMessage.signal !== 'error', workerMessage.message)
  })
}
