const {
  EntityFormat,
  EntityRepository
} = require('@unitybase/ub-migrate').extend

module.exports = function (container) {
  container.registerRepository(
    new EntityRepository(
      'cdn_classifier',
      ['code'],
      [],
      ['name']
    )
  )

  container.registerRepository(
    new EntityRepository(
      'cdn_classifieritem',
      ['code'],
      ['classifierID'],
      ['name'],
      [
        {
          repository: container.getRepository('cdn_classifier'),
          targetAttribute: 'classifierID',
          attributes: ['classifier']
        }
      ]
    )
  )

  const mdClassifierItem = new EntityFormat()
    .key('code')
    .caption('name')
    .fromContext('classifier')
    .wrapAsEntity('cdn_classifieritem')
  const mdClassifier = new EntityFormat()
    .key('code')
    .caption('name')
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
}
