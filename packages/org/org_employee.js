/* global org_employee */
// eslint-disable-next-line camelcase
const me = org_employee
const { App, Session, Repository, DataStore } = require('@unitybase/ub')

const ubaAuditPresent = App.domainInfo.has('uba_audit')
let auditStore
if (ubaAuditPresent) {
  auditStore = DataStore('uba_audit')
}

me.on('update:after', updateCaptionAndLogToAudit)
me.on('insert:after', ubaAuditLinkUser)
me.on('delete:before', removeLinkToUser)
me.on('delete:after', ubaAuditLinkUserDelete)

global.uba_user.on('update:after', updateEmployeeAttributes)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function updateCaptionAndLogToAudit (ctx) {
  updateStaffUnitCaption(ctx)
  ubaAuditLinkUserModify(ctx)
  updateUserAttributes(ctx, true)
}

/**
 * Update name and title of employee
 * @private
 * @param {ubMethodParams} ctx
 * @param {boolean} [ctx.mParams.__syncEmployee]
 */
function updateEmployeeAttributes (ctx) {
  if (ctx.mParams.__syncEmployee === false) {
    // Ability to explicitly skip the synchronization of employee
    return
  }

  let { fullName, firstName, middleName, lastName, title, avatar } = ctx.mParams.execParams
  if (
    fullName === undefined &&
    firstName === undefined &&
    lastName === undefined &&
    middleName === undefined &&
    title === undefined &&
    avatar === undefined &&
    !ctx.mParams.__syncEmployee
  ) {
    // No name-related attributes updated, do not touch employee in such a case
    return
  }

  // If any of "fullName", "firstName", "middleName", "lastName", "avatar" or "title"
  // attributes not provided in execParams, get previous values from "selectBeforeUpdate" dataset
  const oldCurrentDataName = ctx.dataStore.currentDataName
  ctx.dataStore.currentDataName = 'selectBeforeUpdate'
  try {
    if (fullName === undefined) fullName = ctx.dataStore.get('fullName')
    if (firstName === undefined) firstName = ctx.dataStore.get('firstName')
    if (lastName === undefined) lastName = ctx.dataStore.get('lastName')
    if (middleName === undefined) middleName = ctx.dataStore.get('middleName')
    if (title === undefined) title = ctx.dataStore.get('title')
    if (avatar === undefined) avatar = ctx.dataStore.get('avatar')
  } finally {
    ctx.dataStore.currentDataName = oldCurrentDataName
  }

  const employee = Repository('org_employee')
    .attrs('ID', 'firstName', 'middleName', 'lastName', 'fullFIO', 'apply', 'avatar')
    .where('userID', '=', ctx.mParams.execParams.ID)
    .selectSingle({
      fullFIO: 'fullName',
      apply: 'title'
    })

  if (!employee) {
    // No employee to sync
    return
  }

  let skipAvatarUpdate
  if (avatar && employee.avatar) {
    if (JSON.parse(avatar).md5 === JSON.parse(employee.avatar).md5) {
      // avatars are identical, do not update employee avatar
      skipAvatarUpdate = true
    }
  }

  if (firstName === employee.firstName &&
    lastName === employee.lastName &&
    middleName === employee.middleName &&
    fullName === employee.fullName &&
    title === employee.title && skipAvatarUpdate
  ) {
    // No changes to employee name, do not touch it
    return
  }

  let tempAvatar
  if (avatar) {
    const fileExtension = JSON.parse(avatar).origName.split('.').pop()

    const avatarData = App.blobStores.getContent({
      entity: 'uba_user',
      attribute: 'avatar',
      ID: ctx.mParams.execParams.ID
    })

    tempAvatar = App.blobStores.putContent({
      entity: 'org_employee',
      attribute: 'avatar',
      ID: employee.ID,
      fileName: `employee-avatar-${employee.ID}.${fileExtension}`
    }, avatarData)
  }

  console.log('Sync employee attributes with user')
  const execParams = {
    ID: employee.ID,
    firstName,
    lastName,
    middleName,
    apply: title,
    fullFIO: fullName
  }
  if (tempAvatar) {
    execParams.avatar = JSON.stringify(tempAvatar)
  }
  DataStore('org_employee').run('update', {
    execParams,
    __skipOptimisticLock: true,
    __syncUser: false
  })
}

/**
 * Update uba_user attributes for all users of current employee
 * @private
 * @param {ubMethodParams} ctx
 * @param {boolean} [ctx.mParams.__syncUser]
 * @param {boolean} allowSelectBeforeUpdate
 *   Allow get properties missing in execParams from 'selectBeforeUpdate'
 *   data store.  Pass "true" for update method and "false" for insert method.
 */
