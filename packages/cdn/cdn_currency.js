let me = cdn_currency

me.on('insert:before', setDescriptionAttribute)
me.on('update:before', setDescriptionAttribute)

function setDescriptionAttribute (ctx) {
  let instanceData = JSON.parse(ctx.dataStore.asJSONObject)[0] || {}
  ctx.mParams.execParams.description = (ctx.mParams.execParams.code3 || instanceData.code3 || '') + ' ' +
    (ctx.mParams.execParams.name || instanceData.name || '')

}