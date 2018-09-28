const assert = require('assert')
const _ = require('lodash')
const path = require('path')
const dllName = process.platform === 'win32' ? 'ubamqp.dll' : 'libubamqp.so'
const archPath = process.arch === 'x32' ? './bin/x32' : './bin/x86_64'
const moduleName = path.join(__dirname, archPath, dllName)
const plugin = require(moduleName)

/**
 * @typedef AmqpArgumentType
 * @property {string} boolean boolean
 * @property {string} bool boolean
 * @property {string} i8 signed 8 bit integer
 * @property {string} int8 signed 8 bit integer
 * @property {string} u8 unsigned 8 bit integer
 * @property {string} uint unsigned 8 bit integer
 * @property {string} byte unsigned 8 bit integer
 * @property {string} i16 signed 16 bit integer
 * @property {string} int16 signed 16 bit integer
 * @property {string} short signed 16 bit integer
 * @property {string} u16 unsigned 16 bit integer
 * @property {string} uint16 unsigned 16 nit integer
 * @property {string} i32 signed 32 bit integer
 * @property {string} int32 signed 32 bit integer
 * @property {string} int signed 32 bit integer
 * @property {string} u32 unsigned 32 bit integer
 * @property {string} uint32 unsigned 32 bit integer
 * @property {string} i64 signed 64 bit integer
 * @property {string} int64 signed 64 bit integer
 * @property {string} long signed 64 bit integer
 * @property {string} u64 unsigned 64 bit integer
 * @property {string} uint64 unsigned 64 nit integer
 * @property {string} f32 signle precision floating point value
 * @property {string} single signle precision floating point value
 * @property {string} float signle precision floating point value
 * @property {string} f64 double precision floating point value
 * @property {string} double double precision floating point value
 * @property {string} decimal decimal value
 * @property {string} string string in UTF-8 codepage
 * @property {string} array array of other type values (not supported currently)
 * @property {string} timestamp unsigned 64 bit integer value of special meaning
 * @property {string} table nested table (not supported currently)
 * @property {string} null empty value
 * @property {string} void empty value
 * @property {string} bytes a value of Buffer type
 *
 * @typedef {Object} AmqpDecimalValue
 * @param {number} digits
 * @param {number} places
 *
 * @typedef {Object} AmqpArgumentObject
 * @param {AmqpArgumentType} [!]
 * @param {undefined|null|boolean|number|string|Buffer|AmqpDecimalValue} value
 *
 * @typedef {undefined|null|boolean|number|string|Buffer|AmqpArgumentObject} AmqpArgument
 *
 * @typedef {Object.<string, AmqpArgument>} AmqpArguments
 */

/**
 * @typedef {Object} AmqpConnectionOptions
 * @property {string} [host='127.0.0.1']
 * @property {number} [port=5672]
 * @property {string} [user='guest']
 * @property {string} [password='guest']
 * @property {string} [vhost='/']
 * @property {boolean} [ssl=false]
 * @property {string} [pathToCACert='']
 * @property {string} [pathToClientKey='']
 * @property {string} [pathToClientCert='']
 * @property {number} [frameMax=131072]
 * @property {boolean} [verifyHostname=true]
 */

/**
 * Converts an object provided to native TAmqpTable
 *
 * @param {AmqpArguments} object
 * @private
 */
