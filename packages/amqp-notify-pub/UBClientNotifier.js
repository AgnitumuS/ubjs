const _ = require('lodash')
const { Stomp } = require('@stomp/stompjs/lib/stomp.js')
const UB = require('@unitybase/ub-pub')

const AMQP_EXCHANGE_NAME = 'ub-amqp-notify'

/**
 * Client part of server to client notification implementation
 * Uses web extension of stomp protocol internally to receive messages
 * 
 * @class UBClientNotifier
 */
/**
 * UBClientNotifier constructor
 * 
 * The url to connect to must be provided in ubConfig.json to work
 * otherwise will silently ignore everything
 * The url should be specified in uiSettings.adminUI.amqpNotificationUrl
 * An example of valid url: 'ws://127.0.0.1:15674/ws'
 * (this is the url for default RabbitMQ configuration)
 *
 * Plase don't forget to create 'ub-amqp-notify' topic exchange before use!
 *
 * @param {string} filter
 *   
 * @param {UBClientNotifier-onMessageCallback} onMessage
 *   The callback to receive messages
 * @param {Object} [opts]
 * @param {UBClientNotifier-onErrorCallback} [opts.onError=undefined]
 *   The callback to receive errors
 * @param {UBClientNotifier-onDebugCallback} [opts.onDebug=undefined]
 *   The callback to replace default debug handler
 * @param {string} [opts.vhost='/']
 *   The vhost to be used, defaults to root vhost
 */
function UBClientNotifier (filter, onMessage, opts={}) {
  if (!(filter !== '' && filter.indexOf('.') === -1)) throw new Error('filter argument must be non empty string without dots')
  if (typeof onMessage !== 'function') throw new Error('onMessage is a mandatory callback')
  let o = Object.assign(opts, {})
  _.defaults(o, {
    vhost: '/'
  })

  let client
  let url = UB.connection.appConfig.uiSettings.adminUI.amqpNotificationUrl
  if (typeof UB !== 'undefined' && typeof url === 'string') {
    if (url === '*') {
      url = 'ws' + UB.connection.serverUrl.slice(4) + 'ws' // remove http part, so in case http://.. we get ws://.., in case https://.. -> wss://..
    }
    client = Stomp.client(url)

    // With heartbeats disabled (set to 0) we are quickly getting to dropped connection,
    // so let's set hartbeating to 10 sec
    client.heartbeat.outgoing = 10*1000
    client.heartbeat.incoming = 10*1000

    if (typeof o.onDebug === 'function') {
      client.debug = o.onDebug
    }

    let userData = UB.connection.userData()
    let userName = UB.connection.isAuthorized() ? 'U' + userData.userID : userData.login
    // Make sure the user has limited access rights
    client.connect(userName, userData.login, onConnect, o.onError, o.vhost) // TODO: replace with UB auth

    // Start subscribing to the chat queue
    function onConnect () {
      client.subscribe(`/exchange/${AMQP_EXCHANGE_NAME}/${filter}.bcst.bcst`, onMessage)
      if (UB.connection.isAuthorized()) {
        client.subscribe(`/exchange/${AMQP_EXCHANGE_NAME}/${filter}.${userName}.0`, onMessage)
      }
    }
  }

  /**
   * Close connection and stop receive messages
   * It is strongly recommended to call this when messages are not expected any more,
   * at least when destroying containg component
   * 
   * @memberof UBClientNotifier
   */
  UBClientNotifier.prototype.disconnect = function () {
    if (typeof client !== 'undefined') {
      client.disconnect()
      client = undefined
    }
  }
}

/**
 * The message receive callback
 * @callback UBClientNotifier-onMessageCallback
 * @param {Object} message
 *
 * An error handling callback
 * @callback UBClientNotifier-onErrorCallback
 * @param {Object} arg - The passed paramer may be a frame or a message
 *
 * Debugging callback
 * Defult debug handler writes messages and other usefull information to console
 * This can be replaced or even disabled by providing user specific debug handler
 * @callback UBClientNotifier-onDebugCallback
 * @param {Object} message
 */

module.exports.UBClientNotifier = UBClientNotifier
