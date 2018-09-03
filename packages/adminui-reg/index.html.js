const App = require('@unitybase/ub').App
/**
 * Return models config for `admin-UI` web client
 * The purpose is to load model initialization script BEFORE application start
 */
const mustache = require('mustache')
const fs = require('fs')
const path = require('path')
/**
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @param {String} indexName
 * @param {boolean} [addCSP=true] Add a CSP header
 */
function generateIndexPage (req, resp, indexName, addCSP = true) {
  let indexTpl, compiledIndex, compiledIndexKey

  function md5 (fileName) {
    let realPath = App.resolveStatic(fileName)
    if (!realPath) {
      console.error('invalid path %s', fileName)
    }
    // realMD5 = App.globalCacheGet('UB_STATIC.fileMD5_' + realPath);
    let checksum = App.fileChecksum(realPath)
    return checksum
      ? fileName + '?ver=' + checksum
      : fileName
  }

  compiledIndexKey = 'UB_STATIC.compiled_index_' + indexName + App.globalCacheGet('UB_STATIC.staticFoldersModifyDate') + App.globalCacheGet('UB_STATIC.modelsModifyDate')
  compiledIndex = App.globalCacheGet(compiledIndexKey)
  if (!compiledIndex) {
    let uiSettings = App.serverConfig.uiSettings
    if (!uiSettings.adminUI) {
      uiSettings.adminUI = {themeName: 'UBGrayTheme'}
    } else if (!uiSettings.adminUI.themeName) {
      uiSettings.adminUI.themeName = 'UBGrayTheme'
    }
    let adminUIPath = path.dirname(require.resolve('@unitybase/adminui-pub'))
    indexTpl = fs.readFileSync(path.join(adminUIPath, indexName), 'utf8')

    let cspNonce = nsha256('' + Date.now()).substr(0, 8)
    App.globalCachePut('INDEX_cspNonce', cspNonce)
    // create view for mustache
    // noinspection JSUnusedGlobalSymbols
    let view = {
      uiSettings: uiSettings,
      modelVersions: [],
      modelInitialization: [],
      adminUIModel: '',
      cspNonce: cspNonce,
      staticVersion: '' + ncrc32(0, App.globalCacheGet('UB_STATIC.modelsModifyDate')), // prev. App.folderChecksum(App.staticPath),
      UB_API_PATH: App.serverConfig.httpServer.path || '/', //  serverURL.replace(/\/$/, ''),
      md5template: function () {
        return function (template) {
          return md5(mustache.render(template, view))
        }
      },
      md5: function () {
        return md5
      }
    }

    // fill model versions
    let models = App.domainInfo.models
    let modelsConfig = App.serverConfig.application.domain.models
    for (let modelName in models) {
      let model = models[modelName]
      let modelCfg = modelsConfig.find(m => m.name === modelName)
      if (model.realPublicPath) {
        let pver = modelCfg.version
        view.modelVersions.push({
          modelName: modelName,
          modelVersion: pver
        })
      }
    }
    // add admin-ui
    const ADMINUI_MODEL = '@unitybase/adminui-pub'
    let modelCfg = modelsConfig.find(m => m.moduleName === ADMINUI_MODEL)
    view.adminUIModel = modelCfg.browser
    App.domainInfo.orderedModels.forEach((model) => {
      if (model.moduleName !== ADMINUI_MODEL) {
        let modelCfg = modelsConfig.find(m => m.name === model.name)
        if (modelCfg.browser) {
          view.modelInitialization.push(modelCfg.browser)
        } else if (model.needInit) { // ub 5.0.5 compatibility
          console.warn(`Compatibility warning! Model ${model.name} has browser initialization script,
but "browser" section in package.json is not define. Will fallback to "browser": "./public/initModel.js"`)
          let pathStart = /node_modules/.test(model.path)
            ? model.moduleName + '/public'
            : path.join('/clientRequire', model.path).replace(/\\/g, '/')
          view.modelInitialization.push({
            dev: `${pathStart}/initModel.js`,
            prod: `${pathStart}/initModel.js`
          })
        }
      }
    })

    compiledIndex = mustache.render(indexTpl, view)
    if (compiledIndex) {
      App.globalCachePut(compiledIndexKey, compiledIndex)
    }
    console.log(`Generate ${indexName} from template ${path.join(adminUIPath, indexName)}`)
  } else {
    console.debug('Use compiled %s', indexName)
  }
  if (compiledIndex) {
    resp.writeEnd(compiledIndex)
    // resp.writeEnd(index_tpl);
    resp.statusCode = 200
    // cache forever - do not cache index*.html
    let cspHeader = ''
    if (addCSP) {
      let cspNonce = App.globalCacheGet('INDEX_cspNonce')
      // let wsSrc = 'ws' + App.externalURL.slice(4)
      // let uiSettings = App.serverConfig.uiSettings
      // let onlyOfficeServer = (uiSettings.adminUI.onlyOffice && uiSettings.adminUI.onlyOffice.serverIP) || ''
      let cspHeaders =
        "default-src 'self' ws:; " +
        // 'unsafe-inline' is removed in flavor of 'nonce-...'
        // TODO - remove 'unsafe-eval' after removing all `eval(` from Ext
        `script-src 'self' 'nonce-${cspNonce}' 'unsafe-eval';` +
        'object-src blob:; ' +
        "base-uri 'none'; " +
        "style-src 'self' 'unsafe-inline' data:; " +
        "font-src 'self' data:; " +
        `frame-src 'self' blob:;` + // blob src required for chrome PDF viewer. Self - for JS PDF viewer
        "img-src 'self' data: blob:; " + // blob: is for pictures inside tinyMCE
        'plugin-types application/pdf'
      cspHeader = '\r\nContent-Security-Policy: ' + cspHeaders
    }
    resp.writeHead('Content-Type: text/html\r\nCache-Control: no-cache, no-store, max-age=0, must-revalidate\r\nPragma: no-cache\r\nExpires: Fri, 01 Jan 1990 00:00:00 GMT' + cspHeader)
  } else {
    resp.statusCode = 404
  }
}

let adminUIEndpointName
if (App.serverConfig.uiSettings && App.serverConfig.uiSettings.adminUI) {
  adminUIEndpointName = App.serverConfig.uiSettings.adminUI.endpoint
}
adminUIEndpointName = adminUIEndpointName || App.serverConfig.application.rootHandler || 'index.html'
/**
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
App.registerEndpoint(adminUIEndpointName, function (req, resp) {
  if (req.url.endsWith('/')) {
    resp.statusCode = 301 // HTTP_MOVEDPERMANENTLY
    resp.writeHead(`Location: ${App.externalURL}${adminUIEndpointName}`)
    return
  }
  generateIndexPage(req, resp, 'index.mustache')
}, false)

/**
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
App.registerEndpoint(adminUIEndpointName + '-dev', function (req, resp) {
  if (process.isDebug) {
    if (req.url.endsWith('/')) {
      resp.statusCode = 301 // HTTP_MOVEDPERMANENTLY
      resp.writeHead(`Location: ${App.externalURL}${adminUIEndpointName}`)
      return
    }
    generateIndexPage(req, resp, 'index-dev.mustache', false)
  } else {
    resp.writeEnd('Server working in production mode')
    resp.statusCode = 404
  }
}, false)
