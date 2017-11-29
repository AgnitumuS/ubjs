const UBConnection = require('@unitybase/base').UBConnection

module.exports = {
  onmessage: onProcessWorker,
  onterminate: onTerminateWorker,
  onerror: onWorkerError
}

function onTerminateWorker () {
  postMessage({signal: 'terminated'})
}

function onWorkerError (message, exception) {
  postMessage({signal: 'error', message: exception + ' during handle message ' + message})
}

function onProcessWorker (message) {
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

  let result
  let startTime = Date.now()
  result = connection.query({
    entity: 'tst_pdfSign',
    method: 'doTest',
    threadNum: message.thread,
    location: 'Located in ' + message.thread
  })
  postMessage({signal: 'done', thread: message.thread, timeSpend: Date.now() - startTime, result: result})
  terminate()
}
