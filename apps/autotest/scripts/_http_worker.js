// worker for httpRequestMTGlobalCacheTest.js
const http = require('http')

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
  let request, resp
  const NUM_REQ = 100

  let t = Date.now()
  const startTime = t

  for(let i=0; i < 1/*NUM_REQ*/; i++) {
    request = http.request({
      //alternative to host/port/path is
      URL: 'https://unitybase.info/quote',
      //URL: 'http://localhost:8881/testTimeout',
      method: 'GET',
      sendTimeout: 30000, receiveTimeout: 30000,
      keepAlive: true,
      compressionEnable: true
    })

    resp = request.end()
    //console.log(resp.statusCode, resp.read())
  }
  const reqPerRequestT = Date.now() - t

  t = Date.now()
  for (let i=0; i < NUM_REQ; i++) {
    resp = request.end()
    //console.log(resp.statusCode, resp.read())
  }
  const reqReuseT = Date.now() - t
  console.log(`Request Per rq: ${reqPerRequestT}; reuse req: ${reqReuseT}`)

  postMessage({ signal: 'done', thread: message.thread, timeSpend: Date.now() - startTime })
  terminate()
}