function toAmqpTable (object) {
  let table
  if (typeof object === 'object') {
    let items = []
    for (const key in object) {
      const element = object[key]
      switch (typeof element) {
        case 'undefined':
          items.push({ type: 'V', name: key })
          break
        case 'boolean':
          items.push({ type: 't', name: key, value: element })
          break
        case 'number':
          if (element.isSafeInteger) {
            if (element >= -2147483648 && element <= 2147483647) {
              items.push({ type: 'I', name: key, value: element })
            } else {
              items.push({ type: 'l', name: key, value: element })
            }
          }
          items.push({ type: 'd', name: key, value: element })
          break
        case 'string':
          items.push({ type: 'S', name: key, value: element })
          break
        case 'object':
          if (element === null) {
            items.push({ type: 'V', name: key, value: null })
          } else if (element instanceof Buffer) {
            items.push({ type: 'x', name: key, value: element })
          } else if (typeof element['!'] === 'string' && !!element.value) {
            let type
            switch (element['!']) {
              case 'boolean':
              case 'bool':
                type = 't'
                break
              case 'i8':
              case 'int8':
                type = 'b'
                break
              case 'u8':
              case 'uint8':
              case 'byte':
                type = 'B'
                break
              case 'i16':
              case 'int16':
              case 'short':
                type = 's'
                break
              case 'u16':
              case 'uint16':
                type = 'u'
                break
              case 'i32':
              case 'int32':
              case 'int':
                type = 'I'
                break
              case 'u32':
              case 'uint32':
                type = 'i'
                break
              case 'i64':
              case 'int64':
              case 'long':
                type = 'l'
                break
              case 'u64':
              case 'uint64':
                type = 'L'
                break
              case 'f32':
              case 'single':
              case 'float':
                type = 'f'
                break
              case 'f64':
              case 'double':
                type = 'd'
                break
              case 'decimal':
                type = 'D'
                break
              case 'string':
                type = 'S'
                break
              case 'array':
                // type = 'A' -- not supported
                break
              case 'timestamp':
                type = 'T'
                break
              case 'table':
                // type = 'F' -- not supported
                break
              case 'null':
              case 'void':
                type = 'V'
                break
              case 'bytes':
                type = 'x'
                break
            }
            if (type) {
              items.push({ type: type, name: key, value: element.value })
            }
          }
          break
        default:
          // Just ignore everything else
      }
    }
    if (items.length > 0) {
      table = new plugin.TSMAmqpTable(items.length)
      items.forEach(({ type, name, value }) => table.Add(type, name, value))
    }
  }
  return table
}

/**
 * @typedef {Object} AmqpMessage
 * @property {Buffer} content
 * @property {Object} fields
 * @property {number} fields.deliveryChannel
 * @property {number} fields.deliveryTag
 * @property {string} fields.consumerTag
 * @property {string} fields.exchange
 * @property {string} fields.routingKey
 * @property {boolean} fields.redelivered
 * @property {Object} properties
 * @property {string} properties.contentType
 * @property {string} properties.expiration
 * @property {string} properties.userId
 * @property {number} properties.priority
 * @property {number} properties.deliveryMode
 * @property {string} properties.contentEncoding
 * @property {Object} properties.headers
 * @property {string} properties.correlationId
 * @property {string|string[]} properties.replyTo
 * @property {string} properties.messageId
 * @property {number} properties.timestamp
 * @property {string} properties.type
 * @property {string} properties.appId
 */

/**
 * @enum
 */
const AmqpExchangeType = {
  DIRECT: 'direct',
  FANOUT: 'fanout',
  TOPIC: 'topic'
}
module.exports.AmqpExchangeType = AmqpExchangeType

class AmqpConnection {
  /**
   * Creates an instance of AmqpConnection.
   * @param {!TSMAmqpConnection} nativeConnection
   * @memberof AmqpConnection
   * @private
   */
  constructor (nativeConnection) {
    assert(nativeConnection.toString() === plugin.TSMAmqpConnection.toString(), 'The argument must be of native connection class')
    /** @private */
    this._nativeConn = nativeConnection
  }

  /**
   * Closes connection
   * 
   * @memberof AmqpConnection
   */
  close () {
    this._nativeConn.close()
  }

  /**
   * Creates a new amqp channel
   *
   * @returns AmqpChannel
   * @memberof AmqpConnection
   */
  createChannel () {
    return new AmqpChannel(new plugin.TSMAmqpChannel(this._nativeConn))
  }

  /**
   * Checks whether connection is open
   * 
   * @returns boolean
   * @memberof AmqpConnection
   */
  isOpen() {
    return this._nativeConn.isOpen()
  }
}

class AmqpChannel {
  /**
   * Creates an instance of AmqpChannel.
   * @param {!TSMAmqpChannel} nativeChannel
   * @memberof AmqpChannel
   * @private
   */
  constructor (nativeChannel) {
    assert(nativeChannel.toString() === plugin.TSMAmqpChannel.toString(), 'The argument must be of native channel class')
    /** @private */
    this._nativeChannel = nativeChannel
  }

