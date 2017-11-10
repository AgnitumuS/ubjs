/* eslint-disable camelcase,no-unused-vars */
// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Advanced security
* @mixes EventEmitter
*/
global.uba_advSecurity = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Advanced security"
* @class
*/
function uba_advSecurity_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * User (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Cause of change 
  * @type {String}
  */
  this.editCause = ''
  /**
  * Allowed IP address 
  * @type {String}
  */
  this.allowedIP = null
  /**
  * Refresh allowed IP 
  * @type {Boolean}
  */
  this.refreshIP = undefined
  /**
  * Fingerpring 
  * @type {String}
  */
  this.fp = null
  /**
  * Refresh fingerpring 
  * @type {Boolean}
  */
  this.refreshFp = undefined
  /**
  * Key media name 
  * @type {String}
  */
  this.keyMediaName = null
  /**
  * Refresh key media name 
  * @type {Boolean}
  */
  this.refreshKeyMedia = undefined
  /**
  * Additional 
  * JSON with advanced settings
  * @type {String}
  */
  this.additional = null
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Attribute level security (ALS)
* @mixes EventEmitter
*/
global.uba_als = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Attribute level security (ALS)"
* @class
*/
function uba_als_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Сутність 
  * @type {String}
  */
  this.entity = ''
  /**
  * Атрибут 
  * @type {String}
  */
  this.attribute = ''
  /**
  * Код стану 
  * @type {String}
  */
  this.state = ''
  /**
  * Назва ролі 
  * @type {String}
  */
  this.roleName = ''
  /**
  * Дозволені дії 
  * @type {Number}
  */
  this.actions = 0
}
/**
* Аудит
* @mixes EventEmitter
*/
global.uba_audit = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Аудит"
* @class
*/
function uba_audit_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Сутність 
  * Сутність
  * @type {String}
  */
  this.entity = ''
  /**
  * ID запису сутності 
  * ID запису сутності
  * @type {Number}
  */
  this.entityinfo_id = 0
  /**
  * Дія 
  * Дія
  * @type {String}
  */
  this.actionType = ''
  /**
  * Користувач 
  * Користувач
  * @type {String}
  */
  this.actionUser = ''
  /**
  * Час дії 
  * Час дії
  * @type {Date}
  */
  this.actionTime = new Date()
  /**
  * IP адреса 
  * IP адреса сторони, з якої здійснено виклик
  * @type {String}
  */
  this.remoteIP = null
  /**
  * Цільовий користувач 
  * Ім&#39;я користувача, який змінив дані
  * @type {String}
  */
  this.targetUser = null
  /**
  * Цільова роль 
  * Роль користувача, який змінив дані
  * @type {String}
  */
  this.targetRole = null
  /**
  * Було значення 
  * @type {String}
  */
  this.fromValue = null
  /**
  * Стало значення 
  * @type {String}
  */
  this.toValue = null
}
/**
* Аудит
* @mixes EventEmitter
*/
global.uba_auditTrail = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Аудит"
* @class
*/
function uba_auditTrail_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Сутність 
  * Сутність
  * @type {String}
  */
  this.entity = ''
  /**
  * ID запису сутності 
  * ID запису сутності
  * @type {Number}
  */
  this.entityinfo_id = 0
  /**
  * Дія 
  * Дія
  * @type {String}
  */
  this.actionType = ''
  /**
  * Користувач (ref -> uba_user)
  * Користувач
  * @type {Number}
  */
  this.actionUser = 0
  /**
  * Час дії 
  * Час дії
  * @type {Date}
  */
  this.actionTime = new Date()
  /**
  * IP адреса 
  * @type {String}
  */
  this.remoteIP = null
  /**
  * Було значення 
  * @type {String}
  */
  this.fromValue = null
  /**
  * Стало значення 
  * @type {String}
  */
  this.toValue = null
  /**
  * Батьківська сутність 
  * @type {String}
  */
  this.parentEntity = null
  /**
  * ID запису батьківської сутності 
  * @type {Number}
  */
  this.parentEntityInfo_id = null
}
/**
* Entity Level Security(ELS)
* @mixes EventEmitter
*/
global.uba_els = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Entity Level Security(ELS)"
* @class
*/
function uba_els_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код правила 
  * Код ELS правила
  * @type {String}
  */
  this.code = null
  /**
  * Опис 
  * Опис правила
  * @type {String}
  */
  this.description = ''
  /**
  * Відключено 
  * Правило відключено
  * @type {Boolean}
  */
  this.disabled = undefined
  /**
  * Маска сутності 
  * @type {String}
  */
  this.entityMask = ''
  /**
  * Маска методів 
  * @type {String}
  */
  this.methodMask = ''
  /**
  * Тип правила 
  * Тип правила
  * @type {String}
  */
  this.ruleType = ''
  /**
  * Роль (ref -> uba_role)
  * Роль, для якої застосовувати правило
  * @type {Number}
  */
  this.ruleRole = 0
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* User groups
* @mixes EventEmitter
*/
global.uba_group = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "User groups"
* @class
*/
function uba_group_object () {
  /**
  *  (ref -> uba_subject)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Code 
  * Group code. Used by APIs and scripts
  * @type {String}
  */
  this.code = ''
  /**
  * Name 
  * @type {String}
  */
  this.name = ''
  /**
  * Description 
  * @type {String}
  */
  this.description = null
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Ролі груп
* @mixes EventEmitter
*/
global.uba_grouprole = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Ролі груп"
* @class
*/
function uba_grouprole_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Група (ref -> uba_group)
  * @type {Number}
  */
  this.groupID = 0
  /**
  * Роль (ref -> uba_role)
  * @type {Number}
  */
  this.roleID = 0
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Одноразові паролі
* @mixes EventEmitter
*/
global.uba_otp = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Одноразові паролі"
* @class
*/
function uba_otp_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Пароль 
  * Згенерований одноразовий пароль
  * @type {String}
  */
  this.otp = ''
  /**
  * Користувач (ref -> uba_user)
  * Користувач, для якого згенеровано пароль
  * @type {Number}
  */
  this.userID = 0
  /**
  * Додаткові дані 
  * Додаткові дані
  * @type {String}
  */
  this.uData = null
  /**
  * Термін дії 
  * Термін дії
  * @type {Date}
  */
  this.expiredDate = new Date()
  /**
  * Вид паролю 
  * Вид паролю(Email, SMS тощо)
  * @type {String}
  */
  this.otpKind = ''
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
  /**
  *  
  * Deletion date
  * 
  * @type {Date}
  */
  this.mi_deleteDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who delete row
  * 
  * @type {Number}
  */
  this.mi_deleteUser = null
}
/**
* Попередні паролі
* @mixes EventEmitter
*/
global.uba_prevPasswordsHash = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Попередні паролі"
* @class
*/
function uba_prevPasswordsHash_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Користувач (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Хеш паролю 
  * @type {String}
  */
  this.uPasswordHashHexa = null
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Системні ролі
* @mixes EventEmitter
*/
global.uba_role = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Системні ролі"
* @class
*/
function uba_role_object () {
  /**
  *  (ref -> uba_subject)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Роль 
  * @type {String}
  */
  this.name = ''
  /**
  * Опис 
  * @type {String}
  */
  this.description = ''
  /**
  * Час дії сесії 
  * Час, після якого сесія видаляється по таймауту (в хвилинах)
  * @type {Number}
  */
  this.sessionTimeout = 0
  /**
  * Які методи застосування можна виконувати 
  * @type {String}
  */
  this.allowedAppMethods = null
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Суб&#39;єкти адміністрування
* @mixes EventEmitter
*/
global.uba_subject = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Суб&#39;єкти адміністрування"
* @class
*/
function uba_subject_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * @type {String}
  */
  this.code = ''
  /**
  * Логін 
  * @type {String}
  */
  this.name = ''
  /**
  * Тип суб&#39;єкта 
  * @type {String}
  */
  this.sType = ''
  /**
  *  
  * 
  * @type {String}
  */
  this.mi_unityEntity = ''
}
/**
* Користувачі
* @mixes EventEmitter
*/
global.uba_user = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Користувачі"
* @class
*/
function uba_user_object () {
  /**
  *  (ref -> uba_subject)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Логін 
  * User login in lower case
  * @type {String}
  */
  this.name = ''
  /**
  * Ім&#39;я 
  * @type {String}
  */
  this.firstName = null
  /**
  * Прізвище 
  * @type {String}
  */
  this.lastName = null
  /**
  * ПІБ 
  * @type {String}
  */
  this.fullName = null
  /**
  * Стать 
  * 
  * @type {String}
  */
  this.gender = null
  /**
  * Email 
  * Email користувача (може бути виконистано для повідомленнь)
  * 
  * @type {String}
  */
  this.email = null
  /**
  * Телефон 
  * Телефон користувача (може бути виконистано для СМС)
  * 
  * @type {String}
  */
  this.phone = null
  /**
  * Аватар 
  * Аватар користувача (рекомендується 128x128)
  * 
  * @type {String}
  */
  this.avatar = null
  /**
  * Опис 
  * Additional description of user account
  * 
  * @type {String}
  */
  this.description = null
  /**
  * Додаткові дані 
  * Додаткові дані
  * 
  * @type {String}
  */
  this.uData = null
  /**
  * Відключений 
  * @type {Boolean}
  */
  this.disabled = undefined
  /**
  * Очікує підтвердження 
  * Користувач очікує на підтверждення реєстрації
  * @type {Boolean}
  */
  this.isPending = undefined
  /**
  * trusted IPs 
  * 
  * @type {String}
  */
  this.trustedIP = null
  /**
  * Хеш пароля 
  * 
  * @type {String}
  */
  this.uPasswordHashHexa = null
  /**
  * Дата останньої зміни пароля 
  * Дата останньої зміни пароля
  * 
  * @type {Date}
  */
  this.lastPasswordChangeDate = new Date()
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Сертифікати
* @mixes EventEmitter
*/
global.uba_usercertificate = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Сертифікати"
* @class
*/
function uba_usercertificate_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Користувач (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Серійний ключ ЦСК 
  * Issuer tag of cerificate
  * @type {String}
  */
  this.issuer_serial = ''
  /**
  * Назва ЦСК 
  * @type {String}
  */
  this.issuer_cn = null
  /**
  * Серійний номер 
  * Serial number of cerificate
  * @type {String}
  */
  this.serial = ''
  /**
  * Сертифікат 
  * Binary data of certificate
  * @type {ArrayBuffer}
  */
  this.certificate = undefined
  /**
  * Опис 
  * @type {String}
  */
  this.description = null
  /**
  * Відключений 
  * disabled
  * @type {Boolean}
  */
  this.disabled = undefined
  /**
  * Відкликаний 
  * Revoked
  * @type {Boolean}
  */
  this.revoked = undefined
  /**
  * Revocation date 
  * Revocation date
  * @type {Date}
  */
  this.revocationDate = null
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Групи користувачів
* @mixes EventEmitter
*/
global.uba_usergroup = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Групи користувачів"
* @class
*/
function uba_usergroup_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Користувач (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Група (ref -> uba_group)
  * @type {Number}
  */
  this.groupID = 0
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
/**
* Ролі користувача
* @mixes EventEmitter
*/
global.uba_userrole = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Ролі користувача"
* @class
*/
function uba_userrole_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Користувач (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Роль (ref -> uba_role)
  * @type {Number}
  */
  this.roleID = 0
  /**
  *  (ref -> uba_user)
  * Row owner
  * 
  * @type {Number}
  */
  this.mi_owner = 0
  /**
  *  
  * Creation date
  * 
  * @type {Date}
  */
  this.mi_createDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who create row
  * 
  * @type {Number}
  */
  this.mi_createUser = 0
  /**
  *  
  * Modification date
  * 
  * @type {Date}
  */
  this.mi_modifyDate = new Date()
  /**
  *  (ref -> uba_user)
  * User who modify row
  * 
  * @type {Number}
  */
  this.mi_modifyUser = 0
}
