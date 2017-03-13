/**
 * DocuSign envelopes
 *
 * @autor v.orel on 19.09.2016.
 * @module ub_model_dses/dses_envelope
 */

const http = require('http');
const me = dses_envelope;
const docusign = require('docusign-esign');
const {parseString} = require('xml2js');
const docuSignSettings = App.serverConfig.application.customSettings.docuSign;

if (!docuSignSettings) {
    throw new UB.UBAbort('Cannot load dses_envelope module. Section "docuSign" not found in customSettings of application.')
}

const UserName = docuSignSettings.userName;
const Password = docuSignSettings.password;
const IntegratorKey = docuSignSettings.integratorKey;
const BaseUrl = docuSignSettings.apiUrl;

const apiClient = new docusign.ApiClient();
apiClient.setBasePath(BaseUrl);
const creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);
docusign.Configuration.default.setDefaultApiClient(apiClient);

const envelopesApi = new docusign.EnvelopesApi();

const ds = new TubDataStore('dses_envelope');

function docusignLogin(){
    const authApi = new docusign.AuthenticationApi(),
        loginOps = new authApi.LoginOptions();
    let accountId = null;
    loginOps.setApiPassword('true');
    loginOps.setIncludeAccountIdGuid('true');

    authApi.login(loginOps, function (error, loginInfo, response) {
        if (error) {
            throw error;
        }

        if (loginInfo) {
            // list of user account(s)
            // note that a given user may be a member of multiple accounts
            const loginAccounts = loginInfo.getLoginAccounts();
            accountId = loginAccounts[0].accountId;
            console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
        }
    });
    return accountId;
}
/**
 * Document in envelope
 * @typedef {Object} dsesDocument
 * @property {string} entity Entity of document
 * @property {string} attribute Attribute ow entity whitc store document. Type of attribyte must be 'document'
 * @property {number} ID ID of entity that stores document
 * @property {string} documentId Internal ID of document in envelope for docusign. It must be a simple number like 1,2,3... etc
 */

/**
 * Tag that specifies where the recipient places their signature in the document
 * @typedef {Object} dsesSignerTabSignHere
 * @property {string|number} documentId Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
 * @property {number} pageNumber Specifies the page number on which the tab is located.
 * @property {number} xPosition This indicates the horizontal offset of the object on the page. DocuSign uses 72 DPI when determining position.
 * @property {number} yPosition This indicates the vertical offset of the object on the page. DocuSign uses 72 DPI when determining position.
 */

/**
 * Tag on the document where you want the recipient's name to appear.
 * @typedef {Object} dsesSignerTabFullName
 * @property {string|number} documentId Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
 * @property {number} pageNumber Specifies the page number on which the tab is located.
 * @property {number} xPosition This indicates the horizontal offset of the object on the page. DocuSign uses 72 DPI when determining position.
 * @property {number} yPosition This indicates the vertical offset of the object on the page. DocuSign uses 72 DPI when determining position.
 */

/**
 * Tag that specifies where the recipient places their signature in the document
 * @typedef {Object} dsesSignerTabDateSigned
 * @property {string|number} documentId Specifies the document ID number that the tab is placed on. This must refer to an existing Document's ID attribute.
 * @property {number} pageNumber Specifies the page number on which the tab is located.
 * @property {number} xPosition This indicates the horizontal offset of the object on the page. DocuSign uses 72 DPI when determining position.
 * @property {number} yPosition This indicates the vertical offset of the object on the page. DocuSign uses 72 DPI when determining position.
 */

/**
 * Tab on the document where the date the document was signed will automatically appear.
 * @typedef {Object} dsesSignerTab
 * property {dsesSignerTabSignHere[]} signHere List of tags that specifies where the recipient places their signature in the document
 * property {dsesSignerTabFullName[]} fullName List of tags on the document where you want the recipient's name to appear.
 * property {dsesSignerTabDateSigned[]} dateSigned List of tags on the document where the date the document was signed will automatically appear.
 */

/**
 * Signer in envelope
 * @tepedef {Object} dsesSigner
 * @property {string} email Email of signer
 * @property {string} fullName Full name of signer
 * @property {dsesSignerTab[]} tabs Signer tabs(speciasl fields)
 */

