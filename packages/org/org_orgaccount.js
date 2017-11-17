let me = org_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  let acctypeName = (UB.Repository('ubm_enum').attrs(['name'])
    .where('eGroup', '=', 'CDN_ACCOUNTTYPE')
    .where('code', '=', ctx.mParams.execParams.acctype || instanceData.acctype)
    .selectAsObject()[0]).name || ''
  let currencyCode3 = (UB.Repository('cdn_currency').attrs(['code3'])
    .selectById(ctx.mParams.execParams.currencyID || instanceData.currencyID)).code3 || ''
  let bankMFO = (UB.Repository('cdn_bank').attrs(['MFO'])
    .selectById(ctx.mParams.execParams.bankID || instanceData.bankID)).MFO || ''

  ctx.mParams.execParams.description = acctypeName + ' ' +
    (ctx.mParams.execParams.code || instanceData.code || '') + ' ' +
    currencyCode3 + ' (' + bankMFO + ')'
}
