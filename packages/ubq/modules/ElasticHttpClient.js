const http = require('http')
const UBAbort = process.isServer ? require('@unitybase/ub').UBAbort : Error

/**
 *  class for work with Elasticsearch API by Http.
 */

class ElasticHttpClient {
  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} [options.requestOptions]
   *   An object with default options used for HTTP requests
   * @param {object} [options.basicAuth]
   *   Optional basic authorization options.  If specified, appropriate header will come with all the requests.
   * @param {string} options.basicAuth.user
   * @param {string} options.basicAuth.pass
   */
  constructor (options) {
    // remove trailing slashes
    this._baseUrl = options.url.replace(/\/$/, '')
    this._options = Object.assign(
      {
        sendTimeout: 30000,
        receiveTimeout: 30000,
        keepAlive: true,
        compressionEnable: true
      },
      options.requestOptions
    )

    if (options.basicAuth) {
      const { user, pass } = options.basicAuth
      const token = Buffer.from([user, pass].join(':')).toString('base64')
      this._authHeader = 'Basic ' + token
    }
  }

  /**
   * @param {string} actionName
   * @param {string|object} requestOptions
   * @returns {object}
   * @protected
   */
  _get (actionName, requestOptions) {
    const request = this._createRequest(requestOptions, 'GET')
    console.log('GET:', JSON.stringify(requestOptions))
    const response = request.end()
    this._handleResponse(response, actionName)
    return this._parse(response)
  }

  /**
   * POST request to Elastic server, data encoded as 'application/json'.
   * @param {string} actionName
   * @param {string} httpMethod
   * @param {string|object} requestOptions
   * @param {object} [data]
   * @returns {IncomingMessage}
   * @protected
   */
  _json (actionName, httpMethod, requestOptions, data) {
    const request = this._createRequest(requestOptions, httpMethod)
    request.setHeader('Content-Type', 'application/json')
    console.log(`${httpMethod}:`, JSON.stringify(requestOptions))
    const response = request.end(data, 'utf-8')
    this._handleResponse(response, actionName)
    return response
  }

  /**
   * POST request to Elastic server, data encoded as 'application/json'.
   * @param {string} actionName
   * @param {string} httpMethod
   * @param {string|object} requestOptions
   * @param {object} [data]
   * @returns {object}
   * @protected
   */
  _jsonWithResult (actionName, httpMethod, requestOptions, data) {
    const response = this._json(actionName, httpMethod, requestOptions, data)
    return this._parse(response)
  }

  /**
   * Drop a log line with info about request
   * @param {string} url
   * @param {object} [requestData]
   * @protected
   */
  _log (url, requestData) {
    if (requestData) {
      // to prevent big string output we replace it
      // if (requestData.data) {
      //   requestData.data = 'file in Base64 enc'
      // }
      console.log('Request:', url, requestData)
    } else {
      console.log('Request:', url)
    }
  }

  /**
   * Construct an HTTP request object.
   * @param {string|object} requestOptions
   *   Request options.  Will be merged with the default options
   * @param {string} httpMethod
   * @returns {ClientRequest}
   * @protected
   */
  _createRequest (requestOptions, httpMethod) {
    const opts = Object.assign({}, this._options)
    Object.assign(
      opts,
      typeof requestOptions === 'string'
        ? { URL: this._baseUrl + requestOptions }
        : requestOptions
    )
    opts.method = httpMethod
    if (this._authHeader) {
      if (!opts.headers) {
        opts.headers = {}
      }
      opts.headers.Authorization = this._authHeader
    }
    return http.request(opts)
  }

  _handleResponse (response, opType, body = null) {
    const opDescription = `"${opType}" ${body ? JSON.stringify(body) + ' ' : ''} operation`

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`${opDescription} performed successfully.`)
      return
    }

    let responseText = ''
    try {
      responseText = response.read()
    } catch (e) {
      console.error('Cannot read response, the thrown error message could miss details!', e, e.stack)
    }

    // Sometimes Elastic return JSON object with "message" property, which explains the error
    let responseObj
    try {
      responseObj = JSON.parse(responseText)
    } catch (e) {
      console.error('Cannot read response, the thrown error message could miss details!', e, e.stack)
    }

    if (responseObj && typeof responseObj.message === 'string') {
      const message = responseObj.message
        .replace(/\n/g, '<br>')
        .replace(/\* /g, '<li>')
      throw new UBAbort(`<<<${message}>>>`)
    }

    throw new Error(`${opDescription} - error code: ${response.statusCode}.  ${responseText}`)
  }

  /**
   * Parse the response
   * @param {IncomingMessage} response
   * @returns {object}
   * @protected
   */
  _parse (response) {
    if (response.statusCode === 404) {
      return undefined
    }
    if (response.statusCode !== 200) {
      throw new Error('Error loading: ' + JSON.stringify(response))
    }

    try {
      const responseData = JSON.parse(response.read())
      return `performed with result:${responseData.result} index: ${responseData._index} type: ${responseData._type}
    id: ${responseData._id} version: ${responseData._version}`
    } catch (e) {
      throw new Error(`Error parsing JSON: ${e.message}, ${e.stack}`)
    }
  }
}

module.exports = ElasticHttpClient
