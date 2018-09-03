const { Stomp } = require('./node_modules/@stomp/stompjs/lib/stomp.js')
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
 * @param {UBClientNotifier-onMessageCallback} onMessage
 *   The callback to receive messages
 * @param {UBClientNotifier-onErrorCallback} [onError=undefined]
 *   The callback to receive errors
 * @param {UBClientNotifier-onDebugCallback} [onDebug=undefined]
 *   The callback to replace default debug handler
 */
function UBClientNotifier (onMessage, onError = undefined, onDebug = undefined) {
  let client
  let url = UB.connection.appConfig.uiSettings.adminUI.amqpNotificationUrl
  if (typeof UB !== 'undefined' && typeof url === 'string') {
    client = Stomp.client(url)

    // With heartbeats disabled (set to 0) we are quickly getting to dropped connection,
    // so let's set hartbeating to 10 sec
    client.heartbeat.outgoing = 10*1000
    client.heartbeat.incoming = 10*1000

    if (typeof onDebug === 'function') {
      client.debug = onDebug
    }

    let userData = UB.connection.userData()
    let userName = UB.connection.isAuthorized() ? 'U' + userData.userID : userData.login
    // Make sure the user has limited access rights
    client.connect(userName, userData.login, onConnect, onError, '/') // TODO: replace with UB auth

    // Start subscribing to the chat queue
    function onConnect () {
      client.subscribe(`/exchange/${AMQP_EXCHANGE_NAME}/*.bcst.bcst`, onMessage)
      if (UB.connection.isAuthorized()) {
        client.subscribe(`/exchange/${AMQP_EXCHANGE_NAME}/*.${userName}.0`, onMessage)
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
