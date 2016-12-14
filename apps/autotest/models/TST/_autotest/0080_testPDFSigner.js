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
var Worker = require('worker')
var workers = []

var
  argv = require('@unitybase/base').argv,
  session = argv.establishConnectionFromCmdLineAttributes(),
  numThreads = parseInt(argv.findCmdLineSwitchValue('t') || '2', 10),
  i

try {
  console.log('start ', numThreads, 'thread')
    // create threads
  for (i = 0; i < numThreads; i++) {
    workers.push(new Worker({
      onmessage: onProcessWorker,
      onterminate: onTerminateWorker,
      onerror: onWorkerError
    }))
    console.log('Create worker ', i)
  }

  i = 0
  workers.forEach(function (worker) {
    worker.postMessage({signal: 'start', thread: i})
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

function onTerminateWorker () {
  postMessage('Worker terminated')
}

function onWorkerError (message, exception) {
  postMessage('Worker exception: ' + exception + ' during handle message ' + message)
}

function onProcessWorker (message) {
  var
    argv = require('@unitybase/base').argv,
    session,
    connection,
    result,
    startTime

  if (message.signal !== 'start') {
    throw new Error('Start phase. Wrong message ' + message)
  }

  session = argv.establishConnectionFromCmdLineAttributes()
  connection = session.connection
  startTime = Date.now()
  try {
    result = connection.run({
      entity: 'tst_pdfSign',
      method: 'doTest',
      threadNum: message.thread,
      location: 'Located in ' + message.thread
    })
  } finally {
    if (session) {
      session.logout()
    }
  }
  postMessage({signal: 'done', thread: message.thread, timeSpend: Date.now() - startTime, result: result})
  terminate()
}
