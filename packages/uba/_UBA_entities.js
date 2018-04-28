/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * @module @unitybase/uba
 */

/**
 * Advanced security
 * @extends EntityModule
 */
class uba_advSecurity_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_advSecurity_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * @type {String}
  */
  editCause: '',
 /**
  * @type {String}
  */
  allowedIP: null,
 /**
  * @type {Boolean}
  */
  refreshIP: undefined,
 /**
  * @type {String}
  */
  fp: null,
 /**
  * @type {Boolean}
  */
  refreshFp: undefined,
 /**
  * @type {String}
  */
  keyMediaName: null,
 /**
  * @type {Boolean}
  */
  refreshKeyMedia: undefined,
 /**
  * JSON with advanced settings
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
* Advanced security
* @type {uba_advSecurity_object}
*/
const uba_advSecurity = new uba_advSecurity_object()
/**
 * Attribute level security (ALS)
 * @extends EntityModule
 */
class uba_als_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_als_object.attrs = {
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
* Attribute level security (ALS)
* @type {uba_als_object}
*/
const uba_als = new uba_als_object()
/**
 * Аудит
 * @extends EntityModule
 */
class uba_audit_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_audit_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Сутність
  * @type {String}
  */
  entity: '',
 /**
  * ID запису сутності
  * @type {Number}
  */
  entityinfo_id: 0,
 /**
  * Дія
  * @type {String}
  */
  actionType: '',
 /**
  * Користувач
  * @type {String}
  */
  actionUser: '',
 /**
  * Час дії
  * @type {Date}
  */
  actionTime: new Date(),
 /**
  * IP адреса сторони, з якої здійснено виклик
  * @type {String}
  */
  remoteIP: null,
 /**
  * Ім&#39;я користувача, який змінив дані
  * @type {String}
  */
  targetUser: null,
 /**
  * Роль користувача, який змінив дані
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
* Аудит
* @type {uba_audit_object}
*/
const uba_audit = new uba_audit_object()
/**
 * Аудит
 * @extends EntityModule
 */
class uba_auditTrail_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_auditTrail_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Сутність
  * @type {String}
  */
  entity: '',
 /**
  * ID запису сутності
  * @type {Number}
  */
  entityinfo_id: 0,
 /**
  * Дія
  * @type {String}
  */
  actionType: '',
 /**
  * Користувач -> uba_user
  * @type {Number}
  */
  actionUser: 0,
 /**
  * Час дії
  * @type {Date}
  */
  actionTime: new Date(),
 /**
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
* Аудит
* @type {uba_auditTrail_object}
*/
const uba_auditTrail = new uba_auditTrail_object()
/**
 * Entity Level Security(ELS)
 * @extends EntityModule
 */
class uba_els_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_els_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Код ELS правила
  * @type {String}
  */
  code: null,
 /**
  * Опис правила
  * @type {String}
  */
  description: '',
 /**
  * Правило відключено
  * @type {Boolean}
  */
  disabled: undefined,
 /**
  * @type {String}
  */
  entityMask: '',
 /**
  * @type {String}
  */
  methodMask: '',
 /**
  * Тип правила
  * @type {String}
  */
  ruleType: '',
 /**
  * Роль, для якої застосовувати правило -> uba_role
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
* Entity Level Security(ELS)
* @type {uba_els_object}
*/
const uba_els = new uba_els_object()
/**
 * User groups
 * @extends EntityModule
 */
class uba_group_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_group_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Group code. Used by APIs and scripts
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
* @type {uba_group_object}
*/
const uba_group = new uba_group_object()
/**
 * Ролі груп
 * @extends EntityModule
 */
class uba_grouprole_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_grouprole_object.attrs = {
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
* Ролі груп
* @type {uba_grouprole_object}
*/
const uba_grouprole = new uba_grouprole_object()
/**
 * Одноразові паролі
 * @extends EntityModule
 */
class uba_otp_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_otp_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Згенерований одноразовий пароль
  * @type {String}
  */
  otp: '',
 /**
  * Користувач, для якого згенеровано пароль -> uba_user
  * @type {Number}
  */
  userID: 0,
 /**
  * Додаткові дані
  * @type {String}
  */
  uData: null,
 /**
  * Термін дії
  * @type {Date}
  */
  expiredDate: new Date(),
 /**
  * Вид паролю(Email, SMS тощо)
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
* Одноразові паролі
* @type {uba_otp_object}
*/
const uba_otp = new uba_otp_object()
/**
 * Попередні паролі
 * @extends EntityModule
 */
class uba_prevPasswordsHash_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_prevPasswordsHash_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
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
* Попередні паролі
* @type {uba_prevPasswordsHash_object}
*/
const uba_prevPasswordsHash = new uba_prevPasswordsHash_object()
/**
 * Системні ролі
 * @extends EntityModule
 */
class uba_role_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_role_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  name: '',
 /**
  * @type {String}
  */
  description: '',
 /**
  * Час, після якого сесія видаляється по таймауту (в хвилинах)
  * @type {Number}
  */
  sessionTimeout: 0,
 /**
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
* Системні ролі
* @type {uba_role_object}
*/
const uba_role = new uba_role_object()
/**
 * Суб&#39;єкти адміністрування
 * @extends EntityModule
 */
class uba_subject_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_subject_object.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
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
  sType: '',
 /**
  * @type {String}
  */
  mi_unityEntity: '',
}
/**
* Суб&#39;єкти адміністрування
* @type {uba_subject_object}
*/
const uba_subject = new uba_subject_object()
/**
 * Користувачі
 * @extends EntityModule
 */
class uba_user_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_user_object.attrs = {
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
  * Email користувача (може бути виконистано для повідомленнь)
  * @type {String}
  */
  email: null,
 /**
  * Телефон користувача (може бути виконистано для СМС)
  * @type {String}
  */
  phone: null,
 /**
  * Аватар користувача (рекомендується 128x128)
  * @type {String}
  */
  avatar: null,
 /**
  * Additional description of user account
  * @type {String}
  */
  description: null,
 /**
  * Додаткові дані
  * @type {String}
  */
  uData: null,
 /**
  * @type {Boolean}
  */
  disabled: undefined,
 /**
  * Користувач очікує на підтверждення реєстрації
  * @type {Boolean}
  */
  isPending: undefined,
 /**
  * @type {String}
  */
  trustedIP: null,
 /**
  * @type {String}
  */
  uPasswordHashHexa: null,
 /**
  * Дата останньої зміни пароля
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
* Користувачі
* @type {uba_user_object}
*/
const uba_user = new uba_user_object()
/**
 * Сертифікати
 * @extends EntityModule
 */
class uba_usercertificate_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_usercertificate_object.attrs = {
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
* Сертифікати
* @type {uba_usercertificate_object}
*/
const uba_usercertificate = new uba_usercertificate_object()
/**
 * Групи користувачів
 * @extends EntityModule
 */
class uba_usergroup_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_usergroup_object.attrs = {
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
* Групи користувачів
* @type {uba_usergroup_object}
*/
const uba_usergroup = new uba_usergroup_object()
/**
 * Ролі користувача
 * @extends EntityModule
 */
class uba_userrole_object extends EntityModule {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
uba_userrole_object.attrs = {
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
* Ролі користувача
* @type {uba_userrole_object}
*/
const uba_userrole = new uba_userrole_object()
