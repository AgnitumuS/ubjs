const { App } = require('@unitybase/ub')
const path = require('path')
const fs = require('fs')
const PROXY_SEND_FILE_HEADER = App.serverConfig.httpServer.reverseProxy.sendFileHeader
const PROXY_SEND_FILE_LOCATION_ROOT = App.serverConfig.httpServer.reverseProxy.sendFileLocationRoot

/* global log_view */
log_view.entity.addMethod('logsList')
log_view.entity.addMethod('logContent')

/**
 * List available logs
 *
 *  const req = await UB.connection.get('/rest/log_view/logsList')
 *  const files = req.data
 *
 * **Security note**:
 *   - endpoint available on case `ubConfig.logging.remoteAccess` is true and `ubConfig.logging.path` is a folder
 *   - access to endpoint is granted to members of SysOps role
 *
 * API
 *  - list available log files `GET /logAccess`
 *  - get a file content `GET /logAccess/file-name.log
 *
 * @param fake
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @method logsList
 * @memberOf log_view_ns.prototype
 * @memberOfModule @unitybase/logview
 * @published
 */
function logsList (fake, req, resp) {
  if (req.method !== 'GET') {
    return resp.badRequest('invalid request method ' + req.method)
  }
  const files = fs.readdirSync(App.serverConfig.logging.path)
  const filesInfo = files.filter(fn => fn.endsWith('.log')).map(fn => {
    const stat = fs.statSync(`${App.serverConfig.logging.path}/${fn}`)
    return {
      fn,
      size: stat.size,
      mtime: stat.mtime
    }
  })
  resp.writeEnd({
    files: filesInfo
  })
  resp.statusCode = 200
}
log_view.logsList = logsList

/**
 * List available logs
 *
 * **Security note**:
 *   - endpoint available on case `ubConfig.logging.remoteAccess` is true and `ubConfig.logging.path` is a folder
 *   - access to endpoint is granted to members of SysOps role
 *
 * API
 *  - list available log files `GET /logAccess`
 *  - get a file content `GET /logAccess/file-name.log
 *
 * @param fake
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @method logContent
 * @memberOf log_view_ns.prototype
 * @memberOfModule @unitybase/logview
 * @published
 */
function logContent (fake, req, resp) {
  const parts = req.decodedUri.split('/') // log_view/logContent/1.log
  if (parts.length < 3) {
    return resp.badRequest(`invalid path '${req.decodedUri}'`)
  }
  const logFileName = parts.slice(2).join('/')
  const normalized = path.normalize(path.join(App.serverConfig.logging.path, logFileName))
  if (!normalized.startsWith(App.serverConfig.logging.path)) {
    return resp.badRequest(`remoteLog: resolved path '${normalized}' is not inside logging folder ${App.serverConfig.logging.path}`)
  }
  if (!fs.existsSync(normalized)) {
    return resp.notFound(`'${normalized}'`)
  }
  const stat = fs.statSync(normalized)
  if (stat.isDirectory()) {
    return resp.badRequest(`Prevent access to folder "${normalized}"`)
  }
  if (PROXY_SEND_FILE_HEADER) {
    // send files via nginx. In this mode Range request is supported
    const head = `${PROXY_SEND_FILE_HEADER}: /${PROXY_SEND_FILE_LOCATION_ROOT}/remoteLog/${logFileName}`
    console.debug('<- ', head)
    resp.writeHead(head)
    resp.writeEnd('')
  } else {
    resp.writeEnd(normalized)
    resp.writeHead('Content-Type: !STATICFILE')
    resp.writeHead('Content-Type: text/plain')
  }
  resp.statusCode = 200
}
log_view.logContent = logContent
