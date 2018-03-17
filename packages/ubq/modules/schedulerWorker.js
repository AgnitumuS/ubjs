const UBConnection = require('@unitybase/base').UBConnection
const cron = require('node-cron')
/**
 * The Worker function. Function body is evaluated in the worker thread, so
 * reference from this function to anything from a module is NOT ALLOWED
 */
function runSchedulersCircle (message) {
  // boilerplate to stop debugger inside Worker
  // put breakpoint on line  let p = 0 and change a value of i to 2 in debugger to go forward
  /* let i = 1
  while (i===1) {
    let p = 0
  }
  */
  const serverURL = message.serverURL
  const config = message.config
  let jobs = []

  function safeSendAsyncRequest (cfgIdx) {
    try {
      let conn = new UBConnection(serverURL)
      let cfg = config[cfgIdx]
      conn.onRequestAuthParams = function () {
        return {authSchema: 'UB', login: cfg.runAs, apiKey: cfg.apiKey}
      }
      console.log('SCHEDULER: Job', cfg.name, 'started at', new Date())
      console.debug('Job defined as:', cfg)
      conn.xhr({
        endpoint: 'rest/ubq_messages/executeSchedulerTask',
        method: 'POST',
        URLParams: {async: true},
        data: {schedulerName: cfg.name, command: cfg.command, module: cfg.module, singleton: cfg.singleton === 1, logSuccessful: cfg.logSuccessful === 1}
      })
    } catch (e) {
      console.error(e)
    }
  }

  function cronJobStopped (cfgIdx) {
    console.log('SCHEDULER: Job', config[cfgIdx].name, 'stopped')
  }

  console.debug('SCHEDULER: start initializeSchedulers..')

  console.debug('SCHEDULER: Got a init config %j', config)
  for (let i = 0, l = config.length; i < l; i++) {
    console.debug('SCHEDULER: add a job for', config[i].name, 'scheduled as', config[i].cron)
    let job = cron.schedule(
      config[i].cron,
      safeSendAsyncRequest.bind(null, i),
      // OBSOLETE cronJobStopped.bind(null, i),
      true /* Start the job right now */
      // OBSOLETE '' /* local timezone */
    )
    jobs.push(job)
  }
  global._timerLoop.setTimeoutWithPriority(
    function () {
      console.log('SCHEDULER: end timer loop')
      terminate()
    },
    0,
    1000
  )
}

function onWorkerError (message, exception) {
  console.error('SCHEDULER: ', message, exception)
}

module.exports = {
  onmessage: runSchedulersCircle,
  onerror: onWorkerError
}