/**
 * Envelope for docusign
 * @typedef {Object} dsesEnvelope
 * @property {string} emailSubject Specifies the subject of the email that is sent to all recipients.
 * @property {string} emailBlurb This is the same as the email body. If specified it is included in email body for all envelope recipients. This can be a maximum of 10000 characters
 * @property {string} entity Entity, than create this envelope. It emits 'dses:...' events when docusign call event notification callback.
 * @property {number} entityID ID of entity, than create ennvelope. It will be passed as parameter when emit events
 * @property {Array<dsesDocument>} documents List of documents in envelope
 * @property {Array<dsesSigner>} signers List of signerss in envelope
 */

/**
 * Create envelope and send it to docusign.
 * Returns id of envelope in dses_envelope entity.
 *
 * @method addEnvelope
 * @param {dsesEnvelope} envelope Envelope
 * @param {String} [accountId] dses account Id
 * @returns {Number}
 */
addEnvelope = function({
        emailSubject: emailSubject = 'Please Sign my Node SDK Envelope',
        emailBlurb: emailBlurb = 'Hello, Please sign my Node SDK Envelope.',
        entity: entity = null,
        entityID: entityID = null,
        documents: documents = [],
        signers: signers = [],
        envID: envID = null
    },
    accountId = docusignLogin()) {

    const docRequest = new TubDocumentRequest()
        envDef = new docusign.EnvelopeDefinition(),
        docs = [];

    envDef.setEmailSubject(emailSubject);
    envDef.setEmailBlurb(emailBlurb);


    for (let document of documents) {
        docRequest.entity = document.entity;
        docRequest.attribute = document.attribute;
        docRequest.id = document.id;
        const docHandler = docRequest.createHandlerObject(true);
        docHandler.loadContentFromEntity(TubLoadContentBody.Yes);
        const doc = new docusign.Document();

        doc.setDocumentBase64(docHandler.request.getBodyAsBase64String());
        doc.setDocumentId(document.documentId.toString());
        doc.setName(docHandler.content.origName);

        docs.push(doc);
    }

    envDef.setDocuments(docs);

    envDef.setRecipients(new docusign.Recipients());
    envDef.getRecipients().setSigners([]);

    let recipientID = 1;
    for (let signer of signers) {
        const sign = new docusign.Signer(),
            recipientId = (recipientID++).toString();

        sign.setEmail(signer.email);
        sign.setName(signer.fullName);
        signer.recipientId = recipientId;
        sign.setRecipientId(recipientId);
        if (signer.routingOrder) {
            sign.setRoutingOrder(signer.routingOrder)
        }

        if (signer.tabs) {
            const tabs = new docusign.Tabs();

            if (signer.tabs.signHere) {
                const signHereTabs = [];
                for (let signHere of signer.tabs.signHere) {
                    const signHereTab = new docusign.SignHere();
                    signHereTab.setDocumentId(signHere.documentId.toString());
                    signHereTab.setPageNumber(signHere.pageNumber.toString());
                    signHereTab.setRecipientId(recipientId);
                    signHereTab.setXPosition(signHere.xPosition.toString());
                    signHereTab.setYPosition(signHere.yPosition.toString());
                    signHereTabs.push(signHereTab);
                }
                tabs.setSignHereTabs(signHereTabs);
            }

            if (signer.tabs.fullName) {
                const fullNameTabs = [];
                for (let fullName of signer.tabs.fullName) {
                    const fullNameTab = new docusign.FullName();
                    fullNameTab.setDocumentId(fullName.documentId.toString());
                    fullNameTab.setPageNumber(fullName.pageNumber.toString());
                    fullNameTab.setRecipientId(recipientId);
                    fullNameTab.setXPosition(fullName.xPosition.toString());
                    fullNameTab.setYPosition(fullName.yPosition.toString());
                    fullNameTabs.push(fullNameTab);
                }
                tabs.setFullNameTabs(fullNameTabs);
            }

            if (signer.tabs.dateSigned) {
                const dateSignedTabs = [];
                for (let dateSigned of signer.tabs.dateSigned) {
                    const dateSignedTab = new docusign.DateSigned();
                    dateSignedTab.setDocumentId(dateSigned.documentId.toString());
                    dateSignedTab.setPageNumber(dateSigned.pageNumber.toString());
                    dateSignedTab.setRecipientId(recipientId);
                    dateSignedTab.setXPosition(dateSigned.xPosition.toString());
                    dateSignedTab.setYPosition(dateSigned.yPosition.toString());
                    dateSignedTabs.push(dateSignedTab);
                }
                tabs.setDateSignedTabs(dateSignedTabs);
            }

            sign.setTabs(tabs);
        }
        envDef.getRecipients().getSigners().push(sign);
    }

    envDef.setStatus('sent');

    const eventNotification = new docusign.EventNotification();
    const envelopeEvents = [];


    for (let event of ['sent','delivered','completed','declined','voided']){
        const envelopeEvent = new docusign.EnvelopeEvent();
        envelopeEvent.setEnvelopeEventStatusCode(event);
        envelopeEvents.push(envelopeEvent);
    }

    eventNotification.setEnvelopeEvents(envelopeEvents);
    eventNotification.setIncludeTimeZone('true');
    eventNotification.setLoggingEnabled('true');
    eventNotification.setRequireAcknowledgment('true');
    eventNotification.setUrl(App.serverURL+'rest/dses_envelope/eventNotification');
    envDef.setEventNotification(eventNotification);

    let envelopeID;

	// todo set local timeout
    http.setGlobalConnectionDefaults({sendTimeout: 240000, receiveTimeout: 240000});
	
    envelopesApi.createEnvelope(accountId, envDef, null, function (error, envelopeSummary, response) {
        if (error) {
            throw error;
        }

        if (envelopeSummary) {
            console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
            envelopeID = envelopeSummary.envelopeId;
        }
    });

    if (!envID) {
        envID = ds.generateID()
    }

    ds.run('insert', {
        entity: 'dses_envelope',
        execParams: {
            ID: envID,
            entity: entity,
            entityID: entityID,
            envelopeID: envelopeID
        },
        fieldList: ['ID']
    });

    //const envID = ds.get(0);

    ds.run('insert', {
        entity: 'dses_log',
        execParams: {
            envelope: envID,
            data: JSON.stringify({DocuSignEnvelopeInformation: {EnvelopeStatus: {Status: 'Created'}}})
        },
        fieldList: ['ID']
    });

    for (let document of documents){
        ds.run('insert', {
            entity: 'dses_document',
            execParams: {
                envelope: envID,
                docusign_ID: document.documentId,
                document_entity: document.entity,
                document_attribute: document.attribute,
                document_ID: document.id
            }
        });
    };

    for (let signer of signers){
        ds.run('insert', {
            entity: 'dses_signer',
            execParams: {
                envelope: envID,
                docusign_ID: signer.recipientId,
                name: signer.fullName,
                email: signer.email
            }
        });
    };


    return envID;
};

