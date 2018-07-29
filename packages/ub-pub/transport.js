/**
 * HTTP(s) transport based on XMLHttpRequest
 * To use in nodeJS XMLHttpRequest should be defined in global like
 *
 *      global.XMLHttpRequest = require('xhr2')
 *
 * @module transport
 * @memberOf module:@unitybase/ub-pub
 */

/* global XMLHttpRequest */

const ubUtils = require('./utils')

function lowercase (str) {
  return (str || '').toLowerCase()
}

function parseHeaders (headers) {
  let parsed = {}
  let key, val, i

  if (!headers) {
    return parsed
  }

  headers.split('\n').forEach(function (line) {
    i = line.indexOf(':')
    key = lowercase(line.substr(0, i).trim())
    val = line.substr(i + 1).trim()

    if (key) {
      if (parsed[key]) {
        parsed[key] += ', ' + val
      } else {
        parsed[key] = val
      }
    }
  })

  return parsed
}

function headersGetter (headers) {
  let headersObj = typeof headers === 'object' ? headers : undefined
  return function (name) {
    if (!headersObj) {
      headersObj = parseHeaders(headers)
    }
    if (name) {
      return headersObj[lowercase(name)]
    }
    return headersObj
  }
}

function transformData (data, headers, fns) {
  if (typeof fns === 'function') {
    return fns(data, headers)
  }
  fns.forEach(function (fn) {
    data = fn(data, headers)
  })
  return data
}

function transformDataPromise (data, headers, fns) {
  let rPromise = Promise.resolve(data)
  if (typeof fns === 'function') {
    return rPromise.then(function (data) {
      return fns(data, headers)
    })
  }
  fns.forEach(function (fn) {
    rPromise = rPromise.then(function (data) {
      return fn(data, headers)
    })
  })
  return rPromise
}

function isSuccess (status) {
  return status >= 200 && status < 300
}

function forEach (obj, iterator, context) {
  let keys = Object.keys(obj)
  keys.forEach(function (key) {
    iterator.call(context, obj[key], key)
  })
  return keys
}

function forEachSorted (obj, iterator, context) {
  let keys = Object.keys(obj).sort()
  keys.forEach(function (key) {
    iterator.call(context, obj[key], key)
  })
  return keys
}

function buildUrl (url, params) {
  if (!params) return url
  let parts = []
  forEachSorted(params, function (value, key) {
    if (value == null) { // jshint ignore:line
      return
    }
    if (!Array.isArray(value)) {
      value = [value]
    }

    value.forEach(function (v) {
      if (typeof v === 'object') {
        v = JSON.stringify(v)
      }
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v))
    })
  })
  return url + ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&')
}

let __lastRequestData
let __lastRequestTime = Date.now()
let __lastRequestURL

/**
 * see docs in ub-pub main module
 * @private
 * @param {Object} requestConfig
 * @param {String} requestConfig.url
 * @param {String} [requestConfig.method]
 * @param {Object.<string|Object>} [requestConfig.params]
 * @param {String|Object} [requestConfig.data]
 * @param {Object} [requestConfig.headers]
 * @param {function(data, function)|Array.<function(data, function)>} [requestConfig.transformRequest]
 * @param {function(data, function)|Array.<function(data, function)>} [requestConfig.transformResponse]
 * @param  {Number|Promise} [requestConfig.timeout]
 * @param  {Boolean} [requestConfig.withCredentials]
 * @param  {String} [requestConfig.responseType]
 * @param {Function} [requestConfig.onProgress]
 * @returns {Promise}
 */
