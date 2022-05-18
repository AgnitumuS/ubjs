const { Worker, GC_KEYS } = require('@unitybase/base')
const UB = require('@unitybase/ub')
const App = UB.App

if (!process.rootOTP) throw new Error('This version of @unitybase/ubq require version of UB server to be >= 5.6.1')

if (!App.globalCacheGet(GC_KEYS.UBQ_SCHEDULER_INITIALIZED)) {
  if (process.startupMode === 'CmdLine') {
    App.globalCachePut(GC_KEYS.UBQ_SCHEDULER_INITIALIZED, 'yes')
    console.debug('SCHEDULER: disabled for command line startup')
  } else if (App.serverConfig.application.schedulers && (App.serverConfig.application.schedulers.enabled === false)) {
    App.globalCachePut(GC_KEYS.UBQ_SCHEDULER_INITIALIZED, 'yes')
    console.warn('SCHEDULER: disabled (application.schedulers.enabled === false)')
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
  const cfgForWorker = []
  const usersIDs = {}

  if (App.globalCacheGet(GC_KEYS.UBQ_SCHEDULER_INITIALIZED)) {
    console.debug('SCHEDULER: UBQ.initializeSchedulers already executed')
    return
  }

  App.globalCachePut(GC_KEYS.UBQ_SCHEDULER_INITIALIZED, 'yes')
  console.debug('SCHEDULER: executing UBQ.initializeSchedulers')

  const multitenancyConfig = App.serverConfig.security.multitenancy
  const multitenancyEnabled = multitenancyConfig && multitenancyConfig.enabled

  /** @type {Array<ubq_scheduler_ns>} */
  const schedulers = UB.Repository('ubq_scheduler').attrs('*').selectAsObject()
  for (let i = 0, l = schedulers.length; i < l; i++) {
    const /** @type {ubq_scheduler_ns} */ item = schedulers[i]
    if (item.schedulingCondition) {
      let canSchedule = false
      try {
        // eslint-disable-next-line no-eval
        canSchedule = eval(item.schedulingCondition)
      } catch (e) {
        console.error('SCHEDULER: Invalid expression in scheduleCondition for item', item.name, 'Item DISABLED')
      }
      if (!canSchedule) {
        console.info('SCHEDULER: scheduleCondition for item', item.name, 'evaluated to false. Item DISABLED')
        continue
      }
    }

    const workerItem = {
      name: item.name,
      cron: item.cron,
      command: item.command,
      module: item.module,
      singleton: item.singleton,
      runAs: item.runAs,
      logSuccessful: item.logSuccessful
    }
    if (!multitenancyEnabled) {
      // Skip setting "runAsID" for multitenant environments, because ID is different in every tenant
      if (!usersIDs.hasOwnProperty(item.runAs)) {
        const uID = UB.Repository('uba_user')
          .attrs('ID')
          .where('name', '=', item.runAs)
          .selectScalar()
        if (uID) {
          usersIDs[item.runAs] = uID
        }
      }
      if (!usersIDs[item.runAs]) {
        console.error('SCHEDULER: Task owner', item.runAs, 'not found in uba_user. Item', item.name, 'DISABLED')
        continue
      }
      workerItem.runAsID = usersIDs[item.runAs]
    }
    cfgForWorker.push(workerItem)
  }

  let workerPath = require.resolve('./modules/schedulerWorker.js')
  workerPath = workerPath.replace(/\\/g, '/')
  const w = new Worker({
    name: 'Scheduler',
    moduleName: workerPath
  })

  // MPV: in case engine expire worked MUST remain alive,
  // so we can't terminate it here
  // TODO - think what to do
  // process.on('exit', function(){
  //    w.terminate();
  // });

  w.postMessage({ serverURL: App.serverURL, config: cfgForWorker })
  console.debug('SCHEDULER: leave queueWorkerInitialization')
}
