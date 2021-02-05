const argv = require('@unitybase/base').argv
startServer(true)
const session = argv.establishConnectionFromCmdLineAttributes({
  host: 'auto', // use host from ub config
  user: 'root'
})
const serverConfig = argv.getServerConfiguration()
let threadPoolSize = serverConfig.httpServer.threadPoolSize - 1 // reserve one thread to HTTP requests, for example to /metric endpoint
if (threadPoolSize <= 0) {
  console.warn('threadPoolSize in ubConfig should be at last 2')
  threadPoolSize = 1
}

console.log(`Will activate ${threadPoolSize} listeners`)
// start a threadPoolSize - 1 redis connection by run a
// `listenToRedis` endpoint in async mode (do not wait for result) what listen to the redis list in forever loop
for (let i=0; i < threadPoolSize; i++) {
  console.log(`Activating redis listener #${i}...`)
  session.connection.xhr({
    endpoint: 'listenToRedis',
    HTTPMethod: 'POST',
    URLParams: {async: true} // post request with async-true immediately return 202
  })
  console.log(`Listener #${i} activated`)
}
console.log('END!')
