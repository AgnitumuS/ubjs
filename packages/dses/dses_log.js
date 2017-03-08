/**
 * Created by v.orel on 22.09.2016.
 */
const me = dses_log,
    ds = new TubDataStore('dses_envelope');
me.on('insert:after',
    /**
     *
     * @param {ubMethodParams} ctxt
     */
    function(ctxt){
        const execParams = ctxt.mParams.execParams,
            data = JSON.parse(execParams.data),
            envelope = execParams.envelope;
        UB.Repository('dses_envelope').attrs(['entity', 'entityID', 'envelopeID']).where('ID', '=', envelope).select(ds);
        if (!ds.eof){
            const entity = ds.get(0),
                entityID = ds.get(1),
                envelopeID = ds.get(2),
                status = data.DocuSignEnvelopeInformation.EnvelopeStatus.Status;

            global[entity].emit('dses:'+status, entityID, envelopeID, envelope);
        }
    });

/**
 * Fires for the {TubEntity} instance when docusign envelope is just successfully created
 *
 *      myEntity.on('dses:Created', function(id, envelopeID){
 *          console.log('docusign envelope is created for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Created
 */

/**
 * Fires for the {TubEntity} instance when the email notification, with a link to the envelope,
 * is sent to at least one recipient. The envelope remains in this state until all recipients have
 * viewed the envelope.
 *
 *      myEntity.on('dses:Sent', function(id, envelopeID){
 *          console.log('docusign envelope is sent for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Sent
 */

/**
 * Fires for the {TubEntity} instance when all recipients have opened the envelope through the DocuSign
 * signing website. This does not signify an email delivery of an envelope.
 *
 *      myEntity.on('dses:Sent', function(id, envelopeID){
 *          console.log('docusign envelope is delivered for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Delivered
 */

/**
 * Fires for the {TubEntity} instance when the envelope has been signed by all required recipients.
 * Note that this is a temporary state used during processing, after which the envelope is automatically
 * moved to Completed status.
 *
 *      myEntity.on('dses:Signed', function(id, envelopeID){
 *          console.log('docusign envelope is signed for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Signed
 */

/**
 * Fires for the {TubEntity} instance when the envelope has been completed by all the recipients.
 *
 *      myEntity.on('dses:Completed', function(id, envelopeID){
 *          console.log('docusign envelope is completed for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *          // there is a good idea call updateDocuments method for envelope
 *          dses_envelope.updateDocuments(envelopeID);
 *      });
 *
 * @event dses:Completed
 */

/**
 * Fires for the {TubEntity} instance when the envelope has been declined by one of the recipients.
 *
 *      myEntity.on('dses:Declined', function(id, envelopeID){
 *          console.log('docusign envelope is declined for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Declined
 */

/**
 * Fires for the {TubEntity} instance when the envelope has been voided by the sender.
 *
 *      myEntity.on('dses:Declined', function(id, envelopeID){
 *          console.log('docusign envelope is voided for entity myEntity. Entity id is', id, 'envelopeID is', envelopeID);
 *      });
 *
 * @event dses:Voided
 */
