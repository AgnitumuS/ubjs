/**
 * DB BLOB operations
 */
const UB = require('@unitybase/ub')
const App = require('@unitybase/ub').App
const fs = require('fs')
const path = require('path')
const base = require('@unitybase/base')
// let res

function testBLOB () {
  if (base.ubVersionNum < 5017000) return // skip Oracle BLOB truncation test for Ub < 5.17 (not fixed where)
  let buf = new ArrayBuffer(5000)
  let v = new Uint8Array(buf)
  for (let i = 0; i < 5000; i++) {
    v[i] = i % 255
  }
  insertion(123, 'test blob of size 5000', buf, 5000)

  let binContent = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'file1.pdf'), { encoding: 'bin' })
  insertion(1234, 'test blob from file', binContent, 271118)
}

/**
 * Insert BLOB into tst_blob, read it again and verify inserted length
 * @param {number} ID
 * @param {string} descr
 * @param {ArrayBuffer} buf
 * @param {number} expectedLength
 */
function insertion (ID, descr, buf, expectedLength) {
  if (buf.byteLength !== expectedLength) {
    throw new Error(`input blob for ID ${ID} expect to be ${expectedLength} but got ${buf.byteLength}`)
  }
  let p = new TubList()
  p.ID = ID
  p.description = descr
  p.setBLOBValue('blb', buf)
  let store = UB.DataStore('tst_blob')
  store.execSQL('insert into tst_blob(ID, description, blb) values (:ID:, :description:, :blb:)', p)
  App.dbCommit()
  store = UB.Repository('tst_blob').attrs('ID', 'blb').where('ID', '=', ID).select()
  if (!store.eof) {
    let blbBuf = store.getAsBuffer('blb')
    if (blbBuf.byteLength !== expectedLength) {
      throw new Error(`BLOB truncation error: Blob with ID ${ID} expect to be ${expectedLength} but got ${blbBuf.byteLength}`)
    }
  } else {
    throw new Error('can not get blob with ID ' + ID)
  }
}

(function () {
  let res = { success: true }
  try {
    testBLOB()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
