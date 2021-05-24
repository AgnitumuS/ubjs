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
    const iitCrypto = require('@ub-d/iit-crypto')
    const certBin = Buffer.from(execParams.certificate, 'base64')
    const certJson = iitCrypto.parseCertificate(certBin)
    execParams.certParsed = JSON.stringify(certJson)
    execParams.setBLOBValue('certificate', certBin)
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
function clearBlob (ctxt) {
  const execParams = ctxt.mParams.execParams
  if (execParams.certificate) {
    execParams.certificate = ''
  }
}

/**
 * Retrieve certificate as:
 *  - base64 encoded string, if called as ublq
 *  - binary, if called as `/rest/uba_usercertificate/getCertificate?ID=223`
 *
 * @param {ubMethodParams} [ctxt]
 * @param {number} [ctxt.mParams.ID]
 * @param {THTTPRequest} [req]
 * @param {THTTPResponse} [resp]
 * @method getCertificate
 * @memberOf uba_usercertificate_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
me.getCertificate = function (ctxt, req, resp) {
  let certID
  if (req) { // endpoint is called as rest/uba_usercertificate/getCertificate?ID=1231
    if (!req.parsedParameters.ID) {
      return resp.badRequest('Missed ID; Expect URL to be rest/uba_usercertificate/getCertificate?ID=1231')
    }
    certID = req.parsedParameters.ID
  } else {
    certID = ctxt.mParams.ID
  }
  const store = UB.Repository('uba_usercertificate')
    .attrs(['ID', 'certificate'])
    .where('ID', '=', certID).select()

  if (store.eof) throw new Error('not found')
  let certificate = store.getAsBuffer('certificate')
  if (req) {
    resp.writeEnd(certificate)
    resp.writeHead('Content-Type: application/x-x509-user-cert')
    resp.statusCode = 200
  } else {
    certificate = Buffer.from(certificate)
    certificate = certificate.toString('base64')
    ctxt.dataStore.initialize({ fieldCount: 1, values: ['certificate', certificate], rowCount: 1 })
  }
}
