/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * UnityBase Administrative model. Define users, roles and permissions
 * @version 5.0.10
 * @module @unitybase/uba
 */

/**
 * Advanced security settings.
 * For any authentication type add binding of user to IP address. For CERT additionaly add a binding to device fingerprint
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_advSecurity_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_advSecurity_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * Filled by supervisor to indicate cause of changes
  * @type {String}
  */
  editCause: '',
 /**
  * The ID address from which the user is allowed access. If empty - allowed from any
  * @type {String}
  */
  allowedIP: null,
 /**
  * If turned on will refresh allowed IP on firs user logon
  * @type {Boolean}
  */
  refreshIP: undefined,
 /**
  * Fingerprint of user device. If empty - not checked
  * @type {String}
  */
  fp: null,
 /**
  * If turned on will refresh Fingerpring of user device on firs user logon
  * @type {Boolean}
  */
  refreshFp: undefined,
 /**
  * Name of key media device
  * @type {String}
  */
  keyMediaName: null,
 /**
  * If turned on will refresh key media name of user private key device
  * @type {Boolean}
  */
  refreshKeyMedia: undefined,
 /**
  * JSON with advanced settings
  * This settings can be handled in Session.on login event
  * @type {String}
  */
  additional: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Advanced security settings.
 * For any authentication type add binding of user to IP address. For CERT additionaly add a binding to device fingerprint
* @type {uba_advSecurity_ns}
*/
const uba_advSecurity = new uba_advSecurity_ns()
/**
 * Attribute level security
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_als_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_als_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  entity: '',
 /**
  * @type {String}
  */
  attribute: '',
 /**
  * @type {String}
  */
  state: '',
 /**
  * @type {String}
  */
  roleName: '',
 /**
  * @type {Number}
  */
  actions: 0,
}
/**
* Attribute level security
* @type {uba_als_ns}
*/
const uba_als = new uba_als_ns()
/**
 * Security changes audit.
 * All changes to UBA model entities (except uba_als &amp; uba_subject) + user login related event are logged here
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_audit_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_audit_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  entity: '',
 /**
  * @type {Number}
  */
  entityinfo_id: 0,
 /**
  * Action
  * @type {String}
  */
  actionType: '',
 /**
  * User
  * @type {String}
  */
  actionUser: '',
 /**
  * Action time
  * @type {Date}
  */
  actionTime: new Date(),
 /**
  * Caller remote IP address
  * @type {String}
  */
  remoteIP: null,
 /**
  * The user name for which the data has changed
  * @type {String}
  */
  targetUser: null,
 /**
  * The role name for which the data has changed
  * @type {String}
  */
  targetRole: null,
 /**
  * @type {String}
  */
  fromValue: null,
 /**
  * @type {String}
  */
  toValue: null,
}
/**
* Security changes audit.
 * All changes to UBA model entities (except uba_als &amp; uba_subject) + user login related event are logged here
* @type {uba_audit_ns}
*/
const uba_audit = new uba_audit_ns()
/**
 * Data changes audit.
 * All DML statement for entity with mixin &#39;audit&#39; logged here
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_auditTrail_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_auditTrail_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  entity: '',
 /**
  * @type {Number}
  */
  entityinfo_id: 0,
 /**
  * Action
  * @type {String}
  */
  actionType: '',
 /**
  * User -> uba_user
  * @type {Number}
  */
  actionUser: 0,
 /**
  * Action time
  * @type {Date}
  */
  actionTime: new Date(),
 /**
  * Caller remote IP address. NULL in case of localhost
  * @type {String}
  */
  remoteIP: null,
 /**
  * @type {String}
  */
  fromValue: null,
 /**
  * @type {String}
  */
  toValue: null,
 /**
  * @type {String}
  */
  parentEntity: null,
 /**
  * @type {Number}
  */
  parentEntityInfo_id: null,
}
/**
* Data changes audit.
 * All DML statement for entity with mixin &#39;audit&#39; logged here
* @type {uba_auditTrail_ns}
*/
const uba_auditTrail = new uba_auditTrail_ns()
/**
 * Describe, which role have access permissions to Entities methods.
 * Administering of entity level. The system checks the access by the rule &quot;Allowed and NOT Prohibited&quot;
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_els_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_els_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code for ELS rule
  * This field is used by migrations for automatically update rules. It recommended to use your model code as rule prefix.
        We do not set this attribute to unique, because some external models use the same code for different rules.
        But all UnityBase models set this attribute to unique value
  * @type {String}
  */
  code: null,
 /**
  * Rule description
  * @type {String}
  */
  description: '',
 /**
  * Rule is disabled
  * @type {Boolean}
  */
  disabled: undefined,
 /**
  * <h4>Masks wildchars:</h4> <ul>
        <li>*	   	Matches any contiguous characters</li>
        <li>?	   	Matches any single characer</li>
        <li>[abc]  	Matches a or b or c at that position</li>
        <li>[^abc]	Matches anything but a or b or c at that position</li>
        <li>[!abc]	Matches anything but a or b or c at that position</li>
        <li>[a-e]  	Matches a through e at that position</li>
        <li>[abcx-z]  Matches a or b or c or x or y or or z, as does [a-cx-z]</li>
        </ul>
        Example: [iu]* match any string start from either 'i' or 'u' like: 'insetr', 'inner', 'update',...
  * @type {String}
  */
  entityMask: '',
 /**
  * Method mask
  * @type {String}
  */
  methodMask: '',
 /**
  * Rule type
  * @type {String}
  */
  ruleType: '',
 /**
  * Role for which the rule applies -> uba_role
  * @type {Number}
  */
  ruleRole: 0,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Describe, which role have access permissions to Entities methods.
 * Administering of entity level. The system checks the access by the rule &quot;Allowed and NOT Prohibited&quot;
