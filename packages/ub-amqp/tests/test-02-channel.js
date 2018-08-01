const assert = require('assert')
const base = require('./testconnected')

class TestSuiteChannels extends base.TestConnected {
  testChannel () {
    let conn = this.NewConnection()
    assert.notEqual(typeof conn, 'undefined', 'Connection did not provided')
    assert(typeof (conn.createChannel()), 'undefined', 'Channel did not created')
  }
}
module.exports.TestSuite = TestSuiteChannels
