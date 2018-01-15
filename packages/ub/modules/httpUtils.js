/**
 * @param {THTTPResponse} resp
 * @param {string} [reason]
 * @return {boolean}
 * @private
 */
function badRequest (resp, reason) {
  resp.statusCode = 400
  resp.writeEnd('Bad request')
  if (reason) console.error('Bad request.', reason)
  return false
}

/**
 * @param {THTTPResponse} resp
 * @param {string} reason
 * @return {boolean}
 * @private
 */
function notFound (resp, reason) {
  resp.statusCode = 404
  resp.writeEnd('Not found')
  if (reason) console.error('Not found', reason)
  return false
}

module.exports = {
  badRequest, notFound
}