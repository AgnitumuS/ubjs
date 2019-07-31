/**
 * Will test Full text search engine in multithread mode.
 *
 * Unity base must be running in -c mode
 *
 * >ub ./0050_testFTS_Threads.js -cfg D:\projects\Autotest\ubConfig.json -app autotest -u admin -p admin  -t 5
 *
 * @author pavel.mash
 * @created 25.04.2015
 */
const Worker = require('@unitybase/base').Worker
const options = require('@unitybase/base').options
let workers = []

// we can't start server from worker thread try to start it here
const argv = require('@unitybase/base').argv
let session = argv.establishConnectionFromCmdLineAttributes()
let numThreads = parseInt(options.switchValue('t') || '2', 10)
const serverURL = argv.serverURLFromConfig(argv.getServerConfiguration())
const transLen = parseInt(options.switchValue('transLen') || '10', 10)
let i

try {
  console.log('Start ', numThreads, 'writer worker(s)')
  // create threads
  // MPV -temporary disable multi-thread test while not fixed!

  let writerPath = require.resolve('./_FTS_workerWriter.js')
  writerPath = writerPath.replace(/\\/g, '/')
  for (i = 0; i < numThreads; i++) {
    let writerName = 'ftsWriter' + i
    workers.push(new Worker({
      name: writerName,
      moduleName: writerPath
    }))
    console.log('Create worker', writerName)
  }

  // add reader thread
  let readerPath = require.resolve('./_FTS_workerReader.js')
  readerPath = readerPath.replace(/\\/g, '/')
  let readerName = 'ftsReader' + i
  workers.push(new Worker({
    name: readerName,
    moduleName: readerPath
  }))
  console.log('Create worker', readerName)

  i = 0
  workers.forEach(function (worker) {
    worker.postMessage({
      signal: 'start',
      folder: __dirname,
      thread: i,
      beginFrom: 0, // i * 100 * 0,
      insertCount: 99,
      serverURL: serverURL,
      transLen: transLen
    })
    console.log('Worker', worker.name, 'started')
    i++
  })
  // wait for done
  workers.forEach(function (worker) {
    console.log(worker.waitMessage(100000))
  })
} finally {
  session.logout()
}
