/* global SystemJS */
const i18n = require('./i18n')
const utils = require('./utils')
const transport = require('./transport')
const conn = require('./AsyncConnection')
const injection = require('./injection')
const ClientRepository = require('./ClientRepository')
const UBCache = require('./UBCache')
const LocalDataStore = require('@unitybase/cs-shared').LocalDataStore
const CryptoJS = require('@unitybase/cryptojs')
// const CryptoJSCore = require('@unitybase/cryptojs/core')
const SHA256 = require('@unitybase/cryptojs/sha256')
const MD5 = require('@unitybase/cryptojs/md5')
const UBNativeMessage = require('./UBNativeMessage')

let _errorReporter = null
let _globalVueInstance = null
/**
 * Data layer for accessing UnityBase server from Browser or NodeJS
 * @module @unitybase/ub-pub
 */
module.exports = {
  /**
   * Return locale-specific resource from it identifier. `localeString` must be:
   *
   * - either previously defined dy call to {@link i18nExtend i18nExtend}
   * - or be a combination of entity and attribute names so that `UB.i18n('uba_user')`
   *  or `UB.i18n('uba_role.description')` would be resolved to  localized entity caption or entity attribute caption
   *
   * @example

 //Localized string can be formatted either by position args:
 UB.i18nExtend({
   greeting: 'Hello {0}, welcome to {1}'
 })
 UB.i18n('greeting', 'Mark', 'Kiev') // Hello Mark, welcome to Kiev

 //Or by named args:
 UB.i18nExtend({
   namedGreeting: 'Hello {name}, welcome to {place}'
 })
 UB.i18n('namedGreeting', {name: 'Mark', place: 'Kiev'}) // Hello Mark, welcome to Kiev

 //Localization itself can be an object:
 UB.i18nExtend({
   loginPage: { welcome: 'Welcome to our app', user: 'Dear {user}'}
 })
 UB.i18n('loginPage.welcome') // Welcome to our app
 UB.i18n('loginPage.user', {user: 'Pol}) // Dear Pol
 UB.i18n('loginPage') // return object {welcome: "Welcome to our app", user: "Dear {user}"}

   *
   * @param {String} localeString
   * @param {...*} formatArgs Format args
   * @returns {*}
   */
  i18n: i18n.i18n.bind(i18n),
  /**
   * Merge localizationObject to UB.i18n. Usually called form `modelFolder/locale/lang-*.js` scripts
   * @param {Object} localizationObject
   */
  i18nExtend: function (localizationObject) {
    return i18n.i18nExtend(localizationObject)
  },
  /**
   * Allows to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
   * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
   *
   *     var s = UB.format('{1}/ext-lang-{0}.js', 'en', 'locale');
   *     // s now contains the string: ''locale/ext-lang-en.js''
   *
   * @param {String} stringToFormat The string to be formatted.
   * @param {...*} values The values to replace tokens `{0}`, `{1}`, etc in order.
   * @return {String} The formatted string.
   */
  format: function (stringToFormat, ...values) { return utils.format(stringToFormat, ...values) },
  /**
   * Copies all the properties of one or several objectsFrom to the specified objectTo.
   * Non-simple type copied by reference!
   * @param {Object} objectTo The receiver of the properties
   * @param {...Object} objectsFrom The source(s) of the properties
   * @return {Object} returns objectTo
   */
  apply: function (objectTo, ...objectsFrom) { return utils.apply(objectTo, ...objectsFrom) },
  /**
   * Creates namespaces to be used for scoping variables and classes so that they are not global.
   * @example
   *     UB.ns('DOC.Report');
   *
   *     DOC.Report.myReport = function() { ... };
   *
   * @method
   * @param {String} namespacePath
   * @return {Object} The namespace object.
   */
  ns: function (namespacePath) { return utils.ns(namespacePath) },
  /**
   * Convert UnityBase server Boolean response (0 or 1) to JS Boolean (false or true)
   * @param v Value to convert
   * @returns {Boolean|null}
   */
  booleanParse: function (v) { return utils.booleanParse(v) },
  /**
   * Convert UnityBase server dateTime response (ISO8601 string) to Date object
   * @param value String representation of Date in ISO8601 format
   * @returns {Date}
   */
  iso8601Parse: function (value) { return utils.iso8601Parse(value) },
  /**
   * Convert UnityBase server date response to Date object.
   * `date response` is a day with 00 time (2015-07-17T00:00Z), to get a real date we must add current timezone shift
   * @param value
   * @returns {Date}
   */
  iso8601ParseAsDate: function (value) { return utils.iso8601ParseAsDate(value) },
  /**
   * Fast async transformation of data to base64 string
   * @param {File|ArrayBuffer|String|Blob|Array} data
   * @returns {Promise<string>} resolved to data converted to base64 string
   */
  base64FromAny: function (data) { return utils.base64FromAny(data) },
  /**
   * Convert base54 encoded string to decoded array buffer
   * @param {String} base64
   * @returns {ArrayBuffer}
   */
  base64toArrayBuffer: function (base64) { return utils.base64toArrayBuffer(base64) },
  /**
   * Client-side exception.
   * Such exceptions will not be showed as unknown error in {@link UB#showErrorWindow UB.showErrorWindow}
   * @type {UBError}
   */
  UBError: utils.UBError,
  /**
   * Quiet exception. Global error handler does not show this exception for user. Use it for silently reject promise.
   * @type {UBAbortError}
   */
  UBAbortError: utils.UBAbortError,
  log: utils.log,
  logError: utils.logError,
  logWarn: utils.logWarn,
  logDebug: utils.logDebug,
  /**
   * An asynchronous HTTP request. Returns a {Promise} object with the
   *  standard Promise methods (<a href="https://github.com/kriskowal/q/wiki/Coming-from-jQuery#reference">reference</a>).
   *  The `then` method takes two arguments a success and an error callback which will be called with a response object.
   *  The arguments passed into these functions are destructured representation of the response object passed into the
   *  `then` method. The response object has these properties:
   *
   *   - **data** – `{string|Object}` – The response body transformed with the transform
   *     functions. Default transform check response content-type is application/json and if so - convert data to Object
   *   - **status** – `{number}` – HTTP status code of the response.
   *   - **headers** – `{function([headerName])}` – Header getter function.
   *   - **config** – `{Object}` – The configuration object that was used to generate the request.
   *
   * @example

//Get some data from server:
UB.xhr({url: 'getAppInfo'}).then(function(resp) {
  console.log('this is appInfo: %o', resp.data)
})

//The same, but in more short form via {@link get UB.get} shorthand:
UB.get('getAppInfo').then(function(resp) {
  console.log('this is appInfo: %o', resp.data)
})

//Run POST method:
UB.post('ubql', [
  {entity: 'uba_user', method: 'select', fieldList: ['*']}
]).then(function(resp) {
  console.log('success!')
}, function(resp) {
  console.log('request failed with status' + resp.status);
})

//retrieve binary data as ArrayBuffer
UB.get('downloads/cert/ACSK(old).cer', {responseType: 'arraybuffer'})
.then(function(res){
 console.log('Got Arrray of %d length', res.data.byteLength);
})

   * @param {Object} requestConfig Object describing the request to be made and how it should be
   *    processed. The object has following properties:
   * @param {String} requestConfig.url  Absolute or relative URL of the resource that is being requested
   * @param {String} [requestConfig.method] HTTP method (e.g. 'GET', 'POST', etc). Default is GET
   * @param {Object.<string|Object>} [requestConfig.params] Map of strings or objects which will be turned
   *      to `?key1=value1&key2=value2` after the url. If the value is not a string, it will be JSONified
   * @param {String|Object} [requestConfig.data] Data to be sent as the request message data
   * @param {Object} [requestConfig.headers]  Map of strings or functions which return strings representing
   *      HTTP headers to send to the server. If the return value of a function is null, the
   *      header will not be sent. Merged with {@link xhrDefaults UB.xhrDefaults.headers}
   * @param {function(data, function)|Array.<function(data, function)>} [requestConfig.transformRequest]
   *      Transform function or an array of such functions. The transform function takes the http
   *      request body and headers and returns its transformed (typically serialized) version.
   * @param {function(data, function)|Array.<function(data, function)>} [requestConfig.transformResponse]
   *      Transform function or an array of such functions. The transform function takes the http
   *      response body and headers and returns its transformed (typically deserialized) version.
   * @param  {Number|Promise} [requestConfig.timeout] timeout in milliseconds, or {Promise}
   *      that should abort the request when resolved. Default to {UB.xhrDefaults.timeout}
   * @param  {Boolean} [requestConfig.withCredentials] whether to to set the `withCredentials` flag on the
   *      XHR object. See <a href="https://developer.mozilla.org/en/http_access_control#section_5">requests with credentials</a>
   *      for more information.
   * @param  {String} [requestConfig.responseType] see <a href="https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType">responseType</a>.
   * @param {Function} [requestConfig.onProgress] XHR onProgress callback, see <a href="https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent">ProgressEvent</url> for details.
   *      To be user instead obsolete Q Promise.progress()
   * @returns {Promise}
   */
  xhr: function (requestConfig) { return transport.xhr(requestConfig) },
  /**
   * Shortcut for {@link xhr} to perform a `GET` request.
   * @param {string} url Relative or absolute URL specifying the destination of the request
   * @param {Object=} [config] Optional configuration object as in {@link xhr UB.xhr}
   * @returns {Promise} Future object
   */
  get: function (url, config) { return transport.get(url, config) },
  /**
   * Shortcut for {@link xhr} to perform a `POST` request.
   * @param {string} url Relative or absolute URL specifying the destination of the request
   * @param {*} data Request content
   * @param {Object=} [config] Optional configuration object as in {@link xhr UB.xhr}
   * @returns {Promise} Future object
   */
  post: function (url, data, config) { return transport.post(url, data, config) },
  /**
   * Class for communicate with native messages plugin `content script`.
   * @type {UBNativeMessage}
   */
  UBNativeMessage: UBNativeMessage,
  UBConnection: conn,
  /**
   * Client side cache
   * @type {UBCache}
   */
  UBCache: UBCache,
  /**
   * Create authorized connection to UnityBase server.
   *
   * For a browser clients in case value of `silenceKerberosLogin` localStorage key is 'true' and 'Negotiate'
   * authorization method is enable for application will try to authenticate user using Kerberos/NTLM method.
   *
   * Preferred locale tip: to define connection preferredLocale parameter call
   * `localStorage.setItem(UB.LDS_KEYS.PREFERRED_LOCALE, 'uk')`
   * **before** call to UBConnection.connect
   * @example

const UB = require('@unitybase/ub-pub')
let conn = UB.connect({
  host: window.location.origin,
  path: window.location.pathname,
  onCredentialRequired: function(conn, isRepeat){
      if (isRepeat){
          throw new UB.UBAbortError('invalid credential')
      } else {
          return Promise.resolve({authSchema: 'UB', login: 'admin', password: 'admin'})
      }
  },
  onAuthorizationFail:  function(reason){
      alert(reason)
  }
})
conn.then(function(conn){
  conn.get('stat').then(function(statResp){
    document.getElementById('ubstat').innerText = JSON.stringify(statResp.data, null, '\t')
  })

  conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption']).selectAsArray().then(function(data){
    let tmpl = _.template(document.getElementById('repo-template').innerHTML);
    let result = tmpl(data.resultData);
    // document.getElementById('ubnav').innerText = JSON.stringify(data.resultData);
    document.getElementById('ubnav').innerHTML = result;
  })
})

   * @param cfg
   * @param {string} cfg.host Server host
   * @param {string} [cfg.path] API path - the same as in Server config `httpServer.path`
   * @param cfg.onCredentialRequired Callback for requesting a user credentials. See {@link UBConnection} constructor `requestAuthParams` parameter description
   * @param {boolean} [cfg.allowSessionPersistent=false] For a non-SPA browser client allow to persist a Session in the local storage between reloading of pages.
   *  In case user logged out by server side this type persistent not work and UBConnection will call onCredentialRequired handler,
   *  so user will be prompted for credentials
   * @param [cfg.onAuthorizationFail] Callback for authorization failure. See {@link event:authorizationFail} event. Should handle all errors inside!
   * @param [cfg.onAuthorized] Callback for authorization success. See {@link event:authorized} event.
   * @param [cfg.onNeedChangePassword] Callback for a password expiration. See {@link event:passwordExpired} event
   * @param [cfg.onGotApplicationConfig] Called just after application configuration retrieved from server.
   *  Accept one parameter - connection: UBConnection
   *  Usually on this stage application inject some scripts required for authentication (locales, cryptography etc).
   *  Should return a promise then done
   * @param [cfg.onGotApplicationDomain]
   * @return {Promise<UBConnection>}
   */
  connect: function (cfg) {
    return conn.connect(cfg, this).then((conn) => {
      if (_globalVueInstance && _globalVueInstance.$i18n) {
        _globalVueInstance.$i18n.locale = conn.userLang()
      }
      this.Repository = function (entityCode) {
        return new ClientRepository(conn, entityCode)
      }
      return conn
    })
  },
  /**
   * After call to UB.connect this property will point to the active connection
   * @type {UBConnection}
   */
  connection: null,
  /**
   * @type {ClientRepository}
   */
  ClientRepository: ClientRepository,
  /**
   * Create a new instance of repository for a current connection.
   * To be used after connection is created.
   *
   * @param {String} entityCode The name of the Entity for which the Repository is being created
   * @returns {ClientRepository}
   */
  Repository: function (entityCode) {
    throw new Error('function defined only after connect()')
  },
  /**
   * Set a error reported callback for unhandled errors (including unhandled promise rejections).
   * Callback signature `function({errMsg, errCode, entityCode, detail})`
   *  - `errMsg` is already translated using UB.i18n
   *
   * This callback also called inside `UBPub.showErrorWindow`
   *
   * @param {function} errorReportedFunction
   */
  setErrorReporter: function (errorReportedFunction) {
    _errorReporter = errorReportedFunction
  },
  /**
   * Default error reported handler. Will translate error message using {@link UB#i18n i18n}.
   *
   * For a UI other then adminUI developer can call `UB.setErrorReporter` to set his own error reporter
   * @example

      const UB = require('@unitybase/ub-pub')
      const vm = new Vue({
        ...
        methods: {
          showError: function(errMsg, errCode, entityCode, detail) {
            this.$message({
              showClose: true,
              message: errMsg,
              type: 'error'
            })
          }
          ...
      })
      UB.setErrorReporter(vm.showError.bind(vm))
   *
   * @param {String|Object|Error|UBError} errMsg  message to show
   * @param {String} [errCode] error code
   * @param {String} [entityCode] entity code
   * @param {String} [detail] details
   */
  showErrorWindow: function (errMsg, errCode, entityCode, detail) {
    let parsed
    try {
      parsed = utils.parseUBError(errMsg, errCode, entityCode, detail)
      if (_errorReporter) {
        _errorReporter(parsed)
      } else if (this.userAgent && typeof window !== 'undefined') {
        window.alert(parsed.errMsg)
      } else if (typeof console !== 'undefined') {
        console.error(parsed.errMsg, parsed.detail)
      }
    } catch (e) {
      console.error(e)
    }
  },
  /**
   * @deprecated Use connection.appConfig instead
   */
  appConfig: null,
  /**
   * Helper class for manipulation with data, stored locally in ({@link TubCachedData} format)
   * @type {LocalDataStore}
   */
  LocalDataStore: LocalDataStore,

  userAgent: utils.userAgent,
  isChrome: utils.isChrome,
  isWebKit: utils.isWebKit,
  isGecko: utils.isGecko,
  isOpera: utils.isOpera,
  isMac: utils.isMac,
  isSecureBrowser: utils.isSecureBrowser,
  isReactNative: utils.isReactNative,
  /**
   * Inject external script or css to DOM and return a promise to be resolved when script is loaded.
   *
   * if script successfully loaded using inject it will not be loaded anymore with repeatable calls to UB.inject.
   *
   * @example
//Load script.js:
UB.inject('jslibs/script.js')

//Load several script at once and error handling:
Promise.all([UB.inject('jslibs/script.js'), UB.inject('script2.js')])
.catch(function(err){
 console.log('Oh! error occurred: ' + err)
})

//Load one script and then load other
UB.inject('jslibs/js_beautify.js').then(function(){
 console.log('first script loaded. Continue to load second')
 return UB.inject('jslibs/js_beautify1.js')
})

//Load couple of resources:
Promise.all([UB.inject('css/first.css'), UB.inject('css/second.css')])

   * @param {String} url either *js* or *css* resource to load
   * @param {String} [charset]
   * @return {Promise}
   */
  inject: function (url, charset) { return injection.inject(url, charset) },
  addResourceVersion: injection.addResourceVersion,
  /**
   * Calculate SHA256 checksum
   */
  SHA256: SHA256,
  /**
   * Calculate MD5 checksum
   */
  MD5: MD5,
  /**
   * Vue JS integration
   *  - inject UB localization {@link UB.i18n UB.i18n} to global Vue instance as $ut:
   *  - inject `@unitybase/ub-pub` to global Vue instance as $UB
   *
   * @example

  const Vue = require('vue')
  const UB = require('@unitybase/ub-pub')
  Vue.use(UB)

  // localization of vue template
  <button >{{ $ut('Enter') }}</button>
  // in case translation result is HTML + use formatting
  <p v-html="$ut('UBAuthHeader', appName)"></p>
  // inside binding
  <el-tooltip :content="$ut('UBAuthTip')" placement="bottom" effect="light">
  // inside vue methods
  this.$ut('UBAuthTip')

  // using UB inside vue methods
  methods: {
     hasNegotiate: function () {
       return this.$UB.connection.authMethods.indexOf('Negotiate') !== -1
     }
  }

   * @param vue
   */
  install: function (vue) {
    _globalVueInstance = vue
    vue.prototype.$UB = module.exports
    vue.prototype.$ut = module.exports.i18n
  },
  /**
   * localDataStorage keys used by @unitybase-ub-pub (in case of browser environment)
   * @readonly
   * @enum
   */
  LDS_KEYS: utils.LDS_KEYS,
  /**
   * Legacy for old adminUI
   * @private
   */
  ux: {},
  /**
   * Legacy for old adminUI
   * @private
   */
  view: {},
  /**
   * Legacy for old adminUI
   * @private
   */
  core: {},
  /**
   * Legacy for old adminUI. UBUtil.js will define this property
   * @private
   */
  Utils: {}
}

