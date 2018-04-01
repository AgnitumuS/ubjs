const App = require('./App')

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

const PROXY_SEND_FILE_HEADER = App.serverConfig.httpServer['reverseProxy']['sendFileHeader']
const PROXY_SEND_FILE_LOCATION_ROOT = App.serverConfig.httpServer['reverseProxy']['sendFileLocationRoot']

module.exports = {
  badRequest,
  notFound,
  PROXY_SEND_FILE_HEADER,
  PROXY_SEND_FILE_LOCATION_ROOT
}
