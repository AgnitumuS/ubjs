const UB = require('@unitybase/ub')
const Session = UB.Session
/* global ubs_message */
// eslint-disable-next-line camelcase
let me = ubs_message

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
    const expr = 'SELECT MAX(mi_modifyDate) as last_number FROM ubs_message'
    let store = UB.DataStore('ubs_message')
    store.runSQL(expr, {})
    let version = store.get('last_number')
    store.freeNative()
    version = (new Date(version)).getTime()
    if (version === Number(ctx.mParams.version)) {
      ctx.mParams.resultData = {notModified: true}
      ctx.mParams.version = version
      return true
    } else {
      ctx.mParams.version = version
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
  let nm = (new Date()).getTime()
  if (!ctx.mParams.whereList) {
    ctx.mParams.whereList = {}
  }
  ctx.mParams.whereList['user' + nm] = {
    expression: '[recipients.userID]',
    condition: 'equal',
    values: {userID: Session.userID}
  }
  ctx.mParams.whereList['complete' + nm] = {
    expression: '[complete]',
    condition: 'equal',
    values: {complete: 1}
  }
  ctx.mParams.whereList['startDate' + nm] = {
    expression: '[startDate]',
    condition: 'less',
    values: {startDate: new Date()}
  }
  return true
}