  /**
   * Acknowledge the given message, or all messages up to and including the given message.
   * If a #consume or #get is issued with noAck: false, the server will expect acknowledgements
   * for messages before forgetting about them.
   * If no such acknowledgement is given, those messages may be requeued once the channel is closed.
   *
   * @param {AmqpMessage} message
   * @param {boolean} [allUpTo=false]
   *   If allUpTo is true, all outstanding messages prior to and including
   *   the given message shall be considered acknowledged.
   *   If false, or omitted, only the message supplied is acknowledged.
   * @memberof AmqpChannel
   */
  ack (message, allUpTo) {
    let f = (message || {}).fields || {}
    this._nativeChannel.basicAck(f.deliveryTag, allUpTo || false)
  }

  /**
   * Acknowledge all outstanding messages on the channel. This is a “safe” operation,
   * in that it won’t result in an error even if there are no such messages.
   *
   * @memberof AmqpChannel
   */
  ackAll () {
    throw Error('not implemented')
    // this._nativeChannel.basicAckAll()
  }

  /**
   * Binds an exchange to another exchange.
   * The exchange named by destination will receive messages from the exchange named by source,
   * according to the type of the source and the pattern given.
   * For example, a direct exchange will relay messages that have a routing key equal to the pattern.
   *
   * Exchange to exchange binding is a RabbitMQ extension.
   *
   * @param {string} destination
   * @param {string} source
   * @param {string} pattern
   * @param {Object.<string,*>} args
   * @memberof AmqpChannel
   */
  bindExchange (destination, source, pattern, args = {}) {
    this._nativeChannel.bindExchange(destination, source, pattern, toAmqpTable(args))
  }

  /**
   * Asserts a routing path from an exchange to a queue: the exchange named by exchangeName
   * will relay messages to the queue named by queueName, according to the type of the exchange
   * and the routingKey given.
   * The RabbitMQ tutorials give a good account of how routing works in AMQP.
   *
   * @param {string} queueName
   * @param {string} exchangeName
   * @param {string} [routingKey='']
   * @param {Object} [args={}]
   *   An object containing extra arguments that may be required for the particular exchange type
   *   (for which, see your server’s documentation). It may be omitted if it’s the last argument,
   *   which is equivalent to an empty object.
   * @memberof AmqpChannel
   */
  bindQueue (queueName, exchangeName, routingKey = '', args = {}) {
    this._nativeChannel.bindQueue(queueName, exchangeName, routingKey, toAmqpTable(args))
  }

  /**
   * This instructs the server to stop sending messages to the consumer identified by consumerTag.
   * Messages may arrive between sending this and getting its reply; once the reply has resolved,
   * however, there will be no more messages for the consumer, i.e., the message callback will
   * no longer be invoked.
   *estination, source, pattern
   * @param {!string} tag
   *   The consumerTag is the string given in the reply to #consume, which may hestination, source, patternave been generated by the server
   * @memberof AmqpChannel
   */
  cancel (tag) {
    this._nativeChannel.basicCancel(tag)
  }

