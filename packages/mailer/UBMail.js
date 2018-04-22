/**
 * Module for send and receive mail.
 * ssl is not supported. If you need SSL connection - use {@link module:@unitybase/mailer-ssl @unitybase/mailer-ssl}
 *
 * WARNING - do not send a mail directly from a HTTP thread. Mail server can fail or work slowly.
 * The rigth way is to **put a mail messages in the queue** and send it via scheduler.
 *
 * UBQ model already have:
 *
 *  - a module 'modules/mail-queue` for addint EMails to queue
 *  - a `mail` scheduler job for sending a mail from queue (once a minute by default)
 *
 *
 * Usage sample:
 *
      const UBMail = require('@unitybase/mailer')
      // send e-mail
      let sender = new UBMail.TubMailSender({
        host: 'mail.host.name',
        port: '25',
        tls: false
      })
      sender.sendMail({
        subject: 'subject 1',
        bodyType: UBMail.TubSendMailBodyType.Text,
        body: 'body\r\n 1',
        fromAddr: mailAddr1,
        toAddr: [mailAddr1, mailAddr2]
      })

      // Receive e-mails
      let receiver = new UBMail.TubMailReceiver({
        host: mailHost,
        port: '110',
        tls: false,
        auth: true,
        user: 'mpv',
        password: 'myPassword'
      })
      receiver.reconnect();
      let cnt = r.getMessagesCount()
      let res = []
      for (let i = 1; i <= cnt; i++ ) {
          res.push(r.receive(i))
      }
 *
 * @module @unitybase/mailer
 */
const dllName = process.platform === 'win32' ? 'ubmail.dll' : 'libubmail.so'
const archPath = process.arch === 'x32' ? './bin/x32' : './bin/x86_64'
const path = require('path')
const fs = require('fs')
const moduleName = path.join(__dirname, archPath, dllName)
let binding
if (!fs.existsSync(moduleName)) {
  console.warn('UBMail is not compiled')
  binding = {}
} else {
  binding = require(moduleName)
}
let UBMail = module.exports

/**
 * constructor for TubMailReceiver
 *
 * @method TubMailReceiver
 * @return {TubMailReceiverBind}
 */
UBMail.TubMailReceiver = binding.TubMailReceiver

/**
 * constructor for TubMailSender
 *
 * @method TubMailSender
 * @return {TubMailSenderBind}
 */
UBMail.TubMailSender = binding.TubMailSender

let _bt = binding.TubSendMailBodyType
/**
 * Mail body type
 * @enum
 */
UBMail.TubSendMailBodyType = {
  Text: _bt.Text,
  HTML: _bt.HTML,
  Calendar: _bt.Calendar
}

let _ac = binding.TubSendMailAttachKind
/**
 * Mail attach kind
 * @enum
 */
UBMail.TubSendMailAttachKind = {
  File: _ac.File,
  Text: _ac.Text,
  Buffer: _ac.Buffer
}

/**
 * Get body from message
 *
 * @deprecated Use UBMail.getBodyPart(mimeMsg).read() instead
 */
UBMail.getBodyFromMessage = function () {
  throw new Error('UBMail.getBodyFromMessage is obsolete. Use UBMail.getBodyPart(mimeMsg).read() instead')
}

/**
 * Return a mime part what represents the e-mail body
 * @param {TubMimeMessBind} message
 * @return {TMimePartBind}
 */
UBMail.getBodyPart = function (message) {
  function bodyPartDeep (part) {
    let subPart = part.subPart
    let L = subPart.length
    if (L === 0) {
      return part
    } else {
      for (let i = 0; i < L; i++) {
        let pi = subPart[i]
        if (pi.disposition !== 'ATTACHMENT') {
          return bodyPartDeep(pi)
        }
      }
    }
  }
  return bodyPartDeep(message.messagePart)
}