function updateUserAttributes (ctx, allowSelectBeforeUpdate) {
  if (ctx.mParams.__syncUser === false) {
    // Ability to explicitly skip the synchronization of user
    return
  }

  // set main attribute value from localised if it's empty
  const currentLang = Session.userLang
  const multiLangAttributes = ['firstName', 'middleName', 'lastName', 'apply']
  const inExecParams = ctx.mParams.execParams
  for (const attribute of multiLangAttributes) {
    const userLangAttributeName = `${attribute}_${currentLang}^`
    if (!inExecParams[attribute] && inExecParams[userLangAttributeName]) {
      inExecParams[attribute] = inExecParams[userLangAttributeName]
    }
  }

  let { ID, fullFIO, firstName, middleName, lastName, userID, apply, avatar } = inExecParams

  if (
    fullFIO === undefined &&
    firstName === undefined &&
    lastName === undefined &&
    middleName === undefined &&
    apply === undefined &&
    avatar === undefined &&
    !ctx.mParams.__syncUser
  ) {
    // No target attributes updated, do not touch user in such a case
    return
  }

  if (allowSelectBeforeUpdate) {
    // If any of "userID", "apply", "avatar", "fullFIO", "firstName" or "lastName" attributes not provided in execParams,
    // get previous values from "selectBeforeUpdate" dataset
    const oldCurrentDataName = ctx.dataStore.currentDataName
    ctx.dataStore.currentDataName = 'selectBeforeUpdate'
    try {
      if (userID === undefined) userID = ctx.dataStore.get('userID')
      if (fullFIO === undefined) fullFIO = ctx.dataStore.get('fullFIO')
      if (firstName === undefined) firstName = ctx.dataStore.get('firstName')
      if (middleName === undefined) middleName = ctx.dataStore.get('middleName')
      if (lastName === undefined) lastName = ctx.dataStore.get('lastName')
      if (apply === undefined) apply = ctx.dataStore.get('apply')
    } finally {
      ctx.dataStore.currentDataName = oldCurrentDataName
    }
  }

  let tempAvatar
  if (avatar) {
    const fileExtension = JSON.parse(avatar).origName.split('.').pop()

    const avatarData = App.blobStores.getContent({
      entity: 'org_employee',
      attribute: 'avatar',
      ID
    })

    tempAvatar = App.blobStores.putContent({
      entity: 'uba_user',
      attribute: 'avatar',
      ID: userID,
      fileName: `user-avatar-${userID}.${fileExtension}`
    }, avatarData)
  }

  if (!userID) { // can be undefined or null
    // No userID, this possible if staff unit is not assigned to uba_user
    return
  }

  console.log('Sync user attributes with employee')
  const userStore = DataStore('uba_user')
  const execParams = {
    ID: userID,
    fullName: fullFIO,
    title: apply,
    firstName,
    middleName,
    lastName
  }
  if (tempAvatar) {
    execParams.avatar = JSON.stringify(tempAvatar)
  }
  userStore.run('update', {
    execParams,
    __skipOptimisticLock: true,
    __syncEmployee: false
  })
}

/**
 * Update org_staffunit.caption for all staff units of current employee
 * @private
 * @param {ubMethodParams} ctxt
 */
function updateStaffUnitCaption (ctxt) {
  const execParams = ctxt.mParams.execParams
  // in case shortFIO on any language is modified
  const attrsForUpdate = Object.keys(execParams)
  const needUpdate = attrsForUpdate.find(attrName => attrName.startsWith('shortFIO'))
  if (!needUpdate) return
  // and employee is assigned to staff
  const myStaffs = Repository('org_employeeonstaff')
    .attrs('staffUnitID')
    .where('[employeeID]', '=', execParams.ID)
    .select()
  if (myStaffs.rowCount === 0) return

  const updParams = {
    ['caption_' + App.defaultLang + '^']: ''
  }
  const staffUnitStore = DataStore('org_staffunit')
  while (!myStaffs.eof) {
    const staffID = myStaffs.get(0)
    const currentRow = Repository('org_staffunit').attrs(['ID']).selectById(staffID)
    if (currentRow) {
      updParams.ID = staffID
      staffUnitStore.run('update', {
        caller: me.entity.name,
        execParams: updParams,
        __skipOptimisticLock: true
      })
    }
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

  const userName = Session.uData.login
  const linkUserName = Repository('uba_user').attrs('name')
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
  updateUserAttributes(ctx, false)
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

  const origStore = ctx.dataStore
  const origName = origStore.currentDataName
  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.getAsJsObject()
    oldValues = ((typeof oldValues === 'object') && (oldValues instanceof Array) && (oldValues.length > 0))
      ? oldValues[0]
      : oldValues
  } finally {
    origStore.currentDataName = origName
  }

  if (params.userID !== oldValues.userID) {
    actionUser = Session.uData.login
    if (oldValues.userID) {
      linkUser = Repository('uba_user').attrs('name').where('[ID]', '=', oldValues.userID).select()
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
      linkUser = Repository('uba_user').attrs('name').where('[ID]', '=', params.userID).select()
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

  const origStore = ctx.dataStore
  const origName = origStore.currentDataName
  try {
    origStore.currentDataName = 'selectBeforeDelete'
    oldValues = origStore.getAsJsObject()
    oldValues = ((typeof oldValues === 'object') && (oldValues instanceof Array) && (oldValues.length > 0))
      ? oldValues[0]
      : oldValues
  } finally {
    origStore.currentDataName = origName
  }
  if (oldValues.userID) {
    const actionUser = Session.uData.login
    linkUser = Repository('uba_user').attrs('name').where('[ID]', '=', oldValues.userID).select()
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

/**
 * Remove link to uba_user entity before delete
 * to prevent reference error on deleting linked user
 *
 * @param {ubMethodParams} ctx
 */
function removeLinkToUser (ctx) {
  const params = ctx.mParams.execParams
  const { ID } = params
  const store = DataStore('org_employee')
  store.run('update', {
    execParams: {
      ID,
      mi_modifyDate: new Date(),
      userID: null
    },
    __skipOptimisticLock: true
  })
}