  /**
   * Declares consuming from a queue defined by name
   *
   * @param {string} queueName
   * @param {Object} [args={}]
   * @param {string} [args.consumerTag='']
   *   a name which the server will use to distinguish message deliveries for the consumer;
   *   mustn’t be already in use on the channel. It’s usually easier to omit this, in which case
   *   the server will create a random name and supply it in the reply.
   * @param {boolean} [args.noLocal=false]
   *   in theory, if true then the broker won’t deliver messages to the consumer if they were also
   *   published on this connection; RabbitMQ doesn’t implement it though, and will ignore it.
   *   Defaults to false
   * @param {boolean} [args.noAck=true]
   *   if true, the broker won’t expect an acknowledgement of messages delivered to this consumer;
   *   i.e., it will dequeue messages as soon as they’ve been sent down the wire.
   *   Defaults to true (i.e., you will not be expected to acknowledge messages).
   * @param {boolean} [args.exclusive=false]
   *   if true, the broker won’t let anyone else consume from this queue; if there already is a consumer,
   *   there goes your channel (so usually only useful if you’ve made a ‘private’ queue by letting
   *   the server choose its name)
   * @returns {string}
   *   The server reply contains consumerTag string. It is necessary to remember this somewhere
   *   if you will later want to cancel this consume operation (i.e., to stop getting messages)
   * @memberof AmqpChannel
   */
  consume (queueName, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      consumerTag: '',
      noLocal: false,
      noAck: true,
      exclusive: false,
      arguments: {}
    })
    return this._nativeChannel.basicConsume(queueName, o.consumerTag, o.noLocal, o.noAck, o.exclusive, toAmqpTable(o.arguments))
  }

  /**
   * Consumes a message
   *
   * @param {string} tag
   *   consumer tag returned from #consume method
   * @param {number} [timeout=0]
   *   timeout in seconds, 0 means indefinite wait, which is default
   * @returns {AmqpMessage}
   * @memberof AmqpChannel
   */
  consumeMessage (tag, timeout = 0) {
    let msg = this._nativeChannel.basicConsumeMessage(tag, timeout)
    if (msg) {
      msg.content = Buffer.from(msg.content)
      return msg
    } else {
      return undefined
    }
  }

  /**
   * Declares a new exchangeestination, source, pattern
   * Unlike queues, you must supply a name, and it can’t be the empty string.
   * You must also supply an exchange type, which determines how messages will be routed
   * through the exchange
   *
   * @param {!string} exchangeName
   *   you must supply a name for exchange, this can’t be the empty string
   * @param {AmqpExchangeType} [exchangeType=AmqpExchangeType.DIRECT]
   *   type of exchange. Defaults to AmqpExchangeType.DIRECT
   * @param {Object} [args]
   * @param {boolean} [args.passive=false]
   *   if true, the exchange is not actually created but taken an existing one that must exist. Defaults to false
   * @param {boolean} [args.durable=false]
   *   if true, the exchange will survive broker restarts. Defaults to false
   * @param {boolean} [args.internal=false]
   *   if true, messages cannot be published directly to the exchange (i.e., it can only be the target of bindings,
   *   or possibly create messages ex-nihilo). Defaults to false.
   * @param {boolean} [args.autoDelete=false]
   *   if true, the exchange will be destroyed once the number of bindings for which it is the source drop to zero.
   *   Defaults to false
   * @param {AmqpArguments} [args.arguments]
   *   any additional arguments that may be needed by an exchange type
   * @memberof AmqpChannel
   */
  declareExchange (exchangeName, exchangeType = AmqpExchangeType.DIRECT, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      passive: false,
      durable: false,
      internal: false,
      autoDelete: false,
      arguments: {}
    })
    this._nativeChannel.declareExchange(exchangeName, exchangeType, o.passive, o.durable, o.autoDelete, o.internal, toAmqpTable(o.arguments))
  }

  /**
   * Declares (creates) a queue named by queueName argument
   *
   * @param {string} queueName if an ampty string provided, broker will autocreate a name
   * @param {Object} [args]
   * @param {boolean} [args.passive=false]
   *   if true, the queue will not be actually deleted but an existing queue with the name supplied will be returned if found one
   * @param {boolean} [args.durable=false]
   *   if true, the queue will survive broker restarts (defaults to false)
   * @param {boolean} [args.exclusive=false]
   *   if true, scopes the queue to the connection (defaults to false)
   * @param {boolean} [args.autoDelete=false]
   *   if true, the queue will be deleted when the number of consumers drops to zero (defaults to false)
   * @param {Object.<string,*>} [args.arguments={}]
   *   additional arguments, usually parameters for some kind of broker-specific extension e.g., high availability, TTL
   * @returns {string} queue name
   * @memberof AmqpChannel
   */
  declareQueue (queueName, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      passive: false,
      durable: false,
      exclusive: false,
      autoDelete: false,
      arguments: {}
    })
    return this._nativeChannel.declareQueue(queueName, o.passive, o.durable, o.exclusive, o.autoDelete, toAmqpTable(o.arguments))
  }

  /**
   * Deletes a previously declared exchangeestination, source, pattern
   * If the exchange does not exist, a channel error is raised
   *
   * @param {string} exchangeName
   * @param {Object} [args]
   * @param {boolean} [args.ifUnused=false]
   *    if true and the exchange has bindings, it will not be deleted and the channel will be closed
   * @memberof AmqpChannel
   */
  deleteExchange (exchangeName, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      ifUnused: false
    })
    this._nativeChannel.deleteExchange(exchangeName, o.ifUnused)
  }

  /**
   * Deletes the queue named
   *
   * @param {string} queueName
   * @param {Object} [args]
   * @param {boolean} [args.idUnused]
   *   if true and the queu  ted and the channel will be closed.
   *   Defaults to false
   * @param {boolean} [args.ifEmpty=false]
   *   if true and the queue contains messages, the queue will not be deleted and the channel
   *   will be closed. Defaults to false
   * @returns {number} number of messages deleted or dead-lettered along with the queue
   * @memberof AmqpChannel
   */
  deleteQueue (queueName, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      ifUnused: false,
      ifEmpty: false
    })
    return this._nativeChannel.deleteQueue(queueName, o.ifUnused, o.ifEmpty)
  }

  /**
   * Ask a queue for a message, as an RPC. This will be resolved with either null, if there is no message to be had
   * (the queue has no messages ready), or a message in the same shape as detailed in #consume.
   *
   * @param {string} queueName
   * @param {Object} [args]
   * @param {boolean} [args.noAck=false]
   *   if true, the message will be assumed by the server to be acknowledged (i.e., dequeued)
   *   as soon as it’s been sent over the wire. Default is false, that is, you will be expected
   *   to acknowledge the message
   * @returns {null|AmqpMessage}
   * @memberof AmqpChannel
   */
  get (queueName, args = {}) {
    let o = Object.assign({}, args)
    _.defaults(o, {
      noAck: false
    })
    let msg = this._nativeChannel.basicGet(queueName, o.noAck)
    if (msg) {
      msg.content = Buffer.from(msg.content)
      return msg
    } else {
      return undefined
    }
  }

  /**
   * Rejects a message. This instructs the server to either requeue the message or throw it away
   * (which may result in it being dead-lettered)
   *
   * @param {AmqpMessage} message
   * @param {boolean} [allUpTo=false]
   *   If allUpTo is truthy, all outstanding messages prior to and including the given message
   *   are rejected. As with #ack, it’s a channel-ganking error to use a message that is not
   *   outstanding. Defaults to false
   * @param {boolean} [requeue=true]
   *   If requeue is truthy, the server will try to put the message or messages back on the queue
   *   or queues from which they came. Defaults to true if not given, so if you want to make sure
   *   messages are dead-lettered or discarded, supply false here.
   * @memberof AmqpChannel
   */
  nack (message, allUpTo = false, requeue = true) {
    let f = (message || {}).fields || {}
    this._nativeChannel.basicNack(f.deliveryTag, allUpTo, requeue)
  }

  /**
   * Rejects all messages outstanding on this channel
   *
   * @param {boolean} [requeue=true]
   *    If requeue is truthy, or omitted, the server will try to re-enqueue the messages
   * @memberof AmqpChannel
   */
  nackAll (requeue = true) {
    throw Error('not implemented')
    // this._nativeChannel.basicNackAll(requeue || true)
  }

  /**
   * Sets the prefetch count for this channel The count given is the maximum number of messages
   * sent over the channel that cab be awaiting acknowledgement. Once  it has reached, the server
   * will not send more messages on this channel until one or more have been acknowledged.
   * A value of 0 indicates no such limit
   *
   * @param {number} count
   * @memberof AmqpChannel
   */
  prefetch (count) {
    this._nativeChannel.basicQos(count)
  }

  /**
   * Publish a single message to an exchange
   *
   * @param {String} exchange
   *   can be either name of an exchange or empty string as a "special case", named exchange must be
   *   declared somewhare before use
   * @param {String} routingKey
   * @param {*} content
   *   a buffer to be send, if something else is passed, it is converted to string, then to buffer before sending
   * @param {Object} [args]
   *   additional broker-specific options
   * @param {boolean} [args.mandatory=false]
   *   RabbitMQ extension: if true, the message will be returned if it is not routed to a queue
   *   (i.e., if there are no bindings that match its routing key)
   */
  publish (exchange, routingKey, content, args) {
    let data = content instanceof Uint8Array ? content : Buffer.from(content.toString())
    let o = Object.assign({}, args)
    _.defaults(o, {
      mandatory: false
    })
    this._nativeChannel.basicPublish(exchange, routingKey, data, o.mandatory, toAmqpTable(o))
  }

  /**
   * Removes all undelivered messages from the queue named.
   * Note that this won’t remove messages that have been delivered but not yet acknowledged;
   * they will remain, and may be requeued under some circumstances (e.g., if the channel
   * to which they were delivered closes without acknowledging them).
   *
   * @param {!string} queueName
   * @returns {number}
   *   The server reply contains the number of messages purged from the queue
   * @memberof AmqpChannel
   */
  purgeQueue (queueName) {
    return this._nativeChannel.purgeQueue(queueName)
  }

  /**
   * Requeue unacknowledged messages on this channel
   *
   * @memberof AmqpChannel
   */
  recover () {
    this._nativeChannel.basicRecover()
  }

  /**
   * Rejects a message. Equivalent to #nack(message, false, requeue), but works in older versions
   * of RabbitMQ (< v2.3.0) where #nack does not exist
   *
   * @param {AmqpMessage} message
   * @param {boolean} [requeue=true]
   * @memberof AmqpChannel
   */
  reject (message, requeue = true) {
    let f = (message || {}).fields || {}
    this._nativeChannel.basicReject(f.deliveryTag, requeue)
  }

  /**
   * Remove a binding from an exchange to another exchange.
   * A binding with the exact source exchange, destination exchange, routing key pattern, and extension args will be removed
   *
   * @param {string} destination
   * @param {string} source
   * @param {string} pattern
   * @param {Object.<string,*>} args
   * @memberof AmqpChannel
   */
  unbindExchange (destination, source, pattern, args = {}) {
    this._nativeChannel.unbindExchange(destination, source, pattern, toAmqpTable(args))
  }

  /**
   * Removes a routing path between the queue named by queueName and the exchange named by exchangeName
   * with the routingKey and arguments given. Omitting args is equivalent to supplying an empty object
   * (no arguments).
   * Beware: attempting to unbind when there is no such binding may result in a punitive error
   * (the AMQP specification says it’s a connection-killing mistake; RabbitMQ before version 3.2.0
   * softens this to a channel error, and from version 3.2.0, doesn’t treat it as an error at all).
   *
   * @param {!string} queueName
   * @param {!string} exchangeName
   * @param {string} routingKey
   * @param {Object.<string,*>} [args||{}]
   * @memberof AmqpChannel
   */
  unbindQueue (queueName, exchangeName, routingKey, args = {}) {
    this._nativeChannel.unbindQueue(queueName, exchangeName, routingKey, toAmqpTable(args))
  }
}

