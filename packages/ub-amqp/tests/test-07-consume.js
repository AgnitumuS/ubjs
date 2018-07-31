const assert = require('assert')
const base = require('./testconnected')

class TestSuiteConsume extends base.TestConnected {
  testConsumeBasic () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    assert.equal(typeof tag, 'string', 'Result must be string')
  }

  testConsumeBadQueue () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.consume('test_consume_noexistqueue')
    }, 'Must throw an exception when consuming from non existant queue')
  }

  testConsumeDuplicateTag () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    assert.throws(() => {
      ch.consume(q.queue, { consumerTag: tag })
    }, 'Must throw an exception when consuming with duplicated tag')
  }

  testConsumeCancel () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    ch.cancel(tag)
  }

  testConsumeCancelBad () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current version of broker does not throw exception in this case
    ch.cancel('test_consume_noexistconsumer')
    // }, 'Must throw an exception trying to cancel not existing consumer')
  }

  testConsumeDoubleCancel () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    ch.cancel(tag)
    // assert.throws(() => { -- current version of broker does not throw exception in this case
    ch.cancel(tag)
    // }, 'Must throw an exception trying to cancel already canceled consumer')
  }

  testConsumeMessage () {
    const body = 'Message Body'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    ch.publish('', q.queue, body)

    let msg = ch.consumeMessage(tag, 3)
    assert.notEqual(typeof msg, 'undefined', 'Message not returned')
    assert.equal(typeof msg, 'object', 'Message returned is not an object')
    assert.equal(msg.fields.consumerTag, tag, 'Must be delivered to specified consumer')
    assert.equal(msg.fields.exchange, '', 'Invalid exchange returned')
    assert.equal(msg.fields.routingKey, q.queue, 'Invalid queue returned')
    assert.equal(msg.content.toString(), body, 'Invalid body returned')
  }
