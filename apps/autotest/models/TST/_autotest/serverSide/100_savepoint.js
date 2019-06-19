/**
 * savepoint test
 */

const assert = require('assert')
const UB = require('@unitybase/ub')
const App = require('@unitybase/ub').App
// let res

function testSavepoint () {
  let db = App.dbConnections[App.domainInfo.entities.ubm_enum.connectionName]
  try {
    db.savepointWrap(shouldFail)
  } catch (e) {
    console.log('insertion failure inside savepoint')
  }
  try {
    db.savepointWrap(shouldNotFail)
  } catch (e) {
    console.log('insertion failure inside savepoint BUT SHOULD NOT')
  }
  let r = UB.Repository('ubm_enum').attrs('ID').where('eGroup', '=', 'tst').selectAsObject()
  assert.strictEqual(r.length, 1, 'after exception inside savepoint next record should inserts')
}

function shouldFail () {
  let eStore = UB.DataStore('ubm_enum')
  eStore.run('insert', {
    execParams: {
      eGroup: null,
      code: '1',
      name: 'test1'
    }
  })
}

function shouldNotFail () {
  let eStore = UB.DataStore('ubm_enum')
  eStore.run('insert', {
    execParams: {
      eGroup: 'tst',
      code: '1',
      name: 'test1'
    }
  })
}

(function () {
  let res = { success: true }
  try {
    testSavepoint()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