function xhr (requestConfig) {
  let defaults = xhrDefaults
  let config = {
    transformRequest: defaults.transformRequest,
    transformResponse: defaults.transformResponse
  }
  let mergeHeaders = function (config) {
    let defHeaders = defaults.headers
    let reqHeaders = ubUtils.apply({}, config.headers)
    let defHeaderName, lowercaseDefHeaderName, reqHeaderName

    let execHeaders = function (headers) {
      forEach(headers, function (headerFn, header) {
        if (typeof headerFn === 'function') {
          let headerContent = headerFn()
          if (headerContent) {
            headers[header] = headerContent
          } else {
            delete headers[header]
          }
        }
      })
    }

    defHeaders = ubUtils.apply({}, defHeaders.common, defHeaders[lowercase(config.method)])

    // execute if header value is function
    execHeaders(defHeaders)
    execHeaders(reqHeaders)

    // using for-in instead of forEach to avoid unecessary iteration after header has been found
    // noinspection Eslint
    defaultHeadersIteration:
      for (defHeaderName in defHeaders) {
        lowercaseDefHeaderName = lowercase(defHeaderName)
        for (reqHeaderName in reqHeaders) {
          if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
            // noinspection Eslint
            continue defaultHeadersIteration
          }
        }
        reqHeaders[defHeaderName] = defHeaders[defHeaderName]
      }
    return reqHeaders
  }
  let headers = mergeHeaders(requestConfig)

  ubUtils.apply(config, requestConfig)
  config.headers = headers
  config.method = config.method ? config.method.toUpperCase() : 'GET'

  let transformResponse, serverRequest, promise

  transformResponse = function (response) {
    return transformDataPromise(response.data, response.headers, config.transformResponse)
      .then(function (trdData) {
        response.data = trdData
        return isSuccess(response.status) ? response : Promise.reject(response)
      })
  }

  serverRequest = function (config) {
    headers = config.headers
    let reqData = transformData(config.data, headersGetter(headers), config.transformRequest)
    // strip content-type if data is undefined
    if (!config.data) {
      forEach(headers, function (value, header) {
        if (lowercase(header) === 'content-type') {
          delete headers[header]
        }
      })
    } else {
      // prevent reiteration sending of the same request
      // for example if HTML button on the form got a focus and `space` pressed
      // in case button not disabled inside `onclick` handler we got a many-many same requests
      let prevReqTime = __lastRequestTime
      __lastRequestTime = Date.now()
      if ((__lastRequestURL === config.url) && (typeof reqData === 'string') && (__lastRequestData === reqData) && (__lastRequestTime - prevReqTime < 100)) {
        throw new ubUtils.UBError('monkeyRequestsDetected')
      } else {
        __lastRequestData = reqData
        __lastRequestURL = config.url
      }
    }

    if (!config.withCredentials && defaults.withCredentials) {
      config.withCredentials = defaults.withCredentials
    }
    if (!config.timeout && defaults.timeout) {
      config.timeout = defaults.timeout
    }

    // send request
    return sendReq(config, reqData, headers).then(transformResponse, transformResponse)
  }

  promise = Promise.resolve(config)

  // build a promise chain with request interceptors first, then the request, and response interceptors
  interceptors.filter(function (interceptor) {
    return !!interceptor.request || !!interceptor.requestError
  }).map(function (interceptor) {
    return { success: interceptor.request, failure: interceptor.requestError }
  })
  .concat({ success: serverRequest })
  .concat(interceptors.filter(function (interceptor) {
    return !!interceptor.response || !!interceptor.responseError
  }).map(function (interceptor) {
    return { success: interceptor.response, failure: interceptor.responseError }
  })
  ).forEach(function (then) {
    promise = promise.then(then.success, then.failure)
  })

  return promise
}

/**
 * Allow Request reiteration, for example in case of request are repeated after re-auth
 */
xhr.allowRequestReiteration = function () {
  __lastRequestData = null
}

const CONTENT_TYPE_APPLICATION_JSON = { 'Content-Type': 'application/json;charset=utf-8' }

/**
 * The default HTTP parameters for {xhr}
 * @property {Object} xhrDefaults
 * @property {Array<Function>} xhrDefaults.transformRequest request transformations
 * @property {Array<Function>} xhrDefaults.transformResponse response transformations
 * @property {Object} xhrDefaults.headers Default headers to apply to request (depending of method)
 * @property {Number} xhrDefaults.timeout Default timeout to apply to request
 */
