/* eslint-disable curly */
const UB = require('@unitybase/ub')
const App = UB.App
const queryString = require('querystring')
const Session = UB.Session
const UBA_COMMON = require('./modules/uba_common')

Session.on('login', onUserLogin)
Session.on('loginFailed', onUserLoginFailed)
Session.on('securityViolation', securityViolation)

let ubaAuditPresent = App.domainInfo.has('uba_audit')
let auditStore
if (ubaAuditPresent) {
  auditStore = UB.DataStore('uba_audit')
}

/**
 * Checking of user IP and device fingerpriont based on settings from `uba_advSecurity`
 * @private
 * @param {THTTPRequest} req
 * @return {{enabled: false}|{enabled: true, kmn: string, fpa: string}}
 */
function checkAdvancedSecurity (req) {
  let advData
  try {
    advData = UB.Repository('uba_advSecurity')
      .attrs(['ID', 'allowedIP', 'refreshIP', 'fp', 'refreshFp', 'keyMediaName', 'refreshKeyMedia', 'mi_modifyDate'])
      .where('[userID]', '=', Session.userID)
      .selectAsObject()[ 0 ]
  } catch (e) {
    // nothing to do - table uba_advSecurity not exists
    console.warn('Advanced security is disabled because table uba_advSecurity does not exists')
    doCheckAdvancedSecurity = function () { return {enabled: false} }
  }
  let fp = ''
  let urlParams = queryString.parse(req.decodedParameters)

  if (!advData) return { // no adv. settings for current user
    enabled: true,
    kmn: urlParams.KMN || '',
    fpa: urlParams.FPA || ''
  }
  let updateParams = {}
  let needUpdate = false
  if (advData.refreshIP) {
    updateParams.allowedIP = Session.callerIP
    updateParams.refreshIP = 0
    needUpdate = true
  } else if (advData.allowedIP) {
    if (Session.callerIP !== advData.allowedIP) throw new Error('Allowed IP ' + advData.allowedIP + ' <> actual ' + Session.callerIP)
  }

  if (advData.refreshFp || advData.fp) { // fp required
    fp = urlParams.FP
    if (!fp) throw new Error('Fingerprint requred but not passed in FP URL params')
  }
  if (advData.refreshFp) {
    updateParams.fp = fp
    updateParams.refreshFp = 0
    needUpdate = true
  } else if (advData.fp && (advData.fp !== fp)) {
    throw new Error('Allowed FP ' + advData.fp + ' <> actual ' + fp)
  }
  let keyMediaName = ''
  if (advData.refreshKeyMedia || advData.keyMediaName) { // keyMediaName required
    keyMediaName = urlParams.KMN
    if (!keyMediaName) throw new Error('keyMediaName requred but not passed in KMN URL params')
  }
  if (advData.refreshKeyMedia) {
    updateParams.keyMediaName = keyMediaName
    updateParams.refreshKeyMedia = 0
    needUpdate = true
  } else if (advData.keyMediaName && (advData.keyMediaName !== keyMediaName)) {
    throw new Error('Allowed KeyMedia ' + advData.keyMediaName + ' <> actual ' + keyMediaName)
  }
  if (needUpdate) {
    updateParams.ID = advData.ID
    updateParams.mi_modifyDate = advData.mi_modifyDate
    let advStore = UB.DataStore('uba_advSecurity')
    advStore.run('update', {
      execParams: updateParams
    })
    advStore.freeNative()
  }
  return {
    enabled: true,
    kmn: urlParams.KMN || '',
    fpa: urlParams.FPA || ''
  }
}

let doCheckAdvancedSecurity = null // calculate later
/**
 * Add Session 'login' event listener
 * Session 'login' event occurred every time new user logged in
 * here we calculate logged-in user's roles,
 * result we put in Session.uData - only one session-depended server object
 * @private
 * @param {THTTPRequest} req
 */
