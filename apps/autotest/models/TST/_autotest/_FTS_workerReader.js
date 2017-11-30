const UBConnection = require('@unitybase/base').UBConnection

module.exports = {
  onmessage: onProcessReaderWorker,
  onterminate: onTerminateWorker,
  onerror: onWorkerError
}

function onTerminateWorker () {
  postMessage('Worker terminated')
}

function onWorkerError (message, exception) {
  postMessage('Worker exception: ' + exception + ' during handle message ' + message)
}

function onProcessReaderWorker (message) {
  // first of all we await for worker num
  let command = message
  if (message.signal !== 'start') {
    throw new Error('Worker module: Start phase. Wrong message ' + message)
  } else {
    console.log('Worker module: got a signal', JSON.stringify(message))
  }
  const serverURL = message['serverURL']
  let _conn = new UBConnection(serverURL)
  _conn.onRequestAuthParams = function () {
    return {authSchema: 'UB', login: 'admin', password: 'admin'}
  }

  let startTime = Date.now()
  console.debug('\tFTS read test')
  let res = testReadFTS(_conn)

  postMessage({signal: res, thread: command.thread, timeSpend: Date.now() - startTime})
  terminate()

  function testReadFTS (connection) {
    for (let i = command.beginFrom; i < command.beginFrom + command.insertCount; i++) {
      let res = connection.run({
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