* @type {uba_els_ns}
*/
const uba_els = new uba_els_ns()
/**
 * User groups
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class uba_group_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_group_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Group code. Used by APIs and scripts
  * Unique group code. Used by APIs and scripts
  * @type {String}
  */
  code: '',
 /**
  * @type {String}
  */
  name: '',
 /**
  * @type {String}
  */
  description: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* User groups
* @type {uba_group_ns}
*/
const uba_group = new uba_group_ns()
/**
 * Roles assigned to groups
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_grouprole_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_grouprole_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  groupID: 0,
 /**
  * @type {Number}
  */
  roleID: 0,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Roles assigned to groups
* @type {uba_grouprole_ns}
*/
const uba_grouprole = new uba_grouprole_ns()
/**
 * One time passwords.
 * One-time-password generation and verification
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_otp_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_otp_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Generated one time password
  * @type {String}
  */
  otp: '',
 /**
  * User for which password was generated -> uba_user
  * @type {Number}
  */
  userID: 0,
 /**
  * Additional  data
  * Any valid JSON object. This data transferred to client part as result of auth method. Also accessible in server methods vis Session.uData
  * @type {String}
  */
  uData: null,
 /**
  * Expired date
  * @type {Date}
  */
  expiredDate: new Date(),
 /**
  * Kind of otp(Email, SMS etc)
  * @type {String}
  */
  otpKind: '',
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
 /**
  * Deletion date
  * @type {Date}
  */
  mi_deleteDate: new Date(),
 /**
  * User who delete row -> uba_user
  * @type {Number}
  */
  mi_deleteUser: null,
}
/**
* One time passwords.
 * One-time-password generation and verification
* @type {uba_otp_ns}
*/
const uba_otp = new uba_otp_ns()
/**
 * Previous passwords hashes
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_prevPasswordsHash_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_prevPasswordsHash_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * PasswordHashHexa := SHA256('salt'+PasswordPlain) in UTF-8
  * @type {String}
  */
  uPasswordHashHexa: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Previous passwords hashes
* @type {uba_prevPasswordsHash_ns}
*/
const uba_prevPasswordsHash = new uba_prevPasswordsHash_ns()
/**
 * Administering subsystem roles
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class uba_role_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_role_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Role
  * @type {String}
  */
  name: '',
 /**
  * Description
  * @type {String}
  */
  description: '',
 /**
  * Time after which the session is deleted by timeout (in minutes)
  * @type {Number}
  */
  sessionTimeout: 0,
 /**
  * Which application level methods are allowed
  * @type {String}
  */
  allowedAppMethods: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Administering subsystem roles
