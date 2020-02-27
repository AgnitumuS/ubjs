const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
const UBA_COMMON = require('@unitybase/base').uba_common
/* global uba_userrole */
// eslint-disable-next-line camelcase
const me = uba_userrole

me.on('insert:before', UBA_COMMON.denyBuildInRoleAssignmentAndAdminsOnlyForAdmins)
me.on('update:before', UBA_COMMON.denyBuildInRoleAssignmentAndAdminsOnlyForAdmins)
me.on('insert:after', ubaAuditNewUserRole)
me.on('update:after', ubaAuditModifyUserRole)
me.on('delete:after', ubaAuditDeleteUserRole)

/**
 * After inserting new user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams
  let role = params.roleID
  let user = params.userID
  if (role) {
    const obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  if (user) {
    const obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }

  const auditStore = UB.DataStore('uba_audit')
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

/**
 * After updating user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams
  const actionUser = Session.uData.login
  const origStore = ctx.dataStore
  const origName = origStore.currentDataName
  let roleNew = params.roleID
  let userNew = params.userID
  if (roleNew) {
    const obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', roleNew).select()
    roleNew = obj.eof ? roleNew : obj.get('name')
  }
  if (userNew) {
    const obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', userNew).select()
    userNew = obj.eof ? userNew : obj.get('name')
  }

  let user, role, oldValues
  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.getAsTextInObjectNotation()
    role = origStore.get('roleID')
    user = origStore.get('userID')
  } finally {
    origStore.currentDataName = origName
  }
  if (role) {
    const obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  if (user) {
    const obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }
  const auditStore = UB.DataStore('uba_audit')
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: actionUser,
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
      actionUser: actionUser,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: roleNew || role,
      targetUser: userNew || user,
      fromValue: oldValues,
      toValue: JSON.stringify(params)
    }
  })
}

me.on('delete:before', function (ctxt) {
  if (!App.domainInfo.has('uba_audit')) return
  const execParams = ctxt.mParams.execParams

  const store = UB.Repository('uba_userrole')
    .attrs(['userID', 'roleID'])
    .where('[ID]', '=', execParams.ID).select()
  ctxt.mParams.delUserID = store.get('userID')
  ctxt.mParams.delRoleID = store.get('roleID')
})

/**
 * After deleting user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteUserRole (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams

  let role = ctx.mParams.delRoleID
  if (role) {
    const obj = UB.Repository('uba_role').attrs('name').where('[ID]', '=', role).select()
    role = obj.eof ? role : obj.get('name')
  }
  let user = ctx.mParams.delUserID
  if (user) {
    const obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', user).select()
    user = obj.eof ? user : obj.get('name')
  }

  const auditStore = UB.DataStore('uba_audit')
  auditStore.run('insert', {
    execParams: {
      entity: 'uba_userrole',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetRole: role,
      targetUser: user
    }
  })
}
