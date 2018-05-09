const GLOBAL_CACHE_INITIALIZED_ENTRY = 'UBQ.schedulersInitialized'
const Worker = require('@unitybase/base').Worker
const UB = require('@unitybase/ub')
const App = UB.App

if (!App.globalCacheGet(GLOBAL_CACHE_INITIALIZED_ENTRY)) {
  if (process.startupMode === 'CmdLine') {
    App.globalCachePut(GLOBAL_CACHE_INITIALIZED_ENTRY, 'yes')
    console.debug('SCHEDULER: disabled for command line startup')
  } else if (App.serverConfig.application.schedulers && (App.serverConfig.application.schedulers.enabled === false)) {
    App.globalCachePut(GLOBAL_CACHE_INITIALIZED_ENTRY, 'yes')
    console.warn('SCHEDULER: disabled in application config (application.schedulers.enabled === false)')
  } else {
    App.once('domainIsLoaded', startSchedulers)
  }
}

/**
 * Read a schedulers configuration, calculate a apiKeys for all users and
 * pass a config to worker thread for starting
 * @private
 */
function startSchedulers () {
  let cfgForWorker = []
  let usersApiKeys = {}

  if (App.globalCacheGet(GLOBAL_CACHE_INITIALIZED_ENTRY)) {
    console.debug('SCHEDULER: UBQ.initializeSchedulers already executed')
    return
  }

  App.globalCachePut(GLOBAL_CACHE_INITIALIZED_ENTRY, 'yes')
  console.debug('SCHEDULER: executing UBQ.initializeSchedulers')

  let store = UB.DataStore('uba_user')
  /** @type {Array<ubq_scheduler_ns>} */
  let schedulers = UB.Repository('ubq_scheduler').attrs('*').selectAsObject()
  for (let i = 0, l = schedulers.length; i < l; i++) {
    let /** @type {ubq_scheduler_ns} */ item = schedulers[i]
    if (item.schedulingCondition) {
      let canSchedule = false
      try {
        // eslint-disable-next-line no-eval
        canSchedule = eval(item.schedulingCondition)
      } catch (e) {
        console.error('SCHEDULER: Invalid scheduleCondition for item', item.name, 'Item DISABLED')
      }
      if (!canSchedule) {
        console.info('SCHEDULER: scheduleCondition for item', item.name, 'evaluated to false. Item DISABLED')
        continue
      }
    }
    if (!usersApiKeys.hasOwnProperty(item.runAs)) {
      store.runSQL('select uPasswordHashHexa from uba_user where name = :user: AND disabled=0', {user: item.runAs})
      if (!store.eof) {
        usersApiKeys[item.runAs] = store.get(0)
      }
    }
    if (!usersApiKeys[item.runAs]) {
      console.error('SCHEDULER: Task owner', item.runAs, 'not found in uba_user or it\'s apiKey are empty. Item', item.name, 'DISABLED')
      continue
    }
    cfgForWorker.push({
      name: item.name,
      cron: item.cron,
      command: item.command,
      module: item.module,
      singleton: item.singleton,
      runAs: item.runAs,
      apiKey: usersApiKeys[item.runAs],
      logSuccessful: item.logSuccessful
    })
  }

  let workerPath = require.resolve('./modules/schedulerWorker.js')
  workerPath = workerPath.replace(/\\/g, '/')
  let w = new Worker({
    name: 'Scheduler',
    moduleName: workerPath
  })

  // MPV: in case engine expire worked MUST remain alive,
  // so we can't terminate it here
  // TODO - think what to do
  // process.on('exit', function(){
  //    w.terminate();
  // });

  w.postMessage({serverURL: App.serverURL, config: cfgForWorker})
  console.debug('SCHEDULER: leave queueWorkerInitialization')
}
