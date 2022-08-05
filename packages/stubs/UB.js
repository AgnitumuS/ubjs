/* global __UB_int, removeCommentsFromJSON */
/*
 UnityBase startup script
 this script initializes working thread JavaScript context and is called by server for each thread.
 In case UB runs in batch mode, script is called once - for main thread only
 */
Object.defineProperty(global, '__UB_int', {
  configurable: false,
  enumerable: false,
  value: { }
  // get() {
  //   return __UB_INT_VAL
  // },
  // set() {
  //   const err = new Error()
  //   throw new Error('global.UB override detected\nStack:' + err.stack)
  // }
})

// increase EventEmitter.defaultMaxListeners to 100
// for server-side typical pattern is to subscribe to the event end never unsubscribe
// so the node behavior of tracking leaks (someone forgot to unsubscribe) is not applicable
;(function () {
  const EventEmitter = require('events').EventEmitter
  EventEmitter.defaultMaxListeners = 100
})()

/**
 * Put something to log with log levels depending on method
 * @global
 * @type {Console}
 */
// eslint-disable-next-line no-global-assign
global.console = require('console')
const Module = require('module')

process.emitWarning = console.warn
if (process.isServer) {
  const originalFindPath = Module._findPath
  Module._findPath = function(request, paths, isMain) {
    if (request.endsWith('.meta')) return request
    return originalFindPath(request, paths, isMain)
  }
  // Native extension for .meta
  Module._extensions['.meta'] = function(module, filename) {
    const entityScope = filename.slice(0, -5)
    if (!global[entityScope]) throw new Error(`Entity ${entityScope} not in domain or not loaded`)
    module.exports = global[entityScope]
  }
}

const path = require('path')

const ubVersionNum = process.version.slice(1).split('.').map(v => parseInt(v, 10)).reduce((acum, v) => acum * 1000 + v)
__UB_int.checkEngine = function (pkg) {
  const wantedUb = pkg.engines && (pkg.engines.ub || pkg.engines.UnityBase)
  if (wantedUb) {
    if (!wantedUb.startsWith('>=')) {
      console.error(`engines.ub in package.json should starts with >=, but in ${pkg.name} '${wantedUb}' is used. Requirement is ignored`)
      return true
    }
    const spl = wantedUb.slice(2).split('.')
    while (spl.length < 3) spl.push('0')
    const wantedUbNum = spl.map(v => parseInt(v, 10)).reduce((acum, v) => acum * 1000 + v)
    if (ubVersionNum < wantedUbNum) {
      throw new Error(`${pkg.name} require ub server version to be ${wantedUb} but current is ${process.version}`)
    }
  }
}

/**
 * Call a script passed to UB from command line `ub test.js`)
 * @param {string} fn Name of file to evaluate. If not absolute then will be relative to process.cwd()
 */
__UB_int._runAsShell = function(fn) {
  if (!path.isAbsolute(fn)) fn = path.join(process.cwd(), fn)
  const m = require(fn)
  if (typeof m === 'function') m()
}

__UB_int._runAsApp = function () {
  const startupModule = process.configPath
  try {
    const pkg = require(path.join(startupModule, 'package.json'))
    __UB_int.checkEngine(pkg)
    require(startupModule)
  } catch (e) {
    if (process.isDebug) {
      console.error(`Evaluation of '${startupModule}' fails: ${e.message}. Stack: ${e.stack}`)
    }
    throw e
  }
}

