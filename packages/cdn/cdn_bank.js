let me = cdn_bank

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)
cdn_city.on('update:after', setDescriptionAttributeByCity)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  let cityName = (ctx.mParams.execParams.cityID || instanceData.cityID ? (UB.Repository('cdn_city').attrs(['name'])
    .selectById(ctx.mParams.execParams.cityID || instanceData.cityID)).name || '' : '')

  ctx.mParams.execParams.description =
    (ctx.mParams.execParams.MFO || instanceData.MFO || '') + ' ' +
    (ctx.mParams.execParams.name || instanceData.name || '') + ' ' +
    cityName
}

function setDescriptionAttributeByCity (ctx) {
  let cdnStore = new TubDataStore('cdn_bank')
  let cdnAccount =  UB.Repository('cdn_bank')
    .attrs(['ID', 'mi_modifyDate'])
    .where('cityID', 'equal', ctx.mParams.execParams.ID)
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