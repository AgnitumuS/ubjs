// eslint-disable-next-line no-undef,camelcase
const me = tst_aclrls
const UB = require('@unitybase/ub')
const Session = UB.Session

me.entity.addMethod('testDeleteWithSkip')

/**
 * Create and return string for fts index
 * @param {ubMethodParams} ctx
 * @return {Boolean}
 */
me.testDeleteWithSkip = function (ctx) {
  let aID = ctx.mParams.tstAclRlsID
  if (!aID) {
    aID = UB.Repository('tst_aclrls').attrs('ID').limit(1).selectScalar()
  }
  const tstUserID = UB.Repository('uba_user').attrs('ID').where('name', '=', 'testelsuser').selectScalar()
  console.log(`Verify deletion of record ${aID} what not accessible to user ${tstUserID} due to aclRls with __skipAclRls misc`)
  Session.runAsUser(tstUserID, () => {
    UB.DataStore('tst_aclrls').run('delete', {
      execParams: { ID: aID },
      __skipRls: true,
      __skipAclRls: true
    })
  })
  // 335860161740801
}
