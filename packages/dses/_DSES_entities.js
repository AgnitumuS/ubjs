// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Docusing document
* @mixes EventEmitter
* @mixes RequiredModule
*/
var dses_document = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Docusing document"
* @class
*/
function dses_document_object()  {
    /**
    *  
    * 
    * @type {Number}
    */
    this.ID = 0;
    /**
    * Envelope (ref -> dses_envelope)
    * Envelope
    * @type {Number}
    */
    this.envelope = 0;
    /**
    * Docusign ID 
    * Docusign ID of document in envelop
    * @type {String}
    */
    this.docusign_ID = '';
    /**
    * Document entity 
    * Entity from witch this document is getted
    * @type {String}
    */
    this.document_entity = '';
    /**
    * Document attribute 
    * Attribute of entity from witch this document is getted
    * @type {String}
    */
    this.document_attribute = '';
    /**
    * Document ID 
    * ID of entity from witch this document is getted
    * @type {Number}
    */
    this.document_ID = 0;
    /**
    *  (ref -> uba_user)
    * Row owner
    * 
    * @type {Number}
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * 
    * @type {Date}
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * 
    * @type {Number}
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * 
    * @type {Date}
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * 
    * @type {Number}
    */
    this.mi_modifyUser = 0;
    /**
    *  
    * Deletion date
    * 
    * @type {Date}
    */
    this.mi_deleteDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who delete row
    * 
    * @type {Number}
    */
    this.mi_deleteUser = 0;
}

/**
* Docusing envelope
* @mixes EventEmitter
* @mixes RequiredModule
*/
var dses_envelope = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Docusing envelope"
* @class
*/
function dses_envelope_object()  {
    /**
    *  
    * 
    * @type {Number}
    */
    this.ID = 0;
    /**
    * envelopeID 
    * Internal Docusing envelopeID
    * @type {String}
    */
    this.envelopeID = '';
    /**
    * entity 
    * entity than initialized this envelop and receive emited events
    * @type {String}
    */
    this.entity = '';
    /**
    * entity ID 
    * entity ID
    * @type {Number}
    */
    this.entityID = 0;
    /**
    *  (ref -> uba_user)
    * Row owner
    * 
    * @type {Number}
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * 
    * @type {Date}
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * 
    * @type {Number}
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * 
    * @type {Date}
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * 
    * @type {Number}
    */
    this.mi_modifyUser = 0;
    /**
    *  
    * Deletion date
    * 
    * @type {Date}
    */
    this.mi_deleteDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who delete row
    * 
    * @type {Number}
    */
    this.mi_deleteUser = 0;
}

/**
* Docusing log
* @mixes EventEmitter
* @mixes RequiredModule
*/
var dses_log = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Docusing log"
* @class
*/
function dses_log_object()  {
    /**
    *  
    * 
    * @type {Number}
    */
    this.ID = 0;
    /**
    * Envelope (ref -> dses_envelope)
    * Envelope
    * @type {Number}
    */
    this.envelope = 0;
    /**
    * Log data 
    * Log data
    * @type {String}
    */
    this.data = '';
    /**
    *  (ref -> uba_user)
    * Row owner
    * 
    * @type {Number}
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * 
    * @type {Date}
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * 
    * @type {Number}
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * 
    * @type {Date}
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * 
    * @type {Number}
    */
    this.mi_modifyUser = 0;
    /**
    *  
    * Deletion date
    * 
    * @type {Date}
    */
    this.mi_deleteDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who delete row
    * 
    * @type {Number}
    */
    this.mi_deleteUser = 0;
}

/**
* Docusing signer
* @mixes EventEmitter
* @mixes RequiredModule
*/
var dses_signer = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Docusing signer"
* @class
*/
function dses_signer_object()  {
    /**
    *  
    * 
    * @type {Number}
    */
    this.ID = 0;
    /**
    * Envelope (ref -> dses_envelope)
    * Envelope
    * @type {Number}
    */
    this.envelope = 0;
    /**
    * Docusign ID 
    * Docusign ID of signer in envelop
    * @type {String}
    */
    this.docusign_ID = '';
    /**
    * Signer name 
    * Signer name
    * @type {String}
    */
    this.name = '';
    /**
    * Signer email 
    * Signer email
    * @type {String}
    */
    this.email = '';
    /**
    *  (ref -> uba_user)
    * Row owner
    * 
    * @type {Number}
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * 
    * @type {Date}
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * 
    * @type {Number}
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * 
    * @type {Date}
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * 
    * @type {Number}
    */
    this.mi_modifyUser = 0;
    /**
    *  
    * Deletion date
    * 
    * @type {Date}
    */
    this.mi_deleteDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who delete row
    * 
    * @type {Number}
    */
    this.mi_deleteUser = 0;
}

