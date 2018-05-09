const UB = require('@unitybase/ub')
const Session = UB.Session
/* global org_organization */
// eslint-disable-next-line camelcase
const me = org_organization

me.on('update:before', checkOKPOCodeForUkraine)
me.on('insert:before', checkOKPOCodeForUkraine)

function checkOKPOCodeForUkraine (ctxt) {
  if (Session.userLang !== 'uk') return true
  const mParams = ctxt.mParams
  const execParams = mParams.execParams
  if ((mParams.method === 'update') && !execParams.OKPOCode) return true

  let OKPOCode = execParams.OKPOCode
  if (!OKPOCode) throw new UB.UBAbort('<<<Не вказаний код ЄДРПОУ>>>')

  if (ctxt.mParams.execParams._noValid) {
    // Allow add record without OKPO during import operation
    delete ctxt.mParams.execParams._noValid
    return true
  }
  if (!/^[0-9]+$/.test(OKPOCode) || (OKPOCode.length !== 8 && OKPOCode.length !== 10)) {
    throw new Error('<<<Код ЄДРПОУ повинен містити тільки 8 або 10 цифр>>>')
  }
}
