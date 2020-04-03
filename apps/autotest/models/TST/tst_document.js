const me = tst_document
const UB = require('@unitybase/ub')
/**
 * Update instance without lock to test how "not locked" error is handled \
 * when called from JS
 * @param {ubMethodParams} ctx
 */
me.updateNotLocked = function (ctx) {
  UB.DataStore('tst_document').run('update', ctx.mParams)
}
me.entity.addMethod('updateNotLocked')

me.testMailQueue = function (ctx) {
  const ID = UB.Repository('ubq_messages').attrs('ID').limit(1).selectScalar()
  const ubqMessagesStore = UB.DataStore('ubq_messages')
  ubqMessagesStore.run('insert', {
    //fieldList: ['ID'],
    execParams: {
      queueCode: 'mail',
      msgCmd: JSON.stringify({from: 'aa', to: 'aa'}),
      msgData: '<h1>hello</h1>',
      msgPriority: 0
    }
  })
  ubqMessagesStore.run('update', {
    //fieldList: ['ID'],
    __skipOptimisticLock: true,
    execParams: { ID, msgPriority: 1 }
  })
}
me.entity.addMethod('testMailQueue')
