/**
 * @class UB.UBQ
 * Mail sender for Scheduler
 * @singleton
 */

var me = UB.ns('UB.UBQ'),
    mailerParams = JSON.parse(App.customSettings)['mailerConfig'],
    UBMail = require('@unitybase/mailer');

/**
 * @private
 * @param {object} data
 * @param {String} data.msgCmd Stringified JSON of mail
 * @param {String} data.msgData mail body (used if data.msgCmd.body is empty or not defined)
 * @param {UBMail} mailer Mailer instance
 * @return {Boolean}
 */
function internalSendMail(data, mailer){
    var fMailData = JSON.parse(data.msgCmd);

    console.log('UB.UBQ.internalSendMail. Trying send mail to:', fMailData.to);

    var fRes = mailer.sendMail({
        fromAddr: fMailData.from || mailerParams.fromAddr || ('no-reply@' + mailerParams.targetHost),
        subject: fMailData.subject,
        bodyType: fMailData.bodyType || UBMail.TubSendMailBodyType.Text,
        body: fMailData.body ? fMailData.body : data.msgData,
        toAddr: Array.isArray(fMailData.to) ? fMailData.to : [fMailData.to],
        attaches: data.attaches
    });

    if (!fRes){
        console.error('UB.UBQ.internalSendMail. Error when sending mail:', mailer.lastError);
    } else {
        console.info('UB.UBQ.internalSendMail. Mail sent successfully');
    }
    return fRes;
}

/**
 * Read queue with code 'mail' and send mails to recipient(s)
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

 * @param {ubMethodParams} ctxt
 * @returns {String}
 */
me.sendQueueMail = function(ctxt) {
    var i, cmd, docHandler, inst, eMsg,
        mailData = {},
        mailSender,
        docReq, sendedCount = 0;

    console.log('Call JS method: UB.UBQ.sendQueueMail');
    if (!mailerParams.targetHost){
        throw new Error('Invalid mailer configuration. Define ubConfig.YourApp.customSettings.mailerConfig object');
    }

    inst = UB.Repository('ubq_messages')
        .attrs(['ID', 'queueCode', 'msgCmd', 'msgData'])
        .where('[queueCode]', '=', 'mail')
        .where('[completeDate]', 'isNull')
        .limit(100)
//        .orderByDesc('[msgPriority]')
        .select();
		
    mailSender = new UBMail.TubMailSender({
        host: mailerParams.targetHost,
        port: mailerParams.targetPort || '25',
        user: mailerParams.user || '',
        password: mailerParams.password || '',
        tls: Boolean(mailerParams.autoTLS),
        auth: mailerParams.auth || false
    });
	
    while (!inst.eof){
        mailData.ID = inst.get('ID');
        mailData.msgCmd = inst.get('msgCmd');
        mailData.msgData = inst.get('msgData');
        cmd = JSON.parse(mailData.msgCmd);
        mailData.attaches = [];
        if (cmd.attaches && cmd.attaches.length) {
            if (!docReq){
                docReq = new TubDocumentRequest(); // create it only if necessary
            }
            for (i = 0; i < cmd.attaches.length; i++) {
                docReq.entity = cmd.attaches[i].entity;
                docReq.attribute = cmd.attaches[i].attribute;
                docReq.id = cmd.attaches[i].id;
                docHandler = docReq.createHandlerObject(true);
                try {
                    docHandler.loadContent(TubLoadContentBody.Yes);
                    mailData.attaches.push({
                        kind: UBMail.TubSendMailAttachKind.Text,
                        atachName: cmd.attaches[i].atachName,
                        data: docReq.getBodyAsBase64String(),
                        isBase64: true
                    });
                } catch(e) {
                    if (e && e.stack) {
                        eMsg = e.message + ' - ' + e.stack;
                    } else {
                        eMsg = e;
                    }
                    console.error('loadContent', eMsg);
                }
            }
        }
        /*this.*/
        internalSendMail(mailData, mailSender);
        sendedCount++;
        inst.run('success', {
            ID: mailData.ID
        });

        App.dbCommit(inst.entity.connectionName);

        inst.next();
    }
    mailSender.freeNative(); // release a connection to mail server
    mailSender = null;
    return 'Send ' + sendedCount + ' emails';
};
