/* global uba_session, _App */
// eslint-disable-next-line camelcase
const me = uba_session
const UB = require('@unitybase/ub')
const LocalDataStore = require('@unitybase/cs-shared').LocalDataStore

me.entity.addMethod('select')
me.entity.addMethod('delete')

/**
 * Read only access to server-side users sessions
 *
 * @method select
 * @memberOf uba_session_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @return {Boolean}
 */
me.select = function (ctx) {
  const sessionsFieldList = ['ID', 'userID', 'userName', 'remoteIP', 'isPasswordExpired', 'isLocked', 'serverTimeDelta', 'createdAt', 'accessedAt']
  ctx.dataStore.currentDataName = 'select'
  if (!_App.sessionsList) throw new UB.UBAbort('<<<Upgrade your UB server version >= 5.21>>>')
  const arrData = JSON.parse(_App.sessionsList())
  if (arrData[0] && arrData[0].length > sessionsFieldList.length) { // tenantID
    sessionsFieldList.push('tenantID')
  }
  const filteredData = LocalDataStore.doFilterAndSort({
    data: arrData,
    fields: sessionsFieldList,
    rowCount: arrData.length
  }, ctx.mParams)
  // return fields in order they are requested
  const requestedFieldList = ctx.mParams.fieldList
  const fieldMapping = []
  requestedFieldList.forEach(f => {
    fieldMapping.push({
      from: sessionsFieldList.indexOf(f),
      to: f
    })
  })
  ctx.dataStore.initialize(filteredData.resultData.data, fieldMapping)
  return true // everything is OK
}

/**
 * Delete user session (logout a specified session)
 *
 * @method delete
 * @memberOf uba_session_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 * @param {ubMethodParams} ctx
 * @param {object} ctx.mParams.execParams
 * @param {string} ctx.mParams.execParams.ID
 * @return {Boolean}
 */
me.delete = function (ctx) {
  const sessionID = ctx.mParams.execParams.ID
  if (!_App.sessionRemove) throw new UB.UBAbort('<<<Upgrade your UB server version >= 5.21>>>')
  _App.sessionRemove(sessionID)
  return true // everything is OK
}
