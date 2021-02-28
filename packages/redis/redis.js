const TRedisClient = process.binding('synode_redis').TSMRedisClient

class RedisClient {
  /**
   * Creates a lazy connection to the redis server.
   * Actual TCP connection established on first command.
   *
   * Automatically reconnect and repeating a command in case of connection lost.
   * If reconnect fails in reconnectTimeout - throws.
   *
   * @param {Object} connSettings
   * @param {string} connSettings.host
   * @param {string} connSettings.port
   * @param {number} [connSettings.reconnectTimeout=30000]
   */
  constructor (connSettings) {
    this._connSettings = Object.assign({reconnectTimeout: 30000}, connSettings)
    this._native = new TRedisClient()
    this._native.initialize(this._connSettings.host, this._connSettings.port)
  }

  /**
   * Send a series of commands and return a redis response.
   * Depending on command response can be a string, integer, array of <string|array<string>>
   *
   * For blocking operations with timeout reached returns null.
   * Throw in case of protocol level error or connection lost and reconnect fails in connSettings.reconnectTimeout ms.
   * @example
   *
   *
   * @param {...string|number} args
   * @return {null|string|number|Array<string|array<string>>}
   */
  commands (...args) {
    let resp
    try {
      resp = this._native.commands(...args)
      return resp
    } catch (e) {
      console.warn(`Reconnecting to redis on ${this._connSettings.host}:${this._connSettings.port} with timeout ${this._connSettings.reconnectTimeout}...`)
      this._native.reconnect(this._connSettings.reconnectTimeout)
      console.log('Reconnected')
    }
    console.log('Repeat redis command after reconnect')
    resp = this._native.commands(...args) // repeat a command. Throws if fails again
  }

  /**
   * PRIVATE method to send a raw command to redis. Reconnect is not supported
   *
   * Raw command example: '*2\r\n$7\r\nhgetall\r\n$8\r\ntestHash\r\n`
   *
   * @private
   * @param {string} cmd
   * @return {null|string|number|Array<string|array<string>>}
   */

  rawCommand(cmd) {
    return this._native.rawCommand(cmd)
  }
  get ioError () {
    return this._native.ioError
  }
  get ioErrorText () {
    return this._native.ioErrorText
  }
}

let defaultClient

/**
 * Return per-thread instance of redis client connected to server using configuration from `ubConfig.application.redis`
 * @return {RedisClient}
 */
function getDefaultRedisConnection () {
  if (!defaultClient) {
    defaultClient = new RedisClient(App.serverConfig.redis || {host: '127.0.0.1', port: '6379'})
  }
  return defaultClient
}

module.exports = {
  getDefaultRedisConnection,
  RedisClient: RedisClient
}