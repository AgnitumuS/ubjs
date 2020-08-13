const http = require('http')
let request = http.request({
    //alternative to host/port/path is
    URL: 'https://unitybase.info/quote',
    method: 'GET',
    sendTimeout: 30000, receiveTimeout: 30000,
    keepAlive: true,
    compressionEnable: true
 })

let resp = request.end()
console.log(resp.statusCode, resp.read())
