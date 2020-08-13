const http = require('http')
const URL = 'https://10.5.15.28:445/api/v1/coSpaces/6b760eb7-1643-4cec-953d-4380fc377484'
const authToken = 'Basic YXBpYWRtaW46TGtKaGhHMTEwOTg='
const qs = require('querystring')

const request = http.request({
    URL: URL,
    method: 'PUT',
    sendTimeout: 30000,
    receiveTimeout: 30000,
    keepAlive: true,
    useCompression: true,
    strictSSL: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authToken
    }
  })
    
  let  data = qs.stringify('name=ôôôôô123')
  let response = request.end(data)