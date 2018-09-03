const UB = require('@unitybase/ub')
const App = UB.App
const amqp = require('./amqp')
const qs = require('querystring')

const AMQP_EXCHANGE_NAME = 'ub-amqp-notify'
const USERNAME_PATTERN = /U(\d+)/

function parseParams(req) {
  switch (req.method) {
    case 'POST':
      return Object.assign({}, qs.parse(req.read()))
    case 'GET':
      return Object.assign({}, qs.parse(req.decodedParameters))
    default:
      return {}
  }
}

App.registerEndpoint('amqp-auth-user', (req, resp) => {
  let { username, password} = parseParams(req)
  console.log(`parameters: ${username}`)

  if (typeof username === 'string' && typeof password === 'string' && USERNAME_PATTERN.test(username)) {
    let ID = parseInt(USERNAME_PATTERN.exec(username)[1])
    let { name } = UB.Repository('uba_user').attrs('name').selectById(ID) || {}
    if (password === name) {
      resp.statusCode = 200
      resp.writeHead('Content-Type: text/plain')
      resp.writeEnd('allow')
      return
    }  
  }
  resp.statusCode = 400
  resp.writeEnd()
}, false)
App.registerEndpoint('amqp-auth-vhost', (req, resp) => {
  let { username, vhost, ip } = parseParams(req)
  console.log(`parameters: ${username}, ${vhost}, ${ip}`)

  if (typeof username === 'string' && USERNAME_PATTERN.test(username)) {
    if (1 === 1) { //TODO: Check vhost  - it should be the same as in server connection string
      resp.statusCode = 200
      resp.writeHead('Content-Type: text/plain')
      resp.writeEnd('allow')
      return
    }
  }
  resp.statusCode = 400
  resp.writeEnd()
}, false)
App.registerEndpoint('amqp-auth-resource', (req, resp) => {
  let { username, vhost, resource, name, permission } = parseParams(req)
  console.log(`parameters: ${username}, ${vhost}, ${resource}, ${name}, ${permission}`)

  if (typeof username === 'string' && USERNAME_PATTERN.test(username) && typeof resource == 'string') {
    let ok = false
    switch (resource) {
      case 'queue': ok = true; break
      case 'exchange': ok = name === AMQP_EXCHANGE_NAME && permission === 'read'; break
    }
    if (ok) {
      resp.statusCode = 200
      resp.writeHead('Content-Type: text/plain')
      resp.writeEnd('allow')
      return
    }
  }
  resp.statusCode = 400
  resp.writeEnd()
}, false)
App.registerEndpoint('amqp-auth-topic', (req, resp) => {
  let { username, vhost, resource, name, permission, routing_key } = parseParams(req)
  console.log(`parameters: ${username}, ${vhost}, ${resource}, ${name}, ${permission}, ${routing_key}`)

  if (typeof username === 'string' && USERNAME_PATTERN.test(username) && typeof routing_key === 'string' &&
      resource === 'topic' && name === AMQP_EXCHANGE_NAME && permission === 'read') {
    let parts = routing_key.split('.')
    let ok = (parts.length === 3) &&
      ((parts[1] === 'bcst' && parts[2] === 'bcst') || (parts[1] === username && parts[2] === '0'))
    if (ok) {
      resp.statusCode = 200
      resp.writeHead('Content-Type: text/plain')
      resp.writeEnd('allow')
      return
    }
  }
  resp.statusCode = 400
  resp.writeEnd()
}, false)

const amqpUrl = App.serverConfig.application.customSettings.amqpNotificationUrl
if (typeof amqpUrl === 'string') {
  // The exchange should be declared at the server start
  amqp.connect(amqpUrl).createChannel().declareExchange(AMQP_EXCHANGE_NAME, amqp.AmqpExchangeType.TOPIC)
}

/**
 * Server part of server to client notification implementation
 * Uses amqp protocol internally to send messages
 * 
 * The url to connect to must be provided in ubConfig.json to work
 * otherwise will silently ignore everything
 * The url should be specified in application.customSettings.amqpNotificationUrl
 * An example of valid url: 'amqp://localhost/'
 * (this is the url for default RabbitMQ configuration)
 *
 * @class UBServerNotifier
 */
class UBServerNotifier {
  constructor () {
    if (typeof amqpUrl === 'string') {
      this._channel = amqp.connect(amqpUrl).createChannel()
    }
  }

  /**
   * Sending message to all existing clients
   *
   * @param {string} name
   *   name of the notification source
   *   this should be unique name to be able for client to distinguish the source of notification message
   * @param {*} msg
   *   the message to send
   *   any value is converted to JSON string before sending
   * @memberof UBServerNotifier
   */
  broadcast (name, msg) {
    if (this._channel && typeof name === 'string') {
      this._channel.publish(AMQP_EXCHANGE_NAME, `${name}.bcst.bcst`, JSON.stringify(msg))
    }
  }

  /**
   * Sending message to particular user defined by login
   *
   * @param {string} name
   *   name of the notification source
   *   this should be unique name to be able for client to distinguish the source of notification message
   * @param {number} userID
   *   ID of the user the message to be sent to
   * 
   *   Session.uData.userID could be used to sent a message to the current user.
   *   It is worth to mention that all non-authenticatied sessions have 'anonimous' login and there is no way
   *   to distinguish such a users
   * @param {*} msg
   *   the message to send
   *   any value is converted to JSON string before sending
   * @memberof UBServerNotifier
   */
  notify (name, userID, msg) {
    // TODO: to deside on anonimous users
    if (this._channel && typeof name === 'string' && typeof userID === 'number') {
      this._channel.publish(AMQP_EXCHANGE_NAME, `${name}.U${userID}.0`, JSON.stringify(msg))
    }
  }
}
module.exports.UBServerNotifier = UBServerNotifier
