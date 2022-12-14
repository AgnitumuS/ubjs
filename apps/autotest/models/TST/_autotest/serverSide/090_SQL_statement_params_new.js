const assert = require('assert')
const UBA = require('@unitybase/base').uba_common
const App = require('@unitybase/ub').App
// let res

function runTest () {
  const db = App.dbConnections['main']

  // console.time('parseSQL')
  // for (let i = 0; i < 1000; i++) {
  //   let {parsedSql, parsedParams} = db.parseSQL('select id from uba_user where name = :name:', {name: 'anonymous'})
  //   let res2 = db.parseSQL('select id from uba_user where name = :name: or name = :name2:', {name: 'anonymous', name2: 'admin'})
  //   let res3 = db.parseSQL(`select id from uba_user where name = :("${UBA.USERS.ADMIN.NAME}"): and name = :('${UBA.USERS.ADMIN.NAME}'): and id = :(${UBA.USERS.ADMIN.ID}):`)
  // }
  // console.timeEnd('parseSQL')
  // return

  let res
  res = JSON.parse(db.run('select id from uba_user where name = :name:', { name: 'anonymous' }))
  assert.strictEqual(res.length, 1, `single named param. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run(`select id from uba_user where name = :("${UBA.USERS.ADMIN.NAME}"): and name = :('${UBA.USERS.ADMIN.NAME}'): and id = :(${UBA.USERS.ADMIN.ID}):`))
  assert.strictEqual(res.length, 1, `single named param. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = :name: or name = :name2:', { name: 'anonymous', name2: 'admin' }))
  assert.strictEqual(res.length, 2, `Two named parameters. Expect 2 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = :name: and :name: = \'anonymous\'', { name: 'anonymous' }))
  assert.strictEqual(res.length, 1, `Two same named parameters. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = :name: and :name: = :(\'anonymous\'):', { name: 'anonymous' }))
  assert.strictEqual(res.length, 1, `Mix named and inlined parameters. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = :name: and :name2: = :(\'testinline\'):', { name: 'anonymous', name2: 'testinline' }))
  assert.strictEqual(res.length, 1, `Mix named and inlined parameters v2. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = ? and ? = :(\'testinline\'):', { 0: 'anonymous', 1: 'testinline' }))
  assert.strictEqual(res.length, 1, `Mix un-named and inlined parameters. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where name = ? and :name2: = :(\'testinline\'):', { 0: 'anonymous', name2: 'testinline' }))
  assert.strictEqual(res.length, 1, `Mix un-named named and inlined parameters. Expect 1 row, got ${res.length}`)

  res = JSON.parse(db.run('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', { 0: 'anonymous', name2: 'testinline' }))
  assert.strictEqual(res.length, 1, `Mix un-named named and inlined parameters v2. Expect 1 row, got ${res.length}`)

  // return
  // tests below are failed
  // if (App.domainInfo.connections[0].dialect !== 'SQLite3') {
  //   res = JSON.parse(db.run(`select id from uba_user where id in (select id from :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):)`, {}))
  //   assert.strictEqual(res.length, 2, `Named array binding. Expect 2 row, got ${res.length}`)
  // }
  //
  // res = JSON.parse(db.run('select id from uba_user where :name2: = \'testinline\' and name = ?', { name2: 'testinline', 0: 'anonymous' }))
  // assert.strictEqual(res.length, 1, `Mix un-named and named parameters - param order not the same. Expect 1 row, got ${res.length}`)
  //
  // res = JSON.parse(db.run('select id from uba_user where :name2: = :(\'testinline\'): and name = ?', { name2: 'testinline', 0: 'anonymous' }))
  // assert.strictEqual(res.length, 1, `Mix un-named named and inlined parameters - param order not the same. Expect 1 row, got ${res.length}`)
  //
  // const id = db.genID('tst_blob')
  // const buf = Buffer.from('qwerty')
  // ok(db.exec('insert into tst_blob(id, description, blb) values(:ID:, :description:, :blb:)', {
  //   ID: id,
  //   description: 'testAsSetter',
  //   blb: buf
  // }))
  //
  // res = JSON.parse(db.run('select id, description, blb from tst_blob where id = ?', { 0: id }))
  // const buf1 = Buffer.from(res[0].blb.substr(1), 'base64')
  // assert.strictEqual(res.length, 1, ``)
  // assert.strictEqual(buf1.compare(buf), 0, '')
/*
// this fail for SQLite3 (no array binding) - TB tested for other DB
  st.runSQL('select id from uba_user where id in (:ids:)', {ids: [UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID]})
  assert.strictEqual(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)

  st.runSQL(`select id from uba_user where id in :(${JSON.stringify([UBA.USERS.ADMIN.ID, UBA.USERS.ANONYMOUS.ID])}):`, {})
  assert.strictEqual(st.rowCount, 2, `Named array binding. Expect 2 row, got ${st.rowCount}`)
*/
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
