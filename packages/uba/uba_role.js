/* global uba_role */
// eslint-disable-next-line camelcase
let me = uba_role
const UBA_COMMON = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const Session = UB.Session
const App = UB.App
/**
 * After inserting new user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let store = UB.DataStore('uba_audit')
  let actionUserRepo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
  let params = ctx.mParams.execParams
  store.run('insert', {
    execParams: {
      entity: 'uba_role',
      entityinfo_id: params.ID,
      actionType: 'INSERT',
      actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: params.name,
      toValue: JSON.stringify(params)
    }
  })
}
me.on('insert:after', ubaAuditNewRole)

/**
 * Set description = name in case it missing
 * @param {ubMethodParams} ctxt
 */
function fillRoleDescriptionIfMissing (ctxt) {
  let params = ctxt.mParams.execParams
  if (!params.description) {
    params.description = params.name
  }
}
me.on('insert:before', fillRoleDescriptionIfMissing)

/**
 * After updating user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let store = UB.DataStore('uba_audit')
  let actionUserRepo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
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
        actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
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
        actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
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
        actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetRole: oldName,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  }
}
me.on('update:after', ubaAuditModifyRole)

/**
 * After deleting user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let store = UB.DataStore('uba_audit')
  let actionUserRepo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
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

  store.run('insert', {
    execParams: {
      entity: 'uba_role',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: oldName,
      fromValue: oldValues
    }
  })
}
me.on('delete:after', ubaAuditDeleteRole)

/**
 * Prevent delete a build-in roles
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
me.on('delete:before', disableBuildInRoleDelete)
