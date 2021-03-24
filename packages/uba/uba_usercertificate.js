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
me.on('delete.before', logoutUserBeforeCertDelete)
me.on('insert:after', clearBlobAndLogoutAUser)
me.on('update:after', clearBlob)
me.entity.addMethod('getCertificate')

/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function setBlob (ctxt) {
  const execParams = ctxt.mParams.execParams
  Object.keys(execParams)
  if (execParams.certificate) {
    execParams.setBLOBValue('certificate', Buffer.from(execParams.certificate, 'base64'))
  }
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function logoutUserBeforeCertDelete (ctxt) {
  const rowID = ctxt.mParams.execParams.ID
  const userID = UB.Repository(me.entity.name).attrs('userID').where('ID', '=', rowID).selectScalar()
  App.removeUserSessions(userID)
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function clearBlobAndLogoutAUser (ctxt) {
  const execParams = ctxt.mParams.execParams
  if (execParams.certificate) {
    execParams.certificate = ''
  }
  let userID = execParams.userID
  if (!userID) {
    userID = UB.Repository(me.entity.name).attrs('userID').where('ID', '=', params.ID).selectScalar()
  }
  App.removeUserSessions(userID)
}

/**
 * @private
 * @param {ubMethodParams} ctxt
 */
function clearBlob(ctxt) {
  const execParams = ctxt.mParams.execParams
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
  const store = UB.Repository('uba_usercertificate')
    .attrs(['ID', 'certificate'])
    .where('ID', '=', ctxt.mParams.ID).select()

  let certificate = store.getAsBuffer('certificate')
  certificate = Buffer.from(certificate)
  certificate = certificate.toString('base64')
  ctxt.dataStore.initFromJSON({ fieldCount: 1, values: ['certificate', certificate], rowCount: 1 })
}