let xhrDefaults = {
  transformRequest: [function (data) {
    return !!data && typeof data === 'object' && data.toString() !== '[object File]' && data.toString() !== '[object ArrayBuffer]'
      ? JSON.stringify(data) : data
  }],
  transformResponse: [function (data, headers) {
    if (typeof data === 'string' && (headers('content-type') || '').indexOf('json') >= 0) {
      data = JSON.parse(data)
    }
    return data
  }],
  headers: {
    common: { 'Accept': 'application/json, text/plain, */*' },
    post: CONTENT_TYPE_APPLICATION_JSON,
    put: CONTENT_TYPE_APPLICATION_JSON,
    patch: CONTENT_TYPE_APPLICATION_JSON
  },
  timeout: ubUtils.isReactNative ? 5000 : 120000 // do not freeze ReactNative app by long timeouts
}

/**
 * Interceptors array
 * @type {Array.<Object>}
 * @protected
 */
const interceptors = []

/**
 * Array of config objects for currently pending requests. This is primarily meant to be used for debugging purposes.
 * @type {Array.<Object>}
 * @protected
 */
const pendingRequests = []

const XHR = XMLHttpRequest
function sendReq (config, reqData, reqHeaders) {
  let url = buildUrl(config.url, config.params)
  return new Promise(function (resolve, reject) {
    let xhr = new XHR()
    let aborted = -1
    let status, timeoutId

    pendingRequests.push(config)

    xhr.open(config.method, url, true)
    forEach(reqHeaders /* MPV config.headers */, function (value, key) {
      if (value) {
        xhr.setRequestHeader(key, value)
      }
    })

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let response, responseHeaders
        if (status !== aborted) {
          responseHeaders = xhr.getAllResponseHeaders()
          // responseText is the old-school way of retrieving response (supported by IE8 & 9)
          // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
          response = xhr.responseType ? xhr.response : xhr.responseText
        }

        // cancel timeout and subsequent timeout promise resolution
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        status = status || xhr.status
        xhr = null

        // normalize status, including accounting for IE bug (http://bugs.jquery.com/ticket/1450)
        status = Math.max(status === 1223 ? 204 : status, 0)

        let idx = pendingRequests.indexOf(config)
        if (idx !== -1) {
          pendingRequests.splice(idx, 1)
        }

        (isSuccess(status) ? resolve : reject)({
          data: response,
          status: status,
          headers: headersGetter(responseHeaders),
          config: config
        })
      }
    }

    if (config.onProgress) {
      if (xhr.upload) {
        xhr.upload.onprogress = config.onProgress
      } else {
        xhr.onprogress = config.onProgress
      }
    }

    if (config.withCredentials) {
      xhr.withCredentials = true
    }

    if (config.responseType) {
      xhr.responseType = config.responseType
    }

    xhr.send(reqData || null)

    if (config.timeout > 0) {
      timeoutId = setTimeout(function () {
        status = aborted
        if (xhr) {
          xhr.abort()
        }
      }, config.timeout)
    }
  })
}

/**
 * see docs in ub-pub main module
 * @private
 * @param {string} url
 * @param {Object=} [config]
 * @returns {Promise}
 */
function get (url, config) {
  return xhr(ubUtils.apply(config || {}, {
    method: 'GET',
    url: url
  }))
}

/**
 * see docs in ub-pub main module
 * @private
 * @param {string} url
 * @param {*} data
 * @param {Object=} [config]
 * @returns {Promise}
 */
function post (url, data, config) {
  return xhr(ubUtils.apply(config || {}, {
    method: 'POST',
    url: url,
    data: data
  }))
}

module.exports = {
  interceptors,
  pendingRequests,
  xhrDefaults,
  xhr,
  get,
  post
}
