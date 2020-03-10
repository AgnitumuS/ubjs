const UB = require('@unitybase/ub')
/* global org_orgaccount cdn_currency cdn_bank */
// eslint-disable-next-line camelcase
const me = org_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_currency.on('update:after', setDescriptionAttributeByCurrency)
cdn_bank.on('update:after', setDescriptionAttributeByBank)

const ORG_ACCOUNT_STORE = UB.DataStore('org_orgaccount')

function setDescriptionAttribute (ctx) {
  const instanceData = ctx.dataStore.getAsJsObject()[0] || {}
  const execParams = ctx.mParams.execParams
  const accTypeName = UB.Repository('ubm_enum').attrs(['name'])
    .where('eGroup', '=', 'CDN_ACCOUNTTYPE')
    .where('code', '=', execParams.acctype || instanceData.acctype)
    .selectScalar() || ''
  const currencyCode3 = (UB.Repository('cdn_currency').attrs(['code3'])
    .misc({ __allowSelectSafeDeleted: true })
    .selectById(execParams.currencyID || instanceData.currencyID)).code3 || ''
  const bankDescription = (UB.Repository('cdn_bank').attrs(['description'])
    .misc({ __allowSelectSafeDeleted: true })
    .selectById(execParams.bankID || instanceData.bankID)).description || ''

  execParams.description = accTypeName + ' ' +
    (execParams.code || instanceData.code || '') + ' ' +
    currencyCode3 + ' (' + bankDescription + ')'
}

function setDescriptionAttributeByCurrency (ctx) {
  const orgAccount = UB.Repository('org_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('currencyID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()

  orgAccount.forEach((item) => {
    ORG_ACCOUNT_STORE.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}

function setDescriptionAttributeByBank (ctx) {
  const orgAccount = UB.Repository('org_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('bankID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()

  orgAccount.forEach((item) => {
    ORG_ACCOUNT_STORE.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}
