let me = org_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_currency.on('update:after', setDescriptionAttributeByCurrency)
cdn_bank.on('update:after', setDescriptionAttributeByBank)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  let acctypeName = UB.Repository('ubm_enum').attrs(['name'])
    .where('eGroup', '=', 'CDN_ACCOUNTTYPE')
    .where('code', '=', ctx.mParams.execParams.acctype || instanceData.acctype)
    .selectScalar() || ''
  let currencyCode3 = (UB.Repository('cdn_currency').attrs(['code3'])
    .selectById(ctx.mParams.execParams.currencyID || instanceData.currencyID)).code3 || ''
  let bankDescription = (UB.Repository('cdn_bank').attrs(['description'])
    .selectById(ctx.mParams.execParams.bankID || instanceData.bankID)).description || ''

  ctx.mParams.execParams.description = acctypeName + ' ' +
    (ctx.mParams.execParams.code || instanceData.code || '') + ' ' +
    currencyCode3 + ' (' + bankDescription + ')'
}

function setDescriptionAttributeByCurrency (ctx) {
  let orgStore = new TubDataStore('org_orgaccount')
  let orgAccount =  UB.Repository('org_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('currencyID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()

  orgAccount.forEach((item) => {
    orgStore.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}

function setDescriptionAttributeByBank (ctx) {
  let orgStore = new TubDataStore('org_orgaccount')
  let orgAccount =  UB.Repository('org_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('bankID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()

  orgAccount.forEach((item) => {
    orgStore.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}