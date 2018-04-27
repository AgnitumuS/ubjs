/* global uba_userrole */
// eslint-disable-next-line camelcase
const me = uba_userrole
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
const UBA_COMMON = require('@unitybase/base').uba_common

me.on('insert:before', UBA_COMMON.denyBuildInRoleAssignmentAndAdminsOnlyForAdmins)
me.on('update:before', UBA_COMMON.denyBuildInRoleAssignmentAndAdminsOnlyForAdmins)

/**
 * After inserting new user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let role = params.roleID
  let user = params.userID
  if (role) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  if (user) {
    let obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }

  let auditStore = UB.DataStore('uba_audit')
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'INSERT',
      actionUser: Session.uData.login || Session.userID,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetUser: user,
      targetRole: role,
      toValue: JSON.stringify(params)
    }
  })
}
me.on('insert:after', ubaAuditNewUserRole)

/**
 * After updating user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let actionUserRepo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  let roleNew = params.roleID
  let userNew = params.userID
  if (roleNew) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', roleNew).select()
    roleNew = obj.eof ? roleNew : obj.get('name')
  }
  if (userNew) {
    let obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', userNew).select()
    userNew = obj.eof ? userNew : obj.get('name')
  }

  let user, role, oldValues
  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.asJSONObject
    role = origStore.get('roleID')
    user = origStore.get('userID')
  } finally {
    origStore.currentDataName = origName
  }
  if (role) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  if (user) {
    let obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }
  let auditStore = UB.DataStore('uba_audit')
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: role,
      targetUser: user,
      fromValue: oldValues
    }
  })
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'INSERT',
      actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: roleNew || role,
      targetUser: userNew || user,
      fromValue: oldValues,
      toValue: JSON.stringify(params)
    }
  })
}
me.on('update:after', ubaAuditModifyUserRole)

me.on('delete:before', function (ctxt) {
  if (!App.domainInfo.has('uba_audit')) return
  let execParams = ctxt.mParams.execParams

  let store = UB.Repository('uba_userrole')
    .attrs(['userID', 'roleID'])
    .where('[ID]', '=', execParams.ID).select()
  ctxt.mParams.delUserID = store.get('userID')
  ctxt.mParams.delRoleID = store.get('roleID')
})

/**
 * After deleting user - log event to uba_audit
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  let params = ctx.mParams.execParams
  let actionUserRepo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()

  let role = ctx.mParams.delRoleID
  if (role) {
    let obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  let user = ctx.mParams.delUserID
  if (user) {
    let obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }

  let auditStore = UB.DataStore('uba_audit')
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: actionUserRepo.eof ? Session.userID : actionUserRepo.get('name'),
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: role,
      targetUser: user
    }
  })
}
me.on('delete:after', ubaAuditDeleteUserRole)
