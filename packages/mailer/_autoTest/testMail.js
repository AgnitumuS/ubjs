const path = require('path')
const assert = require('assert')
const fs = require('fs')
let testFilesDir = path.resolve(__dirname, 'TestFiles')
let moduleName = path.basename(path.resolve(__dirname, '../'))
let useTls = (moduleName !== 'mailer')
let UBMail = require('../UBMail')

// configuration
const account1 = 'UB_AUTOTEST1'
const account1Pwd = 'BE-1vJwQAH'
const account2 = 'UB_AUTOTEST2'
const account2Pwd = 'BE-1vJwQAH'
const mailHost = 'mail.softline.main'
const rPort = '110'
const sPort = '25'
const mailSuffix = '@softline.kiev.ua'

const mailAddr1 = account1 + mailSuffix
const mailAddr2 = account2 + mailSuffix

const sender1 = new UBMail.TubMailSender({
  host: mailHost,
  port: sPort,
  tls: useTls
})
const sender2 = new UBMail.TubMailSender({
  host: mailHost,
  port: sPort,
  tls: useTls
})
const receiver1 = new UBMail.TubMailReceiver({
  host: mailHost,
  port: rPort,
  tls: useTls,
  auth: true,
  user: account1,
  password: account1Pwd
})
const receiver2 = new UBMail.TubMailReceiver({
  host: mailHost,
  port: rPort,
  tls: useTls,
  auth: true,
  user: account2,
  password: account2Pwd
})
console.debug('useTls=' + useTls)
// Start tests

console.debug('1. Empty mailboxes')
emptyMailBoxes()
receiveMail(receiver1, account1, 0)
receiveMail(receiver2, account2, 0)

console.debug('2. Send message 1')
// message to both mailboxes with plain text bode without attaches
const message1 = {
  subject: 'subject 1',
  bodyType: UBMail.TubSendMailBodyType.Text,
  body: 'body\r\n 1',
  fromAddr: mailAddr1,
  toAddr: [mailAddr1, mailAddr2]
}
assert(sender1.sendMail(message1), 'Sending message1 failed')
let msgList = receiveMail(receiver1, account1, 1)
checkIsSameMessage(msgList[0], message1)

console.debug('3. Send message 2')
// message to second mailbox with html body with 2 text file attaches
// first attach is not base64, but second is
const message2 = {
  subject: 'subject 2',
  bodyType: UBMail.TubSendMailBodyType.HTML,
  body: '<b>body</b> 2',
  fromAddr: mailAddr1,
  toAddr: [mailAddr2],
  attaches: [
    {
      kind: UBMail.TubSendMailAttachKind.Text,
      atachName: 'atach1.txt',
      data: 'atach1 text'
    },
    {
      kind: UBMail.TubSendMailAttachKind.Text,
      atachName: 'atach2.txt',
      data: Buffer.from('atach2 text').toString('base64'),
      isBase64: true
    }
  ]
}
assert.ok(sender1.sendMail(message2), 'Sending message2 failed')
receiveMail(receiver1, account1, 1)
msgList = receiveMail(receiver2, account2, 2)
checkIsSameMessage(msgList[0], message1)
checkIsSameMessage(msgList[1], message2)

emptyMailBoxes()

console.debug('4. Send message 3')
// message to first mailbox with text not latin body with 6 attaches
// attach with even number s is not base64, and with odd number is base64
const message3 = {
  subject: 'тема сообщения Təşəbbüs ',
  bodyType: UBMail.TubSendMailBodyType.Text,
  body: 'Cavab \r\n məktub Təşəbbüs məktu',
  fromAddr: mailAddr2,
  toAddr: [mailAddr1, 'pavel.mash@inbase.com.ua']
  // ,attaches: [
  //   {
  //     kind: UBMail.TubSendMailAttachKind.Text,
  //     atachName: 'atach1.txt',
  //     data: 'тест Cavab \r\n məktub \r\n  Təşəbbüs məktu '
  //   },
  //   {
  //     kind: UBMail.TubSendMailAttachKind.Text,
  //     atachName: 'atach2.txt',
  //     data: '0YLQtdGB0YIgQ2F2YWIgXHJcbiBtyZlrdHViIFxyXG4gIFTJmcWfyZliYsO8cyBtyZlrdHUg',
  //     isBase64: true
  //   },
  //   {
  //     kind: UBMail.TubSendMailAttachKind.File,
  //     data: path.resolve(testFilesDir, '1.bmp'),
  //     isBase64: false
  //   },
  //   {
  //     kind: UBMail.TubSendMailAttachKind.File,
  //     atachName: '1_.bmp',
  //     data: path.resolve(testFilesDir, '1-base64.bmp'),
  //     isBase64: true
  //   },
  //   {
  //     kind: UBMail.TubSendMailAttachKind.Buffer,
  //     atachName: '2.jpg',
  //     data: fs.readFileSync(path.resolve(testFilesDir, '1.jpg'), {encoding: 'bin'}),
  //     isBase64: false
  //   },
  //   {
  //     kind: UBMail.TubSendMailAttachKind.Buffer,
  //     atachName: '2_.jpg',
  //     data: fs.readFileSync(path.resolve(testFilesDir, '1-base64.jpg'), {encoding: 'bin'}),
  //     isBase64: true
  //   }
  // ]
}
assert.ok(sender2.sendMail(message3), 'Sending message3 failed')
receiveMail(receiver2, account2, 0)
debugger
msgList = receiveMail(receiver1, account1, 1)
checkIsSameMessage(msgList[0], message3)

