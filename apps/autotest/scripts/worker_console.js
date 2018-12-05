const Worker = require('@unitybase/base').Worker
const options = require('@unitybase/base').options

let workerModulePath = require.resolve('./_console_worker.js')
workerModulePath = workerModulePath.replace(/\\/g, '/')

let name = 'consoleWorker'
let worker = new Worker({
  name: name,
  moduleName: workerModulePath
})
console.log('Create worker', name)
worker.postMessage({
  cmd: 'setName',
  name: 'Worker#1'
})

name = 'consoleWorker2'
let worker2 = new Worker({
  name: name,
  moduleName: workerModulePath
})
console.log('Create worker', name)
worker2.postMessage({
  cmd: 'setName',
  name: 'Worker#2'
})

//for (let i = 0; i < 100; i++) {
  worker.postMessage({
    message: 'msg to Worker1'
  })

  worker2.postMessage({
    message: 'msg to Worker2'
  })
  sleep(1)
//}

worker2.postMessage({
  cmd: 'terminate'
})
worker.postMessage({
  cmd: 'terminate'
})
let msg = worker.waitMessage(100)
console.log('Message from Worker1', msg)

worker.terminate()

msg = worker2.waitMessage(100000)
console.log('Message from Worker2', msg)