/**
 * Add a envelope to queue
 *
 * @method queueEnvelope
 * @param {dsesEnvelope} envelope Envelope
 */
me.queueEnvelope = function(params) {
    ds.run('insert', {
        fieldList: ['ID'],
        entity: 'ubq_messages',
        execParams: {
            queueCode: 'dses',
            msgCmd: 'add',
            msgData: JSON.stringify(params),
            msgPriority: 0
        }
    });
}

/**
 * Read queue with code 'dses' and  command 'add' and create dses envelopes
 * @param {ubMethodParams} ctxt
 * @returns {String}
 */
me.createQueueEnvelopes = function(ctxt) {
    let sendedCount = 0;

    console.log('Call JS method: dses_envelope.createQueueEnvelopes');
    let accountId;

    inst = UB.Repository('ubq_messages')
        .attrs(['ID', 'queueCode', 'msgCmd', 'msgData'])
        .where('[queueCode]', '=', 'dses')
        .where('[msgCmd]', '=', 'add')
        .where('[completeDate]', 'isNull')
        .limit(100)
//        .orderByDesc('[msgPriority]')
        .select();

    while (!inst.eof){
        if (!accountId) {
            accountId = docusignLogin();
        }
        const params = JSON.parse(inst.get('msgData'));
        addEnvelope(params, accountId);
        sendedCount++;
        inst.run('success', {
            ID: inst.get('ID')
        });
        App.dbCommit(inst.entity.connectionName);
        inst.next();
    }
    return 'Send ' + sendedCount + ' envelopes';
};

