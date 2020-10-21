/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * UnityBase udisk
 * @version 5.0.146
 * @module @unitybase/udisk
 */

/**
 * Files
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes tree
 * @mixes softLock
 */
class udisk_card_ns extends EntityNamespace {}

/**
 * @typedef udiskCardAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} name - Name
 * @property {Number|udiskCardAttrs} parentID - Folder
 * @property {String} fcomment - Comment
 * @property {Boolean} isFolder - Is folder
 * @property {Number|ubaUserAttrs} ownerID - owner
 * @property {Number} fsize - Size
 * @property {String} contentType - Type
 * @property {Boolean} isTemporary - Temporary
 * @property {String} fileData - File
 * @property {Number} objectID - Related object ID
 * @property {String} objectEntity - Related object entity name
 * @property {String} mi_treePath
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskCardAttrs}
 */
udisk_card_ns.attrs = {}

/**
* Files
* @type {udisk_card_ns}
*/
const udisk_card = new udisk_card_ns()
/**
 * Access rights
 * @extends EntityNamespace
 * @mixes mStorage
 */
class udisk_permission_ns extends EntityNamespace {}

/**
 * @typedef udiskPermissionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|udiskCardAttrs} cardID - File
 * @property {Number|ubaSubjectAttrs} userID - User
 * @property {String|ubmEnumAttrs} accessType - Access type
 * @property {Number|udiskPermissionAttrs} parentID - parentID
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskPermissionAttrs}
 */
udisk_permission_ns.attrs = {}

/**
* Access rights
* @type {udisk_permission_ns}
*/
const udisk_permission = new udisk_permission_ns()
/**
 * Files
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes tree
 * @mixes softLock
 */
class udisk_secretcard_ns extends EntityNamespace {}

/**
 * @typedef udiskSecretcardAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} name - Name
 * @property {Number|udiskSecretcardAttrs} parentID - Folder
 * @property {String} fcomment - Comment
 * @property {Boolean} isFolder - Is folder
 * @property {Number|ubaUserAttrs} ownerID - Owner
 * @property {Number} fsize - Size
 * @property {String} contentType - Type
 * @property {Boolean} isTemporary - Temporary
 * @property {String} fileData - File
 * @property {String} mi_treePath
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskSecretcardAttrs}
 */
udisk_secretcard_ns.attrs = {}

/**
* Files
* @type {udisk_secretcard_ns}
*/
const udisk_secretcard = new udisk_secretcard_ns()
/**
 * Files
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes tree
 * @mixes softLock
 */
class udisk_servicecard_ns extends EntityNamespace {}

/**
 * @typedef udiskServicecardAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} name - Name
 * @property {Number|udiskServicecardAttrs} parentID - Folder
 * @property {String} fcomment - Comment
 * @property {Boolean} isFolder - Is folder
 * @property {Number|ubaUserAttrs} ownerID - Owner
 * @property {Number} fsize - Size
 * @property {String} contentType - Type
 * @property {Boolean} isTemporary - Temporary
 * @property {String} fileData - File
 * @property {String} mi_treePath
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskServicecardAttrs}
 */
udisk_servicecard_ns.attrs = {}

/**
* Files
* @type {udisk_servicecard_ns}
*/
const udisk_servicecard = new udisk_servicecard_ns()
/**
 * Access rights
 * @extends EntityNamespace
 * @mixes mStorage
 */
class udisk_spermission_ns extends EntityNamespace {}

/**
 * @typedef udiskSpermissionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|udiskSecretcardAttrs} cardID - File
 * @property {Number|ubaSubjectAttrs} userID - User
 * @property {String|ubmEnumAttrs} accessType - Access type
 * @property {Number|udiskSpermissionAttrs} parentID - parentID
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskSpermissionAttrs}
 */
udisk_spermission_ns.attrs = {}

/**
* Access rights
* @type {udisk_spermission_ns}
*/
const udisk_spermission = new udisk_spermission_ns()
/**
 * Access rights
 * @extends EntityNamespace
 * @mixes mStorage
 */
class udisk_srvpermission_ns extends EntityNamespace {}

/**
 * @typedef udiskSrvpermissionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|udiskServicecardAttrs} cardID - File
 * @property {Number|ubaSubjectAttrs} userID - User
 * @property {String|ubmEnumAttrs} accessType - Access type
 * @property {Number|udiskSrvpermissionAttrs} parentID - parentID
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {udiskSrvpermissionAttrs}
 */
udisk_srvpermission_ns.attrs = {}

/**
* Access rights
* @type {udisk_srvpermission_ns}
*/
const udisk_srvpermission = new udisk_srvpermission_ns()
