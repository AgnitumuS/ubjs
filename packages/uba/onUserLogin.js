UB.ns('UBA')

var auditEntityUba = App.domain.byName('uba_audit')
var auditStore

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
  var
    data = Session.uData,
    repo = null, tmpArr = [], roleIDs = []

  var userInfo = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).selectAsObject()[0]
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

  while (!repo.eof) {
    var currentRole = repo.get('roleID.name')
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
      }
            )
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

  var obj, user
  if (auditEntityUba) { // uba_audit exists
    try {
      obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
      user = obj.eof ? Session.userID : obj.get('name')

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
      }
            )
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

  var obj, user
  if (auditEntityUba) { // uba_audit exists
    if (Session.userID && (Session.userID > 0)) {
      obj = UB.Repository('uba_user').attrs('name').where('[ID]', '=', Session.userID).select()
      user = obj.eof ? Session.userID : obj.get('name')
    } else {
      user = '?'
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
      }
            )
      App.dbCommit(auditStore.entity.connectionName)
    } catch (ex) {
            // this possible if we connect to empty database without ubs_* tables
      console.error('Error access audit entity:', ex.toString())
    }
  }
}

Session.on('securityViolation', UBA.securityViolation)
