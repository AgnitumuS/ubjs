let me = cdn_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  let currencyName = (UB.Repository('cdn_currency').attrs(['name'])
    .selectById(ctx.mParams.execParams.currencyID || instanceData.currencyID)).name || ''
  let bankName = (UB.Repository('cdn_bank').attrs(['name'])
    .selectById(ctx.mParams.execParams.bankID || instanceData.bankID)).name || ''

  ctx.mParams.execParams.description = (ctx.mParams.execParams.code || instanceData.code || '') + ' ' +
    currencyName + ' ' + bankName
}
