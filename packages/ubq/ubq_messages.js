const { App, Session, DataStore, Repository } = require('@unitybase/ub')
const { uba_common, GC_KEYS } = require('@unitybase/base')
/* global ubq_messages */
// eslint-disable-next-line camelcase
const me = ubq_messages

const os = require('os')
const HOST_NAME = os.hostname() || 'unknown'

me.entity.addMethod('executeSchedulerTask')
me.entity.addMethod('addqueue')
me.entity.addMethod('success')

const statInst = DataStore('ubq_runstat')

/**
 * Mark queue task as successfully executed
 * @method success
 * @param {ubMethodParams} ctxt
 * @param {Number} ctxt.mParams.ID
 * @published
 * @memberOf ubq_messages_ns.prototype
 * @memberOfModule @unitybase/ubq
 */
me.success = function (ctxt) {
  ctxt.dataStore.execSQL('update ubq_messages set completeDate = :completeDate: where ID = :ID:', {
    completeDate: new Date(),
    ID: ctxt.mParams.ID
  })
  return true
}

const UBQ_STORE = DataStore('ubq_messages')
/**
 * Add item to queue.
 *
 * Used by server FTS mixin - do not remove
 * @method addqueue
 * @param {ubMethodParams} ctxt
 * @param {String} ctxt.mParams.queueCode Queue code to add a item to
 * @param {String} ctxt.mParams.msgCmd Command
 * @param {String} ctxt.mParams.msgData Additional command data
 * @param {Number} [ctxt.mParams.msgPriority=0] Priority
 * @published
 * @memberOf ubq_messages_ns.prototype
 * @memberOfModule @unitybase/ubq
 * @return {Boolean}
 */
me.addqueue = function (ctxt) {
  console.debug('JS: ubq_messages.addqueue')
  const mParams = ctxt.mParams
  const fMethod = 'insert'
  const fexecParams = {
    queueCode: mParams.queueCode,
    msgCmd: mParams.msgCmd,
    msgData: mParams.msgData
  }
  if (!mParams.msgPriority) {
    fexecParams.msgPriority = 0
  }

  const runobj = {
    entity: 'ubq_messages',
    method: fMethod,
    execParams: fexecParams
  }
  UBQ_STORE.run(fMethod, runobj)
  return true
}

/**
 * Take a `.` separated string and return a function it points to (starting from global)
 * Think about it as about safe eval
 * @private
 * @param {String} path
 * @return {Function|undefined}
 */
function getFnFromNS (path) {
  let root = global
  if (typeof path !== 'string') {
    return undefined
  }

  const parts = path.split('.')

  for (let j = 0, subLn = parts.length; j < subLn; j++) {
    const part = parts[j]

    if (root[part]) {
      root = root[part]
    } else {
      return undefined
    }
  }
  return typeof root === 'function' ? root : undefined
}

function runTask (task, taskName, entryPoint) {
  try {
    const runAsID = Number.isInteger(task.runAsID)
      ? task.runAsID
      : Repository('uba_user')
        .attrs('ID')
        .where('name', '=', task.runAs)
        .selectScalar()

    if (!runAsID) {
      console.warn('SCHEDULER: task %s, runAs user %s does not exist', taskName, task.runAs)
      return false
    }

    const logText = task.runAs === uba_common.USERS.ADMIN.NAME
      ? Session.runAsAdmin(entryPoint)
      : Session.runAsUser(runAsID, entryPoint)
    App.dbCommit()
    return { logText }
  } catch (e) {
    App.dbRollback()
    return { err: e.toString() }
  }
}

