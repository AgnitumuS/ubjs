const amqp = require('@unitybase/amqp')
const qs = require('querystring')
//const UB = require('@unitybase/ub')
//const App = UB.App

const AMQP_EXCHANGE_NAME = 'ub-amqp-notify'
const USERNAME_PATTERN = /U(\d+)/

// = UB auth for RabbitMQ implementation ===========================================

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

function handleAuthUser (req, resp) {
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
}

function handleAuthVHost (req, resp) {
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
}

function handleAuthResource (req, resp) {
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
}

function handleAuthTopic (req, resp) {
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
}

module.exports.registerAuthEndpoints = () => {
  App.registerEndpoint('amqp-auth-user', handleAuthUser, false)
  App.registerEndpoint('amqp-auth-vhost', handleAuthVHost, false)
  App.registerEndpoint('amqp-auth-resource', handleAuthResource, false)
  App.registerEndpoint('amqp-auth-topic', handleAuthTopic, false)
}

// = UBServerNotifier class implementation ==================================================

// A thread-wide channel instance
let _channel
function getChannel () {
  if (!_channel) {
    try {
      let amqpUrl = UB.App.serverConfig.application.customSettings.amqpNotificationUrl
      if (typeof amqpUrl === 'string') {
        let ch = amqp.connect(amqpUrl).createChannel()
        // Here is not a good place to declare exchange - it must be defined at environment initialization (configuration) process
        // ch.declareExchange(AMQP_EXCHANGE_NAME, amqp.AmqpExchangeType.TOPIC, { durable: true })
        _channel = ch
      }
    } catch(e) {
      console.error(e.toString())
      console.error(e)
    }
  }
  return _channel
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
 * Plase don't forget to create 'ub-amqp-notify' topic exchange before use!
 *
 * @class UBServerNotifier
 */
class UBServerNotifier {
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
    let ch = getChannel()
    if (ch && typeof name === 'string') {
      ch.publish(AMQP_EXCHANGE_NAME, `${name}.bcst.bcst`, JSON.stringify(msg))
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
    let ch = getChannel()
    if (ch && typeof name === 'string' && typeof userID === 'number') {
      // TODO: to deside on anonimous users
      ch.publish(AMQP_EXCHANGE_NAME, `${name}.U${userID}.0`, JSON.stringify(msg))
    }
  }
}
module.exports.UBServerNotifier = UBServerNotifier
