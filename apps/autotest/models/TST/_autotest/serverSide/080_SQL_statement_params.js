const assert = require('assert')
const UBA = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const App = UB.App

function runTest () {
  let prm = {
    name: 'admin'
  }

  let st = UB.DataStore('uba_user')
  st.runSQL('select id from uba_user where name = :name:', {name: 'testelsuser'})
  assert.equal(st.rowCount, 1, `single named param. Expect 1 row, got ${st.rowCount}`)

  st.runSQL(`select id from uba_user where name = :("${UBA.USERS.ADMIN.NAME}"): and name = :('${UBA.USERS.ADMIN.NAME}'): and id = :(${UBA.USERS.ADMIN.ID}):`, {})
  assert.equal(st.rowCount, 1, `Simple inlined params. Expect 1 row, got ${st.rowCount}`)

  let st2 = UB.DataStore('uba_user')
  st2.runSQL('select id from uba_user where name = :name: or name = :name2:', {name: 'testelsuser', name2: 'admin'})
  assert.equal(st2.rowCount, 2, `Two named parameters. Expect 2 row, got ${st2.rowCount}`)
  assert.notEqual(st2.rowCount, st.rowCount, `Different object with the same prototype should have different prop vals but ${st.rowCount}=${st2.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name: = \'testelsuser\'', {name: 'testelsuser'})
  assert.equal(st.rowCount, 1, `Two same named parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name: = :(\'testelsuser\'):', {name: 'testelsuser'})
  assert.equal(st.rowCount, 1, `Mix named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name2: = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.equal(st.rowCount, 1, `Mix named and inlined parameters v2. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = ? and ? = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.equal(st.rowCount, 1, `Mix un-named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = ? and :name2: = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.equal(st.rowCount, 1, `Mix un-named named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.equal(st.rowCount, 1, `Mix un-named named and inlined parameters v2. Expect 1 row, got ${st.rowCount}`)

  return

// below is fails

  // MPV 2018-05 I don't understand WHY it should work at all
  // query builder transform UBQL IN condition to different queries for different DBMS
  if (App.domainInfo.connections[0].dialect !== 'SQLite3') {
    st.runSQL(`select id from uba_user where id in (select id from :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):)`, {})
    assert.equal(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
  }

  st.runSQL('select id from uba_user where :name2: = \'testinline\' and name = ?', {
    name2: 'testinline',
    name: 'testelsuser'
  })
  assert.equal(st.rowCount, 1, `Mix un-named and named parameters - param order not the same. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', {
    name2: 'testinline',
    name: 'testelsuser'
  })
  assert.equal(st.rowCount, 1, `Mix un-named named and inlined parameters - param order not the same. Expect 1 row, got ${st.rowCount}`)

  // this fail for SQLite3 (no array binding) - TB tested for other DB
  st.runSQL('select id from uba_user where id in (:ids:)', {ids: [UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID]})
  assert.equal(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)

  st.runSQL(`select id from uba_user where id in :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):`, {})
  assert.equal(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
}

(function () {
  let res = {success: true}
  try {
    runTest()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
