const assert = require('assert')
const base = require('./testconnected')
const lib = require('../ub-amqp')

class TestSuiteGet extends base.TestConnected {
  testBasic () {
    const body = 'Message Body'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, body, { mandatory: true })
    let msg = ch.get(q.queue)
    assert.notEqual(typeof msg, 'undefined', 'Message not returned')
    assert.equal(typeof msg, 'object', 'Message returned is not an object')
    assert(msg.content instanceof Buffer, 'Message content if not of type Buffer')
    assert.equal(msg.content.toString(), body, 'Received message content does not queal to message sent')
  }

  testGetEmpty () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let msg = ch.get(q.queue)
    assert.equal(typeof msg, 'undefined', 'Get from an empty queue should return undefined')
  }

  testGetBig () {
    let info = Object.assign({}, base.connectionInfo)
    // Smallest frame size allowed by AMQP
    info.frameMax = 4096
    let conn = lib.connect(info)
    let ch = conn.createChannel()
    // Create a message with a body larger than a single frame
    const body = 'a'.repeat(4099)
    let q = ch.declareQueue('')
    ch.publish('', q.queue, body)
    let msg = ch.get(q.queue)
    assert.notEqual(typeof msg, 'undefined', 'Message not returned')
    assert.equal(typeof msg, 'object', 'Message returned is not an object')
    assert(msg.content instanceof Buffer, 'Message content if not of type Buffer')
    assert.equal(msg.content.toString(), body, 'Received message content does not queal to message sent')
  }

  testGetBadQueue () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.get('test_get_nonexistantqueue')
    }, 'Must throw excheption retrieving message from nonexistant queue')
  }

  testAckMessage () {
    const body = 'Message at ' + new Date().toISOString()
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, body, { mandatory: true })
    let msg = ch.get(q.queue, { noAck: false })
    assert.equal(typeof msg, 'object', 'Message returned is not an object')
    assert.equal(msg.content.toString(), body, 'Message')
    ch.ack(msg)
    let m2 = ch.get(q.queue, { noAck: false })
    assert.equal(typeof m2, 'undefined', 'No more messages expected')
  }
}
module.exports.TestSuite = TestSuiteGet
