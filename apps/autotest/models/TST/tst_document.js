const me = tst_document
const UB = require('@unitybase/ub')

me.entity.addMethod('updateNotLocked')
me.entity.addMethod('runSelectInJSContext')
/**
 * Update instance without lock to test how "not locked" error is handled \
 * when called from JS
 * @param {ubMethodParams} ctx
 */
me.updateNotLocked = function (ctx) {
  UB.DataStore('tst_document').run('update', ctx.mParams)
}

/**
 * Run query in JS context. Used by 0020_test_mixins to check totalRequired works as expected
 * when called from JS
 * @param {ubMethodParams} ctx
 */
me.runSelectInJSContext = function (ctx) {
  const mParams = ctx.mParams
  const clonedParams = Object.assign({}, ctx.mParams)
  ctx.dataStore.run(
    'select',
    clonedParams
  )
  console.log('clonedParams', clonedParams)
  console.log('mParams', mParams)
}

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

/**
 * Fake RLS just to ensure entity with RLS mixin return total correctly if select() is implemented in `select:before` event
 * @return {string}
 */
me.rlsSql = function () {
  return '1=1'
}
