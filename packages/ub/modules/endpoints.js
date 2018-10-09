/**
 * Build-in UnityBase endpoints. Will be registered during {@link module:@unitybase/ub~start UB.start}
 * In addition to endpoints documented below additional endpoints
 *  - ubql
 *  - stat
 *  - auth
 *  - logout
 *  - timeStamp
 * are implemented inside native code and will be moved to JavaScript in future releases.
 *
 * @module endpoints
 * @memberOf module:@unitybase/ub
 */
// author pavel.mash on 13.10.2016
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mime = require('mime-types')
const WebSockets = require('./web-sockets')
const App = require('./App')
const Session = require('./Session')
const {PROXY_SEND_FILE_HEADER, PROXY_SEND_FILE_LOCATION_ROOT} = require('./httpUtils')
const ubErrors = require('./ubErrors')
const UBA_COMMON = require('@unitybase/base').uba_common
const queryString = require('querystring')
const appBinding = process.binding('ub_app')
/**
 *
 * @param {string} reqPath
 * @param {THTTPResponse} resp
 * @private
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
      return resp.badRequest('first part of path must be model name')
    }
    let model = App.domainInfo.models[modelName]
    if (!model) {
      return resp.badRequest('no such model ' + modelName)
    }
    entry.fullPath = path.normalize(path.join(model.realPublicPath, parts.join('/')))
    if (!entry.fullPath) {
      return resp.badRequest('cant resolve relative path')
    }
    if (!entry.fullPath.startsWith(model.realPublicPath)) {
      return resp.badRequest(`resolved path "${entry.fullPath}" is not inside model folder ${model.realPublicPath}`)
    }
    if (!fs.existsSync(entry.fullPath)) {
      return resp.notFound(`"${entry.fullPath}"`)
    }
    let stat = fs.statSync(entry.fullPath)
    if (stat.isDirectory()) {
      return resp.badRequest(`Prevent access to folder "${entry.fullPath}"`)
    }
    if (PROXY_SEND_FILE_HEADER) {
      entry.fullPath = path.relative(process.configPath, entry.fullPath)
    } else {
      let ct = mime.contentType(parts.pop())
      if (ct) {
        entry.mimeHead = 'Content-Type: ' + ct
      }
    }
    App.globalCachePut(`UB_MODELS_REQ${reqPath}`, JSON.stringify(entry))
  } else {
    console.debug('model file is resolved from cache')
    entry = JSON.parse(cached)
  }
  if (PROXY_SEND_FILE_HEADER) {
    let head = `${PROXY_SEND_FILE_HEADER}: /${PROXY_SEND_FILE_LOCATION_ROOT}/app/${entry.fullPath}`
    console.debug(`<- `, head)
    resp.writeHead(head)
    resp.writeEnd('')
  } else {
    resp.writeEnd(entry.fullPath)
    resp.writeHead('Content-Type: !STATICFILE')
    if (entry.mimeHead) {
      resp.writeHead(entry.mimeHead)
    }
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
function modelsEp (req, resp) {
  if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
    return resp.badRequest('invalid request method ' + req.method)
  }
  let reqPath = req.decodedUri
  if (!reqPath || !reqPath.length || (reqPath.length > 250)) {
    return resp.badRequest('path too long (max is 250) ' + reqPath.length)
  }
  resolveModelFile(reqPath, resp)

  // cache forever - do not cache index*.html
  // resp.writeHead('Content-Type: text/html\r\nCache-Control: no-cache, no-store, max-age=0, must-revalidate\r\nPragma: no-cache\r\nExpires: Fri, 01 Jan 1990 00:00:00 GMT');
}

const MODULES_ROOT = path.join(process.configPath, 'node_modules')

/**
 * The `clientRequire` endpoint. Used by client side loaders (SystemJS for example) to emulate commonJS require
 *
 * **Security note**: It is __very important__ to prevent loading a server-side logic to the client - server-side logic MUST be hidden from clients
 *
 * To do this `clientRequire` endpoint:
 *
 *   - allow access only to modules inside application `node_modules` folder
 *   - in case requested module is a UnityBase model (present in ubConfig.json) then restrict access to non-public part of such model
 *
 * So developer should list all the modules that contain a sensitive server-side business logic inside the application
 * config and set a `moduleName` parameter correctly for such models
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function clientRequireEp (req, resp) {
  console.log(`Call clientRequire`)
  if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
    return resp.badRequest('invalid request method ' + req.method)
  }
  let reqPath = req.decodedUri
  // cache actual file path & type for success clientRequire/* request
  let cached = App.globalCacheGet(`UB_CLIENT_REQ${reqPath}`)
  let entry = {
    fullPath: ''
  }
  if (!cached) {
    if (!reqPath || !reqPath.length || (reqPath.length > 250)) {
      return resp.badRequest('path too long (max is 250) ' + reqPath.length)
    }

    if (reqPath.startsWith('models/')) {
      resolveModelFile(reqPath.slice('models/'.length), resp)
      return
    }

    if (reqPath.indexOf('..') !== -1) { // prevent clientRequire/../../../secret.txt attack
      return resp.badRequest(`Relative path (${reqPath}) not allowed`)
    }
    if (path.isAbsolute(reqPath)) { // prevent clientRequire/d:/secret.txt attack
      return resp.badRequest(`Absolute path (${reqPath}) not allowed`)
    }
    let resolvedPath
    try {
      console.debug(`Try to resolve ${reqPath}`)
      // preventSymlinks emulation. code below will resolve to realPath
      // what can be outside the application folder if packages are symlinked
      // resolvedPath = require.resolve(reqPath, {
      //   paths: [MODULES_ROOT]
      // })
      resolvedPath = path.resolve(MODULES_ROOT, reqPath)
      if (!fs.existsSync(resolvedPath)) { // try js file
        resolvedPath = resolvedPath + '.js'
      }
      let stat = fs.statSync(resolvedPath)
      if (stat.isDirectory()) {
        let pkgName = path.join(resolvedPath, 'package.json')
        if (fs.existsSync(pkgName)) {
          let pkgMain = JSON.parse(fs.readFileSync(pkgName, 'utf8')).main || './index.js'
          resolvedPath = path.join(resolvedPath, pkgMain)
        } else {
          return resp.badRequest(`package.json not found in folder "${resolvedPath}"`)
        }
      }
    } catch (e) {
      console.error(e)
      resolvedPath = undefined
    }
    if (!resolvedPath) {
      return resp.notFound(`Package ${reqPath} not found`)
    }
    if (!resolvedPath.startsWith(MODULES_ROOT)) {
      return resp.badRequest(`Path (${reqPath}) must be inside application node_modules folder but instead resolved to ${resolvedPath}`)
    }

    let models = App.domainInfo.models
    let restrictAccess = false
    // allow access to package.json for dynamically load a module from UI
    if (!reqPath.endsWith('/package.json')) {
      // in case this is request to UnityBase model - check resolved file is inside model public folder
      _.forEach(models, (model) => {
        if (model.moduleName &&
          // do not compare req @unitybase/ub-pub with module @unitybase/ub
          ((reqPath === model.moduleName) || reqPath.startsWith(model.moduleName + '/')) &&
          !resolvedPath.startsWith(model.realPublicPath)
        ) {
          restrictAccess = true
          return false
        }
      })
    }

    if (restrictAccess) {
      return resp.badRequest(`Request to UnityBase model ${reqPath} resolved to (${resolvedPath}) which is not inside any of public models folder`)
    }
    entry.fullPath = resolvedPath
    if (PROXY_SEND_FILE_HEADER) {
      entry.fullPath = path.relative(process.configPath, entry.fullPath)
    } else {
      let ct = mime.contentType(path.extname(resolvedPath))
      if (ct) {
        entry.mimeHead = 'Content-Type: ' + ct
      }
    }
    App.globalCachePut(`UB_CLIENT_REQ${reqPath}`, JSON.stringify(entry))
    console.debug(`Resolve ${reqPath} -> ${resolvedPath}`)
  } else {
    entry = JSON.parse(cached)
    console.debug(`Retrieve cached ${reqPath} -> ${entry.fullPath}`)
  }
  if (PROXY_SEND_FILE_HEADER) {
    let head = `${PROXY_SEND_FILE_HEADER}: /${PROXY_SEND_FILE_LOCATION_ROOT}/app/${entry.fullPath}`
    console.debug(`<- `, head)
    resp.writeHead(head)
    resp.writeEnd('')
  } else {
    resp.writeEnd(entry.fullPath)
    resp.writeHead('Content-Type: !STATICFILE')
    if (entry.mimeHead) {
      resp.writeHead(entry.mimeHead)
    }
  }
  resp.statusCode = 200
}

/**
 * The `getAppInfo` endpoint. Responsible for return a information about application required for a
 * initial client side connectivity and UI setup
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getAppInfoEp (req, resp) {
  const serverConfig = App.serverConfig
  let DSTU = serverConfig.security && serverConfig.security.dstu

  let appInfo = {
    appVersion: App.package.version,
    serverVersion: process.version,
    defaultLang: serverConfig.application.defaultLang,
    simpleCertAuth: serverConfig.security.simpleCertAuth,

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

// const RESTRICTED_ENTITY_PROPS = ['connectionConfig', 'dbExtensions', 'mapping'] // adv allow mapping
// const RESTRICTED_ATTRIBUTES_PROPS = ['physicalDataType', 'generateFK', 'mapping'] // adv allow mapping
// const RESTRICTED_MODEL_PROPS = ['realPublicPath'] // adv allow realPublicPath
// const advancedDomainInfoEntityProps = []
//
// function domainReplacer (key, val) {
//   if (!this) return undefined
//   if (this instanceof UBDomain.UBEntity) {
//     // at last one of entity method is accessible
//     if (!this.haveAccessToAnyMethods(Object.keys(this.entityMethods))) return undefined
//     // serialize only allowed properties
//     return RESTRICTED_ENTITY_PROPS.find(elm => elm === key) ? undefined : val
//   } else if (this instanceof UBDomain.UBEntity.UBEntityAttribute) {
//     // skip empty string
//     if ((typeof val === 'string') && !val) return undefined
//     if ((key === 'customSettings') && !Object.keys(val).length) return undefined
//     return RESTRICTED_ATTRIBUTES_PROPS.find(elm => elm === key) ? undefined : val
//   } else if (this instanceof UBDomain.UBModel) {
//     return RESTRICTED_MODEL_PROPS.find(elm => elm === key) ? undefined : val
//   } else {
//     return val
//   }
// }

const authenticationHandled = appBinding.handleAuthentication
const nativeGetDomainInfo = appBinding.getDomainInfo
/**
 * The `getDomainInfo` endpoint.
 * Return JSON representation of application Domain according to caller rights
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDomainInfoEp (req, resp) {
  // implementation below is SLOW. The bottleneck is JSON.stringify() for huge JSON
  // let restrictedDomain = {
  //   domain: App.domainInfo.entities, // _.filter(App.domainInfo.entities, (e) => e.code.startsWith('ubm')),
  //   models: App.domainInfo.models
  // }
  // let res = JSON.stringify(restrictedDomain, domainReplacer)

  let params = queryString.parse(req.parameters)
  let isExtended = (params['extended'] === 'true')
  if (isExtended && authenticationHandled && !UBA_COMMON.isSuperUser()) {
    return resp.badRequest('Extended domain info allowed only for member of admin group of if authentication is disabled')
  }
  if (!params['userName'] || params['userName'] !== Session.uData.login) {
    return resp.badRequest('userName=login parameter is required')
  }

  let res = nativeGetDomainInfo(isExtended)
  // let res = nativeGetDomainInfo(false)

  resp.writeEnd(res)
  resp.statusCode = 200
  resp.validateETag()
}

/**
 * Default endpoint. Will be called in case URL do not start form a known endpoint.
 * Current implementation will handle static files from `ServerConfig.HTTPServer.inetPub` folder
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function staticEp (req, resp) {
  if (!App.staticPath) return resp.notFound('httpServer.inetPub is empty')
  if ((req.method !== 'GET') && (req.method !== 'HEAD')) {
    return resp.badRequest('invalid request method ' + req.method)
  }
  let reqPath = req.decodedUri
  if (!reqPath || !reqPath.length || (reqPath.length > 250)) {
    return resp.badRequest('path too long (max is 250) ' + reqPath.length)
  }
  let normalized = path.normalize(path.join(App.staticPath, reqPath))
  if (!normalized.startsWith(App.staticPath)) {
    return resp.badRequest(`statics: resolved path "${normalized}" is not inside inetPub folder ${App.staticPath}`)
  }
  if (!fs.existsSync(normalized)) {
    return resp.notFound(`"${normalized}"`)
  }
  let stat = fs.statSync(normalized)
  if (stat.isDirectory()) {
    return resp.badRequest(`Prevent access to folder "${normalized}"`)
  }
  if (PROXY_SEND_FILE_HEADER) {
    let relative = path.relative(process.configPath, normalized)
    let head = `${PROXY_SEND_FILE_HEADER}: /${PROXY_SEND_FILE_LOCATION_ROOT}/app/${relative}`
    console.debug(`<- `, head)
    resp.writeHead(head)
    resp.writeEnd('')
    resp.statusCode = 200
  } else {
    let ext = path.extname(normalized)
    let ct = mime.contentType(ext)
    resp.writeEnd(normalized)
    resp.writeHead('Content-Type: !STATICFILE')
    if (ct) {
      resp.writeHead('Content-Type: ' + ct)
    }
    resp.statusCode = 200
  }
}

const EXPECT_RESULT_RE = /^[ \r\n\t]*(select|pragma)/i // start with optional RC LF TAB or SPACE and when select or pragma
/**
 * Run sql query on server side. Allowed from local IP's.
 *
 * Connection name is in `connection` uri parameter (or default connection if not set)
 *  - If HTTP verb is GET then allowed inline parameters only and sql is in `sql` uri parameter
 *  - If HTTP verb is POST then sql is in request body and query parameters is uri parameters except `connection`
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function runSQLEp (req, resp) {
  if (App.localIPs.indexOf(Session.callerIP) === -1) {
    throw new Error(`Only local execution allowed. Caller remoteIP="${Session.callerIP}"`)
  }

  const parameters = queryString.parse(req.parameters)
  let connectionName = parameters.connection || parameters.CONNECTION || App.domainInfo.defaultConnection.name
  let conn = App.dbConnections[connectionName]

  if (!conn) throw new Error(`runSQL: Unknown connection ${connectionName}`)

  let sql, sqlParams
  if (req.method === 'GET') {
    sql = parameters.sql
    sqlParams = null
  } else if ((req.method === 'POST') || (req.method === 'PUT')) {
    sql = req.read('utf-8')
    delete parameters.connection
    sqlParams = parameters
  } else {
    return resp.badRequest('runSQL: invalid verb ' + req.method)
  }

  if (!sql) throw new Error('runSQL: statement is empty')
  if (EXPECT_RESULT_RE.test(sql)) {
    let result = conn.run(sql, sqlParams)
    resp.writeEnd(result)
  } else {
    conn.exec(sql, sqlParams)
    resp.writeEnd('')
  }
  resp.statusCode = 200
}

/**
 * Run sql query on server side. Allowed from local IP's.
 *
 * Connection name is in `connection` uri parameter (or default connection if not set)
 *  - If HTTP verb is GET then allowed inline parameters only and sql is in `sql` uri parameter
 *  - If HTTP verb is POST then sql is in request body and query parameters is uri parameters except `connection`
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function restEp (req, resp) {
  const INVALID_PARAMS = 'REST: parameters are invalid'
  if (req.uri === '') return resp.badRequest(INVALID_PARAMS)
  let parts = req.uri.split('/')
  let entity = App.domainInfo.get(parts[0], false)
  if (!entity) return resp.badRequest('REST: unknown entity ' + parts[0])
  let method = parts[1]
  if (!method) return resp.notImplemented(`REST: await "entity/method" in url`)
  if (!entity.haveAccessToMethod(method)) throw new ubErrors.ESecurityException(`REST: unknown method or access deny ${entity.code}.${method}`)
  // TODO - must be implemented using launchMethod to emit :before and :after events etc.
  global[entity.code][method](null, req, resp)
  return true
}

const CACHE_LOCALE_KEY_PREFIX = 'UB.LOCALE.'
/**
 * Return a single localization script bundled from all models public/locale/lang-${Session.userLang} scripts
 * excluding adminui-pub what injected before login window
 *
 *      GET allLocales?lang=en
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function allLocalesEp (req, resp) {
  let cached
  const parameters = queryString.parse(req.parameters)
  let lang = parameters.lang
  if (!lang || lang.length > 5) return resp.badRequest('lang parameter required')
  let supportedLanguages = App.serverConfig.application.domain.supportedLanguages || ['en']
  if (supportedLanguages.indexOf(lang) === -1) return resp.badRequest('unsupported language')

  cached = App.globalCacheGet(`${CACHE_LOCALE_KEY_PREFIX}${lang}`)
  if (!cached) {
    cached = ' '
    App.domainInfo.orderedModels.forEach((model) => {
      if (model.needLocalize) {
        let localeScript = path.join(model.realPublicPath, 'locale', `lang-${lang}.js`)
        if (fs.existsSync(localeScript)) {
          let content = fs.readFileSync(localeScript, 'utf-8')
          cached += `\n// ${model.name} localization\n${content}`
        }
      }
    })
    App.globalCachePut(`${CACHE_LOCALE_KEY_PREFIX}${lang}`, cached)
  }
  resp.writeEnd(cached)
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/javascript')
  resp.validateETag()
}

module.exports = {
  modelsEp,
  getAppInfoEp,
  clientRequireEp,
  getDomainInfoEp,
  staticEp,
  runSQLEp,
  restEp,
  allLocalesEp
}
