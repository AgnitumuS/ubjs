const UB = require('@unitybase/ub')
/* global cdn_bank cdn_city */
// eslint-disable-next-line camelcase
const me = cdn_bank

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_city.on('update:after', setDescriptionAttributeByCity)

function setDescriptionAttribute (ctx) {
  const instanceData = ctx.dataStore.getAsJsObject()[0] || {}
  const execParams = ctx.mParams.execParams
  const cityName = execParams.cityID || instanceData.cityID
    ? (UB.Repository('cdn_city').attrs('name')
      .misc({ __allowSelectSafeDeleted: true })
      .selectById(execParams.cityID || instanceData.cityID)).name || ''
    : ''

  execParams.description =
    (execParams.MFO || instanceData.MFO || '') + ' ' +
    (execParams.name || instanceData.name || '') + ' ' +
    cityName
}

function setDescriptionAttributeByCity (ctx) {
  const bankStore = UB.DataStore('cdn_bank')
  const cdnAccount = UB.Repository('cdn_bank')
    .attrs(['ID', 'mi_modifyDate'])
    .where('cityID', 'equal', ctx.mParams.execParams.ID)
    .misc({ __allowSelectSafeDeleted: true })
    .selectAsObject()
  cdnAccount.forEach((item) => {
    // trigger update:before to set a description
    bankStore.run('update', {
      execParams: {
        ID: item.ID,
        mi_modifyDate: item.mi_modifyDate,
        description: ''
      }
    })
  })
}
