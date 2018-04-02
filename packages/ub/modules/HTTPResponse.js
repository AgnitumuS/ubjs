const {resp_writeHead, resp_write, resp_writeEnd, resp_writeBinaryBase64,
  resp_validateETag, resp_getStatus, resp_setStatus} = process.binding('http_server')

/** Class for direct write HTTP response.
 * Passed as parameter to application level scripting methods (see App.registerEndpoint )
 * also accessible in in entity level scripting methods while in rest mode.
 *
 * Implements string writer.
 *
 * Caller MUST call writeEnd once in the end and set response statusCode
 *
 * To send file content as a response without loading file into memory the following code can be used:
 *
 // Replace this comments by JSDocs style comment
 // param {THTTPRequest} req
 // param {THTTPResponse} resp
 function getPublicDocument(req, resp){
        resp.statusCode = 200;
        resp.writeHead('Content-Type: !STATICFILE\r\nContent-Type: text/plain'); // !STATICFILE is a special content type - will be removed from headers by server during sending
        resp.writeEnd('c:\\myFilesWithPasswords.txt');
      }

 * @class
 * @implements {UBWriter}
 */
function HTTPResponse () {
  /**
   * Response HTTP status code
   * @memberOf HTTPResponse
   * @property {Number} statusCode
   */
  Object.defineProperty(this, 'statusCode', {
    enumerable: true,
    get: function () {
      return resp_getStatus()
    },
    set: function (status) {
      resp_setStatus(status)
    }
  })
}

HTTPResponse.prototype = {
  /** Add response header(s). Can be called several times for DIFFERENT header
   *
   *    resp.writeHead('Content-Type: text/css; charset=UTF-8\r\nOther-header: value')
   *
   * @param {String} header one header or #13#10 separated headers
   */
  writeHead: function (header) {
    resp_writeHead(header)
  },
  /**
   * @inheritdoc
   */
  write: function (data, encoding) {
    resp_write(data, encoding)
  },
  /**
   * Write base64 encoded data as a binary representation (will decode from base64 to binary before write to response)
   * @param {String} base64Data
   */
  writeBinaryBase64: function (base64Data) {
    resp_writeBinaryBase64(base64Data)
  },
  /** Write to internal buffer and set buffer content as HTTP response.
   * See {UBWriter.wrote} for parameter details
   * @param {ArrayBuffer|Object|String} data
   * @param {String} [encoding]
   */
  writeEnd: function (data, encoding) {
    resp_writeEnd(data, encoding)
  },
  /**
   * Perform a ETag based HTTP response caching.
   * Must be called after writeEnd called and and statusCode is defined.
   *
   * In case statusCode === 2000 and response body length > 64 will
   *  - if request contains a IF-NONE-MATCH header, and it value equal to response crc32
   * will mutate a statusCode to 304 (not modified) and clear the response body
   *  - in other case will add a ETag header with value = hex representation of crc32(responseBody).
   */
  validateETag: function () {
    return resp_validateETag()
  },
  /**
   * Write a HTTP 400 Bad Request response. Return false
   * @param {string} reason If specified will be written to log as error
   * @return {boolean}
   */
  badRequest: function (reason) {
    this.statusCode = 400
    this.writeEnd('Bad Request')
    if (reason) console.error('Bad request', reason)
    return false
  },
  /**
   * Write a HTTP 404 Not Found response. Return false
   * @param {string} reason  If specified will be written to log as error
   * @return {boolean}
   */
  notFound: function (reason) {
    this.statusCode = 404
    this.writeEnd('Not Found')
    if (reason) console.error('Not found', reason)
    return false
  }
}

module.exports = HTTPResponse
