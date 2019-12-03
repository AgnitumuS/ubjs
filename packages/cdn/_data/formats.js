const {
  EntityFormat,
  EntityRepository,
  container
} = require('@unitybase/ub-migrate').extend

container.registerRepository(
  'cdn_query',
  new EntityRepository(
    'cdn_query',
    ['code'],
    ['ubql'],
    ['name']
  )
)
container.registerFileType(
  'cdn_query',
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
    .wrapAsEntity('cdn_query')
)
