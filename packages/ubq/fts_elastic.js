const ElasticApi = require('./modules/ElasticApi')
const me = fts_elastic

/**
 * Virtual `isElastic` implementation.
 * @method isElastic
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @return {Boolean}
 * @memberOf fts_elastic.prototype
 * @published
 */
me.isElastic = function (ctx) {
  ctx.dataStore.currentDataName = 'isElastic'
  const params = ctx.mParams.params
  if (params.entity.substring(0, 4) === 'fts_') {
    return ElasticApi.isElasticConnection(params.entity.substring(4))
  } else {
    return ElasticApi.isElasticFtsEntity(params.entity.entity)
  }
}

me.entity.addMethod('isElastic')

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
  const params = ctx.mParams.params
  const elasticApi = new ElasticApi()
  if (params.entity.substring(0, 4) === 'fts_') {
    return elasticApi.ftsElasticReindexConnection(params.entity.substring(4))
  } else {
    return elasticApi.ftsElasticReindexEntity(params.entity.entity)
  }
}

me.entity.addMethod('ftsElasticReindex')

/**
 * Virtual `ftsElasticSearch` implementation.
 * @method ftsElasticSearch
 * @param {ubMethodParams} ctx
 * @param {UBQL} ctx.mParams ORM query in UBQL format
 * @memberOf fts_elastic.prototype
 * @published
 */
me.fts = function (ctx) {
  ctx.dataStore.currentDataName = 'fts'
  const params = ctx.mParams.params
  const elasticApi = new ElasticApi()
  return elasticApi.fts(params)
}

me.entity.addMethod('fts')
