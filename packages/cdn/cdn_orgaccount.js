const UB = require('@unitybase/ub')
/* global cdn_orgaccount cdn_currency cdn_bank */
// eslint-disable-next-line camelcase
const me = cdn_orgaccount

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_currency.on('update:after', setDescriptionAttributeByCurrency)
cdn_bank.on('update:after', setDescriptionAttributeByBank)

/**
 * Calculate cdn_orgaccount description as "account type" + "account code" + "currency code3" + "bank MFO"
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
  const acctypeName = UB.Repository('ubm_enum').attrs('name')
    .where('eGroup', '=', 'CDN_ACCOUNTTYPE')
    .where('code', '=', execParams.acctype || oldData.acctype)
    .selectScalar() || ''
  const currencyCode3 = UB.Repository('cdn_currency').attrs('code3')
    .where('ID', '=', execParams.currencyID || oldData.currencyID)
    .selectScalar() || ''
  const bankID = execParams.bankID || oldData.bankID
  let bankDescription
  if (bankID) {
    bankDescription = UB.Repository('cdn_bank').attrs('description')
      .where('ID', '=', bankID)
      .selectScalar() || ''
  }

  execParams.description = `${acctypeName}  ${execParams.code || oldData.code || ''} ${currencyCode3}`
  if (bankDescription) execParams.description += ` (${bankDescription})`
}

/**
 * Update accounts description for all cdn_orgaccount with currencyID = edited currency ID (in case currency.code3 is changed)
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttributeByCurrency (ctx) {
  const execParams = ctx.mParams.execParams
  if (!execParams.code3) return // currency code3 not changed - nothing to update

  const cdnStore = UB.DataStore('cdn_orgaccount')
  const cdnAccount = UB.Repository('cdn_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('currencyID', 'equal', execParams.ID)
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
 * Update accounts description for all cdn_orgaccount with bankID = edited bank ID (in case bank.description is changed)
 * @private
 * @param {ubMethodParams} ctx
 */
function setDescriptionAttributeByBank (ctx) {
  const execParams = ctx.mParams.execParams
  if (!execParams.description) return // bank description not changed - nothing to update

  const cdnStore = UB.DataStore('cdn_orgaccount')
  const cdnAccount = UB.Repository('cdn_orgaccount')
    .attrs(['ID', 'mi_modifyDate'])
    .where('bankID', 'equal', execParams.ID)
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
