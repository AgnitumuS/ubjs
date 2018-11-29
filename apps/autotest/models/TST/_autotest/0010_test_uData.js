/**
 * Created by pavel.mash on 25.05.2015.
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const _ = require('lodash')
const UBA = require('@unitybase/base').uba_common

module.exports = function runUDataTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', 'uData test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  // console.log('orig options:', options)
  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  function relogon (credential) {
    let opts = _.merge({}, options, {forceStartServer: true}, credential)
    session.logout() // shut down server
    // console.log('new options:', opts)
    session = argv.establishConnectionFromCmdLineAttributes(opts)
    conn = session.connection
  }

  /**
   * Test uData is restored after Session.runAsAdmin call
   */
  function testUDataPersistence () {
    relogon({user: 'testelsuser', pwd: 'testElsPwd'})
    // check it filled
    let resp = conn.query({
      entity: 'tst_service',
      method: 'runAsAdminTest'
    })
    assert.deepEqual(resp.runAsAdminUData.before, resp.runAsAdminUData.after, 'uData before and after runAsAdmin must be equal')
    let uDataInsidePseudoAdmin = JSON.parse(resp.runAsAdminUData.uDataInsidePseudoAdmin)
    let uDataInsidePseudoAdmin2level = JSON.parse(resp.runAsAdminUData.uDataInsidePseudoAdmin2level)
    assert.deepEqual(resp.runAsAdminUData.before, resp.runAsAdminUData.after, 'uData before and after runAsAdmin must be equal')
    assert.ok(/testRole/.test(uDataInsidePseudoAdmin2level.roles),
      'uData after 2 level of recursion runAs must contains "testRole" but got ' + uDataInsidePseudoAdmin2level.roles)
    // should be {"lang":"en","login":"admin","roles":"Admin","roleIDs":[1],"userID":10}
    assert.equal(uDataInsidePseudoAdmin.roles, UBA.ROLES.ADMIN.NAME)
    assert.deepEqual(uDataInsidePseudoAdmin.roleIDs, [UBA.ROLES.ADMIN.ID])
  }

  console.debug('test_uData')
  testUData(conn)
  console.debug('test_uData persistance')
  testUDataPersistence()
  // console.debug('test data store')
  // testDataStore(conn)
}

/**
 *  Test uData is Object and it persisted only on Session.on('login');
 * @param {SyncConnection} conn
 */
function testUData (conn) {
  // check it filled
  conn.query({
    entity: 'tst_service',
    method: 'uDataTest'
  })
  // and if we define something in uData not in Session.on(login) nothing changed
  conn.query({
    entity: 'tst_service',
    method: 'uDataTest'
  })
}

function testDataStore (conn) {
  assert.throws(function () {
    conn.run({
      entity: 'tst_service',
      method: 'testDataStoreInitialization'
    })
  }, /Wrong JSON/, 'Wrong JSON do not raise AV')
}