emptyMailBoxes()

console.debug('5. Send message 4')
// message to second mailbox with not latin html body without
const message4 = {
  subject: 'subject 4',
  bodyType: UBMail.TubSendMailBodyType.HTML,
  body: '<b>body</b> 4 <i>тест Cavab \r\n məktub \r\n  Təşəbbüs məktu </i>',
  fromAddr: mailAddr1,
  toAddr: [mailAddr2, 'pavel.mash@inbase.com.ua']
}
assert.ok(sender1.sendMail(message4), 'Sending message4 failed')
msgList = receiveMail(receiver2, account2, 1)
checkIsSameMessage(msgList[0], message4)

emptyMailBoxes()

/**
 * Delete all messages from both mailboxes
 */
function emptyMailBoxes () {
  /**
   * Delete all messages from custom mailbox
   * @param {UBMail.TubMailReceiver} r
   */
  function emptyMail (r) {
    let cnt = r.getMessagesCount()
    for (let i = 1; i <= cnt; i++) {
      r.deleteMessage(i)
    }
    r.reconnect()
  }
  emptyMail(receiver1)
  emptyMail(receiver2)
}

/**
 * Receive mail
 * @param {UBMail.TubMailReceiver} r
 * @param {String} account
 * @param {Number} cntExpected expected count of messages
 * @returns {Array.<UBMail.TUBMimeMess>}
 */
function receiveMail (r, account, cntExpected) {
  r.reconnect()
  let cnt = r.getMessagesCount()
  let res = []
  for (let i = 1; i <= cnt; i++) {
    res.push(r.receive(i))
  }
  assert.strictEqual(res.length, cntExpected, 'receiveMail ' + account + ' expected ' + cntExpected + ' message actually: ' + res.length)

  return res
}

function checkIsSameMessage (mimeMsg, sendingMsg) {
  assert.strictEqual(mimeMsg.header.subject, sendingMsg.subject, `Invalid message subject. Got "${mimeMsg.header.subject}" must be "${sendingMsg.subject}"`)
  assert.strictEqual(mimeMsg.header.from, '<' + sendingMsg.fromAddr + '>', 'Invalid message from field')
  for (let i = 0; i < sendingMsg.toAddr.length; i++) {
    assert.strictEqual(mimeMsg.header.toList.readLn(i), '<' + sendingMsg.toAddr[i] + '>', 'Invalid message to field')
  }
  assert.strictEqual(mimeMsg.header.cCList.read(), '', 'Invalid message CC field')
  if (sendingMsg.bodyType === UBMail.TubSendMailBodyType.HTML) {
    let receivedBody = UBMail.getBodyPart(mimeMsg).read()
    assert.strictEqual(
      receivedBody,
      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + sendingMsg.body,
      `Invalid HTML message body "${receivedBody}"`
    )
  } else {
    let receivedBody = UBMail.getBodyPart(mimeMsg).read()
    assert.strictEqual(receivedBody, sendingMsg.body, `Invalid ${sendingMsg.bodyType} message body "${receivedBody}"`)
  }

  if ((sendingMsg.attaches) && (sendingMsg.attaches.length > 0)) {
    assert.strictEqual(mimeMsg.messagePart.subPart.length, 1 + sendingMsg.attaches.length, 'Incorrect subparts count')
    for (let i = 1; i < mimeMsg.messagePart.subPart.length; i++) {
      let subPart = mimeMsg.messagePart.subPart[i]
      let attach = sendingMsg.attaches[i - 1]
      assert.strictEqual(subPart.disposition, 'ATTACHMENT', 'Invalid attachment disposition')
      if ((attach.kind === UBMail.TubSendMailAttachKind.File) && (!attach.atachName)) {
        assert.strictEqual(subPart.fileName, attach.data.substr(-subPart.fileName.length), 'Invalid attachment file name')
      } else {
        assert.strictEqual(subPart.fileName, attach.atachName, 'Invalid attachment file name')
      }
      let body
      switch (attach.kind) {
        case UBMail.TubSendMailAttachKind.Text:
          if (attach.isBase64) {
            body = subPart.partBody.read()
          } else {
            fs.writeFileSync(path.resolve(testFilesDir, 'tmpFile.tmp'), subPart.partBody.read('base64'), {encoding: 'bin'})
            body = fs.readFileSync(path.resolve(testFilesDir, 'tmpFile.tmp'), 'utf8')
          }
          assert.strictEqual(body, attach.data, 'Invalid text attachment data')
          break
        case UBMail.TubSendMailAttachKind.Buffer:
          if (attach.isBase64) {
            body = subPart.partBody.read('bin')
          } else {
            body = subPart.partBody.read('base64')
          }
          assert.deepEqual(body, attach.data, 'Invalid buffer attachment data')
          break
        case UBMail.TubSendMailAttachKind.File:
          if (attach.isBase64) {
            body = subPart.partBody.read('bin')
          } else {
            body = subPart.partBody.read('base64')
          }
          assert.deepEqual(body, fs.readFileSync(attach.data, {encoding: 'bin'}), 'Invalid file attachment data')
          break
      }
    }
  }
}
