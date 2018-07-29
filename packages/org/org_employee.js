const _ = require('lodash')
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
/* global org_employee */
// eslint-disable-next-line camelcase
const me = org_employee

let ubaAuditPresent = App.domainInfo.has('uba_audit')
let auditStore
if (ubaAuditPresent) {
  auditStore = UB.DataStore('uba_audit')
}

me.on('update:after', updateCaptionAndLogToAudit)
me.on('insert:after', ubaAuditLinkUser)
me.on('delete:after', ubaAuditLinkUserDelete)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function updateCaptionAndLogToAudit (ctx) {
  updateStaffUnitCaption(ctx)
  ubaAuditLinkUserModify(ctx)
}

/**
 * Update org_staffunit.caption for all staff utits of current employee
 * @private
 * @param {ubMethodParams} ctxt
 */
function updateStaffUnitCaption (ctxt) {
  const execParams = ctxt.mParams.execParams
  // in case shortFIO on any language is modified
  let attrsForUpdate = Object.keys(execParams)
  let needUpdate = attrsForUpdate.find(attrName => attrName.startsWith('shortFIO'))
  if (!needUpdate) return
  // and employee is assigned to staff
  let myStaffs = UB.Repository('org_employeeonstaff')
    .attrs('staffUnitID')
    .where('[employeeID]', '=', execParams.ID)
    .select()
  if (myStaffs.rowCount === 0) return

  let updParams = {
    ['caption_' + App.defaultLang + '^']: ''
  }
  let staffUnitStore = UB.DataStore('org_staffunit')
  while (!myStaffs.eof) {
    updParams.ID = myStaffs.get(0)
    staffUnitStore.run('update', {
      caller: me.entity.name,
      execParams: updParams,
      __skipOptimisticLock: true
    })
    myStaffs.next()
  }
}

/**
 * After employee is linked to uba_user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditLinkUser (ctx) {
  if (!ubaAuditPresent) return

  const execParams = ctx.mParams.execParams
  if (!execParams.userID) return

  let userName = Session.uData.login
  let linkUserName = UB.Repository('uba_user').attrs('name')
    .where('[ID]', '=', execParams.userID)
    .selectScalar()

  auditStore.run('insert', {
    execParams: {
      entity: 'org_employee',
      entityinfo_id: execParams.ID,
      actionType: 'INSERT',
      actionUser: userName,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetUser: linkUserName || execParams.userID,
      toValue: JSON.stringify(execParams)
    }
  })
}

/**
 * After employee is reassigned to user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditLinkUserModify (ctx) {
  if (!ubaAuditPresent) return

  const params = ctx.mParams.execParams
  let actionUser
  let oldValues, linkUser

  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = JSON.parse(origStore.asJSONObject)
    oldValues = ((typeof oldValues === 'object') && (oldValues instanceof Array) && (oldValues.length > 0))
      ? oldValues[0]
      : oldValues
  } finally {
    origStore.currentDataName = origName
  }

  if (params.userID !== oldValues.userID) {
    actionUser = Session.uData.login
    if (oldValues.userID) {
      linkUser = UB.Repository('uba_user').attrs('name').where('[ID]', '=', oldValues.userID).select()
      auditStore.run('insert', {
        execParams: {
          entity: 'org_employee',
          entityinfo_id: params.ID,
          actionType: 'DELETE',
          actionUser: actionUser,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          targetUser: linkUser.eof ? oldValues.userID : linkUser.get('name'),
          fromValue: JSON.stringify(oldValues),
          toValue: JSON.stringify(params)
        }
      })
    }
    if (params.userID) {
      linkUser = UB.Repository('uba_user').attrs('name').where('[ID]', '=', params.userID).select()
      auditStore.run('insert', {
        execParams: {
          entity: 'org_employee',
          entityinfo_id: params.ID,
          actionType: 'INSERT',
          actionUser: actionUser,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          targetUser: linkUser.eof ? params.userID : linkUser.get('name'),
          fromValue: JSON.stringify(oldValues),
          toValue: JSON.stringify(params)
        }
      })
    }
  }
}

/**
 * After deleting user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditLinkUserDelete (ctx) {
  if (!ubaAuditPresent) return

  const params = ctx.mParams.execParams
  let oldValues, linkUser

  let origStore = ctx.dataStore
  let origName = origStore.currentDataName
  try {
    origStore.currentDataName = 'selectBeforeDelete'
    oldValues = JSON.parse(origStore.asJSONObject)
    oldValues = ((typeof oldValues === 'object') && (oldValues instanceof Array) && (oldValues.length > 0))
      ? oldValues[0]
      : oldValues
  } finally {
    origStore.currentDataName = origName
  }
  if (oldValues.userID) {
    let actionUser = Session.uData.login
    linkUser = UB.Repository('uba_user').attrs('name').where('[ID]', '=', oldValues.userID).select()
    auditStore.run('insert', {
      execParams: {
        entity: 'uba_user',
        entityinfo_id: params.ID,
        actionType: 'DELETE',
        actionUser: actionUser,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: linkUser.eof ? oldValues.userID : linkUser.get('name'),
        fromValue: JSON.stringify(oldValues)
      }
    })
  }
}
