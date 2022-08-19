/* global org_organization, ubs_settings */
const UB = require('@unitybase/ub')
// eslint-disable-next-line camelcase
const me = org_organization

me.on('update:before', checkOKPOCode)
me.on('insert:before', checkOKPOCode)

/**
 * @param {ubMethodParams} ctx
 * @param {object} ctx.mParams
 * @param {string} ctx.mParams.method
 * @param {object} ctx.mParams.execParams
 * @param {string} ctx.mParams.execParams.OKPOCode
 * @returns {boolean}
 */
function checkOKPOCode (ctx) {
  const isOKPORequired = ubs_settings.loadKey('org.organization.OKPORequired', false)
  if (isOKPORequired === false) {
    return true
  }
  const { mParams } = ctx
  const { execParams } = mParams
  if ((mParams.method === 'update') && !execParams.OKPOCode) {
    return true
  }
  const { OKPOCode } = execParams
  if (!OKPOCode) {
    throw new UB.UBAbort('<<<Не вказаний код ЄДРПОУ>>>')
  }

  if (execParams._noValid) {
    // Allow add record without OKPO during import operation
    delete ctx.mParams.execParams._noValid
    return true
  }
  if (!/^[0-9]+$/.test(OKPOCode) || (OKPOCode.length !== 8 && OKPOCode.length !== 10)) {
    throw new Error('<<<Код ЄДРПОУ повинен містити тільки 8 або 10 цифр>>>')
  }
}
