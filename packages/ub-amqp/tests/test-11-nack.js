const base = require('./testconnected')

class TestSuiteNack extends base.TestConnected {
  testNackBasic () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, 'Message Body')
    let tag = ch.consume(q.queue, { noAck: false })
    let msg = ch.consumeMessage(tag)
    ch.nack(msg)
  }

  testNackWithRequeue () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, 'Message Body')
    let tag = ch.consume(q.queue, { noAck: false })
    let msg = ch.consumeMessage(tag)
    ch.nack(msg, false, true)
    let m2 = ch.consumeMessage(tag)
    ch.nack(m2, false, false)
  }

  testReject () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, 'Message Body')
    let tag = ch.consume(q.queue, { noAck: false })
    let msg = ch.consumeMessage(tag)
    ch.reject(msg, true)
    let m2 = ch.consumeMessage(tag)
    ch.reject(m2, false)
  }
}
module.exports.TestSuite = TestSuiteNack