/* This test hangs as currently no check is implemented
  testConsumeMessageBadConsumer () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.consumeMessage('test_consume_noexistconsumer', 0)
    }, 'Must throw an exception trying to consume message with invalid tag')
  }
*/
  testConsumeInitialQos () {
    const body1 = 'Message 1'
    const body2 = 'Message 2'
    const body3 = 'Message 3'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, body1)
    ch.publish('', q.queue, body2)
    ch.publish('', q.queue, body3)

    let tag = ch.consume(q.queue)

    let msg1 = ch.consumeMessage(tag, 1)
    assert.notEqual(typeof msg1, 'undefined', 'Message 1 not returned')
    assert.equal(typeof msg1, 'object', 'Message 1 returned is not an object')
    assert.equal(msg1.content.toString(), body1, 'Invalid body returned for message 1')

    let msg2
    msg2 = ch.consumeMessage(tag, 1)
    assert.equal(typeof msg2, 'undefined', 'Must not return message before acknowledge')

    ch.ack(msg1)
    msg2 = ch.consumeMessage(tag, 1)
    assert.notEqual(typeof msg2, 'undefined', 'Message 2 not returned')
    assert.equal(typeof msg2, 'object', 'Message 2 returned is not an object')
    assert.equal(msg2.content.toString(), body2, 'Invalid body returned for message 2')
  }

  testConsume2Consumers () {
    const body1 = 'Message 1'
    const body2 = 'Message 2'
    const body3 = 'Message 3'
    let ch = this.NewConnection().createChannel()
    let q1 = ch.declareQueue('')
    let q2 = ch.declareQueue('')
    let q3 = ch.declareQueue('')
    ch.publish('', q1.queue, body1)
    ch.publish('', q2.queue, body2)
    ch.publish('', q3.queue, body3)

    let tag1 = ch.consume(q1.queue, { noAck: false })
    let tag2 = ch.consume(q2.queue, { noAck: false })

    let msg1 = ch.consumeMessage(tag1)
    assert.notEqual(typeof msg1, 'undefined', 'Message 1 not returned')
    assert.equal(typeof msg1, 'object', 'Message 1 returned is not an object')
    assert.equal(msg1.content.toString(), body1, 'Invalid body returned for message 1')
    ch.ack(msg1)
    let msg2 = ch.consumeMessage(tag2)
    assert.notEqual(typeof msg2, 'undefined', 'Message 2 not returned')
    assert.equal(typeof msg2, 'object', 'Message 2 returned is not an object')
    assert.equal(msg2.content.toString(), body2, 'Invalid body returned for message 2')
    ch.ack(msg2)
    let msg3 = ch.get(q3.queue)
    assert.notEqual(typeof msg3, 'undefined', 'MessageMessage 3 not returned')
    assert.equal(typeof msg3, 'object', 'Message 3 returned is not an object')
    assert.equal(msg3.content.toString(), body3, 'Invalid body returned for message 3')
    ch.ack(msg3)
  }

  testConsume100Messages () {
    const body = 'Message Body'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)

    for (let i = 0; i < 100; i++) {
      let msg
      try {
        ch.publish('', q.queue, body + i)
        msg = ch.consumeMessage(tag, 1)
        assert.notEqual(typeof msg, 'undefined', `Message ${i} not returned`)
        assert.equal(typeof msg, 'object', `Message ${i} returned is not an object`)
        assert.equal(msg.fields.consumerTag, tag, `Message ${i} must be delivered to specified consumer`)
        assert.equal(msg.fields.exchange, '', `Message ${i} - invalid exchange returned`)
        assert.equal(msg.fields.routingKey, q.queue, `Message ${i} - invalid queue returned`)
        assert.equal(msg.content.toString(), body + i, `Message ${i} - invalid body returned`)
      } catch (e) {
        console.error(`Error at iteration ${i}, message is ${((msg || {}).content || '').toString()}:\n`, msg)
        throw e
      }
    }
  }

  testRecoverBasic () {
    const body = 'Message 1'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    ch.publish('', q.queue, body)

    let msg1 = ch.consumeMessage(tag)
    assert.notEqual(typeof msg1, 'undefined', 'Message 1 not returned')
    assert.equal(typeof msg1, 'object', 'Message 1 returned is not an object')
    assert.equal(msg1.content.toString(), body, 'Invalid body returned for message 1')
    ch.recover()
    let msg2 = ch.consumeMessage(tag, 1)
    assert.notEqual(typeof msg2, 'undefined', 'Message 2 not returned')
    assert.equal(typeof msg2, 'object', 'Message 2 returned is not an object')
    assert.equal(msg2.content.toString(), body, 'Invalid body returned for message 2')

    ch.deleteQueue(q.queue)
  }

  testQosBasic () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue)
    ch.publish('', q.queue, 'Message 1')
    ch.publish('', q.queue, 'Message 2')

    let m1 = ch.consumeMessage(tag, 1)
    assert.notEqual(typeof m1, 'undefined', 'Message 1 not returned')
    let m2 = ch.consumeMessage(tag, 1)
    assert.equal(typeof m2, 'undefined', 'Message 2 must not be returned')

    ch.prefetch(2)
    let msg = ch.consumeMessage(tag, 1)
    assert.notEqual(typeof msg, 'undefined', 'Message 2 not returned')

    ch.deleteQueue(q.queue)
  }

  testConsumeCancelled () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue, { noAck: false })
    ch.deleteQueue(q.queue)

    assert.throws(() => {
      ch.consumeMessage(tag)
    })
  }

  testConsumeAfterDelete () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    let tag = ch.consume(q.queue, { noAck: false })

    ch.publish('', q.queue, 'Message')
    ch.consumeMessage(tag)

    ch.deleteQueue(q.queue)
    assert.throws(() => {
      ch.consumeMessage(tag)
    })
  }

  testConsumeMultiple () {
    const body = 'Message Body'
    let ch = this.NewConnection().createChannel()
    let q1 = ch.declareQueue('')
    let q2 = ch.declareQueue('')
    ch.publish('', q1.queue, body)

    ch.consume(q1.queue, { noAck: false })
    ch.consume(q2.queue, { noAck: false })

    let msg = ch.consumeMessage('')
    assert.notEqual(typeof msg, 'undefined', 'Message not returned')
    assert.equal(typeof msg, 'object', 'Message returned is not an object')
    assert.equal(msg.content.toString(), body, 'Invalid body returned')
  }
}
module.exports.TestSuite = TestSuiteConsume
