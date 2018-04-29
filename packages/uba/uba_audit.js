const UB = require('@unitybase/ub')
const WebSockets = require('@unitybase/ub/modules/web-sockets')
const Session = UB.Session
/* global uba_audit ubs_settings */
// eslint-disable-next-line camelcase
let me = uba_audit

me.entity.addMethod('secureBrowserEvent')

let __supervisorUserID = 0

function getSupervisorID () {
  if (__supervisorUserID === 0) {
    let supervisorUserName = ubs_settings.getSettingValue('UBA.securityDashboard.supervisorUser')
    if (supervisorUserName) {
      __supervisorUserID = UB.Repository('uba_user').attrs('ID').where('name', '=', supervisorUserName).selectAsObject()[0].ID
    }
  }
  return __supervisorUserID
}

me.on('insert:after', function notifyAboutSecurity (ctxt) {
  let notifier = WebSockets.getWSNotifier()
  if (notifier) {
    // Send to specific user
    let userSessions = notifier.getUserSessions(getSupervisorID())
    userSessions.forEach(function (sessionID) {
      notifier.sendCommand('uba_audit_notifier', sessionID, JSON.stringify(ctxt.mParams.execParams))
    })
  }
})

const UBA_AUDIT = UB.DataStore('uba_audit')
/**
 * Save an audit events from the secure browser (UnityBase defense edition)
 * @param {ubMethodParams} ctx
 * @param {string} ctx.mParams.reason
 * @param {string} ctx.mParams.action
 * @published
 */
function secureBrowserEvent (ctx) {
  let params = ctx.mParams
  let action = params.action || 'DOWNLOAD'
  let reason = params.reason || 'Invalid client call'

  UBA_AUDIT.run('insert', {
    execParams: {
      entity: 'secureBrowser',
      entityinfo_id: 0,
      actionType: action,
      actionUser: Session.uData.login || Session.userID,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      fromValue: reason
    }
  })
}
me.secureBrowserEvent = secureBrowserEvent
