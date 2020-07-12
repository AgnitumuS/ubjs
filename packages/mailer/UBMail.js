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
const UBMail = module.exports
/**
 * The module for sending and receiving mail
 * @module @unitybase/mailer
 */

/**
 * constructor for TubMailReceiver
 *
 * @method TubMailReceiver
 * @return {TubMailReceiver}
 */
UBMail.TubMailReceiver = binding.TubMailReceiver

/**
 * constructor for TubMailSender
 *
 * @method TubMailSender
 * @return {TubMailSenderBind}
 */
UBMail.TubMailSender = binding.TubMailSender

const _bt = binding.TubSendMailBodyType || {}
/**
 * Mail body type
 * @enum
 */
UBMail.TubSendMailBodyType = {
  Text: _bt.Text,
  HTML: _bt.HTML,
  Calendar: _bt.Calendar
}

const _ac = binding.TubSendMailAttachKind || {}
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
    const subPart = part.subPart
    const L = subPart.length
    if (L === 0) {
      return part
    } else {
      for (let i = 0; i < L; i++) {
        const pi = subPart[i]
        if (pi.disposition !== 'ATTACHMENT') {
          return bodyPartDeep(pi)
        }
      }
    }
  }
  return bodyPartDeep(message.messagePart)
}
