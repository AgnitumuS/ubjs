const {
  EntityFormat,
  EntityRepository
} = require('@unitybase/ub-migrate').extend

module.exports = function (container) {
  container.registerRepository(
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
      .copy('ubql')
      .transform(
        'ubql',
        ubql => typeof ubql === 'string' ? ubql : JSON.stringify(ubql)
      )
      .wrapAsEntity('ubm_query')
  )

  container.registerRepository(
    new EntityRepository(
      'ubm_sysdictionary',
      ['code'],
      ['ubql'],
      ['name']
    )
  )
  container.registerFileType(
    'ubm_sysdictionary',
    new EntityFormat()
      .key('code')
      .caption('name')
      .copy('ubql')
      .transform(
        'ubql',
        ubql => typeof ubql === 'string' ? ubql : JSON.stringify(ubql)
      )
      .wrapAsEntity('ubm_sysdictionary')
  )
}
