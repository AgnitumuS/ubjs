const http = require('http')
let request, resp
const NUM_REQ = 100

let t = Date.now()
for(let i=0; i < NUM_REQ; i++) {
  request = http.request({
    //alternative to host/port/path is
    URL: 'https://unitybase.info/quote',
    method: 'GET'
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

request.setPath('/getAppInfo')
resp = request.end()
if (resp.statusCode === 200) {
  const jsonResp = resp.json()
  console.log('Read as', typeof jsonResp, jsonResp)
} else {
  console.error('Non 200 response code', resp.statusCode)
}
console.log(`Request Per rq: ${reqPerRequestT}; reuse req: ${reqReuseT}`)
