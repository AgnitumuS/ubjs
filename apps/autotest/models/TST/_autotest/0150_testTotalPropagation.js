/**
 * @author pavel.mash
 * Date: 2021-04-15
 * Test case for select method override by select:before propagate a __totalRecCount (if requested)
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

module.exports = function runMixinsTests (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'Mixins test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection
  // limit query result to ensure __totalRecCount actually calculated
  const resp = conn.query(conn.Repository('tst_document')
    .using('runSelectInJSContext').attrs('ID').limit(100).withTotal(true)
    .ubql()
  )
  assert.ok(resp.__totalRecCount > 101, `Should got __totalRecCount > 101 but actual is ${resp.__totalRecCount}`)
  assert.throws(
    () => unsafeExternalCallFieldList(conn),
    /Internal Server Error/,
    'Should got error for unsafe fieldList'
  )
  assert.throws(
    () => unsafeExternalCallWhere(conn),
    /Internal Server Error/,
    'Should got error for unsafe orderItem'
  )
  assert.throws(
    () => unsafeExternalCallOrder(conn),
    /Internal Server Error/,
    'Should got error for order item what not in fieldList'
  )
}

/**
 * Unsafe external call for overrated `select` method must throws for unsafe field list
 * @param {SyncConnection} conn
 */
function unsafeExternalCallFieldList (conn) {
  return conn.Repository('tst_document')
    .using('runSelectInJSContext')
    .attrs('ID', "(select ID from uba_user where name = 'admin'")
    .limit(1).selectAsObject()
}

/**
 * Unsafe external call for overrated `select` method must throws for unsafe where expression
 * @param {SyncConnection} conn
 */
function unsafeExternalCallWhere (conn) {
  return conn.Repository('tst_document')
    .using('runSelectInJSContext')
    .attrs('ID')
    .where("(select ID from uba_user where name = 'admin'", '=', 1)
    .limit(1).selectAsObject()
}

/**
 * Unsafe external call for overrated `select` method must throws for unsafe order expression
 * @param {SyncConnection} conn
 */
function unsafeExternalCallOrder (conn) {
  return conn.Repository('tst_document')
    .using('runSelectInJSContext')
    .attrs('ID')
    .orderBy("(select ID from uba_user where name = 'admin'")
    .limit(1).selectAsObject()
}
