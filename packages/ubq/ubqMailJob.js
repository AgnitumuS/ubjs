const fs = require('fs')
const UB = require('@unitybase/ub')
const App = UB.App
const mailerParams = App.serverConfig.application.customSettings.mailerConfig
const UBMail = require('@unitybase/mailer')

const processTerminationRequested = typeof process.terminationRequested === 'function'
  ? process.terminationRequested
  : function () { return false } // UB < 5.20.10 compatibility

/**
 * Mail sender for Scheduler
 * Read queue with code **mail** and send mails to recipient(s)
 * to attach files into the mail, use queue like this:

 msgCmd.attaches = [{entity: <entity>, attribute: 'document', id: <id>, attachName: <file name>}, ...]

 * for document image:

 {
   entity: 'doc_document',
   attribute: 'document',
   id: <doc_document ID>,
   attachName: "document.pdf"
 }

 * for attached files:
 *
 {
   entity: "doc_attachment",
   attribute: 'document',
   id: <attachment ID>,
   attachName: <attachment caption>
 }

 *
 * @module ubqMailJob
 * @memberOf module:@unitybase/ubq
 */
module.exports = function (options) {
  const BATCH_SIZE = 100
  const useBatches = options && !!options.exhaustQueue ? options.exhaustQueue : false
  let sentCount = 0
  let hasMail = false
  let mailSender
  const ensureSenderCreated = () => { // lazy initialization for mailSender
    if (!mailSender) {
      console.debug('Mailer: before new TubMailSender')
      mailSender = new UBMail.TubMailSender({
        host: mailerParams.targetHost,
        port: mailerParams.targetPort || '25',
        user: mailerParams.user || '',
        password: mailerParams.password || '',
        tls: Boolean(mailerParams.autoTLS),
        fullSSL: Boolean(mailerParams.fullSSL),
        auth: mailerParams.auth || false,
        deferLogin: true
      })

      console.debug('Mailer: before mailSender.Login')
      mailSender.login()
      console.debug('Mailer: after mailSender.Login')
    }
  }

  console.log('Call JS method: UB.UBQ.sendQueueMail')
  if (!mailerParams.targetHost) {
    throw new Error('Invalid mailer configuration. Define ubConfig.YourApp.customSettings.mailerConfig object')
  }
  try {
    do {
      const inst = UB.Repository('ubq_messages')
        .attrs(['ID', 'queueCode', 'msgCmd']) // 'msgData' will be retrieved for each row, because it can be huge
        .where('[queueCode]', '=', 'mail')
        .where('[completeDate]', 'isNull')
        .limit(BATCH_SIZE)
        // handle messages In the order of their arrival
        .orderBy('[ID]')
        .select()

      hasMail = !inst.eof
      if (hasMail) {
        ensureSenderCreated()
        sentCount += sendMessages(inst, mailSender)
      }
      /* eslint-disable-next-line */
    } while (useBatches && hasMail && !processTerminationRequested())
  } finally {
    if (mailSender) {
      console.debug('!!!!!!!!! mailSender.freeNative !!!!!!!!!')
      mailSender.freeNative() // release a connection to mail server
      mailSender = null
    }
  }
  return sentCount ? `Send ${sentCount} emails` : 'No emails sent'
}

/**
 * @private
 * @param {ServerRepository} inst Repository instance
 * @param {UBMail} mailSender Mailer instance
 * @returns {number} Sent emails count
 */
function sendMessages (inst, mailSender) {
  let eMsg
  const mailData = {}
  let sentCount = 0

  const msgDataStore = UB.DataStore('ubq_messages') // avoid create a new instance inside a loop
  while (!inst.eof && !processTerminationRequested()) { // terminate mail scheduler ASAP, without waiting all pending mails sends, in case process termination is requested
    mailData.ID = inst.get('ID')
    mailData.msgCmd = inst.get('msgCmd')

    // retrieve msgData one by one to avoid fetch size overflow (see ubConfig.connections.connName.statementMaxMemoryMb. 50Mb by default)
    UB.Repository('ubq_messages')
      .attrs('msgData')
      .where('[ID]', '=', mailData.ID)
      .select(msgDataStore)
    mailData.msgData = msgDataStore.get(0)

    const cmd = JSON.parse(mailData.msgCmd)
    mailData.attaches = []
    if (cmd.attaches && cmd.attaches.length) {
      for (let i = 0, L = cmd.attaches.length; i < L; i++) {
        try {
          const attachFN = App.blobStores.getContentPath({
            entity: cmd.attaches[i].entity,
            attribute: cmd.attaches[i].attribute,
            ID: cmd.attaches[i].id
          })
          if (!fs.existsSync(attachFN)) {
            mailData.attaches.push({
              kind: UBMail.TubSendMailAttachKind.Text,
              attachName: cmd.attaches[i].attachName + '.txt',
              data: `File not exists, please forward this message to administrator.
  Entity: ${cmd.attaches[i].entity}, attribute: ${cmd.attaches[i].attribute}, ID: ${cmd.attaches[i].id}`
            })
          } else {
            mailData.attaches.push({
              kind: UBMail.TubSendMailAttachKind.File,
              attachName: cmd.attaches[i].attachName,
              data: attachFN,
              isBase64: false
            })
          }

          if (cmd.attaches[i].entity === 'ubq_mailAttachment') {
            UB.DataStore('ubq_mailAttachment').run('delete', {
              execParams: {
                ID: cmd.attaches[i].id
              }
            })
          }
        } catch (e) {
          eMsg = (e && e.stack) ? e.message + ' - ' + e.stack : e
          console.error('loadContent', eMsg)
        }
      }
    }
    /* this. */
    internalSendMail(mailData, mailSender)
    sentCount++
    inst.run('success', {
      ID: mailData.ID
    })
    App.dbCommit(App.domainInfo.entities.ubq_messages.connectionName)
    inst.next()
  }
  return sentCount
}

/**
 * @private
 * @param {object} data
 * @param {String} data.msgCmd Stringified JSON of mail
 * @param {String} data.msgData mail body (used if data.msgCmd.body is empty or not defined)
 * @param {UBMail} mailer Mailer instance
 * @return {Boolean}
 */
function internalSendMail (data, mailer) {
  const fMailData = JSON.parse(data.msgCmd)

  console.log('UB.UBQ.internalSendMail. Trying send mail to:', fMailData.to)

  const fRes = mailer.sendMail({
    fromAddr: fMailData.from || mailerParams.fromAddr || ('no-reply@' + mailerParams.targetHost),
    subject: fMailData.subject,
    bodyType: fMailData.bodyType || UBMail.TubSendMailBodyType.Text,
    body: fMailData.body ? fMailData.body : data.msgData,
    toAddr: Array.isArray(fMailData.to) ? fMailData.to : [fMailData.to],
    attaches: data.attaches
  })

  if (!fRes) {
    console.error('UB.UBQ.internalSendMail. Error when sending mail:', mailer.lastError)
  } else {
    console.info('UB.UBQ.internalSendMail. Mail sent successfully')
  }
  return fRes
}
