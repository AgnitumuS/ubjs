/**
 * UnityBase default endpoints implementation.
 * In UB <=4 these endpoints have been defined in the native code
 * @author pavel.mash on 13.10.2016.
 */

const {relToAbs} = process.binding('fs')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mime = require('mime-types')
const WebSockets = require('./web-sockets')

/**
 * @param {THTTPResponse} resp
 * @param {string} reason
 * @return {boolean}
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
 */
function notFound (resp, reason) {
  resp.statusCode = 404
  resp.writeEnd('Not found')
  if (reason) console.error('Not found', reason)
  return false
}

/**
 *
 * @param {string} pathToFile
 * @param {THTTPResponse} resp
 */
function resolveModelFile (reqPath, resp) {
  let entry = {
    fullPath: ''
  }
  // cache actual file path & type for success models/* request
  let cached = App.globalCacheGet(`UB_MODELS_REQ${reqPath}`)
  if (!cached) {
    let parts = reqPath.replace(/\\/g, '/').split('/')
    let modelName = parts.shift()
    if (!modelName) {
      return badRequest(resp, 'first part of path must be model name')
    }
    let model = App.domain.models.byName(modelName)
    if (!model) {
      return badRequest(resp, 'no such model ' + modelName)
    }
    entry.fullPath = relToAbs(model.publicPath, parts.join('\\'))
    if (!entry.fullPath) {
      return badRequest(resp, 'cant resolve relative path')
    }
    if (!entry.fullPath.startsWith(model.publicPath)) {
      return badRequest(resp, `resolved path "${entry.fullPath}" is not inside model folder ${model.publicPath}`)
    }
    if (!fs.existsSync(entry.fullPath)) {
      return notFound(resp, `"${entry.fullPath}"`)
    }
    let ct = mime.contentType(parts.pop())
    if (ct) {
      entry.mimeHead = 'Content-Type: ' + ct
    }
    App.globalCachePut(`UB_MODELS_REQ${reqPath}`, JSON.stringify(entry))
  } else {
    entry = JSON.parse(cached)
  }
  resp.writeEnd(entry.fullPath)
  resp.writeHead('Content-Type: !STATICFILE')
  if (entry.mimeHead) {
    resp.writeHead(entry.mimeHead)
  }
  resp.statusCode = 200
}
/**
 * The `models` endpoint. Responsible for return a static files content from a model publicPath folders
 *
 * For example request `GET http://host:port/models/modelName/fileName`
 * will return a file from a public folder of a model `modelName`
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function models (req, resp) {
  if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
    return badRequest(resp, 'invalid request method ' + req.method)
  }
  let reqPath = req.decodedUri
  if (!reqPath || !reqPath.length || (reqPath.length > 250)) {
    return badRequest(resp, 'path too long (max is 250) ' + reqPath.length)
  }
  resolveModelFile(reqPath, resp)
  // cache forever - do not cache index*.html
    // resp.writeHead('Content-Type: text/html\r\nCache-Control: no-cache, no-store, max-age=0, must-revalidate\r\nPragma: no-cache\r\nExpires: Fri, 01 Jan 1990 00:00:00 GMT');
}

const MODULES_ROOT = path.join(process.configPath, 'node_modules')
let MODULE_PUBLICS
/**
 * The `clientRequire` endpoint. Used by client side loaders (SystemJS for example) to emulate commonJS require
 *
 * **Security note**: It is __very important__ to prevent loading a server-side logic to the client - server-side logic MUST be hidden from clients
 *
 * To do this `clientRequire` endpoint:
 *
 *   - allow access only to modules inside application `node_modules` folder
 *   - restrict access to files inside **scoped** (module name start from @) modules if resolved file path is not inside of any model publicPath folder
 *   - all files inside non-scoped modules are accessible to client (since non-scoped modules are public)
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function clientRequire (req, resp) {
  console.log(`Call clientRequire`)
  if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
    return badRequest(resp, 'invalid request method ' + req.method)
  }
  let reqPath = req.decodedUri
  if (!reqPath || !reqPath.length || (reqPath.length > 250)) {
    return badRequest(resp, 'path too long (max is 250) ' + reqPath.length)
  }

  if (reqPath.startsWith('models/')) {
    resolveModelFile(reqPath.slice('models/'.length), resp)
    return
  }

  if (reqPath.indexOf('..') !== -1) { // prevent clientRequire/../../../secret.txt attack
    return badRequest(resp, `Relative path (${reqPath}) not allowed`)
  }
  if (path.isAbsolute(reqPath)) { // prevent clientRequire/d:/secret.txt attack
    return badRequest(resp, `Absolute path (${reqPath}) not allowed`)
  }
  let resolvedPath
  try {
    console.debug(`Try to resolve ${reqPath}`)
    resolvedPath = require.resolve(reqPath)
  } catch (e) {
    resolvedPath = undefined
  }
  if (!resolvedPath) {
    console.error(`Package ${reqPath} not found`)
    return notFound(resp, `"${reqPath}"`)
  }
  if (!resolvedPath.startsWith(MODULES_ROOT)) {
    return badRequest(resp, `Path (${reqPath}) must be inside modules root folder but instead resolved to ${resolvedPath}`)
  }

  if (!MODULE_PUBLICS) MODULE_PUBLICS = _(App.domainInfo.models).map('realPublicPath').filter((x) => !!x).value()
  if (MODULE_PUBLICS.findIndex((modulePublic) => resolvedPath.startsWith(modulePublic)) === -1) {
    return badRequest(resp, `${reqPath} resolved to (${resolvedPath}) which is not inside any of module public folder`)
  }

  console.debug(`Resolve ${reqPath} -> ${resolvedPath}`)
  if (resolvedPath.endsWith('css')) {
    resp.writeHead('Content-Type: !STATICFILE\r\nContent-Type: text/css; charset=UTF-8')
  } else {
    resp.writeHead('Content-Type: !STATICFILE\r\nContent-Type: application/javascript')
  }
  resp.writeEnd(resolvedPath)
  // if (entry.mimeHead) {
  //   resp.writeHead(entry.mimeHead)
  // }
  resp.statusCode = 200
}

/**
 * The `getAppInfo` endpoint. Responsible for return a information about application required for a
 * initial client side connectivity and UI setup
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getAppInfo (req, resp) {
  const serverConfig = App.serverConfig
  let DSTU = serverConfig.security && serverConfig.security.dstu

  let appInfo = {
    serverVersion: process.version,
    defaultLang: serverConfig.application.defaultLang || 'en',

    trafficEncryption: DSTU ? DSTU.trafficEncryption : false,
    serverCertificate: (DSTU && DSTU.trafficEncryption) ? App.serverPublicCert : '',
    encryptionKeyLifetime: (DSTU && DSTU.trafficEncryption) ? DSTU.encryptionKeyLifeTime : 0,

    authMethods: serverConfig.security.authenticationMethods || [],

    supportedLanguages: serverConfig.application.domain.supportedLanguages || ['en'],

    supportedWSProtocols: process.isWebSocketEnabled ? WebSockets.registeredProtocols() : [],

    uiSettings: serverConfig.uiSettings || {}
  }
  resp.writeEnd(appInfo)
  resp.statusCode = 200
  resp.validateETag()
}

module.exports = {
  models,
  getAppInfo,
  clientRequire
}
