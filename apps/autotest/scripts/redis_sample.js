const redis = require('@unitybase/redis')

// WARNING - for server side usage use
// redisConn = redis.getDefaultRedisConnection()
const redisConn = new redis.RedisClient({})
console.log('sending PING')
let pong = redisConn.commands('ping')
console.log(pong)

console.log('rpush', 'mylist', 'pushedWOanswer')
let rpush = redisConn.commands('rpush', 'mylist', 'pushedWOanswer')
console.log(rpush)

let xadd = redisConn.commands('XADD','mystream','*', 'name', 'Sara', 'surname', 'OConnor')
console.log('xadd', xadd, typeof xadd)
let xread = redisConn.commands('XREAD','BLOCK', 10, 'COUNT', 2, 'STREAMS', 'mystream', '1526999352406-0')
console.log('xread\n', JSON.stringify(xread, null, ' '))


try {
  console.log('rpop', 'mylist');
  let rpop = redisConn.commands('rpop', 'mylist')
  console.log('rpop', rpop)
} catch(e) {
  console.log('E: ', e.message);
  console.log('ioError:',c.ioError);
}

err = null
while(err === null) {
  try {
    console.log('waiting for item inside "mylist" for 10 sec');
    // in case redis is restarted (connection lost) `sudo systemctl restart redis`
    // client reconnects automatically
    let brpop = redisConn.commands('brpop', 'mylist', 10) // use 0 as a timeout to wait forever
    if (brpop === null) {
      console.log('Nothing pushed. Wait again...')
    } else {
      console.log('brpop', brpop)
    }
  } catch(e) {
    console.log('E:', e.message);
    console.log('ioError:',c.ioError, ' ', c.ioErrorText);
    err = 1 // ends loop on exception
  }
}
console.log('terminate..')

process.on('exit', () => { console.log('process on exit..') })