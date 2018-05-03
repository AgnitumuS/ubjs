const UB = require('@unitybase/ub')
/* global cdn_bank cdn_city */
// eslint-disable-next-line camelcase
let me = cdn_bank

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_city.on('update:after', setDescriptionAttributeByCity)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  const execParams = ctx.mParams.execParams
  let cityName = execParams.cityID || instanceData.cityID
    ? (UB.Repository('cdn_city').attrs('name')
      .selectById(execParams.cityID || instanceData.cityID)).name || ''
    : ''

  execParams.description =
    (execParams.MFO || instanceData.MFO || '') + ' ' +
    (execParams.name || instanceData.name || '') + ' ' +
    cityName
}

function setDescriptionAttributeByCity (ctx) {
  let bankStore = UB.DataStore('cdn_bank')
  let cdnAccount = UB.Repository('cdn_bank')
    .attrs(['ID', 'mi_modifyDate'])
    .where('cityID', 'equal', ctx.mParams.execParams.ID)
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