// config merging and env file dotenv`ing
;(function () {
  const fs = require('fs')
  const url = require('url')

  // below is a dotenv@8.2
  function log (message /*: string */) {
    console.log(`[dotenv][DEBUG] ${message}`)
  }

  const NEWLINE = '\n'
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
  const RE_NEWLINES = /\\n/g
  const NEWLINES_MATCH = /\n|\r|\r\n/

  // Parses src into an Object
  function parse (src /*: string | Buffer */, options /*: ?DotenvParseOptions */) /*: DotenvParseOutput */ {
    const debug = Boolean(options && options.debug)
    const obj = {}

    // convert Buffers before splitting into lines and processing
    src.toString().split(NEWLINES_MATCH).forEach(function (line, idx) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL)
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1]
        // default undefined or missing values to empty string
        let val = (keyValueArr[2] || '')
        const end = val.length - 1
        const isDoubleQuoted = val[0] === '"' && val[end] === '"'
        const isSingleQuoted = val[0] === "'" && val[end] === "'"

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end)

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE)
          }
        } else {
          // remove surrounding whitespace
          val = val.trim()
        }

        obj[key] = val
      } else if (debug) {
        log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
      }
    })

    return obj
  }

  // Populates process.env from .env file
  function config (options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
    let dotenvPath = path.resolve(process.cwd(), '.env')
    let encoding /*: string */ = 'utf8'
    let debug = false

    if (options) {
      if (options.path != null) {
        dotenvPath = options.path
      }
      if (options.encoding != null) {
        encoding = options.encoding
      }
      if (options.debug != null) {
        debug = true
      }
    }

    try {
      // specifying an encoding returns a string instead of a buffer
      const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug })

      Object.keys(parsed).forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
          process.env[key] = parsed[key]
        } else if (debug) {
          log(`"${key}" is already defined in \`process.env\` and will not be overwritten`)
        }
      })

      return { parsed }
    } catch (e) {
      return { error: e }
    }
  }
  // end of dotenv

  // apply dotenv BEFORE parsing of config
  let envOptionVal = switchValue('env') || process.env.UB_ENV
  if (envOptionVal) {
    envOptionVal = path.resolve(process.configPath, envOptionVal)
    if (fs.existsSync(envOptionVal)) {
      config({path: envOptionVal})
    } else {
      console.warn(`env file '${envOptionVal}'passed as arg to -env not exists`)
    }
  }

  function switchIndex (switchName) {
    const res = process.argv.indexOf('-' + switchName)
    return (res === -1) ? process.argv.indexOf('/' + switchName) : res
  }
  function switchValue (switchName) {
    const idx = switchIndex(switchName) + 1
    let val
    return (idx && (val = process.argv[idx]) && val.charAt !== '-' && val.charAt !== '/') ? process.argv[idx] : undefined
  }
  /**
   * Get config file name. if -cfg switch passed then use this switch value, else use default
   * @return {String}
   */
  function getConfigFileName () {
    let cfgFile = switchValue('cfg') || process.env.UB_CFG

    if (cfgFile) {
      if (!path.isAbsolute(cfgFile)) cfgFile = path.join(process.cwd(), cfgFile)
      if (!fs.existsSync(cfgFile)) {
        console.warn('passed -cfg file not exist ' + cfgFile)
        cfgFile = ''
      }
    }
    if (!cfgFile) {
      cfgFile = path.join(process.cwd(), 'ubConfig.json')
      cfgFile = fs.existsSync(cfgFile) ? cfgFile : ''
    }
    if (!cfgFile) {
      cfgFile = path.resolve(path.dirname(process.execPath), 'ubConfig.json')
      cfgFile = fs.existsSync(cfgFile) ? cfgFile : ''
    }
    if (!cfgFile) throw new Error('Server configuration file not found')
    return cfgFile
  }
  __UB_int.getConfigFileName = getConfigFileName

  /**
   * #ifdef / #ifndef directives parser:
   *  - keep a part of JSON content between `"#ifdef": "%VAR_NAME%", ... "#endif": ""` if environment variable VAR_NAME is defined and not empty
   *  - keep a part of JSON content between`"#ifndef": "%VAR_NAME%", ... "#endif": ""` if environment variable VAR_NAME is not defined or empty
   *  - support up to TWO level of nesting ifdef's by using //#ifdef1 .. //#endif1 and //#ifdef2 ... //#endif2
   *  - content replaced by empty strings to keep the same line numbers as in original file
   *  Nesting example:
   *  @example
    //#ifdef(%UB_ENABLE_ENOT%=true)
    {
      "name": "enot",
      "driver": "Oracle",
      "serverName": "%UB_DB_ENOT_SERVER%",
      "userID": "%UB_DB_ENOT_USER%",
      "password": "%UB_DB_ENOT_PWD%",
      //#ifdef1(%UB_LOCALE%=BINARY)
      "executeWhenConnected": [
          "ALTER SESSION SET NLS_COMP=LINGUISTIC",
          "ALTER SESSION SET NLS_SORT=BINARY_CI",
          //#ifdef2(%UB_DB_STATEMENT_TIME_LIMIT%)
          "DECLARE prev_group VARCHAR2(30); BEGIN DBMS_SESSION.switch_current_consumer_group ('%UB_DB_STATEMENT_TIME_LIMIT%', prev_group, TRUE); END;"
          //#endif2
      ]
      //#endif1
    }
    //#endif

   * @private
   * @param {String} content
   * @return {String}
   */
  function replaceIfDefs (content) {
    function replaceIfDefsLevel (content, B, E) {
      function getCRCnt (s) {
        let r = 0
        for (let i = 0, L = s.length; i < L; i++) {
          if (s.charAt(i) === '\n') r++
        }
        return r
      }

      let res = content.replace(new RegExp(`\\/\\/#ifdef${B}\\((.*?)\\)([\\s\\S]*?)\\/\\/#endif${E}`,'gm'), (match, envVarVal, envCt) => {
        if (envVarVal) {
          const arr = envVarVal.split('=')
          if (arr.length === 2) { // check === condition //#ifdef(val=val)
            if (arr[0] === arr[1]) return envCt
          } else {
            return envCt
          }
        }
        return ' \n'.repeat(getCRCnt(envCt)) + ' ' // spaces for `ub -T | nl` line numbers
      })
      res = res.replace(new RegExp(`\\/\\/#ifndef${B}\\((.*?)\\)([\\s\\S]*?)\\/\\/#endif${E}`,'gm'), (match, envVarVal, envCt) => {
        if (!envVarVal) {
          return envCt
        } else {
          const arr = envVarVal.split('=')
          if (arr.length === 2) { // check !== condition //#ifdef(val1=val2)
            if (arr[0] !== arr[1]) return envCt
          }
        }
        return ' \n'.repeat(getCRCnt(envCt)) + ' '
      })
      return res
    }
    let res = replaceIfDefsLevel(content, '', '[\\D]') // \D = anything but a digit
    res = replaceIfDefsLevel(res, '1', '1')
    return replaceIfDefsLevel(res, '2', '2')
  }
  /**
   * Replace placeholders %VAR_NAME||default% to environment variable value (or optional default)
   * @private
   * @param {String} content
   * @param {Map} usedVars If defined = accumulate used vars here. If ends with '* - thi is default
   * @return {String}
   */
  function replaceEnvironmentVariables (content, usedVars=null) {
    return content.replace(/%([\w-#.@$]*?)(?:\|\|(.*?))?%/gm, function replacer (match, p1, def) {
      if (process.env.hasOwnProperty(p1)) {
        const val = process.env[p1].replace(/\\/g, '\\\\')
        if (usedVars) usedVars[p1] = `'${val}'`
        return val
      } else {
        if (def !== undefined) {
          if (usedVars) usedVars[p1] = `'${def}'*`
          return def
        } else {
          if (usedVars) usedVars[p1] = ''
          return ''
        }
      }
    })
  }

  /**
   * Will replace placeholders "#include(pathToFile) to file content
   * @private
   * @param {String} content
   * @return {String}
   */
  function replaceIncludeVariables (content) {
    return content.replace(/"#include\((.*)\)"/gm, function replacer (match, p1) {
      let filePath
      try {
        filePath = JSON.parse('{"f": "' + p1 + '"}').f // hack to decode JSON string
      } catch (e) {
        return 'INVALID INCLUDE ' + p1
      }
      filePath = path.resolve(process.configPath, filePath)
      try {
        fs.statSync(filePath)
      } catch (e) {
        return 'INVALID INCLUDE ' + filePath
      }
      const content = removeCommentsFromJSON(fs.readFileSync(filePath, 'utf8'))
      if (!content) {
        return 'EMPTY INCLUDE ' + filePath
      }
      return replaceEnvironmentVariables(content)
    })
  }

  /**
   * In case packageData.section contains relative path return package.name+path else path
   * @private
   * @param packageData
   * @param model
   * @param section
   * @return {*|browser|{}}
   */
  function checkPackageBrowserPath (packageData, model, section) {
    let p = packageData.browser[section] || packageData.browser
    if (!path.isAbsolute(p)) {
      if (!packageData.name) {
        const pKey = packageData.browser[section] ? `browser.${section}` : 'browser'
        console.error(`package.json "${pKey}" section for ${model.name} model contains a relative path but package.json "name" section is empty\n
Either use a absolute path ("/clientRequire/models/${model.name}/PathToYourDevScript" or specify a "name" section in package.json`)
        p = path.join(model.name, p).replace(/\\/g, '/')
      } else {
        p = path.join(packageData.name, p).replace(/\\/g, '/')
      }
    }
    return p
  }

  /**
   * Return a URL server actually listen on
   * @param {Object} config Server configuration
   */
  function serverURLFromConfig (config) {
    const httpCfg = config.httpServer || {}
    let rUrl = (httpCfg.protocol && httpCfg.protocol === 'https') ? 'https://' : 'http://'
    // in case of serverDomainNames in [+, *] replace it to localhost
    rUrl += httpCfg.host ? (httpCfg.host.length === 1 ? 'localhost' : httpCfg.host) : 'localhost'
    if (httpCfg.port) rUrl += ':' + httpCfg.port
    if (httpCfg.path) rUrl += '/' + httpCfg.path
    return rUrl
  }

  /**
   * JSON file parsing, allow to parse semi-JSON files with comments. In case of errors inside JSON show detailed error description
   * @param {String} fileName
   * @param {Boolean} [allowMultiLineString=false] Replace `\n` before parse (not compatible with JSON format, but multiline string is useful)
   * @param {Function} [preprocessor] Optional function accept file content transform it and return new content
   * @return {Object}
   */
  function safeParseJSONfile (fileName, validationMode, preprocessor) {
    let content = fs.readFileSync(fileName, 'utf8')
    if (preprocessor) content = preprocessor(content)
    content = removeCommentsFromJSON(content)
    try {
      return JSON.parse(content)
    } catch (e) {
      if (validationMode) console.log(content)
      console.error('Error parsing config file', fileName, e.message)
      throw e
    }
  }

  // this is minified lodash.mergewith@4.6.2
  // eslint-disable-next-line
  const lodashMergeWith=function(){var n="__lodash_hash_undefined__",o=9007199254740991,r="[object Arguments]",e="[object AsyncFunction]",i="[object Function]",u="[object GeneratorFunction]",a="[object Null]",_="[object Object]",c="[object Proxy]",f="[object Undefined]",l=/^\[object .+?Constructor\]$/,s=/^(?:0|[1-9]\d*)$/,p={};p["[object Float32Array]"]=p["[object Float64Array]"]=p["[object Int8Array]"]=p["[object Int16Array]"]=p["[object Int32Array]"]=p["[object Uint8Array]"]=p["[object Uint8ClampedArray]"]=p["[object Uint16Array]"]=p["[object Uint32Array]"]=!0,p[r]=p["[object Array]"]=p["[object ArrayBuffer]"]=p["[object Boolean]"]=p["[object DataView]"]=p["[object Date]"]=p["[object Error]"]=p[i]=p["[object Map]"]=p["[object Number]"]=p[_]=p["[object RegExp]"]=p["[object Set]"]=p["[object String]"]=p["[object WeakMap]"]=!1;var t="object"==typeof global&&global&&global.Object===Object&&global,h="object"==typeof self&&self&&self.Object===Object&&self,v=t||h||Function("return this")(),y="object"==typeof exports&&exports&&!exports.nodeType&&exports,b=y&&"object"==typeof module&&module&&!module.nodeType&&module,d=b&&b.exports===y,g=d&&t.process,j=function(){try{var t=b&&b.require&&b.require("util").types;return t?t:g&&g.binding&&g.binding("util")}catch(t){}}(),O=j&&j.isTypedArray;var A,m,w,z=Array.prototype,x=Function.prototype,S=Object.prototype,F=v["__core-js_shared__"],U=x.toString,$=S.hasOwnProperty,P=(A=/[^.]+$/.exec(F&&F.keys&&F.keys.IE_PROTO||""))?"Symbol(src)_1."+A:"",E=S.toString,I=U.call(Object),M=RegExp("^"+U.call($).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),T=d?v.Buffer:void 0,k=v.Symbol,B=v.Uint8Array,D=T?T.allocUnsafe:void 0,R=(m=Object.getPrototypeOf,w=Object,function(t){return m(w(t))}),q=Object.create,C=S.propertyIsEnumerable,L=z.splice,N=k?k.toStringTag:void 0,W=function(){try{var t=_t(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),G=T?T.isBuffer:void 0,V=Math.max,H=Date.now,J=_t(v,"Map"),K=_t(Object,"create"),Q=function(t){if(!$t(t))return{};if(q)return q(t);X.prototype=t;var r=new X;return X.prototype=void 0,r};function X(){}function Y(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}function Z(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}function tt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}function rt(t){var r=this.__data__=new Z(t);this.size=r.size}function et(t,r){var e=zt(t),n=!e&&wt(t),o=!e&&!n&&St(t),i=!e&&!n&&!o&&Mt(t),u=e||n||o||i,a=u?function(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n}(t.length,String):[],c=a.length;for(var f in t)!r&&!$.call(t,f)||u&&("length"==f||o&&("offset"==f||"parent"==f)||i&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||yt(f,c))||a.push(f);return a}function nt(t,r,e){(void 0===e||mt(t[r],e))&&(void 0!==e||r in t)||it(t,r,e)}function ot(t,r){for(var e=t.length;e--;)if(mt(t[e][0],r))return e;return-1}function it(t,r,e){"__proto__"==r&&W?W(t,r,{configurable:!0,enumerable:!0,value:e,writable:!0}):t[r]=e}Y.prototype.clear=function(){this.__data__=K?K(null):{},this.size=0},Y.prototype.delete=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},Y.prototype.get=function(t){var r=this.__data__;if(K){var e=r[t];return e===n?void 0:e}return $.call(r,t)?r[t]:void 0},Y.prototype.has=function(t){var r=this.__data__;return K?void 0!==r[t]:$.call(r,t)},Y.prototype.set=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=K&&void 0===r?n:r,this},Z.prototype.clear=function(){this.__data__=[],this.size=0},Z.prototype.delete=function(t){var r=this.__data__,e=ot(r,t);return!(e<0)&&(e==r.length-1?r.pop():L.call(r,e,1),--this.size,!0)},Z.prototype.get=function(t){var r=this.__data__,e=ot(r,t);return e<0?void 0:r[e][1]},Z.prototype.has=function(t){return-1<ot(this.__data__,t)},Z.prototype.set=function(t,r){var e=this.__data__,n=ot(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this},tt.prototype.clear=function(){this.size=0,this.__data__={hash:new Y,map:new(J||Z),string:new Y}},tt.prototype.delete=function(t){var r=vt(this,t).delete(t);return this.size-=r?1:0,r},tt.prototype.get=function(t){return vt(this,t).get(t)},tt.prototype.has=function(t){return vt(this,t).has(t)},tt.prototype.set=function(t,r){var e=vt(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this},rt.prototype.clear=function(){this.__data__=new Z,this.size=0},rt.prototype.delete=function(t){var r=this.__data__,e=r.delete(t);return this.size=r.size,e},rt.prototype.get=function(t){return this.__data__.get(t)},rt.prototype.has=function(t){return this.__data__.has(t)},rt.prototype.set=function(t,r){var e=this.__data__;if(e instanceof Z){var n=e.__data__;if(!J||n.length<199)return n.push([t,r]),this.size=++e.size,this;e=this.__data__=new tt(n)}return e.set(t,r),this.size=e.size,this};var ut,at=function(t,r,e){for(var n=-1,o=Object(t),i=e(t),u=i.length;u--;){var a=i[ut?u:++n];if(!1===r(o[a],a,o))break}return t};function ct(t){return null==t?void 0===t?f:a:N&&N in Object(t)?function(t){var r=$.call(t,N),e=t[N];try{var n=!(t[N]=void 0)}catch(t){}var o=E.call(t);n&&(r?t[N]=e:delete t[N]);return o}(t):(r=t,E.call(r));var r}function ft(t){return Pt(t)&&ct(t)==r}function lt(t){var r;return $t(t)&&(r=t,!(P&&P in r))&&(Ft(t)?M:l).test(function(t){if(null!=t){try{return U.call(t)}catch(t){}try{return t+""}catch(t){}}return""}(t))}function st(t){if(!$t(t))return function(t){var r=[];if(null!=t)for(var e in Object(t))r.push(e);return r}(t);var r=bt(t),e=[];for(var n in t)("constructor"!=n||!r&&$.call(t,n))&&e.push(n);return e}function pt(n,o,i,u,a){n!==o&&at(o,function(t,r){var e;a=a||new rt,$t(t)?function(t,r,e,n,o,i,u){var a=dt(t,e),c=dt(r,e),f=u.get(c);if(f)return nt(t,e,f);var l=i?i(a,c,e+"",t,r,u):void 0,s=void 0===l;{var p,h,v;s&&(p=zt(c),h=!p&&St(c),v=!p&&!h&&Mt(c),l=c,p||h||v?l=zt(a)?a:function(t){return Pt(t)&&xt(t)}(a)?function(t,r){var e=-1,n=t.length;r=r||Array(n);for(;++e<n;)r[e]=t[e];return r}(a):h?function(t,r){if(r)return t.slice();var e=t.length,n=D?D(e):new t.constructor(e);return t.copy(n),n}(c,!(s=!1)):v?function(t,r){var e=r?function(t){var r=new t.constructor(t.byteLength);return new B(r).set(new B(t)),r}(t.buffer):t.buffer;return new t.constructor(e,t.byteOffset,t.length)}(c,!(s=!1)):[]:function(t){if(!Pt(t)||ct(t)!=_)return!1;var r=R(t);if(null===r)return!0;var e=$.call(r,"constructor")&&r.constructor;return"function"==typeof e&&e instanceof e&&U.call(e)==I}(c)||wt(c)?wt(l=a)?l=function(t){return function(t,r,e,n){var o=!e;e=e||{};var i=-1,u=r.length;for(;++i<u;){var a=r[i],c=n?n(e[a],t[a],a,e,t):void 0;void 0===c&&(c=t[a]),(o?it:function(t,r,e){var n=t[r];$.call(t,r)&&mt(n,e)&&(void 0!==e||r in t)||it(t,r,e)})(e,a,c)}return e}(t,Tt(t))}(a):$t(a)&&!Ft(a)||(l=function(t){return"function"!=typeof t.constructor||bt(t)?{}:Q(R(t))}(c)):s=!1)}s&&(u.set(c,l),o(l,c,n,i,u),u.delete(c));nt(t,e,l)}(n,o,r,i,pt,u,a):(void 0===(e=u?u(dt(n,r),t,r+"",n,o,a):void 0)&&(e=t),nt(n,r,e))},Tt)}function ht(t,r){return At((i=t,a=kt,u=V(void 0===(u=r)?i.length-1:u,0),function(){for(var t=arguments,r=-1,e=V(t.length-u,0),n=Array(e);++r<e;)n[r]=t[u+r];r=-1;for(var o=Array(u+1);++r<u;)o[r]=t[r];return o[u]=a(n),function(t,r,e){switch(e.length){case 0:return t.call(r);case 1:return t.call(r,e[0]);case 2:return t.call(r,e[0],e[1]);case 3:return t.call(r,e[0],e[1],e[2])}return t.apply(r,e)}(i,this,o)}),t+"");var i,u,a}function vt(t,r){var e,n,o=t.__data__;return("string"==(n=typeof(e=r))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==e:null===e)?o["string"==typeof r?"string":"hash"]:o.map}function _t(t,r){var e,n,o=(n=r,null==(e=t)?void 0:e[n]);return lt(o)?o:void 0}function yt(t,r){var e=typeof t;return(r=null==r?o:r)&&("number"==e||"symbol"!=e&&s.test(t))&&-1<t&&t%1==0&&t<r}function bt(t){var r=t&&t.constructor;return t===("function"==typeof r&&r.prototype||S)}function dt(t,r){if(("constructor"!==r||"function"!=typeof t[r])&&"__proto__"!=r)return t[r]}var gt,jt,Ot,At=(gt=W?function(t,r){return W(t,"toString",{configurable:!0,enumerable:!1,value:(e=r,function(){return e}),writable:!0});var e}:kt,Ot=jt=0,function(){var t=H(),r=16-(t-Ot);if(Ot=t,0<r){if(800<=++jt)return arguments[0]}else jt=0;return gt.apply(void 0,arguments)});function mt(t,r){return t===r||t!=t&&r!=r}var wt=ft(function(){return arguments}())?ft:function(t){return Pt(t)&&$.call(t,"callee")&&!C.call(t,"callee")},zt=Array.isArray;function xt(t){return null!=t&&Ut(t.length)&&!Ft(t)}var St=G||function(){return!1};function Ft(t){if($t(t)){var r=ct(t);return r==i||r==u||r==e||r==c}}function Ut(t){return"number"==typeof t&&-1<t&&t%1==0&&t<=o}function $t(t){var r=typeof t;return null!=t&&("object"==r||"function"==r)}function Pt(t){return null!=t&&"object"==typeof t}var Et,It,Mt=O?(Et=O,function(t){return Et(t)}):function(t){return Pt(t)&&Ut(t.length)&&!!p[ct(t)]};function Tt(t){return xt(t)?et(t,!0):st(t)}function kt(t){return t}return It=function(t,r,e,n){pt(t,r,e,n)},ht(function(t,r){var e=-1,n=r.length,o=1<n?r[n-1]:void 0,i=2<n?r[2]:void 0,o=3<It.length&&"function"==typeof o?(n--,o):void 0;for(i&&function(t,r,e){if($t(e)){var n=typeof r;return("number"==n?xt(e)&&yt(r,e.length):"string"==n&&r in e)&&mt(e[r],t)}}(r[0],r[1],i)&&(o=n<3?void 0:o,n=1),t=Object(t);++e<n;){var u=r[e];u&&It(t,u,e,o)}return t})}();
  /**
   * Recursively merge two named collection
   * This method **mutate** `orig` or return `desc` if `orig` is empty collection
   *
   * @private
   * @param {*} orig
   * @param {*} desc
   */
  function mergeNamedCollections (orig, desc) {
    if (Array.isArray(orig) && Array.isArray(desc) &&
      ((orig.length && orig[0].name) || (desc.length && desc[0].name))
    ) {
      if (!orig.length) return desc
      desc.forEach(dItem => {
        const oItem = orig.find(oItem => oItem.name === dItem.name)
        if (oItem) {
          lodashMergeWith(oItem, dItem, mergeNamedCollections)
        } else {
          orig.push(dItem)
        }
      })
      return orig
    } else {
      return undefined // let's lodash do a merge
    }
  }
  /**
   * Read server configuration from file, resolved by {@link getConfigFileName}
   * parse it in safe mode, replace environment variables by it values,
   * sets a defaults and return parsed config.
   *
   * @param {boolean} [forFutureSave=false] If true will return config ready to save back as new ubConfig
   *  (do not add props model.browser & model.version)
   * @param {boolean} [validationMode=false]
   * @return {Object}
   */
  function getServerConfiguration (forFutureSave = false, validationMode = false) {
    const cfgFileName = getConfigFileName()
    let usedVars = validationMode ? {} : null
    const partials = []
    let result
    const cachedCfgStr = process.cachedConfigStr
    if (cachedCfgStr !== '') {
      result = JSON.parse(cachedCfgStr)
      return result
    }
    result = safeParseJSONfile(cfgFileName, validationMode,
      (content) => replaceIncludeVariables(replaceIfDefs(
        replaceEnvironmentVariables(content, usedVars)
      )))
    // add name attribute for applications
    if (!result.application) {
      result.application = {}
    }
    if (!forFutureSave) {
      result.application.name = result.httpServer.path ? result.httpServer.path : '/'
    }
    if (!result.application.defaultLang) {
      result.application.defaultLang = 'en'
    }
    if (!result.application.domain) {
      result.application.domain = { models: [] }
    }

    // adds vendor and customer models
    function addModels (csvList, root) {
      if (!csvList) return
      csvList.split(':').forEach(p => {
        result.application.domain.models.push({ path: path.join(root, p) })
      })
    }
    const vModelsRoot = process.env.UB_APPHOME
      ? path.join(process.env.UB_APPHOME, 'models')
      : 'models'
    addModels(result.application.domain.vendorModels, vModelsRoot)
    const cModelsRoot = process.env.UB_APPDATA
      ? path.join(process.env.UB_APPDATA, 'cmodels')
      : 'cmodels'

    if (!result.application.domain.customerModels) {
      result.application.domain.customerModels = ''
    }
    const cModelsArr = result.application.domain.customerModels.split(':').filter(m => !!m) // exclude empty values ''.split(':') => ['']
    if (cModelsArr.indexOf('cust') === -1) { // if cust model not added manually - add it in case folder for settings exists
      const userSettingsPath = path.join(cModelsRoot, 'cust')
      if (fs.existsSync(userSettingsPath)) {
        cModelsArr.push('cust')
        result.application.domain.customerModels = cModelsArr.join(':')
      }
    }
    addModels(result.application.domain.customerModels, cModelsRoot)

    // path to cust model - this model will be merged AFTER all other partials
    // this allows override parameters from main ubConfig.json
    let stngsPath, stngsPartialContent
    // for models without name - read it from package.json
    // read "browser" section of package.json to check public model part should be injected into browser
    // section may contains "prod" / "dev" key for production / development client execution
    result.application.domain.models.forEach((model) => {
      let p = (model.path === '_public_only_') ? model.publicPath : model.path
      p = path.resolve(process.configPath, p)
      if (!forFutureSave) model.realPath = p
      const packFN = path.join(p, 'package.json')
      if (fs.existsSync(packFN)) {
        const packageData = require(packFN)
        if (!packageData.name) console.error(`"name" section is required in package.json for "${packFN}`)
        __UB_int.checkEngine(packageData)
        model.moduleName = packageData.name
        if (packageData.config && packageData.config.ubmodel) {
          const ubModelConfig = packageData.config.ubmodel
          if (model.name) {
            console.warn(`Warning: name for model ${model.name} is configured in both "ubConfig" and model "package.json".
  Will use name from package.json`)
          }
          model.name = ubModelConfig.name
          if (ubModelConfig.isPublic) {
            model.publicPath = model.path
            model.path = '_public_only_'
          }
        }
        // check browser settings
        if (packageData.browser) {
          const dev = checkPackageBrowserPath(packageData, model, 'dev')
          const prod = checkPackageBrowserPath(packageData, model, 'prod')
          if (!forFutureSave) model.browser = { dev, prod }
        }
        if (!forFutureSave) model.version = packageData.version
      }
      // partials
      const partialFN = path.join(p, 'ubConfig-partial.json')
      if (fs.existsSync(partialFN)) {
        if (model.name === 'cust') {
          stngsPath = partialFN
        }
        partials.push(partialFN)
      }
    })

    const usedPartialsVars = validationMode ? {} : null
    const configFromPartials = {}
    partials.forEach(partialPath => {
      let partialContent
      try {
        partialContent = safeParseJSONfile(partialPath, validationMode,
          (content) => replaceIncludeVariables(replaceIfDefs(
            replaceEnvironmentVariables(content, usedPartialsVars)
          ))
        )
        if (partialContent.application && partialContent.application.domain) {
          throw new Error("'application.domain' is not allowed in partial config")
        }
      } catch (e) {
        throw new Error(`partial config '${partialPath}': ${e.message}` )
      }
      if (partialPath !== stngsPath) { // settings partial will be merged last and have priority over ubConfig
        lodashMergeWith(configFromPartials, partialContent, mergeNamedCollections)
      } else {
        stngsPartialContent = partialContent
      }
    })
    if (partials.length) {
      // merge into partials to give priority to a main config
      lodashMergeWith(configFromPartials, result, mergeNamedCollections)
      result = configFromPartials
    }
    if (stngsPartialContent) { // merge cust model partial with priority over ubConfig
      lodashMergeWith(result, stngsPartialContent, mergeNamedCollections)
    }

    const domainCfg = result.application.domain
    if (!domainCfg.implicitlyAddedMixins) domainCfg.implicitlyAddedMixins = []
    if (domainCfg.implicitlyAddedMixins.length === 0) { // by default 'audit' mixin is implicitly added
      domainCfg.implicitlyAddedMixins.push('audit')
    }
    if (result.security.multitenancy && result.security.multitenancy.enabled) { // add multitenancy mixin to implicitly added
      if (domainCfg.implicitlyAddedMixins.indexOf('multitenancy') === -1) {
        domainCfg.implicitlyAddedMixins.push('multitenancy')
      }
    }

    // normalize blobStores paths. In case path is relative transform it to absolute regarding to configPath
    if (!result.application.blobStores) result.application.blobStores = []
    result.application.blobStores.forEach(storeConfig => {
      if (storeConfig.path) {
        storeConfig.path = path.resolve(process.configPath, storeConfig.path)
        if (!storeConfig.tempPath) {
          storeConfig.tempPath = path.join(storeConfig.path, '_temp')
        }
      }
      if (storeConfig.tempPath) {
        storeConfig.tempPath = path.resolve(process.configPath, storeConfig.tempPath)
      }
    })
    if (!forFutureSave && !result.application.domain.supportedLanguages) {
      const connections = result.application.connections
      if (connections) {
        const ls = new Set()
        connections.forEach(c => {
          if (c.supportLang) {
            c.supportLang.forEach(l => ls.add(l))
          }
        })
        result.application.domain.supportedLanguages = [...ls]
      } else {
        result.application.domain.supportedLanguages = [result.application.defaultLang]
      }
    }
    if (!result.application.customSettings) {
      result.application.customSettings = {}
    }
    if (!result.uiSettings) {
      result.uiSettings = {}
    }
    if (!result.security) result.security = {}
    if (!result.httpServer) result.httpServer = { serverType: 'None' }
    if (result.httpServer.inetPub) {
      result.httpServer.inetPub = path.resolve(process.configPath, result.httpServer.inetPub)
    }
    if (result.httpServer.serverType !== 'None') {
      if (!result.httpServer.externalURL) result.httpServer.externalURL = serverURLFromConfig(result)
      if (!result.httpServer.reverseProxy) result.httpServer.reverseProxy = {}
      const rp = result.httpServer.reverseProxy
      if (rp.kind === 'nginx') {
        if (!rp.remoteIPHeader) rp.remoteIPHeader = 'X-Real-IP'
        if (!rp.remoteConnIDHeader) rp.remoteConnIDHeader = 'X-Conn-ID'
        if (!rp.sendFileHeader) rp.sendFileHeader = 'X-Accel-Redirect'
        if (!rp.sendFileLocationRoot) {
          // eslint-disable-next-line
          rp.sendFileLocationRoot = url.parse(result.httpServer.externalURL).hostname.replace(/\./g, '-')
        }
        if (!rp.hasOwnProperty('serveStatic')) {
          rp.serveStatic = true
        }
      }
    }

    function printEnv (envObj) {
      for (const v in envObj) {
        let val = envObj[v]
        if (val.endsWith("'*")) {
          val = val.slice(0, -1)
          console.log(`#default used: ${v}=${val}`)
        } else {
          console.log(`${v}=${val}`)
        }
      }
    }
    if (validationMode) {
      console.log(JSON.stringify(result, null, "\t"))
      console.log('\n\n--BEGIN USED VARIABLES BLOCK--')
      printEnv(usedVars)
      if (Object.keys(usedPartialsVars).length) {
        console.log('\n# from partials')
        printEnv(usedPartialsVars)
      }
      console.log('--END USED VARIABLES BLOCK--\n')
      if (partials.length) {
        console.log('Included partials config:')
        console.log(partials.join('\n'))
        console.log('\n')
      }
      usedVars = {}
      if (result.javascript) {
        console.warn(`WARN: 'javascript' section of ubConfig is ignored. Please, REMOVE it from config.
Use either command line switches or environment variables to change a JS runtime parameters.
See ub -? for details`)
      }
      result.application.domain.models.forEach((model) => {
        let p = (model.path === '_public_only_') ? model.publicPath : model.path
        p = path.resolve(process.configPath, p)
        if (!forFutureSave) model.realPath = p
        const packFN = path.join(p, 'package.json')
        if (!fs.existsSync(packFN)) {
          console.warn(`Model not installed properly: '${packFN}' is not accessible`)
        }
      })
    }
    if (cachedCfgStr === '') {
      process.cachedConfigStr = JSON.stringify(result, null, '\t')
    }
    return result
  }
  __UB_int.getServerConfiguration = getServerConfiguration
})(this)

// function evalScript (name) {
//   var Module = require('module')
//   var path = require('path')
//   var cwd = process.cwd()
//
//   var module = new Module(name)
//   module.filename = path.join(cwd, name)
//   module.paths = Module._nodeModulePaths(cwd)
//   var script = process._eval
//   if (!Module._contextLoad) {
//     var body = script
//     script = 'global.__filename = ' + JSON.stringify(name) + ';\n' + 'global.exports = exports;\n' + 'global.module = module;\n' + 'global.__dirname = __dirname;\n' + 'global.require = require;\n' + 'return require("vm").runInThisContext(' + JSON.stringify(body) + ', ' + JSON.stringify(name) + ', true);\n'
//   }
//   var result = module._compile(script, name + '-wrapper')
//   if (process._print_eval) console.log(result)
// }

/*    if (!process.isServer){
 toLog('!!!!not server - run startup')
 var Module = NativeModule.require('module');
 Module._load(process.argv[1], null, true);
 } */
