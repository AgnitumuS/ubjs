const UB = require('@unitybase/ub')
const assert = require('assert')

function verifyServerSideI18n () {
  assert.strictEqual(UB.i18n('greeting', 'Mark', 'Kiev'), 'Hello Mark, welcome to Kiev')
  assert.strictEqual(UB.i18n('greeting', 'uk', 'Mark', 'Kiev'), 'Привіт Mark, ласкаво просимо в Kiev')
}

(function () {
  let res = { success: true }
  try {
    verifyServerSideI18n()
  } catch (e) {
    res.success = false
    res.reason = e.message + ' Stack: ' + e.stack
  }
  module.exports = res
  return res
})()
