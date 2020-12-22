/**
 * @author pavel.mash
 * Date: 2021-04-15
 * Test case for select method override by select:before propagate a __totalRecCount (if requested)
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const LocalDataStore = require('@unitybase/cs-shared').LocalDataStore

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
    /<<<Access deny>>>/,
    'Should got error for unsafe fieldList'
  )
  assert.throws(
    () => unsafeExternalCallFieldListAsterisk(conn),
    /<<<Access deny>>>/,
    'Should got Access deny for unsafe * fieldList'
  )
  assert.throws(
    () => unsafeExternalCallWhere(conn),
    /Internal Server Error/,
    'Should got error for unsafe orderItem'
  )
  assert.throws(
    () => unsafeExternalCallOrder(conn),
    /<<<Access deny>>>/,
    'Should got Access deny for order item without attribute'
  )
  assert.throws(
    () => unsafeExternalCallOrderAttr(conn),
    /<<<Access deny>>>/,
    'Should got Access deny for order item with attribute expression'
  )
  // order by safe attribute not in field list should not throws
  conn.Repository('tst_document')
    .attrs('ID')
    .orderBy('code')
    .limit(1).selectAsObject()
  // order by attribute with unsafe expression binding should not throw
  conn.Repository('tst_IDMapping')
    .attrs('ID')
    .orderBy('rnd').selectAsObject()

  // insert as Object
  const dayDate = LocalDataStore.truncTimeToUtcNull(new Date())
  const dateTime = new Date()
  dateTime.setMilliseconds(0)
  const newDoc = conn.insertAsObject({
    entity: 'tst_document',
    fieldList: ['ID', 'code', 'docDate', 'docDateTime', 'mi_modifyDate'],
    lockType: 'ltTemp', // lock for update below (tst_document have softLock mixin)
    execParams: {
      code: 'testInsertAsObject',
      docDate: dayDate,
      docDateTime: dateTime
    }
  }, {mi_modifyDate: 'modifiedAt'})
  assert.ok((typeof newDoc === 'object') && (newDoc.modifiedAt instanceof Date), `insertAsObject should return Object with parsed Date but got ${JSON.stringify(newDoc)}`)
  //assert.strictEqual(newDoc.docDate.getTime(), dayDate.getTime(), `Parsed Date should be equal ${dayDate} but got ${newDoc.docDate}`)
  assert.strictEqual(newDoc.docDateTime.getTime(), dateTime.getTime(), `Parsed DateTime should be equal ${dateTime} but got ${newDoc.docDateTime}`)
  const newDoc2 = conn.updateAsObject({
    entity: 'tst_document',
    fieldList: ['code', 'docDate', 'docDateTime', 'mi_modifyDate'],
    execParams: {
      ID: newDoc.ID,
      code: 'testInsertAsObjectU',
      mi_modifyDate: newDoc.modifiedAt
    }
  })
  assert.ok((typeof newDoc2 === 'object') && (newDoc2.mi_modifyDate instanceof Date) && (newDoc2.code === 'testInsertAsObjectU'),
    `updateAsObject should return Object with parsed Date but got ${JSON.stringify(newDoc2)}`)

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

/**
 * Unsafe order expression for external call must throw
 * @param {SyncConnection} conn
 */
function unsafeExternalCallOrderAttr (conn) {
  return conn.Repository('tst_document')
    .using('runSelectInJSContext')
    .attrs('ID')
    .orderBy('UNSAFE_FUNC([code])')
    .limit(1).selectAsObject()
}

/**
 * Unsafe external call for `select *` must throws for unsafe field list
 * @param {SyncConnection} conn
 */
function unsafeExternalCallFieldListAsterisk (conn) {
  return conn.Repository('uba_user')
    .attrs('*')
    .limit(1).selectAsObject()
}
