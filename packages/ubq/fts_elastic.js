const ElasticApi = require('./modules/ElasticApi')
const me = fts_elastic

/**
 * Virtual `isElasticFts` implementation.
 * @method isElasticFts
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @return {Boolean}
 * @memberOf fts_elastic.prototype
 * @published
 */
me.isElasticFts = function (ctx) {
  ctx.dataStore.currentDataName = 'isElasticFts'
  const params = ctx.mParams.params
  if (params.entity.substring(0, 4) === 'fts_') {
    return ElasticApi.isElasticConnection(params.entity.substring(4))
  } else {
    return ElasticApi.isElasticFtsEntity(params.entity.entity)
  }
}

me.entity.addMethod('isElasticFts')

/**
 * Virtual `ftsElasticReindex` implementation.
 * @method ftsElasticReindex
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @memberOf fts_elastic.prototype
 * @published
 */
me.ftsElasticReindex = function (ctx) {
  ctx.dataStore.currentDataName = 'ftsElasticReindex'
  const elasticApi = new ElasticApi()
  elasticApi.ftsElasticReindex(ctx.mParams.params)
}

me.entity.addMethod('ftsElasticReindex')
