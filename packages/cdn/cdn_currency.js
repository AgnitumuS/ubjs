/* global cdn_currency */
// eslint-disable-next-line camelcase
let me = cdn_currency

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttribute (ctx) {
  let oldData = {
    code3: ctx.dataStore.get('code3'),
    name: ctx.dataStore.get('name')
  }
  const execParams = ctx.mParams.execParams
  execParams.description = (execParams.code3 || oldData.code3 || '') + ' ' +
    (execParams.name || oldData.name || '')
}
