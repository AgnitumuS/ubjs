const {req_read, reg_getHeaders, reg_getMethod, reg_getUrl,
  reg_getURI, reg_getDecodedURI, reg_getParameters, reg_getDecodedParameters
} = process.binding('http_server')

/*
 * Allows the lazy getter to be defined on a prototype and work correctly with
 * instances.
 *
 * @param {Object} object
 *        The prototype object to define the lazy getter on.
 * @param {string} key
 *        The key to define the lazy getter on.
 * @param {Function} getValueFunc
 *        The getValueFunc that will be called to determine the value. Will be
 *        called with the |this| value of the current instance.
 */
function defineLazyPrototypeGetter (object, key, getValueFunc) {
  Object.defineProperty(object, key, {
    configurable: true,
    get: function () {
      const value = getValueFunc.call(this)

      Object.defineProperty(this, key, {
        configurable: true,
        writable: false,
        value: value
      })

      return value
    }
  })
}

/** Structure for direct reading of HTTP request properties.
 * Passed as parameter to the endpoints handlers.
 * Also accessible in in entity level scripting methods while in rest mode
 * @namespace THTTPRequest
 * @implements {UBReader}
 */
function THTTPRequest () {}
THTTPRequest.prototype = {
  /**
   * @inheritdoc
   * @param {String} [encoding]
   */
  read: function (encoding) {
    return req_read(encoding)
  }
}
/**
 * HTTP request headers
 * @property {string} headers
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'headers', reg_getHeaders)
/**
 * HTTP request method GET|POST|PUT......
 * @memberOf THTTPRequest
 * @member {string} method
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'method', reg_getMethod)
/** full request URL with app name, method name and parameters
 * for request http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
 * - return ub/rest/doc_document/report?id=1&param2=asdas
 * @property {string} url
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'url', reg_getUrl)
/** request URI - URL WITHOUT appName and method name
 * For request http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
 * - return doc_document/report
 * @property {string} uri
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'uri', reg_getURI)
/**
 * The same as uri, but URLDecode'd
 *
 *      req.uri === "TripPinServiceRW/My%20People"
 *      //
 *      req.decodedUri === "TripPinServiceRW/My People"
 *
 * @property {string} decodedUri
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'decodedUri', reg_getDecodedURI)
/** request parameters if any
 * - return id=1&param2=asdas
 * @property {string} parameters
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'parameters', reg_getParameters)
/**
 * URLDecoded request parameters if any
 *
 *      req.parameters === "$filter=Name%20eq%20%27John%27"
 *      //
 *      req.decodedParameters === "$filter=Name eq 'John'"
 *
 * @property {string} decodedParameters
 * @memberOf THTTPRequest
 * @readonly
 */
defineLazyPrototypeGetter(THTTPRequest.prototype, 'decodedParameters', reg_getDecodedParameters)

module.exports = THTTPRequest