function runAndLogTask (task, schedulerName, entryPoint) {
  const statParams = {
    appName: HOST_NAME,
    schedulerName,
    startTime: new Date()
  }

  const { err, logText } = runTask(task, schedulerName, entryPoint)

  statParams.endTime = new Date()
  statParams.resultError = err ? 1 : 0
  if (statParams.resultError) {
    statParams.resultErrorMsg = err
  }
  if (logText) {
    statParams.logText = logText
  }

  if (task.logSuccessful || statParams.resultError) {
    statInst.run('insert', {
      execParams: statParams
    })
    App.dbCommit()
  }

  console.debug('SCHEDULER: end a task %j with result %j', task, statParams)
}

/**
 * REST endpoint for executing a scheduler task.
 * Queue worker will send the tasks in async mode to this endpoint according to a schedulers.
 * Endpoint wait a POST requests from a local IP with JSON in body:
 *
 *      {
 *        schedulerName: cfg.name, command: cfg.command, module: cfg.module,
 *        singleton: cfg.singleton !== false, logSuccessful: cfg.logSuccessful,
 *        runAsID: optional user ID for runAs
 *      }
 *
 * `command` must be a function name (may including namespace), for example `UB.UBQ.sendQueueMail` or `ubs_message_edit.notifyAllRecipients`
 * in case `command` not passed `module` must be a module what export default a function, for example module: '@unitybase/myModule/schedTask'
 * and in schedTask.js: `module exports = function() {...}`
 *
 * In case `singleton` parameter is missing or === false scheduler can run a multiple instances of the same task,
 * otherwise - if previous task with the same name not finished yet current task will not be executed
 *
 * - If command executed success, record with resultError===0 will be written to `ubq_runstat` entity.
 * - If command executed **with exception**, record with resultError===1 will be written to `ubq_runstat` entity,
 * Exception text will be written to `ubq_runstat.resultErrorMsg`.
 *
 * @method executeSchedulerTask
 * @param {null} nullCtxt
 * @param {THTTPRequest} req Name of a scheduler item
 * @param {THTTPResponse} resp Command to execute
 * @memberOf ubq_messages_ns.prototype
 * @memberOfModule @unitybase/ubq
 * @published
 * @return {Boolean}
 */
me.executeSchedulerTask = function executeSchedulerTask (nullCtxt, req, resp) {
  if ((Session.userID !== uba_common.USERS.ROOT.ID) || (App.localIPs.indexOf(Session.callerIP) === -1)) {
    throw new Error('SCHEDULER: remote or non root execution is not allowed')
  }

  const multitenancyConfig = App.serverConfig.security.multitenancy
  const multitenancyEnabled = multitenancyConfig && multitenancyConfig.enabled

  const task = JSON.parse(req.read())
  const taskName = task.schedulerName || 'unknownTask'
  const isSingleton = (task.singleton !== false)

  const GLOBAL_CACHE_KEY = `${GC_KEYS.UBQ_TASK_RUNNING_}${taskName}`
  if (isSingleton) {
    if (App.globalCacheGet(GLOBAL_CACHE_KEY) === '1') {
      console.warn('SCHEDULER: task %s is already running', taskName)
      return false
    }
    App.globalCachePut(GLOBAL_CACHE_KEY, '1')
  }

  try {
    console.debug('SCHEDULER: got a task %j', task)

    let entryPoint
    if (task.command) {
      entryPoint = getFnFromNS(task.command)
    } else if (task.module) {
      entryPoint = require(task.module)
    }
    if (!entryPoint) {
      console.error('SCHEDULER: invalid command: function %s not found', task.command || task.module)
      return false
    }

    if (multitenancyEnabled) {
      for (const { TID } of App.serverConfig.security.multitenancy.tenants) {
        console.log('SCHEDULER: task "%s", switch to tenant %d', taskName, TID)
        Session.setTempTenantID(TID)
        runAndLogTask(task, taskName, entryPoint)
      }
    } else {
      runAndLogTask(task, taskName, entryPoint)
    }

  } finally {
    if (isSingleton) {
      App.globalCachePut(GLOBAL_CACHE_KEY, '0')
    }
  }
  resp.statusCode = 200
  App.logout()
}
