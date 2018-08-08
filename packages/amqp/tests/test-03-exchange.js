const assert = require('assert')
const base = require('./testconnected')
const lib = require('..')

class TestSuiteExchange extends base.TestConnected {
  testExchangeBasic () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_defaults')
    ch.deleteExchange('declare_defaults')
  }

  testExchangeDirect () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_direct', lib.AmqpExchangeType.DIRECT)
    ch.deleteExchange('declare_direct')
  }

  testExchangeFanout () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_fanout', lib.AmqpExchangeType.FANOUT)
    ch.deleteExchange('declare_fanout')
  }

  testExchangeTopic () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_topic', lib.AmqpExchangeType.TOPIC)
    ch.deleteExchange('declare_topic')
  }

  testExchangePassiveGood () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_passive', lib.AmqpExchangeType.DIRECT)
    try {
      ch.declareExchange('declare_passive', lib.AmqpExchangeType.DIRECT, { passive: true })
    } finally {
      ch.deleteExchange('declare_passive')
    }
  }

  testExchangePassiveNotExist () {
    let ch = this.NewConnection().createChannel()
    assert.throws(() => {
      ch.declareExchange('declare_passive_notexist', lib.AmqpExchangeType.DIRECT, { passive: true })
    }, 'Must throw an exception when declaring exchange with passive = true while it was not previously declared')
  }

  testExchangeTypeMismatch () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_typemismatch', lib.AmqpExchangeType.DIRECT)
    try {
      assert.throws(() => {
        ch.declareExchange('declare_typemismatch', lib.AmqpExchangeType.FANOUT)
      }, 'Must throw an exception when redeclaring exchange with different type')
    } finally {
      ch.deleteExchange('declare_typemismatch')
    }
  }

  testExchangeTypeMismatch2 () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_typemismatch', lib.AmqpExchangeType.DIRECT)
    try {
      assert.throws(() => {
        ch.declareExchange('declare_typemismatch', lib.AmqpExchangeType.DIRECT, { durable: true })
      }, 'Must throw an exception when redeclaring exchange with different type')
    } finally {
      ch.deleteExchange('declare_typemismatch')
    }
  }

  testExchangeDurable () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_durable', lib.AmqpExchangeType.DIRECT, { durable: true })
    ch.deleteExchange('declare_durable')
  }

  testExchangeAutodelete () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('declare_autodelete', lib.AmqpExchangeType.DIRECT, { autoDelete: true })
    ch.deleteExchange('declare_autodelete')
  }

  testExchangeDelete () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('delete_exchange')
    ch.deleteExchange('delete_exchange')
  }

  testExchangeDeleteNotExist () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- curent broker version does not throw exceptions in this case
    ch.deleteExchange('exchange_notexist')
    // } , 'Must throw an exception when deleting non-existant exchange')
  }

  testExchangeDeleteIfUnused () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('exchange_used', lib.AmqpExchangeType.DIRECT)
    ch.deleteExchange('exchange_used', true)
  }

  testExchangeDeleteIfUsed () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('exchange_used', lib.AmqpExchangeType.DIRECT)
    let q = ch.declareQueue('')
    try {
      ch.bindQueue(q.queue, 'exchange_used', 'whatever')

      assert.throws(() => {
        ch.deleteExchange('exchange_used', { ifUnused: true })
      }, 'Must throw an exception when deleting a used exchange')
    } finally {
      ch.deleteQueue(q.queue)
      ch.deleteExchange('exchange_used')
    }
  }

  testExchangeBind () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('exchange_bind_dest')
    ch.declareExchange('exchange_bind_src')
    try {
      ch.bindExchange('exchange_bind_dest', 'exchange_bind_src', 'rk')
    } finally {
      ch.deleteExchange('exchange_bind_dest')
      ch.deleteExchange('exchange_bind_src')
    }
  }

  testExchangeBindBad () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('exchange_bindbad_dest')
    try {
      assert.throws(() => {
        ch.bindExchange('exchange_bindbad_dest', 'exchange_bind_notexist', 'rk')
      })
    } finally {
      ch.deleteExchange('exchange_bindbad_dest')
    }
  }

  testExchangeUnbind () {
    let ch = this.NewConnection().createChannel()
    ch.declareExchange('exchange_unbind_dest')
    ch.declareExchange('exchange_unbind_src')
    try {
      ch.bindExchange('exchange_unbind_dest', 'exchange_unbind_src', 'rk')
      ch.unbindExchange('exchange_unbind_dest', 'exchange_unbind_src', 'rk')
    } finally {
      ch.deleteExchange('exchange_unbind_dest')
      ch.deleteExchange('exchange_unbind_src')
    }
  }

  testExchangeBadBinding () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current broker versions does not throw exception in this case
    ch.unbindExchange('exchange_notexist', 'exchange_notexist', 'notexist')
    // }, 'Must throw exception when unbinding nonexisting exchanges')
  }
}
module.exports.TestSuite = TestSuiteExchange
