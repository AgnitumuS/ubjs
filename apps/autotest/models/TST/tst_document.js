/* global tst_document */
const me = tst_document
const UB = require('@unitybase/ub')

me.entity.addMethod('updateNotLocked')
me.entity.addMethod('runSelectInJSContext')
me.entity.addMethod('runInAnotherConn')
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
  const ccIdx = ctx.mParams.fieldList.indexOf('person.fullFIO')
  if (ccIdx !== -1) {
    ctx.dataStore.setColumnName(ccIdx, 'personFIO')
  }
  console.log('clonedParams', clonedParams)
  console.log('mParams', mParams)
}

me.testMailQueue = function (ctx) {
  const ID = UB.Repository('ubq_messages').attrs('ID').limit(1).selectScalar()
  const ubqMessagesStore = UB.DataStore('ubq_messages')
  ubqMessagesStore.run('insert', {
    // fieldList: ['ID'],
    execParams: {
      queueCode: 'mail',
      msgCmd: JSON.stringify({ from: 'aa', to: 'aa' }),
      msgData: '<h1>hello</h1>',
      msgPriority: 0
    }
  })
  ubqMessagesStore.run('update', {
    // fieldList: ['ID'],
    __skipOptimisticLock: true,
    execParams: { ID, msgPriority: 1 }
  })
}
me.entity.addMethod('testMailQueue')

/**
 * Verify changing of entity code to point to another entity in different connection
 * @param {ubMethodParams} ctx
 */
me.runInAnotherConn = function (ctx) {
  ctx.dataStore.runSQL('select * from uba_user', {})
  ctx.dataStore.switchEntity('fts_ftsDefault')
  ctx.dataStore.runSQL('SELECT A01.ID,A01.entity,A01.ftsentity,A01.dy,A01.dm,A01.dd,A01.datacode,A01.aclrls,A01.entitydescr,A01.databody FROM ftsDefault_en A01  LIMIT 10 OFFSET 0', {})
}

/**
 * Fake RLS just to ensure entity with RLS mixin return total correctly if select() is implemented in `select:before` event
 * @return {string}
 */
me.rlsSql = function () {
  return '1=1'
}
