const UB = require('@unitybase/ub')
/* global ubs_message_edit */
// eslint-disable-next-line camelcase
let me = ubs_message_edit
const WebSockets = require('@unitybase/ub/modules/web-sockets')

me.on('update:after', mayBeNotify)

/**
 * Filter only completed(ready for send) up-to-date messages for logged in user
 * @private
 * @param {ubMethodParams} ctx
 * @return {boolean}
 */
function mayBeNotify (ctx) {
  let notifier = WebSockets.getWSNotifier()
  if (notifier) {
    let store = ctx.dataStore
    store.currentDataName = 'selectAfterUpdate'
    if (!store.eof && store.get('complete')) {
      console.debug('ubs_message_edit: detected ready to send message - try to notify using WS')
      let sentTime = new Date(store.get('startDate'))
      let _expireStr = store.get('expireDate')
      let expireDate = _expireStr ? new Date(store.get('expireDate')) : null
      let now = new Date()
      if ((sentTime <= now) && (!expireDate || (expireDate >= now))) {
        me.notifyAllMessageRecipients(store.get('ID'))
      }
    }
  }
}

/**
 * Send a WS command `ubs_message` to all recipient of message with ID `messageID`
 * @method notifyAllMessageRecipients
 * @memberOf ubs_message_edit_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @public
 * @param {Number} messageID
 */
me.notifyAllMessageRecipients = function notifyAllMessageRecipient (messageID) {
  let recipients = UB.Repository('ubs_message_recipient')
    .attrs('userID')
    .where('messageID', '=', messageID)
    .where('acceptDate', 'isNull')
    .selectAsObject()
  let notifier = WebSockets.getWSNotifier()

  function doNotify (wsSession) {
    notifier.sendCommand('ubs_message', wsSession, {info: 'newMessage'})
  }

  if (notifier) {
    for (let i = 0, L = recipients.length; i < L; i++) {
      let wsSessions = notifier.getUserSessions(recipients[i].userID)
      wsSessions.forEach(doNotify)
    }
  }
}

/**
 * Send a WS command `ubs_message` to all recipient who are ready to send unaccepted messages.
 * To be user in scheduler for sending notification
 * @method notifyAllRecipients
 * @memberOf ubs_message_edit_ns.prototype
 * @memberOfModule @unitybase/ubs
 * @public
 */
me.notifyAllRecipients = function notifyAllRecipients () {
  let notifier = WebSockets.getWSNotifier()
  let now = new Date()

  function doNotify (wsSession) {
    notifier.sendCommand('ubs_message', wsSession, {info: 'newMessage'})
  }

  if (notifier) {
    let recipients = UB.Repository('ubs_message_recipient')
      .attrs('userID')
      .where('acceptDate', 'isNull')
      .where('[messageID.complete]', '=', 1)
      .where('[messageID.startDate]', '>=', now)
      .where('[messageID.expireDate]', '<=', now)
      .groupBy('userID')
      .select()
    while (!recipients.eof) {
      let wsSessions = notifier.getUserSessions(recipients.get(0))
      wsSessions.forEach(doNotify)
    }
    recipients.freeNative()
  }
}
