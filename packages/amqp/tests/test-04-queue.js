const assert = require('assert')
const base = require('./testconnected')

class TestSuiteQueue extends base.TestConnected {
  testBasic () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
      assert.equal(typeof q, 'object', 'The result of declareQueue call must be an object')
      assert(typeof q.queue, 'string', 'Property queue must be of type "string"')
      assert.notEqual(q.queue, '', 'The returned queue name must not be an ampty string')
      assert(typeof q.messageCount, 'number', 'Property messageCount must be of type "number"')
      assert(typeof q.consumerCount, 'number', 'Property consumerCount must be of type "number"')
    } finally {
      let n = ch.deleteQueue(q.queue)
      assert.notEqual(typeof n, 'undefined', 'Function deleteQueue does not return any result')
      assert.equal(typeof n, 'number', 'The result of deleteQueue function must be a number')
      assert(n >= 0 && Number.isInteger(n), 'The deleteQueue function must return 0 or positive integer')
    }
  }

  testNamed () {
    const qName = 'declare_queue_test'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      assert.equal(q.queue, qName, 'Returned name must be identical to provided')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testPassive () {
    const qName = 'declare_queue_test'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
      q = ch.declareQueue(qName, { passive: true })
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testPassiveFail () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.declareQueue('declare_queue_test_fail', { passive: true })
    }, 'Passive flag requires queue to be previously declared')
  }

  testDeclareDurable () {
    const qName = 'declare_queue_durable'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName, { durable: true })
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDeclareExclusive () {
    const qName = 'declare_queue_exclusive'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName, { exclusive: true })
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDeclareAutoDelete () {
    const qName = 'declare_queue_autodelete'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName, { autoDelete: true })
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDeclareCounts () {
    const qName = 'queue_declare_counts'
    let ch = this.NewConnection().createChannel()
    ch.deleteQueue(qName)
    let q = ch.declareQueue(qName)
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
      assert.equal(typeof q, 'object', 'The result of declareQueue call must be an object')
      assert(typeof q.queue, 'string', 'Property queue must be of type "string"')
      assert.equal(q.queue, qName, 'The returned queue name must identical to provided')
      assert(typeof q.messageCount, 'number', 'Property messageCount must be of type "number"')
      assert(typeof q.consumerCount, 'number', 'Property consumerCount must be of type "number"')
      assert.equal(q.messageCount, 0, 'Number of messages of newly created queue must be equal to 0')
      assert.equal(q.consumerCount, 0, 'Number of consumers of newly created queue must be equal to 0')

      ch.publish('', qName, 'Test message')
      ch.publish('', qName, 'Test message')
      ch.publish('', qName, 'Test message')

      let q2 = ch.declareQueue(qName)
      assert.notEqual(typeof q2, 'undefined', 'Function declareQueue does not return any result')
      assert.equal(typeof q2, 'object', 'The result of declareQueue call must be an object')
      assert(typeof q2.queue, 'string', 'Property queue must be of type "string"')
      assert.equal(q2.queue, qName, 'The returned queue name must identical to provided')
      assert(typeof q2.messageCount, 'number', 'Property messageCount must be of type "number"')
      assert(typeof q2.consumerCount, 'number', 'Property consumerCount must be of type "number"')
      assert.equal(q2.messageCount, 3, 'Number of messages of redeclared queue must be equal to 3')
      assert.equal(q2.consumerCount, 0, 'Number of consumers of redeclared queue must be equal to 0')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDeclareCountsTable () {
    const qName = 'queue_declare_counts_table'
    let ch = this.NewConnection().createChannel()
    ch.deleteQueue(qName)
    let q = ch.declareQueue(qName, { arguments: { isATest: true } })
    try {
      assert.notEqual(typeof q, 'undefined', 'Function declareQueue does not return any result')
      assert.equal(typeof q, 'object', 'The result of declareQueue call must be an object')
      assert(typeof q.queue, 'string', 'Property queue must be of type "string"')
      assert.equal(q.queue, qName, 'The returned queue name must identical to provided')
      assert(typeof q.messageCount, 'number', 'Property messageCount must be of type "number"')
      assert(typeof q.consumerCount, 'number', 'Property consumerCount must be of type "number"')
      assert.equal(q.messageCount, 0, 'Number of messages of newly created queue must be equal to 0')
      assert.equal(q.consumerCount, 0, 'Number of consumers of newly created queue must be equal to 0')

      ch.publish('', qName, 'Test message')
      ch.publish('', qName, 'Test message')
      ch.publish('', qName, 'Test message')

      let q2 = ch.declareQueue(qName, { arguments: { isATest: true } })
      assert.notEqual(typeof q2, 'undefined', 'Function declareQueue does not return any result')
      assert.equal(typeof q2, 'object', 'The result of declareQueue call must be an object')
      assert(typeof q2.queue, 'string', 'Property queue must be of type "string"')
      assert.equal(q2.queue, qName, 'The returned queue name must identical to provided')
      assert(typeof q2.messageCount, 'number', 'Property messageCount must be of type "number"')
      assert(typeof q2.consumerCount, 'number', 'Property consumerCount must be of type "number"')
      assert.equal(q2.messageCount, 3, 'Number of messages of redeclared queue must be equal to 3')
      assert.equal(q2.consumerCount, 0, 'Number of consumers of redeclared queue must be equal to 0')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDelete () {
    const qName = 'delete_queue'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    ch.deleteQueue(q.queue)
    assert.throws(() => {
      ch.declareQueue(qName, { passive: true })
    }, 'Queue was not successfully deleted')
  }

  testDeleteNonexisting () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current broker versions does not throw exception in this case
    ch.deleteQueue('delete_queue_notexist')
    // }, 'Must throw an exception when deleting non-existing queue')
  }

  testDeleteIfUnused () {
    const qName = 'delete_queue_ifunused'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    ch.deleteQueue(q.queue, { ifUnused: true })
    assert.throws(() => {
      ch.declareQueue(qName, { passive: true })
    }, 'Unused queue had to be deleted')
  }

  testDeleteIfUsed () {
    const qName = 'delete_queue_ifused'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      ch.consume(q.queue)
      assert.throws(() => {
        ch.deleteQueue(q.queue, { ifUnused: true })
      }, 'Used queue must not be deleted')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testDeleteIfEmpty () {
    const qName = 'delete_queue_ifempty'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    ch.deleteQueue(q.queue, { ifEmpty: true })
    assert.throws(() => {
      ch.declareQueue(qName, { passive: true })
    }, 'Empty queue had to be deleted')
  }

  testDeleteIfNotEmpty () {
    const qName = 'delete_queue_ifnotempty'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      ch.publish('', q.queue, 'Message body', { mandatory: true })
      // assert.throws(() => { -- cuurent implementation does not throw exception in this case
      ch.deleteQueue(q.queue, { ifUnused: true })
      // }, 'A queue with messages must not be deleted')
      ch.publish('', q.queue, 'Message body', { mandatory: true })
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testBind () {
    const qName = 'queue_bind_queue'
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('queue_bind_exchange')
    let q = ch.declareQueue(qName)
    try {
      ch.bindQueue(q.queue, 'queue_bind_exchange', 'rk')
      ch.deleteExchange('queue_bind_exchange')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testBindBadExchange () {
    const qName = 'queue_bind_badexchange'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      assert.throws(() => {
        ch.bindQueue(q.queue, 'queue_bind_exchangenotexist', 'rk')
      }, 'Must throw exception when bining to not existing exchange')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testBindBadQueue () {
    const eName = 'queue_bind_badqueue'
    let ch = this.NewConnection().createChannel()
    ch.declareExchange(eName)
    try {
      assert.throws(() => {
        ch.bindQueue('queue_bind_queuenotexist', eName, 'rk')
      }, 'Must throw exception when bining of not existing queue')
    } finally {
      ch.deleteExchange(eName)
    }
  }

  testBindNoKey () {
    const qName = 'queue_bind_queue'
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('queue_bind_exchange')
    let q = ch.declareQueue(qName)
    try {
      ch.bindQueue(q.queue, 'queue_bind_exchange')
      ch.deleteExchange('queue_bind_exchange')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testUnbind () {
    const qName = 'queue_unbind_queue'
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('queue_unbind_exchange')
    let q = ch.declareQueue(qName)
    try {
      ch.bindQueue(q.queue, 'queue_unbind_exchange', 'rk')
      ch.unbindQueue(q.queue, 'queue_unbind_exchange', 'rk')
      ch.deleteExchange('queue_unbind_exchange')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testUnbindBadBinding () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current broker versions does not throw exception in this case
    ch.unbindQueue('queue_unbind_queuenotexist', 'queue_unbind_exchangenotexist', 'rk')
    // }, 'Must throw when unbinging from proviously not declared and bound queue and exchange')
  }

  testPurge () {
    const qName = 'queue_purge'
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue(qName)
    try {
      ch.publish('', q.queue, 'Message body', { mandatory: true })
      ch.purgeQueue(q.queue)
      let msg = ch.get(q.queue)
      assert.equal(typeof msg, 'undefined', 'No messages expected')
    } finally {
      ch.deleteQueue(qName)
    }
  }

  testPurgeBadQueue () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.purgeQueue('purge_queue_queuenotexist')
    }, 'Must throw when purging non existing queue')
  }
}
module.exports.TestSuite = TestSuiteQueue
