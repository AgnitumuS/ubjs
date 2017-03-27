let UBA = UB.ns('UBA')

let auditEntityUba = App.domain.byName('uba_audit')
let auditStore

if (auditEntityUba) {
  auditStore = new TubDataStore(auditEntityUba)
}
/**
 * Add Session 'login' event listener
 * Session 'login' event occurred every time new user logged in
 * here we calculate logged-in user's roles,
 * result we put in Session.uData - only one session-depended server object
 */
UBA.onUserLogin = function () {
  console.debug('Call JS method: UBA.onUserLogin')
  let data = Session.uData
  let repo = null

  let userInfo = UB.Repository('uba_user').attrs('name').selectById(Session.userID)
  data.login = userInfo.name || Session.userID
  try {
    repo = UB.Repository('uba_userrole')
      .attrs(['ID', 'roleID.name', 'roleID'])
      .where('[userID]', '=', Session.userID)
      .select()
  } catch (ex) {
    // this possible if we connect to empty database without uba_* tables
    console.error('Error getting userroles:', ex.toString())
  }

  let tmpArr = []
  let roleIDs = []
  while (!repo.eof) {
    let currentRole = repo.get('roleID.name')
    tmpArr.push(currentRole)
    roleIDs.push(repo.get('roleID'))
    repo.next()
  }
  data.roles = tmpArr.join(',')
  data.userID = Session.userID
  data.roleIDs = roleIDs

  if (auditEntityUba) { // uba_audit exists
    try {
      auditStore.run('insert', {
        execParams: {
          entity: 'uba_user',
          entityinfo_id: Session.userID,
          actionType: 'LOGIN',
          actionUser: Session.userID,
          actionTime: new Date(),
          remoteIP: Session.callerIP,
          targetUser: data.login
          // toValue: data.roles
        }
      })
      App.dbCommit(auditStore.entity.connectionName)
    } catch (ex) {
      // this possible if we connect to empty database without ubs_* tables
      console.error('Error access audit entity:', ex.toString())
    }
  }
}
Session.on('login', UBA.onUserLogin)

UBA.onUserLoginFailed = function (isLocked) {
  console.debug('Call JS method: UBA.onUserLoginFailef')

  if (auditEntityUba) { // uba_audit exists
    try {
      let obj = UB.Repository('uba_user').attrs('name').selectById(Session.userID)
      let user = obj ? obj.name : Session.userID

      auditStore.run('insert', {
        execParams: {
          entity: 'uba_user',
          entityinfo_id: Session.userID,
          actionType: isLocked ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
          actionUser: Session.userID,
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

Session.on('loginFailed', UBA.onUserLoginFailed)

UBA.securityViolation = function (reason) {
  console.debug('Call JS method: UBA.securityViolation')

  if (auditEntityUba) { // uba_audit exists
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

Session.on('securityViolation', UBA.securityViolation)
