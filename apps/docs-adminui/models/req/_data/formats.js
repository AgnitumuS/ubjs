const {
  EntityFormat,
  EntityRepository
} = require('@unitybase/ub-migrate').extend

module.exports = function (container) {
  container.registerRepository(
    new EntityRepository(
      'req_department',
      ['code'],
      ['name', 'postAddr', 'phoneNum'],
      undefined,
      [{
        repository: '$self',
        attribute: 'parent',
        targetAttribute: 'parentID'
      }]
    )
  )

  container.registerFileType(
    'req_department',
    new EntityFormat()
      .key('code')
      .copy('name', 'postAddr', 'phoneNum')
      .fromContext('parent')
      .child('items', {
        context: { parent: 'code' },
        metadata: '$self'
      })
      .wrapAsEntity('req_department')
  )

  container.registerRepository(
    new EntityRepository(
      'req_user',
      ['name'],
      ['email', 'phone', 'website']
    )
  )

  container.registerFileType(
    'req_user',
    new EntityFormat()
      .key('name')
      .copy('email', 'phone', 'website')
      .wrapAsEntity('req_user')
  )

  container.registerRepository(
    new EntityRepository(
      'req_request',
      ['applicant', 'department'],
      ['text', 'answer', 'reqDate', 'duration', 'cost', 'notes'],
      undefined,
      [{
        repository: 'req_user',
        attribute: 'applicant',
        targetAttribute: 'applicant'
      }, {
        repository: 'req_department',
        attribute: 'department',
        targetAttribute: 'department'
      }]
    )
  )

  container.registerFileType(
    'req_request',
    new EntityFormat()
      .key('applicant')
      .copy('text', 'answer', 'department', 'applicant', 'reqDate', 'duration', 'cost', 'notes')
      .wrapAsEntity('req_request')
  )
}
