const {
  EntityFormat,
  EntityRepository,
  container
} = require('@unitybase/ub-migrate').extend

container.registerRepository(
  'cdn_classifier',
  new EntityRepository(
    'cdn_classifier',
    ['code'],
    [],
    ['name']
  )
)

container.registerRepository(
  'cdn_classifieritem',
  new EntityRepository(
    'cdn_classifieritem',
    ['code'],
    ['classifierID'],
    ['name'],
    [
      {repository: container.getRepository('cdn_classifier'), targetAttribute: 'classifierID', attributes: ['classifier']}
    ]
  )
)

const mdClassifierItem = new EntityFormat()
  .key('code')
  .caption('name')
  .translatable('name')
  .fromContext('classifier')
  .wrapAsEntity('cdn_classifieritem')
const mdClassifier = new EntityFormat()
  .key('code')
  .caption('name')
  .translatable('name')
  .child(
    'items',
    {
      context: {
        classifier: 'code'
      },
      metadata: mdClassifierItem
    }
  )
  .wrapAsEntity('cdn_classifier')

container.registerFileType('cdn_classifieritem', mdClassifierItem)
container.registerFileType('cdn_classifier', mdClassifier)
