// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Files
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_card = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Files"
* @class
*/
function udisk_card_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Name 
    * Name
    * @type {String}
    */
    this.name = '';
    /**
    * Folder (ref -> udisk_card)
    * Folder
    * @type {Number}
    * @protected
    */
    this.parentID = 0;
    /**
    * Comment 
    * Comment
    * @type {String}
    */
    this.fcomment = '';
    /**
    * Is folder 
    * Is folder
    * @type {Boolean}
    */
    this.isFolder = undefined;
    /**
    * owner (ref -> uba_user)
    * owner
    * @type {Number}
    */
    this.ownerID = 0;
    /**
    * size 
    * size
    * @type {Number}
    */
    this.fsize = 0;
    /**
    * contentType 
    * contentType
    * @type {String}
    */
    this.contentType = '';
    /**
    * Temporary 
    * Temporary
    * @type {Boolean}
    */
    this.isTemporary = undefined;
    /**
    * file 
    * file
    * @type {String}
    */
    this.fileData = '';
    /**
    *  
    * @type {String}
    * @protected
    */
    this.mi_treePath = '';
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

/**
* Общий доступ
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_permission = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Общий доступ"
* @class
*/
function udisk_permission_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Card (ref -> udisk_card)
    * Card
    * @type {Number}
    */
    this.cardID = 0;
    /**
    * user (ref -> uba_subject)
    * user
    * @type {Number}
    */
    this.userID = 0;
    /**
    * Access type 
    * Access type ### owner, read, write, delegate 
    * @type {String}
    */
    this.accessType = '';
    /**
    * parentID (ref -> udisk_permission)
    * parentID
    * @type {Number}
    */
    this.parentID = 0;
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

/**
* Files
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_secretcard = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Files"
* @class
*/
function udisk_secretcard_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Name 
    * Name
    * @type {String}
    */
    this.name = '';
    /**
    * Folder (ref -> udisk_secretcard)
    * Folder
    * @type {Number}
    * @protected
    */
    this.parentID = 0;
    /**
    * Comment 
    * Comment
    * @type {String}
    */
    this.fcomment = '';
    /**
    * Is folder 
    * Is folder
    * @type {Boolean}
    */
    this.isFolder = undefined;
    /**
    * owner (ref -> uba_user)
    * owner
    * @type {Number}
    */
    this.ownerID = 0;
    /**
    * size 
    * size
    * @type {Number}
    */
    this.fsize = 0;
    /**
    * contentType 
    * contentType
    * @type {String}
    */
    this.contentType = '';
    /**
    * Temporary 
    * Temporary
    * @type {Boolean}
    */
    this.isTemporary = undefined;
    /**
    * file 
    * file
    * @type {String}
    */
    this.fileData = '';
    /**
    *  
    * @type {String}
    * @protected
    */
    this.mi_treePath = '';
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

/**
* Files
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_servicecard = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Files"
* @class
*/
function udisk_servicecard_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Name 
    * Name
    * @type {String}
    */
    this.name = '';
    /**
    * Folder (ref -> udisk_servicecard)
    * Folder
    * @type {Number}
    * @protected
    */
    this.parentID = 0;
    /**
    * Comment 
    * Comment
    * @type {String}
    */
    this.fcomment = '';
    /**
    * Is folder 
    * Is folder
    * @type {Boolean}
    */
    this.isFolder = undefined;
    /**
    * owner (ref -> uba_user)
    * owner
    * @type {Number}
    */
    this.ownerID = 0;
    /**
    * size 
    * size
    * @type {Number}
    */
    this.fsize = 0;
    /**
    * contentType 
    * contentType
    * @type {String}
    */
    this.contentType = '';
    /**
    * Temporary 
    * Temporary
    * @type {Boolean}
    */
    this.isTemporary = undefined;
    /**
    * file 
    * file
    * @type {String}
    */
    this.fileData = '';
    /**
    *  
    * @type {String}
    * @protected
    */
    this.mi_treePath = '';
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

/**
* Общий доступ
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_spermission = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Общий доступ"
* @class
*/
function udisk_spermission_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Card (ref -> udisk_secretcard)
    * Card
    * @type {Number}
    */
    this.cardID = 0;
    /**
    * user (ref -> uba_subject)
    * user
    * @type {Number}
    */
    this.userID = 0;
    /**
    * Access type 
    * Access type ### owner, read, write, delegate 
    * @type {String}
    */
    this.accessType = '';
    /**
    * parentID (ref -> udisk_spermission)
    * parentID
    * @type {Number}
    */
    this.parentID = 0;
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

/**
* Общий доступ
* @mixes EventEmitter
* @mixes RequiredModule
*/
var udisk_srvpermission = {
  /** 
   * Reference to entity metadata
   * @type {TubEntity} 
   */
  entity: null
};

/**
* Attributes of "Общий доступ"
* @class
*/
function udisk_srvpermission_object()  {
    /**
    *  
    * @type {Number}
    * @protected
    */
    this.ID = 0;
    /**
    * Card (ref -> udisk_servicecard)
    * Card
    * @type {Number}
    */
    this.cardID = 0;
    /**
    * user (ref -> uba_subject)
    * user
    * @type {Number}
    */
    this.userID = 0;
    /**
    * Access type 
    * Access type ### owner, read, write, delegate 
    * @type {String}
    */
    this.accessType = '';
    /**
    * parentID (ref -> udisk_srvpermission)
    * parentID
    * @type {Number}
    */
    this.parentID = 0;
    /**
    *  (ref -> uba_user)
    * Row owner
    * @type {Number}
    * @protected
    */
    this.mi_owner = 0;
    /**
    *  
    * Creation date
    * @type {Date}
    * @protected
    */
    this.mi_createDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who create row
    * @type {Number}
    * @protected
    */
    this.mi_createUser = 0;
    /**
    *  
    * Modification date
    * @type {Date}
    * @protected
    */
    this.mi_modifyDate = new Date();
    /**
    *  (ref -> uba_user)
    * User who modify row
    * @type {Number}
    * @protected
    */
    this.mi_modifyUser = 0;
}

