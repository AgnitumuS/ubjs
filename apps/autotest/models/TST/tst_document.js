const me = tst_document
/**
 * Update instance without lock to test how "not locked" error is handled \
 * when called from JS
 * @param {ubMethodParams} ctx
 */
me.updateNotLocked = function (ctx) {
  UB.DataStore('tst_document').run('update', ctx.mParams)
}
me.entity.addMethod('updateNotLocked')

