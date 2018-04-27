const UB = require('@unitybase/ub')
const Session = UB.Session
const App = UB.App
/* global uba_els */
// eslint-disable-next-line camelcase
let me = uba_els

/**
 * After inserting new user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewEls (ctx) {
  if (!App.domainInfo.has('uba_audit')) {
    return
  }
  let params = ctx.mParams.execParams
  let ruleRole = params.ruleRole
  if (ruleRole) {
    ruleRole = UB.Repository('uba_role').attrs('name').where('[ID]', '=', ruleRole).select()
    ruleRole = ruleRole.eof ? params.ruleRole : ruleRole.get('name')
  }
  let store = UB.DataStore('uba_audit')
  store.run('insert', {
    execParams: {
      entity: 'uba_els',
      entityinfo_id: params.ID,
      actionType: 'INSERT',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: ruleRole,
      toValue: JSON.stringify(params)
    }
  })
}
me.on('insert:after', ubaAuditNewEls)

/**
 * After updating user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyEls (ctx) {
  if (!App.domainInfo.has('uba_audit')) {
    return
  }
  let params = ctx.mParams.execParams
  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  let ruleRoleNew = params.ruleRole
  if (ruleRoleNew) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', ruleRoleNew).select()
    ruleRoleNew = obj.eof ? ruleRoleNew : obj.get('name')
  }

  let oldValues, ruleRole
  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.asJSONObject
    ruleRole = origStore.get('ruleRole')
  } finally {
    origStore.currentDataName = origName
  }
  if (ruleRole && params.ruleRole !== ruleRole) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', ruleRole).select()
    ruleRole = obj.eof ? ruleRole : obj.get('name')
  } else {
    ruleRole = null
  }

  let store = UB.DataStore('uba_audit')
  if (ruleRole && ruleRoleNew !== ruleRole) {
    store.run('insert', {
      execParams: {
        entity: 'uba_els',
        entityinfo_id: params.ID || oldValues.ID,
        actionType: 'DELETE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: ruleRole,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
    store.run('insert', {
      execParams: {
        entity: 'uba_els',
        entityinfo_id: params.ID || oldValues.ID,
        actionType: 'INSERT',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: ruleRoleNew,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  } else {
    store.run('insert', {
      execParams: {
        entity: 'uba_els',
        entityinfo_id: params.ID || oldValues.ID,
        actionType: 'UPDATE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: ruleRole || ruleRoleNew,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  }
}
me.on('update:after', ubaAuditModifyEls)

/**
 * After deleting user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteEls (ctx) {
  if (!App.domainInfo.has('uba_audit')) {
    return
  }
  let params = ctx.mParams.execParams
  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  let oldValues, ruleRole, ruleRoleObj

  try {
    origStore.currentDataName = 'selectBeforeDelete'
    oldValues = origStore.asJSONObject
    ruleRole = origStore.get('ruleRole')
  } finally {
    origStore.currentDataName = origName
  }
  if (ruleRole) {
    ruleRoleObj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', ruleRole).select()
    ruleRole = ruleRoleObj.eof ? ruleRole : ruleRoleObj.get('name')
  }
  let store = UB.DataStore('uba_audit')
  store.run('insert', {
    execParams: {
      entity: 'uba_els',
      entityinfo_id: params.ID || oldValues.ID,
      actionType: 'DELETE',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: ruleRole,
      fromValue: oldValues
    }
  })
}
me.on('delete:after', ubaAuditDeleteEls)
