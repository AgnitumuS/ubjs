const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
const UBServerNotifier = require('@unitybase/amqp').UBServerNotifier

App.registerEndpoint('broadcast', broadcast, false)
App.registerEndpoint('notify', notify, false)

/**
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function broadcast (req, resp) {
  console.log('In broadcast handler')
  let msg = ''
  try {
    msg = (JSON.parse(req.read()) || {}).text
  } catch (e) {
    console.warn('Error when parsing request body', e.toString())
  }
  let source = 'ntf_messaging'

  let notifier = new UBServerNotifier()
  notifier.broadcast(source, msg)

  resp.statusCode = 200
  resp.writeEnd('')
}

/**
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function notify (req, resp) {
  console.log('In notify handler')
  let msg = ''
  try {
    msg = (JSON.parse(req.read()) || {}).text
  } catch (e) {
    console.warn('Error when parsing request body', e.toString())
  }
  let source = 'ntf_messaging'
  let user = Session.uData.userID

  let notifier = new UBServerNotifier()
  notifier.notify(source, user, msg)

  resp.statusCode = 200
  resp.writeEnd('')
}
