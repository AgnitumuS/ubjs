The module for sending and receiving mail.
For SSL support OpenSSL libraries version >= 0.9.7 must be installed
 - Windows: `libssl32.dll`, `libeay32.dll`, (optional `ssleay32.dll`) must be in the PATH
 - Linux: libssl.so libcrypto.so must be in LD_LIBRARY_PATH

**WARNING** - do not send the mail directly from a HTTP thread.
Mail server can fail or work slowly.
The right way is to **put the mail messages in the queue** and send them via scheduler.

{@link module:@unitybase/ubq @unitybase/ubq} module already has:
  - a module 'modules/mail-queue` for adding e-mails to the queue
  - a `mail` scheduler job for sending mails from the queue (once a minute by default)

Usage sample:
```js
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
```