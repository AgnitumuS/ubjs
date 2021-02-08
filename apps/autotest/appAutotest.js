const UB = require('@unitybase/ub')
const App = UB.App

// BLOB store performance test endpoints. For TEST environments only
const { getDocumentPerfTestEp, setDocumentPerfTestEp } = require('@unitybase/blob-stores/storesPerfTest.js')
App.registerEndpoint('getDocumentPerfTest', getDocumentPerfTestEp, false)
App.registerEndpoint('setDocumentPerfTest', setDocumentPerfTestEp, false)

App.registerEndpoint('upload', (req, resp) => {
  console.log(req.headers)
  resp.writeEnd(req.headers)
  resp.statusCode = 200
}, false)

const mailQueue = require('@unitybase/ubq/modules/mail-queue')
const UBMail = require('@unitybase/mailer')

/**
 * Put 1000 e-mails into ubq_mail for testing purpose
 */
App.registerEndpoint('queueMails', (req, resp) => {
  let i
  for (i = 0; i < 1000; i++) {
    const IMG = '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'
    const ATTACH_CID = 'ub-generated-content'
    const message2 = {
      subject: `subject ${i}`,
      bodyType: UBMail.TubSendMailBodyType.HTML,
      body: `<b>body</b> 2 <img src="cid:${ATTACH_CID}" alt="UB logo" title="UB logo" width="136" height="136">
          <pre>${'aaa'.repeat(i)}</pre>
`,
      from: `mailAddr${i}@test.com`,
      to: [`mailAddr${i}@test.com`, `mailAddr${i}@test2.com`, `mailAddr${i}@test3.com`]
      // attaches: [
      //   {
      //     kind: UBMail.TubSendMailAttachKind.Text,
      //     atachName: 'atach1.txt',
      //     data: 'atach1 text'
      //   },
      //   {
      //     kind: UBMail.TubSendMailAttachKind.Text,
      //     atachName: 'atach2.png',
      //     contentID: `${ATTACH_CID}`,
      //     data: IMG, // Buffer.from('atach2 text').toString('base64'),
      //     isBase64: true
      //   }
      // ]
    }
    mailQueue.queueMail(message2)
  }
  resp.statusCode = 200
  resp.writeEnd(`Schedule ${i} mails for sending`)
}, false)
App.registerEndpoint('pdfsign', testPdfSignerSpeed, false)

/** 
 * test socket limit exceed while use mailer
 */
App.registerEndpoint('sockOverflow', (req, resp) => {
  const mailerParams = App.serverConfig.application.customSettings.mailerConfig
  const UBMail = require('@unitybase/mailer')
  const arr = []
  for (let i=0; i < 32000; i++) {
    console.debug('Mailer: before new TubMailSender ' + i)
    let mailSender = new UBMail.TubMailSender({
      host: mailerParams.targetHost,
      port: mailerParams.targetPort || '25',
      user: mailerParams.user || '',
      password: mailerParams.password || '',
      tls: Boolean(mailerParams.autoTLS),
      fullSSL: Boolean(mailerParams.fullSSL),
      auth: mailerParams.auth || false,
      deferLogin: true
    })
    console.debug('Mailer: before mailSender.Login ' + i)
    arr.push(mailSender)
    mailSender.login()
    // mailSender.freeNative()
  }
}, false)
/**
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testPdfSignerSpeed (req, resp) {
  const pdfsignTest = require('@ub-e/pdfsign/_autotest/test_TubSigner.js')
  pdfsignTest()
  resp.statusCode = 200
}

/**
 * This endpoint runs into infinity (while nt terminated by signal) loot what reads
 * a redis queue and do some staff.
 * Server should be started from command line script and threads are activated using
 * HTTP request to itself `POST /listenToRedis?async=true`
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function redisQueueListener (req, resp) {
  const TRedisClient = process.binding('synode_redis').TSMRedisClient
  let REDIS_CONN = new TRedisClient()
  REDIS_CONN.initialize('127.0.0.1', '6379')
  console.log(`waiting for values in "mylist" list...
  Use 'RPUSH mylist a b c' in redis-cli to push some values`)
  let brpop=0
  for (let i=0; brpop !== null; i++) {
    brpop = REDIS_CONN.commands('brpop', 'mylist', 0)
    console.log('Result from brpop is ', brpop)
    sleep(100) // do some work
    console.log('continue listening...')
  }
  console.log('Worker thread terminated')
  resp.statusCode = 200
  resp.writeEnd('reds queue listener terminated')
}
App.registerEndpoint('listenToRedis', redisQueueListener, true)

UB.start()

console.log('Verify adding of 50 listeners not produce a ERR in console');
for (let i=0; i < 50; i++) {
  uba_user.on('select:after', function(){})
}
