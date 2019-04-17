/**
 * User: felix
 * Date: 26.01.14
 * This test connect to UB server and do select for all entities
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const uba = require('@unitybase/base').uba_common
const argv = require('@unitybase/base').argv
const TEST_NAME = 'SQL builder test'

module.exports = function runTest (options) {
  let session, conn

  if (!options) {
    let opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  session = argv.establishConnectionFromCmdLineAttributes(options)
  // if (!session.__serverStartedByMe) {
  //   throw new Error('Shut down server before run this test')
  // }
  conn = session.connection

  try {
    console.debug('Start ' + TEST_NAME)
    testCommon(conn)
  } finally {
    // session.logout()
  }

  function testCommon (conn) {
    let res

    console.debug('Test where item condition "LIKE"')

    assert.doesNotThrow(
      function () {
        conn.Repository('uba_user').attrs('ID', 'name').where('name', 'in', [ 'as:da', 'admin' ]).selectAsArray()
      },
      'string parameters with : inside must not throw'
    )

    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .where('[name]', 'like', uba.USERS.ADMIN.NAME)
      .limit(1)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 1, 'case sensitive LIKE fails')

    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .where('[name]', 'like', uba.USERS.ADMIN.NAME.toUpperCase())
      .limit(1)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 1, 'case insensitive LIKE fails')

    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .where('[name]', 'like', 'Admin')
      .limit(1)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 1, 'mixed case insensitive LIKE fails')

    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .where('[ID]', 'in', [uba.USERS.ADMIN.ID, uba.USERS.ANONYMOUS.ID])
      .limit(3)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 2, 'IN condition for array of Numbers fails')

    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .where('name', 'in', [uba.USERS.ADMIN.NAME, uba.USERS.ANONYMOUS.NAME])
      .limit(3)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 2, 'IN condition for array if String fails')

    // in subquery
    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      // .where('[ID]', 'in', [10, 20])
      .where('ID', 'in', conn.Repository('uba_user').attrs([ 'ID' ]).limit(1))
      .limit(3)
      .selectAsArray()
    assert.equal(res.resultData.rowCount, 1, 'IN condition for subrepository fails')

    // group by
    res = conn.Repository('uba_user')
      .attrs([ 'ID', 'name' ])
      // .where('[ID]', 'in', [10, 20])
      .where('ID', 'in', conn.Repository('uba_user').attrs([ 'ID' ]).limit(1))
      .groupBy([ 'ID', 'name' ])
      .orderBy('name')
      .selectAsArray()

    // exists
    // who do not login during this year
    res = conn.Repository('uba_user')
      .attrs([ 'ID' ])
      .notExists(
        conn.Repository('uba_audit')
          .correlation('actionUser', 'name')  // not a simple expression!
          .where('[actionTime]', '>', new Date(2016, 1, 1))
          .where('[actionType]', '=', 'LOGIN')
      )
      // but modify some data
      .exists(
        conn.Repository('uba_auditTrail')
          .where('[{master}.ID] =[ID]', 'custom') // here we link to uba_user.ID
          .where('[actionTime]', '>', new Date(2016, 1, 1))
      ).select()
  }
}