/**
 * Callback for docusign. Push data into ubq_messages
 *
 * @param fake
 * @param {THTTPRequest}req
 * @param {THTTPResponse}resp
 */
me.eventNotification = function(fake, req, resp) {
    parseString(req.read(), {explicitArray: false/*, normalizeTags: true*/}, function (err, result) {
        if (err) {
            throw err;
        } else {
            // todo check that package is from docusign
            ds.run('insert', {
                fieldList: ['ID'],
                entity: 'ubq_messages',
                execParams: {
                    queueCode: "dses",
                    msgCmd: 'notify',
                    msgData: JSON.stringify(result),
                    msgPriority: 0
                }
            });

            resp.statusCode = 200;
        }
    });
    resp.writeEnd('');
};
me.entity.addMethod('eventNotification');
/**
 * Read queue with code 'dses' and command 'notify' and handle DocuSign event notification
 * @param {ubMethodParams} ctxt
 * @returns {String}
 */
me.notificationQueue = function(ctxt){
    let handledCount = 0;

    console.log('Call JS method: dses_envelope.notificationQueue');

    inst = UB.Repository('ubq_messages')
        .attrs(['ID', 'queueCode', 'msgCmd', 'msgData'])
        .where('[queueCode]', '=', 'dses')
        .where('[msgCmd]', '=', 'notify')
        .where('[completeDate]', 'isNull')
        .limit(100)
//        .orderByDesc('[msgPriority]')
        .select();

    while (!inst.eof){
        const params = JSON.parse(inst.get('msgData'));

        if (params.DocuSignEnvelopeInformation && params.DocuSignEnvelopeInformation.EnvelopeStatus && params.DocuSignEnvelopeInformation.EnvelopeStatus.EnvelopeID) {
            UB.Repository('dses_envelope').attrs('ID').
                where('envelopeID', '=', params.DocuSignEnvelopeInformation.EnvelopeStatus.EnvelopeID).select(ds);
            if (!ds.eof) {
                ds.run('insert', {
                    entity: 'dses_log',
                    execParams: {
                        envelope: ds.get(0),
                        data: JSON.stringify(params)
                    },
                    fieldList: ['ID']
                });
                handledCount++;
                inst.run('success', {
                    ID: inst.get('ID')
                });
                App.dbCommit(inst.entity.connectionName);
            }
        }
        inst.next();
    }
    return 'Handled ' + handledCount + ' notifications';
}

/**
 * Get list of documents in envelope
 *
 * @method getDocumentList
 * @param {number|string} envelopeID If number then ID of envelope in dses_envelope entity, else docusign envelope ID
 * @returns {Array<{docusign_ID: string, document_entity: string, document_attribute: string, document_ID: number}>}
 */
me.getDocumentList = function(envelopeID) {
    UB.Repository('dses_document').attrs(['docusign_ID', 'document_entity', 'document_attribute', 'document_ID']).
        where(envelopeID * 1 == envelopeID ? 'envelope' : 'envelope.envelopeID', '=' , envelopeID).select(ds);
    return JSON.parse(ds.asJSONObject);
}

/**
 * Get list of signers in envelope
 *
 * @method getSignerList
 * @param {number|string} envelopeID If number then ID of envelope in dses_envelope entity, else docusign envelope ID
 * @returns {Array<{docusign_ID: string, name: string, email: string}>}
 */
me.getSignerList = function(envelopeID) {
    UB.Repository('dses_signer').attrs(['docusign_ID', 'name', 'email']).
        where(envelopeID * 1 == envelopeID ? 'envelope' : 'envelope.envelopeID', '=' , envelopeID).select(ds);
    return JSON.parse(ds.asJSONObject);
};

/**
 * Get content of document from docusign
 *
 * @method getDocument
 * @param {number|string} envelopeID If number then ID of envelope in dses_envelope entity, else docusign envelope ID
 * @param {string} documentID Internal ID of document in envelope for docusign. It must be a simple number like 1,2,3... etc
 * @returns Buffer
 */
