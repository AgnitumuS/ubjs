const argv = require('@unitybase/base').argv
const createDBConnectionPool = require('@unitybase/base').createDBConnectionPool

const cfg = argv.getServerConfiguration()
if (!cfg.application.connections || !cfg.application.connections.length) {
  throw new Error('application.connections section is empty in ubConfig')
}
const dbConnections = createDBConnectionPool(cfg.application.connections)
const mainConnection = dbConnections.main
let res, L=0
const CNT = 100
console.time('as str')
for (let i = 0; i < CNT; i++) {
  res = JSON.parse(mainConnection.runParsed('select ID, phone from uba_user', []))
  L += Object.keys(res).length
}
console.timeEnd('as str');
console.log(res, '\n', typeof res )

let resObj
console.time('as obj')
for (let i = 0; i < CNT; i++) {
  resObj = mainConnection.selectParsedAsObject('select ID, phone from uba_user', [])
  L += Object.keys(resObj).length
}
console.timeEnd('as obj');
console.log(resObj, '\n', typeof resObj, L)

const res2 = mainConnection.execParsed('update uba_user set phone=? where ID > ?', ['123', 100])