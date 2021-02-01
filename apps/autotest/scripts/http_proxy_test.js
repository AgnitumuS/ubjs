const http = require('http')
let request, resp
const NUM_REQ = 100

let t = Date.now()
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
const reqPerRequestT = Date.now() - t;

t = Date.now();
for (let i=0; i < NUM_REQ; i++) {
  resp = request.end()
  console.log(resp.statusCode, resp.read())
}
const reqReuseT = Date.now() - t;

console.log(`Request Per rq: ${reqPerRequestT}; reuse req: ${reqReuseT}`)
