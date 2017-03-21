/**
 * Reverse proxy with authentication
 *
 * Code below will check UB authentication header is valid (if not - return 401)
 * and after this proxy all requests for `cms` endpoint to the `http://localhost:3030`.
 *
 * For requests what start from `/ubcms` authentication not checked
 *
 * I.e. GET /cms/some/path&p1=true will be proxied to GET http://localhost:3030/some/path&p1=true
 *

 const HttpProxy = require('@unitybase/http-proxy')
 new HttpProxy({
    endpoint: 'cms',
    targetURL: 'http://localhost:3030'
    nonAuthorizedURLs: [///ubcms/]
 })

 */

const http = require('http')
const EventEmitter = require('events').EventEmitter
const UBA_COMMON = require('@unitybase/base').uba_common

class HttpProxy extends EventEmitter {
  /**
   * @param {Object} config
   * @param {string} config.endpoint Proxy endpoint name
   * @param {string} config.targetURL A URL of target server we reverse requests to
   * @param {boolean} [config.compressionEnable=false] Use gzip compression of request body
   * @param {Number} [config.sendTimeout=30000] Send timeout in ms.
   * @param {Number} [config.receiveTimeout=30000] Receive timeout in ms.
   * @param {Number} [config.connectTimeout=30000] Connect timeout in ms.
   * @param {Array<RegExp>} [config.nonAuthorizedURLs] Array of regular expression for URL what not require a authentication
   */
  constructor (config) {
    super()
    this.endpoint = config.endpoint

    let requestParams = {
      URL: config.targetURL,
      keepAlive: true,
      compressionEnable: config.compressionEnable
    }
    if (config.connectTimeout >= 0) {
      requestParams.connectTimeout = config.connectTimeout
    }
    if (config.receiveTimeout >= 0) {
      requestParams.receiveTimeout = config.receiveTimeout
    }
    if (config.sendTimeout >= 0) {
      requestParams.sendTimeout = config.sendTimeout
    }

    this.nonAuthorizedURLs = config.nonAuthorizedURLs || []

    this.reverseRequest = http.request(requestParams)
    if (this.reverseRequest.options.path && this.reverseRequest.options.path !== '/') {
      this.basePath = this.reverseRequest.options.path
    }

    App.registerEndpoint(this.endpoint, (req, resp) => {
      this.processRequest(req, resp)
    }, false)
  }

  checkRequestIsAuthorized (path, resp) {
    for (let urlRegexp of this.nonAuthorizedURLs) {
      if (urlRegexp.test(path)) return true
    }

    if (!App.authFromRequest() || (Session.userID === UBA_COMMON.ROLES.ANONYMOUS.ID)) {
      resp.statusCode = 401
      resp.writeEnd('')
      return false
    }

    return true
  }

  /**
   * Handle a  proxy request
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   */
  processRequest (req, resp) {
    this.reverseRequest.setMethod(req.method)
    this.reverseRequest.setHeadersAsString(req.headers)

    let path = (this.basePath ? this.basePath + (req.uri ? '/' : '') : '') + (req.uri || '/') + (req.parameters ? '?' + req.parameters : '')
    if (!this.checkRequestIsAuthorized(path, resp)) {
      return
    }
    if (path) {
      this.reverseRequest.setPath(path)
    }
    let response
    try {
      response = this.reverseRequest.end(req.read('bin'), 'bin')
    } catch (e) {
      console.error(e.message)
      resp.statusCode = 500
      resp.writeHead('Content-Type: text/plain')
      resp.writeEnd(e.message, 'utf-8')
      return
    }

    let responseHeaders = response.headers
    // TODO - do we need handle a redirect here?
    // switch (response.statusCode) {
    //   case 301:
    //   case 302:
    //     if (responseHeaders.location) {
    //       let parsedURL = url.parse(responseHeaders.location)
    //       if (parsedURL.protocol === me.reverseRequest.options.protocol &&
    //         parsedURL.hostName === me.reverseRequest.options.hostName &&
    //         parsedURL.port === me.reverseRequest.options.port) {
    //         responseHeaders.location = App.serverURL + '/' + this.endpoint + '/' + parsedURL.path + parsedURL.hash
    //       }
    //     }
    //     break
    // }
    resp.statusCode = response.statusCode
    if (responseHeaders['content-type']) {
      resp.writeHead('Content-Type: ' + responseHeaders['content-type'])
    }

    if (responseHeaders['cache-control']) resp.writeHead('Cache-Control: ' + responseHeaders['cache-control'])
    if (responseHeaders['date']) resp.writeHead('Date: ' + responseHeaders['date'])
    if (responseHeaders['etag']) resp.writeHead('ETag: ' + responseHeaders['etag'])
    if (responseHeaders['last-modified']) resp.writeHead('Last-Modified: ' + responseHeaders['last-modified'])

    resp.writeEnd(response.read('bin'), 'bin')
  }
}

module.exports = HttpProxy

