const http = require('http')
let request, resp
const NUM_REQ = 100

console.time('req per request')
for(let i=0; i < NUM_REQ; i++) {
  request = http.request({
    //alternative to host/port/path is
    URL: 'https://unitybase.info/quote',
    method: 'GET',
    sendTimeout: 30000, receiveTimeout: 30000,
    keepAlive: true,
    compressionEnable: true
  })

  resp = request.end()
  console.log(resp.statusCode, resp.read())
}
console.timeEnd('req per request')

console.time('reuse req')
for (let i=0; i < NUM_REQ; i++) {
  resp = request.end()
  console.log(resp.statusCode, resp.read())
}
console.timeEnd('reuse req')
