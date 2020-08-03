const fs = require('fs')
const { App } = require('@unitybase/ub')
const indexPage = fs.readFileSync('./index.html', 'UTF-8')

const endpoint = (() => {
  const cfg = App.serverConfig
  if (cfg.uiSettings && cfg.uiSettings.adminUI) {
    return cfg.uiSettings.adminUI.endpoint
  }
  if (cfg.application.rootHandler) {
    return cfg.application.rootHandler
  }

  return 'index.html'
})()

/**
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
App.registerEndpoint(endpoint, function (req, resp) {
  if (req.url.endsWith('/')) {
    resp.statusCode = 301
    resp.writeHead(`Location: ${App.externalURL}${endpoint}`)
    return
  }

  resp.writeHead('Content-Type: text/html; charset=UTF-8')
  resp.writeEnd(indexPage)
  resp.statusCode = 200
}, false)
