// eslint-disable-next-line camelcase
const { req_read, reg_getHeaders, reg_getMethod, reg_getUrl, reg_getURI, reg_getDecodedURI, reg_getParameters, reg_getDecodedParameters, req_writeToFile } = process.binding('http_server')

/**
 * @classdesc
 * An `THTTPRequest` object is created by UB server and passed as the first
 * argument to the `endpoint's` methods or as a second argument to the `rest` entity method's event.
 *
 * It may be used to access HTTP request status, headers and data.
 * @class THTTPRequest
 * @implements {UBReader}
 */
class THTTPRequest {
  /**
   * @inheritdoc
   * @param {String} [encoding]
   */
  read (encoding) {
    return req_read(encoding)
  }

  /**
   * Write request body content (as binary) to a file. Return true on success
   * @param {string} fullFilePath
   * @return {boolean}
   */
  writeToFile (fullFilePath) {
    return req_writeToFile(fullFilePath)
  }

  /**
   * HTTP request headers
   * @type {string}
   * @readonly
   */
  get headers () {
    if (this._headers === undefined) this._headers = reg_getHeaders()
    return this._headers
  }
  /**
   * HTTP request method GET|POST|PUT......
   * @type {string}
   * @readonly
   */
  get method () {
    if (this._method === undefined) this._method = reg_getMethod()
    return this._method
  }
  /**
   * Full URL
   * @example
   *
   *   // GET http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
   *   req.url === 'ub/rest/doc_document/report?id=1&param2=asdas'
   *
   * @type {string}
   * @readonly
   */
  get url () {
    if (this._url === undefined) this._url = reg_getUrl()
    return this._url
  }
  /**
   * URL WITHOUT appName and endpoint name
   * @example
   *   // GET http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
   *   req.uri === 'doc_document/report'
   *
   * @type {string}
   * @readonly
   */
  get uri () {
    if (this._uri === undefined) this._uri = reg_getURI()
    return this._uri
  }
  /**
   * The same as uri, but URLDecode'd
   * @example
   *   //GET http://host:port/ub/rest/TripPinServiceRW/My%20People"
   *   req.decodedUri === 'TripPinServiceRW/My People'
   *
   * @type {string}
   * @readonly
   */
  get decodedUri () {
    if (this._decodedUri === undefined) this._decodedUri = reg_getDecodedURI()
    return this._decodedUri
  }
  /**
   * URL parameters. Can be transformed to object using `queryString.parse`
   * @example
   *   // GET http://host:port/ub/rest/doc_document/report?id=1&param2=asdas
   *   req.parameters === 'id=1&param2=asdas'
   *
   * @type {string}
   * @readonly
   */
  get parameters () {
    if (this._parameters === undefined) this._parameters = reg_getParameters()
    return this._parameters
  }
  /**
   * URLDecoded parameters
   * @example
   *      // GET http://host:port/bla-bla?$filter=Name%20eq%20%27John%27
   *      req.parameters === '$filter=Name%20eq%20%27John%27'
   *      req.decodedParameters === "$filter=Name eq 'John'"
   *
   * @type {string}
   * @readonly
   */
  get decodedParameters () {
    if (this._decodedParameters === undefined) this._decodedParameters = reg_getDecodedParameters()
    return this._decodedParameters
  }
}

module.exports = THTTPRequest