getDocument = function(envelopeID, documentID, accountId= docusignLogin()){
    UB.Repository('dses_envelope').attrs('envelopeID').where(envelopeID * 1 == envelopeID ? 'ID' : 'envelopeID', '=', envelopeID).select(ds);
    let res = null;
    if (!ds.eof) {
        envelopesApi.getDocument(accountId, ds.get(0), documentID, function (error, data, response) {
            res = Buffer.from(data, 'binary');
        });
    }
    return res;
};

/**
 * Update content all documents of envelope from docusign
 *
 * @method updateDocuments
 * @param {number|string} envelopeID If number then ID of envelope in dses_envelope entity, else docusign envelope ID
 */
me.updateDocuments = function(envelopeID, accountId = docusignLogin()) {
    UB.Repository('dses_envelope').attrs('envelopeID').where(envelopeID * 1 == envelopeID ? 'ID' : 'envelopeID', '=', envelopeID).select(ds);
    if (!ds.eof) {
        const envelope_ID = ds.get(0);
        var  docs = me.getDocumentList(envelope_ID),
            docRequest = new TubDocumentRequest();

        for (let {
                document_entity: entity,
                document_attribute: attribute,
                document_ID: id,
                docusign_ID: docusign_ID
            } of docs) {
            const isSimpleAudit = global[entity].entity.mixins.mStorage && global[entity].entity.mixins.mStorage.simpleAudit;
            docRequest.entity = entity;
            docRequest.attribute = attribute;
            docRequest.id = id;
            docRequest.isDirty = true;

            docRequest.setBodyFromArrayBuffer(getDocument(envelope_ID, docusign_ID, accountId).buffer);
            const docHandler = docRequest.createHandlerObject(false);
            docHandler.loadContentFromRequest(TubLoadContentBody.No);

            ds.run('select', {
                entity: entity,
                method: 'select',
                lockType: 'ltTemp',
                ID: id,
                fieldList: isSimpleAudit ? [attribute, 'mi_modifyDate'] : [attribute]
            });

            const prevFti = JSON.parse(ds.get(0)),
                updateParams = {
                    ID: id
                };
            if (isSimpleAudit) {
                updateParams.mi_modifyDate = ds.get(1);
            };

            docHandler.content.fName = prevFti.fName;
            docHandler.content.origName = prevFti.origName;
            docHandler.content.ct = prevFti.ct;
            docHandler.saveContentToTempStore();
            docHandler.content.revision = prevFti.revision;
            docHandler.content.fName = prevFti.fName;
            docHandler.content.origName = prevFti.origName;
            docHandler.content.ct = prevFti.ct;
            updateParams[attribute] = JSON.stringify(docHandler.content);

            ds.run('update', {
                entity: entity,
                method: 'update',
                execParams: updateParams
            });
        }
    }
};

/**
 * Add a update update documents of envelope request to queue
 *
 * @method queueUpdate
 * @param {dsesEnvelope} envelope Envelope
 */
me.queueUpdateDocuments = function(envelopeID) {
    ds.run('insert', {
        fieldList: ['ID'],
        entity: 'ubq_messages',
        execParams: {
            queueCode: "dses",
            msgCmd: 'updateDocuments',
            msgData: JSON.stringify({envelopeID: envelopeID}),
            msgPriority: 0
        }
    });
}
/**
 * Read queue with code 'dsesUpdate' and update documents
 * @param {ubMethodParams} ctxt
 * @returns {String}
 */
me.updateQueueDocuments = function(ctxt) {
    let envelopesCount = 0;

    console.log('Call JS method: dses_envelope.createQueueEnvelopes');
    let accountId;

    inst = UB.Repository('ubq_messages')
        .attrs(['ID', 'queueCode', 'msgCmd', 'msgData'])
        .where('[queueCode]', '=', 'dses')
        .where('[msgCmd]', '=', 'updateDocuments')
        .where('[completeDate]', 'isNull')
        .limit(100)
//        .orderByDesc('[msgPriority]')
        .select();

    while (!inst.eof){
        if (!accountId) {
            accountId = docusignLogin();
        }
        const {envelopeID} = JSON.parse(inst.get('msgData'));
        //addEnvelope(params, accountId);
        me.updateDocuments(envelopeID, accountId)
        envelopesCount++;
        inst.run('success', {
            ID: inst.get('ID')
        });
        App.dbCommit(inst.entity.connectionName);
        inst.next();
    }
    return `Updated documents of ${envelopesCount} envelopes`;
}
