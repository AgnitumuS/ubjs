const me = World

function rnd10000 () {
  return Math.round(Math.random() * 10000)
}

/**
 * TechemPower DB random access test
 * @param {ubMethodParams} ctx
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function db (ctx, req, resp) {
  const query = UB.Repository('World').attrs(['ID', 'randomNumber'])
  const data = query.where('ID', '=', rnd10000()).selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data[0])
}

/**
 * TechemPower DB random access test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function db2 (req, resp) {
  const data = q.where('ID', '=', rnd10000()).selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data[0])
}
