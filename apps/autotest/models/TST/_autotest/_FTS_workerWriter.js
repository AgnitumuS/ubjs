const UBConnection = require('@unitybase/base').UBConnection

module.exports = {
  onmessage: onProcessWorker,
  onterminate: onTerminateWorker,
  onerror: onWorkerError
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
    FILE_NAME = 'ConstitutionUkr.txt',
    folder,
    _conn,
    transLen, command, startTime

  if (message.signal !== 'start') {
    throw new Error('Worker module: Start phase. Wrong message ' + message)
  } else {
    console.log('Worker module: got a signal', JSON.stringify(message))
  }
  const serverURL = message['serverURL']
  let connection = new UBConnection(serverURL)
  connection.onRequestAuthParams = function () {
    return {authSchema: 'UB', login: 'admin', password: 'admin'}
  }

  // first of all we await for worker num
  command = message
  // postMessage('connected');
  folder = command.folder

  session = argv.establishConnectionFromCmdLineAttributes()
  _conn = session.connection
  transLen = parseInt(argv.findCmdLineSwitchValue('transLen') || '10', 10)

  startTime = Date.now()
  try {
    console.debug('\tFTS test')
    testFTS(_conn, folder)
  } finally {
    if (session) session.logout()
  }
  postMessage({signal: 'done', thread: command.thread, timeSpend: Date.now() - startTime})
  terminate()

  function testFTS (connection, folder) {
    const CRLF = String.fromCharCode(13) + String.fromCharCode(10)
    var fs = require('fs'),
      path = require('path'),
      testArr, trans = [], curTrLen,
      descrMaxLen = 2000,
      d = new Date(2015, 1, 1),
      i, n, descr;

    testArr = fs.readFileSync(path.join(folder, 'fixtures', FILE_NAME)).split(CRLF)
    curTrLen = 0
    for (i = command.beginFrom; i < command.beginFrom + command.insertCount; i++) {
      d.setDate(i % 30 + 1); d.setMonth(i % 11 + 1)
      descr = testArr[i].slice(0, descrMaxLen)
      trans.push({
        entity: 'tst_document',
        method: 'insert',
        execParams: {
          code: 'code' + ('000' + i).slice(-3),
          docDate: d,
          description: descr
        }
      })
      curTrLen++
      if (curTrLen = transLen || i === command.beginFrom + command.insertCount - 1) {
        connection.runList(trans); trans = []; curTrLen = 0
      }
    }
  }
}
