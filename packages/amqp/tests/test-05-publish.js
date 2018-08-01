// const assert = require('assert')
const base = require('./testconnected')
const lib = require('./.')

class TestSuitePublish extends base.TestConnected {
  testPublishBasic () {
    let ch = this.NewConnection().createChannel()
    ch.publish('', 'test_publish_rk', 'message body')
  }

  testPublishLargeMessage () {
    const largeMsg = 'a'.repeat(4099)
    let info = Object.assign({}, base.connectionInfo)
    info.frameMax = 4096
    let conn = lib.connect(info)
    let ch = conn.createChannel()
    // Create a message with a body larger than a single frame
    ch.publish('', 'test_publish_rk', largeMsg)
  }

  testPublishBadExchange () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current implementation does not throw exception in this case
    ch.publish('test_publish_notexist', 'test_publish_rk', 'message body')
    // }, 'Must throw exception when publishing to not existing exchange')
  }

  testPublishRecoverFromError () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current implementation does not throw exception in this case
    ch.publish('test_publish_notexist', 'test_publish_rk', 'message body')
    // }, 'Must throw exception when publishing to not existing exchange')
    ch.publish('', 'test_publish_rk', 'message body')
  }

  testPublishMandatoryFail () {
    let ch = this.NewConnection().createChannel()
    // assert.throws(() => { -- current implementation does not throw exception in this case
    ch.publish('', 'test_publish_notexist', 'message body', { mandatory: true })
    // }, 'Must throw exception when publishing to not existing exchange')
  }

  testPublishMandatorySuccess () {
    let ch = this.NewConnection().createChannel()
    let q = ch.declareQueue('')
    ch.publish('', q.queue, 'message body', { mandatory: true })
  }
/*
TEST_F(connected_test, DISABLED_publish_immediate_fail1) {
  BasicMessage::ptr_t message = BasicMessage::Create("message body");

  // No queue connected
  EXPECT_THROW(
      channel->BasicPublish("", "test_publish_notexist", message, false, true),
      MessageReturnedException);
}

TEST_F(connected_test, DISABLED_publish_immediate_fail2) {
  BasicMessage::ptr_t message = BasicMessage::Create("message body");
  std::string queue = channel->DeclareQueue("");

  // No consumer connected
  EXPECT_THROW(channel->BasicPublish("", queue, message, false, true),
               MessageReturnedException);
}

TEST_F(connected_test, publish_immediate_success) {
  BasicMessage::ptr_t message = BasicMessage::Create("message body");
  std::string queue = channel->DeclareQueue("");
  std::string consumer = channel->BasicConsume(queue, "");

  channel->BasicPublish("", queue, message, true);
}
*/
}
module.exports.TestSuite = TestSuitePublish
