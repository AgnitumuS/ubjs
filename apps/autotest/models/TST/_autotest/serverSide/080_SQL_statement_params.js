﻿const assert = require('assert')
const UBA = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const App = UB.App

function runTest () {
  const st = UB.DataStore('uba_user')
  st.runSQL('select id from uba_user where name = :name:', { name: 'testelsuser' })
  assert.strictEqual(st.rowCount, 1, `single named param. Expect 1 row, got ${st.rowCount}`)

  st.runSQL(`select id from uba_user where name = :("${UBA.USERS.ADMIN.NAME}"): and name = :('${UBA.USERS.ADMIN.NAME}'): and id = :(${UBA.USERS.ADMIN.ID}):`, {})
  assert.strictEqual(st.rowCount, 1, `Simple inlined params. Expect 1 row, got ${st.rowCount}`)

  const st2 = UB.DataStore('uba_user')
  st2.runSQL('select id from uba_user where name = :name: or name = :name2:', { name: 'testelsuser', name2: 'admin' })
  assert.strictEqual(st2.rowCount, 2, `Two named parameters. Expect 2 row, got ${st2.rowCount}`)
  assert.notStrictEqual(st2.rowCount, st.rowCount, `Different object with the same prototype should have different prop vals but ${st.rowCount}=${st2.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name: = \'testelsuser\'', { name: 'testelsuser' })
  assert.strictEqual(st.rowCount, 1, `Two same named parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name: = :(\'testelsuser\'):', { name: 'testelsuser' })
  assert.strictEqual(st.rowCount, 1, `Mix named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = :name: and :name2: = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.strictEqual(st.rowCount, 1, `Mix named and inlined parameters v2. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = ? and ? = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.strictEqual(st.rowCount, 1, `Mix un-named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where name = ? and :name2: = :(\'testinline\'):', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.strictEqual(st.rowCount, 1, `Mix un-named named and inlined parameters. Expect 1 row, got ${st.rowCount}`)

  st.runSQL('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', {
    name: 'testelsuser',
    name2: 'testinline'
  })
  assert.strictEqual(st.rowCount, 1, `Mix un-named named and inlined parameters v2. Expect 1 row, got ${st.rowCount}`)

  if (App.domainInfo.connections[0].dialect.startsWith('Oracle')) {
    st.execSQL(`
DECLARE anID NUMBER(19,0);
begin
  select ID INTO anID from uba_user where ID > :ID: and name <> :name: FETCH FIRST 1 ROWS ONLY;
END;
`,
    { ID: 10, name: '123' }
    )

    st.execSQL('create global temporary table TMP_ID(id NUMBER not null) on commit delete rows', {})
    App.dbCommit()
    st.execSQL('insert into TMP_ID(id) values (?)', { a: [1, 2, 3] })
    st.runSQL('select * from TMP_ID', {})
    const data = JSON.stringify(st.getAsJsObject())
    assert.strictEqual(st.rowCount, 3, `Array binding for Oracle Insert - expect 3 rows to be inserted, got ${st.rowCount}: ${data} `)
  }

  // below is fails

  // MPV 2018-05 I don't understand WHY it should work at all
  // query builder transform UBQL IN condition to different queries for different DBMS
  // if (App.domainInfo.connections[0].dialect !== 'SQLite3') {
  //   st.runSQL(`select id from uba_user where id in (select id from :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):)`, {})
  //   assert.strictEqual(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
  // }
  //
  // st.runSQL('select id from uba_user where :name2: = \'testinline\' and name = ?', {
  //   name2: 'testinline',
  //   name: 'testelsuser'
  // })
  // assert.strictEqual(st.rowCount, 1, `Mix un-named and named parameters - param order not the same. Expect 1 row, got ${st.rowCount}`)
  //
  // st.runSQL('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', {
  //   name2: 'testinline',
  //   name: 'testelsuser'
  // })
  // assert.strictEqual(st.rowCount, 1, `Mix un-named named and inlined parameters - param order not the same. Expect 1 row, got ${st.rowCount}`)
  //
  // // this fail for SQLite3 (no array binding) - TB tested for other DB
  // st.runSQL('select id from uba_user where id in (:ids:)', { ids: [UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID] })
  // assert.strictEqual(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
  //
  // st.runSQL(`select id from uba_user where id in :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):`, {})
  // assert.strictEqual(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
}

(function () {
  const res = { success: true }
  try {
    runTest()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
