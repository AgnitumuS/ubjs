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
let workers = []

// we can't start server from worker thread try to start it here
const argv = require('@unitybase/base').argv
let session = argv.establishConnectionFromCmdLineAttributes()
let numThreads = parseInt(argv.findCmdLineSwitchValue('t') || '2', 10)
let i

try {
  console.log('start ', numThreads, 'thread')
    // create threads
// MPV -temporary disable multythread test while not fixed!

  for (i = 0; i < numThreads; i++) {
    workers.push(new Worker({
      name: 'ftsWriter' + i,
      onmessage: onProcessWorker,
      onterminate: onTerminateWorker,
      onerror: onWorkerError
    }))
    console.log('Create worker ', i)
  }
    // add reader thread
  workers.push(new Worker({
    name: 'ftsReader' + i,
    onmessage: onProcessReaderWorker,
    onterminate: onTerminateWorker,
    onerror: onWorkerError
  }))

   i = 0
  workers.forEach(function (worker) {
    worker.postMessage({signal: 'start', folder: __dirname, thread: i, beginFrom: i * 100 * 0, insertCount: 99})
    console.log('Worker ', i, 'started')
    i++
  })
    // wait for done
  workers.forEach(function (worker) {
    console.log(worker.waitMessage(100000))
  })
} finally {
  session.logout()
}

function onProcessReaderWorker (message) {
  var
    argv = require('@unitybase/base').argv,
    session,
    _conn, res,
    command, startTime

    // first of all we await for worker num
  command = message
  if (command.signal !== 'start') {
    throw new Error('Start phase. Wrong message ' + message)
  }

  session = argv.establishConnectionFromCmdLineAttributes()
  _conn = session.connection

  startTime = Date.now()
  try {
    console.debug('\tFTS read test')
    res = testReadFTS(_conn)
  } finally {
    if (session) session.logout()
  }
  postMessage({signal: res, thread: command.thread, timeSpend: Date.now() - startTime})
  terminate()

  function testReadFTS (connection) {
    var fs = require('fs'),
      path = require('path'),
      i, res

    for (i = command.beginFrom; i < command.beginFrom + command.insertCount; i++) {
      res = connection.run({
        entity: 'fts_ftsDefault',
        method: 'fts',
        fieldList: ['ID', 'entity', 'entitydescr', 'snippet'],
        whereList: {match: {condition: 'match', values: {'any': 'Україна'}}},
        options: {limit: 100, start: 0}
      })
      if (!res.resultData || !res.resultData.data || !res.resultData.data.length) {
        throw new Error('invalidReadSearch')
      }
    }
    return 'done'
  }
}
