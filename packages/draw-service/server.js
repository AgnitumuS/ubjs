const http = require('http')
const drawer = require('./drawer')

const server = http.createServer(requestHandler)
const port = process.env.PORT || '8882'
server.listen(port)
console.log(`Draw service listen on ${port}`)

function requestHandler (req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    })
  }
  if (req.method === 'POST') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString() // convert Buffer to string
    })
    req.on('end', () => {
      let drawProgram = JSON.parse(body)
      console.time('draw in')
      let pict = drawer.drawPicture(drawProgram)
      console.timeEnd('draw in')
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      })
      res.end(pict)
    })
  } else {
    res.writeHead(405, {'Content-Type': 'text/plain'})
    res.end('Service accept only POST request with drawProgram json in body')
  }
}
