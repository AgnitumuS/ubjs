const {
  EntityFormat,
  EntityRepository
} = require('@unitybase/ub-migrate').extend

module.exports = function (container) {
  container.registerRepository(
    'ubm_query',
    new EntityRepository(
      'ubm_query',
      ['code'],
      ['ubql'],
      ['name']
    )
  )
  container.registerFileType(
    'ubm_query',
    new EntityFormat()
      .key('code')
      .caption('name')
      .translatable('name')
      .copy('ubql')
      .transform(
        'ubql',
        function (ubql) {
          if (typeof ubql === 'string') {
            return ubql
          } else {
            return JSON.stringify(ubql)
          }
        }
      )
      .wrapAsEntity('ubm_query')
  )
}