const base = require('./testconnected')

class TestSuiteAck extends base.TestConnected {
  testAck () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, 'Message Body')
    let tag = ch.consume(q.queue, { noLocal: true, noAck: false })
    let msg = ch.consumeMessage(tag)
    ch.ack(msg)
  }
}
module.exports.TestSuite = TestSuiteAck
