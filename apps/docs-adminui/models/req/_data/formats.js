const {
  EntityFormat,
  EntityRepository
} = require('@unitybase/ub-migrate').extend

module.exports = function (container) {
  container.registerRepository(
    new EntityRepository(
      'req_Department',
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
    'req_Department',
    new EntityFormat()
      .key('code')
      .copy('name', 'postAddr', 'phoneNum')
      .fromContext('parent')
      .child('items', {
        context: { parent: 'code' },
        metadata: '$self'
      })
      .wrapAsEntity('req_Department')
  )

  container.registerRepository(
    new EntityRepository(
      'req_User',
      ['name'],
      ['email', 'phone', 'website']
    )
  )

  container.registerFileType(
    'req_User',
    new EntityFormat()
      .key('name')
      .copy('email', 'phone', 'website')
      .wrapAsEntity('req_User')
  )

  container.registerRepository(
    new EntityRepository(
      'req_Request',
      ['applicantID', 'departmentID'],
      ['text', 'answer', 'reqDate', 'duration', 'cost', 'notes'],
      undefined,
      [{
        repository: 'req_User',
        attribute: 'applicant',
        targetAttribute: 'applicantID'
      }, {
        repository: 'req_Department',
        attribute: 'department',
        targetAttribute: 'departmentID'
      }]
    )
  )

  container.registerFileType(
    'req_Request',
    new EntityFormat()
      .key('applicant')
      .copy('text', 'answer', 'department', 'applicant', 'reqDate', 'duration', 'cost', 'notes')
      .wrapAsEntity('req_Request')
  )
}
