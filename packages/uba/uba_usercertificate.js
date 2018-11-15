/*
 * User certificates
 * @author xmax
 */
const UB = require('@unitybase/ub')
/* global uba_usercertificate */
// eslint-disable-next-line camelcase
const me = uba_usercertificate
me.on('insert:before', setBlob)
me.on('update:before', setBlob)
me.on('insert:after', clearBlob)
me.on('update:after', clearBlob)
me.entity.addMethod('getCertificate')

function setBlob (ctxt) {
  const execParams = ctxt.mParams.execParams
  Object.keys(execParams)
  if (execParams.certificate) {
    execParams.setBLOBValue('certificate', Buffer.from(execParams.certificate, 'base64'))
  }
}

function clearBlob (ctxt) {
  let execParams = ctxt.mParams.execParams
  if (execParams.certificate) {
    execParams.certificate = ''
  }
}

/**
 * Retrieve certificate as base64 encoded string
 *
 * @param {ubMethodParams} ctxt
 * @param {number} ctxt.mParams.ID
 * @method getCertificate
 * @memberOf uba_usercertificate_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
me.getCertificate = function (ctxt) {
  let store = UB.Repository('uba_usercertificate')
    .attrs(['ID', 'certificate'])
    .where('ID', '=', ctxt.mParams.ID).select()

  let certificate = store.getAsBuffer('certificate')
  certificate = Buffer.from(certificate)
  certificate = certificate.toString('base64')
  ctxt.dataStore.initFromJSON({fieldCount: 1, values: ['certificate', certificate], rowCount: 1})
}
