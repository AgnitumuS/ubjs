/**
 * Module for send and receive mail.
 * ssl is not supported. If you need SSL connection - use {@link UBMail_openssl}
 *
 * WARNING - do not send a mail directly from a HTTP thread. Mailer can fail or work slowly.
 * The rigth way is to put a mail messages in the queue and send it via scheduler.
 *
 * UBQ model already have:
 *
 *  - a module 'modules/mail-queue` for addint EMails to queue
 *  - a `mail` scheduler job for sending a mail from queue (once a minute by default)
 *
 *
 * Usage sample:
 *
 *      var UBMail = require('@unitybase/mailer');
 *      sender = new UBMail.TubMailSender({
            host: 'mail.host.name',
            port: '25',
            tls: false
        });
        sender.sendMail({
            subject: "subject 1",
            bodyType: UBMail.TubSendMailBodyType.Text,
            body: "body\r\n 1",
            fromAddr: mailAddr1,
            toAddr: [mailAddr1, mailAddr2]
        });

        var receiver = new UBMail.TubMailReceiver({
            host: mailHost,
            port: '110',
            tls: false,
            auth: true,
            user: 'mpv',
            password: "myPassword"
        });
        receiver.reconnect();
        var cnt = r.getMessagesCount(), res = [], i;
        for ( i = 1; i <= cnt; i++ ) {
            res.push(r.receive(i));
        }
 *
 * @module @unitybase/mailer-ssl
 */
const archPath = process.arch === 'x32' ? './bin/x32' : './bin/x64'
const binding = require(archPath + '/UBMail.dll')
var UBMail = module.exports;

/**
 * constructor for TubMailReceiver
 *
 * @method TubMailReceiver
 * @return {UBMail.TubMailReceiver}
 */
UBMail.TubMailReceiver = binding.TubMailReceiver;

/**
 * constructor for TubMailSender
 *
 * @method TubMailSender
 * @return {UBMail.TubMailSender}
 */
UBMail.TubMailSender = binding.TubMailSender;

/**
 * Mail body type
 *
 * @property TubSendMailBodyType
 * @type {UBMail.TubSendMailBodyType}
 */
UBMail.TubSendMailBodyType = binding.TubSendMailBodyType;

/**
 * Mail body type
 *
 * @property TubSendMailAttackKind
 * @type {UBMail.TubSendMailAttachKind}
 */
UBMail.TubSendMailAttachKind = binding.TubSendMailAttachKind;

/**
 * Get body from message part
 *
 * @ignore
 * @param {UBMail.TMimePart} part
 * @returns {UBMail.StringCollection}
 */

function getBodyFromMessagePart(part) {
    var i, subPart = part.subPart;
    if (subPart.length === 0) {
        return part.partBody;
    } else {
        for (i = 0; i<subPart.length; i++) {
            if (subPart[i].disposition !== 'ATTACHMENT') {
                return getBodyFromMessagePart(subPart[i]);
            }
        }
    }
}

/**
 * Get body from message
 *
 * @param {UBMail.TUBMimeMess} message
 * @returns {UBMail.StringCollection}
 */
UBMail.getBodyFromMessage = function(message) {
    return getBodyFromMessagePart(message.messagePart);
};


