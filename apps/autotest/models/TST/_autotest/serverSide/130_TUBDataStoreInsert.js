const UB = require('@unitybase/ub')
const assert = require('assert')
const _ = require('lodash')

function testTUBDataStoreMethods(){
  const STORE = UB.DataStore('tst_dictionary')
  const ID = STORE.insert({
    fieldList: ['ID'],
    execParams: {
      code: 'test_insertWithID',
      filterValue: 1
    }
  })
  assert.strictEqual(typeof ID, 'number', 'store.insert with only ID in fieldList should return new ID')

  const rowAsArray = STORE.insert({
    fieldList: ['code', 'filterValue'],
    execParams: {
      code: 'test_insertROW',
      filterValue: 2
    }
  })
  assert.strictEqual(_.isEqual(rowAsArray, ['test_insertROW', 2]), true, 'store.insert with fieldList should return array of inserted values but got' + JSON.stringify(rowAsArray))

  const nullResp = STORE.insert({
    execParams: {
      code: 'test_insertWOFL',
      filterValue: 3
    }
  })
  assert.strictEqual(nullResp, null, 'store.insert w/o fieldList should return null')

  const objectRespIns = STORE.insertAsObject({
    fieldList: ['code', 'mi_modifyDate'],
    execParams: {
      code: 'test_insertROWObj',
      filterValue: 2
    }
  }, {mi_modifyDate: 'modifiedAt'})
  assert.ok((typeof objectRespIns === 'object') && (objectRespIns.modifiedAt instanceof Date) && (objectRespIns.code === 'test_insertROWObj'),
    `STORE.insertAsObject should return Object with parsed Date but got ${JSON.stringify(objectRespIns)}`)
}

(function () {
  let res = { success: true }
  try {
    testTUBDataStoreMethods()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()