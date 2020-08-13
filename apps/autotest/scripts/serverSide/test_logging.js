const assert = require('assert')
const UBA = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const App = UB.App

function runTest () {
  const st = UB.DataStore('uba_user')
  const bulkData = []
  for (let i = 1; i < 100000; i++) {
    bulkData.push({
      ID: i,
      code: i % 2 === 0 ? 'c' + i : null,
      mi_createDate: new Date(2020, 1, i)
    })
  }
  // create table test_bulk(
  //   ID bigint,
  //   code nvarchar(32),
  //   mi_createDate datetime
  // )
  // Bulk insert :)
  st.execSQL(`insert into test_bulk(ID, code, mi_createDate)
    select * from OPENJSON(?) 
    WITH (   
         ID   bigint '$.ID' ,  
         code nvarchar(32) '$.code',  
         mi_createDate datetime '$.mi_createDate'
    )`, { p1: JSON.stringify(bulkData) }
  )
  // insert by one
  console.time('bulkByOne')
  bulkData.forEach(d => {
    st.runSQL('insert into test_bulk(ID, code, mi_createDate) values(?,?,?)', d)
  })
  console.timeEnd('bulkByOne')

  console.log('Not prepared statement')
  st.runSQL('insert into uba_user (ID, name) values (:ID:, :name:)', { ID: [1, 2, 3], name: ['aa','bb','cc'] })

  st.runSQL('select id from uba_user where name = :name:', { name: 'testelsuser' })
  console.log('Prepared statement with named parameter')
  st.runSQL('select id from uba_user where name = :name:', { name: 'testelsuser' })
  console.log('Prepared statement with ? parameter')
  st.runSQL('select id from uba_user where name = ?', { name: 'testelsuser' })
  console.log('Prepared statement with inline parameter')
  st.runSQL('select id from uba_user where name = :("testelsuser"):', { })
  console.log('Long fetch query (t <> tf)')
  //st.runSQL('select ID, entity, actionType, actionUser, actionUserName, actionTime from uba_auditTrail where 1=?', {a: 1})
  st.runSQL('select * from uba_auditTrail where 1=?', {a: 1})
  console.log('Log updated count')
  st.execSQL('update uba_user set disabled = 0 where 1=?', {a: 1})
  try {
    console.log('Preparation error')
    st.runSQL('select UNKNOWN from uba_user where name = ?', { name: 'testelsuser' })
  } catch (e) {}
  try {
    console.log('bind error')
    st.runSQL('select id from uba_user where name = :name:', { name: 1 })
  } catch (e) {}
  try {
    console.log('dml error')
    st.runSQL('delete from uba_user where id = :ID:', { ID: 10 })
  } catch (e) {}
}

(function () {
  let res = { success: true }
  try {
    runTest()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
