const UB = require('@unitybase/ub')
/* global cdn_orgaccount cdn_currency cdn_bank */
// eslint-disable-next-line camelcase
let me = cdn_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_currency.on('update:after', setDescriptionAttributeByCurrency)
cdn_bank.on('update:after', setDescriptionAttributeByBank)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttribute (ctx) {
  let oldData = {}
  const dataStore = ctx.dataStore
  if (!dataStore.eof) {
    oldData = {
      acctype: dataStore.get('acctype'),
      currencyID: dataStore.get('currencyID'),
      bankID: dataStore.get('bankID'),
      code: dataStore.get('code')
    }
  }
  const execParams = ctx.mParams.execParams
  let acctypeName = UB.Repository('ubm_enum').attrs('name')
    .where('eGroup', '=', 'CDN_ACCOUNTTYPE')
    .where('code', '=', execParams.acctype || oldData.acctype)
    .selectScalar() || ''
  let currencyCode3 = UB.Repository('cdn_currency').attrs('code3')
    .where('ID', '=', execParams.currencyID || oldData.currencyID)
    .selectScalar() || ''
  let bankDescription = UB.Repository('cdn_bank').attrs('description')
    .where('ID', '=', execParams.bankID || oldData.bankID)
    .selectScalar() || ''

  execParams.description = acctypeName + ' ' +
    (execParams.code || oldData.code || '') + ' ' +
    currencyCode3 + ' (' + bankDescription + ')'
}

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttributeByCurrency (ctx) {
  let cdnStore = UB.DataStore('cdn_orgaccount')
  let cdnAccount = UB.Repository('cdn_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('currencyID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()
  cdnAccount.forEach((item) => {
    cdnStore.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttributeByBank (ctx) {
  let cdnStore = UB.DataStore('cdn_orgaccount')
  let cdnAccount = UB.Repository('cdn_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('bankID', 'equal', ctx.mParams.execParams.ID)
    .selectAsObject()
  cdnAccount.forEach((item) => {
    cdnStore.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}
