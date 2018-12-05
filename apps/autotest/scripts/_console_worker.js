module.exports = {
  onmessage: onMessage,
  onterminate: onTerminateWorker,
  onerror: onWorkerError
}

let myName = ''

function onTerminateWorker () {
  console.log(`Worker ${myName} terminated`)
  //postMessage('Worker terminated')
}

function onWorkerError (message, exception) {
  console.error('Worker exception: ' + exception + ' during handle message ' + message)
  postMessage('Worker exception: ' + exception + ' during handle message ' + message)
}

function onMessage (message) {
  if (message.cmd === 'setName') {
    myName = message.name
  } else if (message.cmd === 'terminate') {
    postMessage('Good by from ' + myName)
    //terminate()
  } else {
    if (myName === 'Worker#2') {
      console.info('Worker', myName, 'got a signal', JSON.stringify(message))
    } else {
      console.log('Worker', myName, 'got a signal', JSON.stringify(message))
    }
  }
}
