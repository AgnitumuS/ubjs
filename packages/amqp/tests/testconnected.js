const lib = require('./.')
const testbase = require('./testbase')

/**
 * @type AmqpConnectionOptions
 */
const connectionInfo = {
  host: '127.0.0.1',
  port: 5672,
  user: 'guest',
  password: 'guest',
  vhost: '/',
  ssl: false,
  pathToCACert: '',
  pathToClientKey: '',
  pathToClientCert: '',
  frameMax: 131072,
  verify_hostname: true
}
module.exports.connectionInfo = connectionInfo

class TestConnected extends testbase.TestBase {
  /**
   * Creates a new amqp connection
   *
   * @returns AmqpConnection
   */
  NewConnection () {
    return lib.connect(undefined, connectionInfo)
  }
}
module.exports.TestConnected = TestConnected
