const UB = require('@unitybase/ub')
const assert = require('assert')

function verifyServerSideI18n () {
  // 2 lines below uses JS based localization /TST/serverLocale/tst_i18n.js
  assert.strictEqual(UB.i18n('greeting', 'Mark', 'Kiev'), 'Hello Mark, welcome to Kiev')
  assert.strictEqual(UB.i18n('greeting', 'uk', 'Mark', 'Kiev'), 'Привіт Mark, ласкаво просимо в Kiev')
  // below check for JSON based locale /cdn/serverLocale/cdn_sl-uk.json
  assert.strictEqual(UB.i18n('errNotExsistsOKPO', 'uk'), '<<<Не вказаний код ЄДРПОУ >>>')
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
