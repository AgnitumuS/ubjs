/* global cdn_currency */
// eslint-disable-next-line camelcase
const me = cdn_currency
const { App, Session } = UB = require('@unitybase/ub')

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttribute (ctx) {
  const execParams = ctx.mParams.execParams
  const dataStore = ctx.dataStore
  let oldData = {}
  const langs = App.serverConfig.application.domain.supportedLanguages
  if (!dataStore.eof) {
    oldData.code3 = dataStore.get('code3')
    if (typeof execParams.code3 === 'string') {
      let cur = UB.Repository('cdn_currency')
        .attrs(langs.map((l) => `name_${l}^`))
        .selectById(execParams.ID)
      Object.assign(oldData, cur)
    }
  }
  const currencyCode = execParams.code3 || oldData.code3 || ''
  langs.forEach((l) => {
    let newName = execParams[`name_${l}^`] || oldData[`name_${l}^`]
    if (typeof newName === 'string') {
      execParams[`description_${l}^`] = `${currencyCode} - ${newName}`
    }
  })
}