* @type {uba_role_ns}
*/
const uba_role = new uba_role_ns()
/**
 * Administration subjects
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_subject_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_subject_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  code: '',
 /**
  * Login
  * @type {String}
  */
  name: '',
 /**
  * Subject type
  * @type {String}
  */
  sType: '',
 /**
  * @type {String}
  */
  mi_unityEntity: '',
}
/**
* Administration subjects
* @type {uba_subject_ns}
*/
const uba_subject = new uba_subject_ns()
/**
 * Users
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class uba_user_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_user_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * User login in lower case
  * @type {String}
  */
  name: '',
 /**
  * @type {String}
  */
  firstName: null,
 /**
  * @type {String}
  */
  lastName: null,
 /**
  * @type {String}
  */
  fullName: null,
 /**
  * @type {String}
  */
  gender: null,
 /**
  * User email (could be used for notifications)
  * @type {String}
  */
  email: null,
 /**
  * User phone (could be used for sms)
  * @type {String}
  */
  phone: null,
 /**
  * User avatar image (recommended 128x128)
  * @type {String}
  */
  avatar: null,
 /**
  * Additional description of user account
  * @type {String}
  */
  description: null,
 /**
  * Additional  data
  * Any valid JSON object. This data transferred to client part as result of auth method. Also accessible in server methods vis Session.uData
  * @type {String}
  */
  uData: null,
 /**
  * Disabled
  * @type {Boolean}
  */
  disabled: undefined,
 /**
  * The user is waiting for confirmation of registration
  * @type {Boolean}
  */
  isPending: undefined,
 /**
  * Semicolon separated list of allowed IPs for UBIP authentication schema. Warning! We recomend use it only for IPs from DMZ
  * @type {String}
  */
  trustedIP: null,
 /**
  * Password hash
  * PasswordHashHexa := SHA256('salt'+PasswordPlain) in UTF-8
  * @type {String}
  */
  uPasswordHashHexa: null,
 /**
  * Last password change date
  * @type {Date}
  */
  lastPasswordChangeDate: new Date(),
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Users
* @type {uba_user_ns}
*/
const uba_user = new uba_user_ns()
/**
 * User certificates.
 * used for Certificate authentification 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_usercertificate_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_usercertificate_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * Issuer tag of cerificate
  * @type {String}
  */
  issuer_serial: '',
 /**
  * @type {String}
  */
  issuer_cn: null,
 /**
  * Serial number of cerificate
  * @type {String}
  */
  serial: '',
 /**
  * Binary data of certificate
  * @type {ArrayBuffer}
  */
  certificate: undefined,
 /**
  * @type {String}
  */
  description: null,
 /**
  * disabled
  * @type {Boolean}
  */
  disabled: undefined,
 /**
  * Revoked
  * @type {Boolean}
  */
  revoked: undefined,
 /**
  * Revocation date
  * @type {Date}
  */
  revocationDate: null,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* User certificates.
 * used for Certificate authentification 
* @type {uba_usercertificate_ns}
*/
const uba_usercertificate = new uba_usercertificate_ns()
/**
 * User memberships in groups
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_usergroup_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_usergroup_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * @type {Number}
  */
  groupID: 0,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* User memberships in groups
* @type {uba_usergroup_ns}
*/
const uba_usergroup = new uba_usergroup_ns()
/**
 * Roles assigned to user
 * @extends EntityNamespace
 * @mixes mStorage
 */
class uba_userrole_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_userrole_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * @type {Number}
  */
  roleID: 0,
 /**
  * Row owner -> uba_user
  * @type {Number}
  */
  mi_owner: 0,
 /**
  * Creation date
  * @type {Date}
  */
  mi_createDate: new Date(),
 /**
  * User who create row -> uba_user
  * @type {Number}
  */
  mi_createUser: 0,
 /**
  * Modification date
  * @type {Date}
  */
  mi_modifyDate: new Date(),
 /**
  * User who modify row -> uba_user
  * @type {Number}
  */
  mi_modifyUser: 0,
}
/**
* Roles assigned to user
* @type {uba_userrole_ns}
*/
const uba_userrole = new uba_userrole_ns()
