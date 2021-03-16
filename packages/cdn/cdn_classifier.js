const { Repository } = require('@unitybase/ub')

const me = global.cdn_classifier

me.on('insert:before', ctx => {
  autoGenerateUbqlForClassifier(ctx)
})

me.on('update:before', ctx => {
  autoGenerateUbqlForClassifier(ctx)
})

function autoGenerateUbqlForClassifier(ctx) {
  if (ctx.mParams.execParams.ubql) {
    return
  }

  const { mParams, dataStore } = ctx
  const originStoreName = dataStore.currentDataName
  let { code, orderByAttr } = mParams.execParams

  try {
    dataStore.currentDataName = 'selectBeforeUpdate'

    if (code === undefined) {
      code = dataStore.get('code')
    }

    if (orderByAttr === undefined) {
      orderByAttr = dataStore.get('orderByAttr')
    }
  } finally {
    dataStore.currentDataName = originStoreName
  }

  if (!code) {
    return
  }

  mParams.execParams.ubql = JSON.stringify(
    Repository('cdn_classifieritem')
      .attrs('ID', 'code', 'name')
      .where('classifierID.code', '=', code)
      .orderBy(orderByAttr)
      .ubql()
  )
}
