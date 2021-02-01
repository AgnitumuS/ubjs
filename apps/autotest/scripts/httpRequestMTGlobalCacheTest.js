const options = require('@unitybase/base').options
const Worker = require('@unitybase/base').Worker

const numThreads = parseInt(options.switchValue('t') || '1', 10)
const workerModule = require.resolve('./_http_worker.js').replace(/\\/g, '/')

const workers = []

for (let i = 0; i < numThreads; i++) {
  const threadName = 'th' + i
  workers.push(new Worker({
    name: threadName,
    moduleName: workerModule
  }))
}

workers.forEach((w, i) => {
  w.postMessage({
    signal: 'start',
    thread: i
  })
  console.log('Worker', w.name, 'started')
})

workers.forEach(w => {
  console.log(w.waitMessage(100000))
})