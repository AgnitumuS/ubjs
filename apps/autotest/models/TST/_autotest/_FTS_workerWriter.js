const UBConnection = require('@unitybase/base').UBConnection
const fs = require('fs')
const path = require('path')

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
  const FILE_NAME = 'ConstitutionUkr.txt'

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
  let command = message
  // postMessage('connected');
  let folder = command.folder

  let transLen = message.transLen

  let startTime = Date.now()
  console.debug('\tFTS test')
  testFTS(connection, folder)
  postMessage({signal: 'done', thread: command.thread, timeSpend: Date.now() - startTime})
  terminate()

  function testFTS (connection, folder) {
    const CRLF = String.fromCharCode(13) + String.fromCharCode(10)
    const descrMaxLen = 2000
    let trans = []
    let d = new Date(2015, 1, 1)

    let testArr = fs.readFileSync(path.join(folder, 'fixtures', FILE_NAME)).split(CRLF)
    let curTrLen = 0
    for (let i = command.beginFrom; i < command.beginFrom + command.insertCount; i++) {
      d.setDate(i % 30 + 1); d.setMonth(i % 11 + 1)
      let description = testArr[i].slice(0, descrMaxLen)
      trans.push({
        entity: 'tst_document',
        method: 'insert',
        execParams: {
          code: 'code' + ('000' + i).slice(-3),
          docDate: d,
          description: description
        }
      })
      curTrLen++
      if (curTrLen === transLen || i === command.beginFrom + command.insertCount - 1) {
        connection.runList(trans); trans = []; curTrLen = 0
      }
    }
  }
}