let __alreadyAdded = false
/**
 * Intercept all unhandled errors including Promise unhandled rejections.
 * Errors will be parsed and passed to UB.showErrorWindow {@see setErrorReporter setErrorReporter}
 */
function addBrowserUnhandledRejectionHandler (UBPub) {
  let originalOnError = null
  if (typeof window === 'undefined' || UBPub.isReactNative || __alreadyAdded) return // non browser environment
  if (__alreadyAdded) console.error('module @unitybase/ub-pub imported several times. This is wrong situation and should be fixed by app developer. Try `npm ddp`')
  __alreadyAdded = true
  if (window.onerror) {
    originalOnError = window.onerror
  }
  // for a unhandled rejection in bluebird-q
  if (window.Q && window.Q.getBluebirdPromise) {
    window.Q.onerror = function (error) {
      window.onerror.apply(UBPub, [ '', '', '', '', error ])
    }
  }
  // for unhandled rejection in bluebird/native promises (IE 10+)
  window.addEventListener('unhandledrejection', function (e) {
    // NOTE: e.preventDefault() must be manually called to prevent the default
    // action which is currently to log the stack trace to console.warn
    e.preventDefault()
    // NOTE: parameters are properties of the event detail property
    let reason = e.detail ? e.detail.reason : e.reason
    let promise = e.detail ? e.detail.promise : e.promise
    // See Promise.onPossiblyUnhandledRejection for parameter documentation
    if (window.onerror) window.onerror.apply(UBPub, [ '', '', '', '', reason ])
    console.error('UNHANDLED', reason, promise)
  })

  window.onerror = function (msg, file, line, column, errorObj) {
    let message
    let detail = ''

    if (errorObj && utils.UBAbortError && errorObj instanceof utils.UBAbortError) {
      console.log(errorObj)
      return
    }
    let isHandled = errorObj && utils.UBError && errorObj instanceof utils.UBError

    if (errorObj && Error && errorObj instanceof Error) {
      message = errorObj.message
      detail = ''
      if (/q\.js/.test(file) === false) {
        detail += 'file: "' + file + '" line: ' + line
      }
      let strace = errorObj.stack || ''
      detail += strace.replace(/\?ubver=\w*/g, '').replace(/\?ver=\w*/g, '') // remove any versions
      detail = detail.replace(new RegExp(window.location.origin.replace(/:/g, '\\$&'), 'g'), '') // remove address if same as origin
      detail = detail.replace(/\/[\w-]+\.js:/g, '<b>$&</b>&nbsp;line ') // file name is BOLD
      detail = detail.replace(/\n/g, '<br>&nbsp;&nbsp;')
    } else if (errorObj && errorObj.data && errorObj.data.errMsg) {
      message = errorObj.data.errMsg
    } else if (errorObj && errorObj.status === 0) { // long network request
      message = 'serverIsBusy'
      isHandled = true
    } else if (errorObj && errorObj.errMsg) {
      message = errorObj.errMsg
      detail = errorObj.detail ? errorObj.detail : message
    } else {
      message = errorObj && (typeof errorObj === 'string') ? errorObj : msg
    }
    if (errorObj && errorObj.detail) {
      detail = errorObj.detail + (detail ? '<br/>' + detail : '')
      // 405 Method Not Allowed
      if (errorObj.detail === 'Method Not Allowed') {
        message = 'recordNotExistsOrDontHaveRights'
      }
    }
    if (!message) {
      message = 'internalServerError'
    }

    if (!isHandled) {
      // MPV - message is already in datail (stack trace)
      // detail = message + '<BR/> ' + detail;
      message = 'unknownError'
    }
    try {
      UBPub.showErrorWindow(message, '', '', detail)
    } catch (err) {
      window.alert(message)
    }
    if (originalOnError) originalOnError.call(window, msg, file, line, column, errorObj)
  }
}
addBrowserUnhandledRejectionHandler(module.exports)

if (typeof SystemJS !== 'undefined') { // browser
  if (!SystemJS.has('@unitybase/cryptojs')) SystemJS.set('@unitybase/cryptojs', SystemJS.newModule(CryptoJS))
  if (!SystemJS.has('@unitybase/ub-pub')) SystemJS.set('@unitybase/ub-pub', SystemJS.newModule(module.exports))
}
