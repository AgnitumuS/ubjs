const cmdLineOpt = require('@unitybase/base').options
const base = require('@unitybase/base')
const argv = base.argv

module.exports = function testAclSkipOnDelete (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'test Acl Skip On Delete')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }
  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection
  const tstUserID = conn.Repository('uba_user').attrs('ID').where('name', '=', 'testelsuser').selectScalar()
  const tstUserAdminPermID = conn.Repository('uba_userrole').attrs('ID')
    .where('userID', '=', tstUserID)
    .where('roleID', '=', base.uba_common.ROLES.ADMIN.ID)
    .selectScalar()
  if (tstUserAdminPermID) {
    conn.query({ entity: 'uba_userrole', method: 'delete', execParams: { ID: tstUserAdminPermID } })
  }
  // create record without permissions
  const tstAclRlsID = conn.insert({
    entity: 'tst_aclrls',
    fieldList: ['ID'],
    execParams: {
      caption: 'test server side deletion with __skip'
    }
  })
  console.debug('Verify deletion of record what not accessible to user due to aclRls with __skipAclRls misc')
  conn.query({ entity: 'tst_aclrls', method: 'testDeleteWithSkip', tstAclRlsID })
}
