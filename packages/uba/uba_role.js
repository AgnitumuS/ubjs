const UBA_COMMON = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const Session = UB.Session
const App = UB.App
/* global uba_role */
// eslint-disable-next-line camelcase
let me = uba_role
me.on('insert:before', fillRoleDescriptionIfMissing)
me.on('insert:after', ubaAuditNewRole)
me.on('update:after', ubaAuditModifyRole)
me.on('delete:before', disableBuildInRoleDelete)
me.on('delete:after', ubaAuditDeleteRole)

/**
 * After inserting new user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let store = UB.DataStore('uba_audit')
  let params = ctx.mParams.execParams
  store.run('insert', {
    execParams: {
      entity: 'uba_role',
      entityinfo_id: params.ID,
      actionType: 'INSERT',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: params.name,
      toValue: JSON.stringify(params)
    }
  })
}

/**
 * Set description = name in case it missing
 * @private
 * @param {ubMethodParams} ctxt
 */
function fillRoleDescriptionIfMissing (ctxt) {
  let params = ctxt.mParams.execParams
  if (!params.description) {
    params.description = params.name
  }
}

/**
 * After updating user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let store = UB.DataStore('uba_audit')
  let actionUser = Session.uData.login
  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  let oldValues, oldName

  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.asJSONObject
    oldName = origStore.get('name')
  } finally {
    origStore.currentDataName = origName
  }

  if (params.name) {
    store.run('insert', {
      execParams: {
        entity: 'uba_role',
        entityinfo_id: params.ID,
        actionType: 'DELETE',
        actionUser: actionUser,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: oldName,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
    store.run('insert', {
      execParams: {
        entity: 'uba_role',
        entityinfo_id: params.ID,
        actionType: 'INSERT',
        actionUser: actionUser,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: params.name,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  } else {
    store.run('insert', {
      execParams: {
        entity: 'uba_role',
        entityinfo_id: params.ID,
        actionType: 'UPDATE',
        actionUser: actionUser,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: oldName,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  }
}

/**
 * After deleting user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  let oldValues, oldName

  try {
    origStore.currentDataName = 'selectBeforeDelete'
    oldValues = origStore.asJSONObject
    oldName = origStore.get('name')
  } finally {
    origStore.currentDataName = origName
  }

  let store = UB.DataStore('uba_audit')
  store.run('insert', {
    execParams: {
      entity: 'uba_role',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: oldName,
      fromValue: oldValues
    }
  })
}

/**
 * Prevent delete a build-in roles
 * @private
 * @param {ubMethodParams} ctx
 */
function disableBuildInRoleDelete (ctx) {
  let ID = ctx.mParams.execParams.ID

  for (let role in UBA_COMMON.ROLES) {
    if (UBA_COMMON.ROLES[role].ID === ID) {
      throw new UB.UBAbort('<<<Removing of built-in role is prohibited>>>')
    }
  }
}
