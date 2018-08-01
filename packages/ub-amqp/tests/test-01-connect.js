const assert = require('assert')
const lib = require('../ub-amqp')
const base = require('./testconnected')

class TestSuiteConnect extends base.TestConnected {
  testDefault () {
    let conn = lib.connect(base.connectionInfo)
    assert(conn, 'Connection did not returned')
  }

  testUri () {
    let info = {}
    Object.assign(info, base.connectionInfo)
    let uri = `amqp://${info.host}:${info.port ? info.port : 5672}${info.vhost ? info.vhost : ''}`
    let conn = lib.connect(uri)
    assert(conn, 'Connection did not returned')
  }

  testUriWithConnInfo () {
    let info = {}
    Object.assign(info, base.connectionInfo)
    let uri = 'amqp://hostToBeOverriden/'
    let conn = lib.connect(uri, info)
    assert(conn, 'Connection did not returned')
  }

  testBadHost () {
    assert.throws(() => { lib.connect({ host: 'notExistingHost' }) }, 'Must throw exception')
  }

  testBadAuth () {
    let info = {}
    Object.assign(info, base.connectionInfo)
    info.user = 'badUser'
    info.password = 'wrongPass'
    assert.throws(() => { lib.connect(info) }, 'Must throw exception')
  }

  testBadVHost () {
    let info = {}
    Object.assign(info, base.connectionInfo)
    info.vhost = 'nonexitant_vhost'
    assert.throws(() => { lib.connect(info) }, 'Must throw exception')
  }

  testBadFramesize () {
    // AMQP Spec says we have a minimum frame size of 4096
    let info = {}
    Object.assign(info, base.connectionInfo)
    info.frameMax = 400
    assert.throws(() => { lib.connect(info) }, 'Must throw exception')
  }
}
module.exports.TestSuite = TestSuiteConnect
