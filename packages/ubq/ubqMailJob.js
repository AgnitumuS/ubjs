const UB = require('@unitybase/ub')
const App = UB.App
let mailerParams = App.serverConfig.application.customSettings['mailerConfig']
const UBMail = require('@unitybase/mailer')

/**
 * Mail sender for Scheduler
 * Read queue with code **mail** and send mails to recipient(s)
 * to attach files into the mail, use queue like this:

 msgCmd.attaches = [{entity: <entity>, attribute: 'document', id: <id>, atachName: <file name>}, ...]

 * for document image:

 {
   entity: 'doc_document',
   attribute: 'document',
   id: <doc_document ID>,
   atachName: "document.pdf"
 }

 * for attached files:
 *
 {
   entity: "doc_attachment",
   attribute: 'document',
   id: <attachment ID>,
   atachName: <attachment caption>
 }

 *
 * @module ubqMailJob
 * @memberOf module:@unitybase/ubq
 */
module.exports = function () {
  let eMsg
  let mailData = {}
  let sentCount = 0

  console.log('Call JS method: UB.UBQ.sendQueueMail')
  if (!mailerParams.targetHost) {
    throw new Error('Invalid mailer configuration. Define ubConfig.YourApp.customSettings.mailerConfig object')
  }

  let inst = UB.Repository('ubq_messages')
    .attrs(['ID', 'queueCode', 'msgCmd', 'msgData'])
    .where('[queueCode]', '=', 'mail')
    .where('[completeDate]', 'isNull')
    .limit(100)
    // handle messages In the order of their arrival
    .orderBy('[ID]')
    .select()

  if (inst.eof) {
    return 'No emails sent'
  }

  let mailSender = new UBMail.TubMailSender({
    host: mailerParams.targetHost,
    port: mailerParams.targetPort || '25',
    user: mailerParams.user || '',
    password: mailerParams.password || '',
    tls: Boolean(mailerParams.autoTLS),
    auth: mailerParams.auth || false
  })

  while (!inst.eof) {
    mailData.ID = inst.get('ID')
    mailData.msgCmd = inst.get('msgCmd')
    mailData.msgData = inst.get('msgData')
    let cmd = JSON.parse(mailData.msgCmd)
    mailData.attaches = []
    if (cmd.attaches && cmd.attaches.length) {
      for (let i = 0, L = cmd.attaches.length; i < L; i++) {
        try {
          let base64Body = App.blobStores.getContent({
            entity: cmd.attaches[i].entity,
            attribute: cmd.attaches[i].attribute,
            ID: cmd.attaches[i].id
          }, {encoding: 'base64'})
          mailData.attaches.push({
            kind: UBMail.TubSendMailAttachKind.Text,
            atachName: cmd.attaches[i].atachName,
            data: base64Body,
            isBase64: true
          })
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

    App.dbCommit(App.domainInfo.entities['ubq_messages'].connectionName)

    inst.next()
  }
  mailSender.freeNative() // release a connection to mail server
  mailSender = null
  return `Send ${sentCount} emails`
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
  let fMailData = JSON.parse(data.msgCmd)

  console.log('UB.UBQ.internalSendMail. Trying send mail to:', fMailData.to)

  let fRes = mailer.sendMail({
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
