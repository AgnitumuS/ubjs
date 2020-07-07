/**
 * Test softLock mixin
 * Created by pavel.mash on 2020-03-13
 */

const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'SoftLock mixin'
const assert = require('assert')
const _ = require('lodash')

module.exports = function runSoftLockTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('test softLock mixin', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('Start ' + TEST_NAME)

  function relogon (credential) {
    const opts = _.assign({}, options, { forceStartServer: true }, credential)
    session.logout() // shut down server
    session = argv.establishConnectionFromCmdLineAttributes(opts)
    conn = session.connection
  }

  const firstID = conn.Repository('tst_document').attrs('ID')
    .limit(1).selectScalar()

  // should not throw in case ID not in top level but in filer and lockAttribute not in fieldList
  conn.Repository('tst_document').attrs('description').where('ID', '=', firstID)
    .misc({ lockType: 'None' }).selectSingle()

  const data = conn.Repository('tst_document').attrs('ID', 'description', 'mi_modifyDate')
    .limit(1).selectSingle()
  console.log(data)
  assert.notStrictEqual(data, null, 'One document if limit(1)')
  conn.query({ entity: 'tst_document', method: 'lock', ID: data.ID, lockType: 'Temp' })
  relogon({ user: 'testelsuser', pwd: 'testElsPwd' })

  let tCase = 'test invalid modify date'
  console.log(tCase)
  assert.throws(() => {
    conn.query({
      entity: 'tst_document',
      method: 'update',
      execParams: { ID: data.ID, description: tCase, mi_modifyDate: new Date().toISOString() }
    })
  }, /<<<Record modified by another user>>>/, 'Should throw handled "modified by another user" when called directly')

  tCase = 'test locked'
  console.log(tCase)
  assert.throws(() => {
    conn.query({
      entity: 'tst_document',
      method: 'update',
      execParams: { ID: data.ID, description: tCase, mi_modifyDate: data.mi_modifyDate }
    })
  }, /<<<Record locked by another user>>>/, 'Should throw handled "locked by another user" error when called directly')

  tCase = 'test invalid modify date using JS method'
  console.log(tCase)
  assert.throws(() => {
    conn.query({
      entity: 'tst_document',
      method: 'updateNotLocked',
      execParams: { ID: data.ID, description: tCase, mi_modifyDate: data.mi_modifyDate }
    })
  }, /<<<Record locked by another user>>>/, 'Should throw handled "locked by another user" error when called from server JS method')

  tCase = 'test locked using JS method'
  console.log(tCase)
  assert.throws(() => {
    conn.query({
      entity: 'tst_document',
      method: 'updateNotLocked',
      execParams: { ID: data.ID, description: tCase, mi_modifyDate: new Date().toISOString() }
    })
  }, /<<<Record modified by another user>>>/, 'Should throw handled "modified by another user" when called from server JS method')

// assert.doesNotThrow(datesSerialize, 'Dates should be serialized correctly')
  // assert.notEqual(datesRes.dates.zDate.toString(), 'Invalid Date', 'Dates should be serialized correctly but got' + datesRes)
}
