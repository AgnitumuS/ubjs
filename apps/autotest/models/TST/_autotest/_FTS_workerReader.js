/* global postMessage, terminate */
const SyncConnection = require('@unitybase/base').SyncConnection

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
  const command = message
  if (message.signal !== 'start') {
    throw new Error('Worker module: Start phase. Wrong message ' + message)
  } else {
    console.log('Worker module: got a signal', JSON.stringify(message))
  }
  const serverURL = message.serverURL
  const _conn = new SyncConnection(serverURL)
  _conn.onRequestAuthParams = function () {
    return { authSchema: 'UB', login: 'admin', password: 'admin' }
  }

  const startTime = Date.now()
  console.debug('\tFTS read test')
  const res = testReadFTS(_conn)

  postMessage({ signal: res, thread: command.thread, timeSpend: Date.now() - startTime })
  terminate()

  function testReadFTS (connection) {
    for (let i = command.beginFrom; i < command.beginFrom + command.insertCount; i++) {
      const readRes = connection.run({
        entity: 'fts_ftsDefault',
        method: 'fts',
        fieldList: ['ID', 'entity', 'entitydescr', 'snippet'],
        whereList: { match: { condition: 'match', value: 'Україна' } },
        options: { limit: 100, start: 0 }
      })
      if (!readRes.resultData || !readRes.resultData.data || !readRes.resultData.data.length) {
        throw new Error('invalidReadSearch')
      } else {
        console.log(`Read ${readRes.resultData.data.length} rows from FTS`)
      }
    }
    return 'done'
  }
}