/**
 * Creates and opens a new amqp connection
 * Connection options can be passed in a form of url or as object or both
 * If the first argument passed is of type 'object' it is treated as args parameter
 * The url parameter is parsed if passed, then args parameter data (if provided) applied over the parsed data
 *
 * @param {string|Object} [url]
 * @param {AmqpConnectionOptions} [args]
 * @returns {AmqpConnection} amqp connection object
 */
function connect (url, args) {
  let o = {}
  if (typeof url === 'object') {
    Object.assign(o, url)
  } else if (typeof url !== 'undefined') {
    Object.assign(o, plugin.parse_url(url.toString()))
  }
  if (typeof args === 'object') {
    Object.assign(o, args)
  }
  _.defaults(o, {
    host: '127.0.0.1',
    port: (!o.ssl ? 5672 : 5671),
    user: 'guest',
    password: 'guest',
    vhost: '/',
    ssl: false,
    pathToCACert: '',
    pathToClientKey: '',
    pathToClientCert: '',
    frameMax: 131072,
    verifyHostname: true
  })
  return new AmqpConnection(
    new plugin.TSMAmqpConnection(
      o.host, o.port, o.user, o.password, o.vhost === '' ? '/' : o.vhost,
      o.ssl, o.pathToCACert, o.pathToClientKey, o.pathToClientCert,
      o.frameMax, o.verifyHostname))
}
module.exports.connect = connect