function onUserLogin (req) {
  console.debug('Call JS method: UBA.onUserLogin')
  let data = Session.uData
  let repo = null

  let userInfo = UB.Repository('uba_user').attrs('name').selectById(Session.userID)
  data.login = userInfo.name || Session.userID
  if (!doCheckAdvancedSecurity) {
    doCheckAdvancedSecurity = App.domainInfo.has('uba_advSecurity')
      ? checkAdvancedSecurity
      : function () { return {enabled: false} }
  }
  let advCheckData = doCheckAdvancedSecurity(req)
  try {
    repo = UB.Repository('uba_userrole')
      .attrs(['ID', 'roleID.name', 'roleID'])
      .where('[userID]', '=', Session.userID)
      .select()
  } catch (ex) {
    // this possible if we connect to empty database without uba_* tables
    console.error('Error getting userroles:', ex.toString())
  }

  // add everyone role to uData
  let tmpArr = [UBA_COMMON.ROLES.EVERYONE.NAME]
  let roleIDs = [UBA_COMMON.ROLES.EVERYONE.ID]
  // add Anonymous or User role to uData
  if (Session.userID === UBA_COMMON.USERS.ANONYMOUS.ID) {
    tmpArr.push(UBA_COMMON.ROLES.ANONYMOUS.NAME)
    roleIDs.push(UBA_COMMON.ROLES.ANONYMOUS.ID)
  } else {
    tmpArr.push(UBA_COMMON.ROLES.USER.NAME)
    roleIDs.push(UBA_COMMON.ROLES.USER.ID)
  }
  while (!repo.eof) {
    let currentRole = repo.get('roleID.name')
    tmpArr.push(currentRole)
    roleIDs.push(repo.get('roleID'))
    repo.next()
  }
  data.roles = tmpArr.join(',')
  data.userID = Session.userID
  data.roleIDs = roleIDs

  if (ubaAuditPresent) { // uba_audit exists
    try {
      auditStore.run('insert', {
        execParams: {
          entity: 'uba_user',
          entityinfo_id: Session.userID,
          actionType: 'LOGIN',
          actionUser: data.login,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          targetUser: (advCheckData.enabled && advCheckData.kmn) ? advCheckData.kmn : data.login,
          targetRole: (advCheckData.enabled && advCheckData.fpa) ? advCheckData.fpa.slice(0, 127) : '',
          fromValue: req.headers
        }
      })
      App.dbCommit(auditStore.entity.connectionName)
    } catch (ex) {
      // this possible if we connect to empty database without ubs_* tables
      console.error('Error access audit entity:', ex.toString())
    }
  }
}

function onUserLoginFailed (isLocked) {
  console.debug('Call JS method: UBA.onUserLoginFailef')

  if (ubaAuditPresent) { // uba_audit exists
    try {
      let obj = UB.Repository('uba_user').attrs('name').selectById(Session.userID)
      let user = obj ? obj.name : Session.userID

      auditStore.run('insert', {
        execParams: {
          entity: 'uba_user',
          entityinfo_id: Session.userID,
          actionType: isLocked ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
          actionUser: user,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          targetUser: user
        }
      })
      App.dbCommit(auditStore.entity.connectionName)
    } catch (ex) {
      // this possible if we connect to empty database without ubs_* tables
      console.error('Error access audit entity:', ex.toString())
    }
  }
}

function securityViolation (reason) {
  console.debug('Call JS method: UBA.securityViolation')

  if (ubaAuditPresent) { // uba_audit exists
    let user = '?'
    if (Session.userID && (Session.userID > 0)) {
      let obj = UB.Repository('uba_user').attrs('name').selectById(Session.userID)
      user = obj ? obj.name : Session.userID
    }
    try {
      auditStore.run('insert', {
        execParams: {
          entity: 'uba_user',
          entityinfo_id: Session.userID,
          actionType: 'SECURITY_VIOLATION',
          actionUser: user,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          fromValue: reason
        }
      })
      App.dbCommit(auditStore.entity.connectionName)
    } catch (ex) {
      // this possible if we connect to empty database without ubs_* tables
      console.error('Error access audit entity:', ex.toString())
    }
  }
}
