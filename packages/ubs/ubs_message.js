const UB = require('@unitybase/ub')
const Session = UB.Session
/* global ubs_message */
// eslint-disable-next-line camelcase
const me = ubs_message

me.entity.addMethod('getCached')
me.on('select:before', addUserFilters)

/**
 * If something changes in ubs_messages from a last call - return a messages.
 * @method getCached
 * @memberOf ubs_message_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @published
 * @param {ubMethodParams} ctx
 * @return {boolean}
 */
me.getCached = function (ctx) {
  if (ctx.mParams.version) {
    const expr = 'SELECT MAX(mi_modifyDate) AS "last_number" FROM ubs_message'
    const store = UB.DataStore('ubs_message')
    store.runSQL(expr, {})
    const versionFromDb = store.get('last_number')
    store.freeNative()
    const version = new Date(versionFromDb).getTime()
    const notModified = version === Number(ctx.mParams.version)
    ctx.mParams.version = version
    if (notModified) {
      ctx.mParams.resultData = { notModified: true }
      return true
    }
  }
  ctx.dataStore.run('select', ctx.mParams)
}

/**
 * Filter only complete(ready for send) up-to-date messages for logged in user
 * @private
 * @param {ubMethodParams} ctx
 * @return {boolean}
 */
function addUserFilters (ctx) {
  const nm = Date.now()
  const mParams = ctx.mParams
  if (!mParams.whereList) {
    mParams.whereList = {}
  }
  mParams.whereList['user' + nm] = {
    expression: '[recipients.userID]',
    condition: 'equal',
    value: Session.userID
  }
  mParams.whereList['complete' + nm] = {
    expression: '[complete]',
    condition: 'equal',
    value: 1
  }
  mParams.whereList['startDate' + nm] = {
    expression: '[startDate]',
    condition: 'less',
    value: new Date()
  }
  return true
}
