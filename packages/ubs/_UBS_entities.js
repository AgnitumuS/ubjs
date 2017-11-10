/* eslint-disable camelcase,no-unused-vars */
// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Збережені фільтри
* @mixes EventEmitter
*/
global.ubs_filter = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Збережені фільтри"
* @class
*/
function ubs_filter_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код групи фільтрів
  * @type {String}
  */
  this.code = ''
  /**
  * Назва фільтра 
  * Filter name
  * @type {String}
  */
  this.name = ''
  /**
  * Текст фільтра 
  * filter
  * @type {String}
  */
  this.filter = ''
  /**
  * Загальний? 
  * Is global?
  * @type {Boolean}
  */
  this.isGlobal = undefined
  /**
  * Власник (ref -> uba_user)
  * Filter owner
  * @type {Number}
  */
  this.owner = 0
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
* Повідомлення
* @mixes EventEmitter
*/
global.ubs_message = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Повідомлення"
* @class
*/
function ubs_message_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Повідомлення 
  * @type {String}
  */
  this.messageBody = null
  /**
  * Доставляти повідомлення 
  * @type {Boolean}
  */
  this.complete = undefined
  /**
  * Тип 
  * @type {String}
  */
  this.messageType = ''
  /**
  * Дійсне з 
  * @type {Date}
  */
  this.startDate = new Date()
  /**
  * Дійсне до 
  * @type {Date}
  */
  this.expireDate = new Date()
  /**
  * Отримувачі повідомлень (ref -> ubs_message_recipient)
  * Отримувачі повідомлень
  * @type {Number}
  */
  this.recipients = null
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
* Повідомлення
* @mixes EventEmitter
*/
global.ubs_message_edit = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Повідомлення"
* @class
*/
function ubs_message_edit_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Повідомлення 
  * @type {String}
  */
  this.messageBody = null
  /**
  * Готове для відправки 
  * @type {Boolean}
  */
  this.complete = undefined
  /**
  * Тип 
  * @type {String}
  */
  this.messageType = ''
  /**
  * Дійсне з 
  * @type {Date}
  */
  this.startDate = new Date()
  /**
  * Дійсне до 
  * @type {Date}
  */
  this.expireDate = new Date()
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
* Отримувачі повідомлень
* @mixes EventEmitter
*/
global.ubs_message_recipient = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Отримувачі повідомлень"
* @class
*/
function ubs_message_recipient_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Повідомлення (ref -> ubs_message)
  * @type {Number}
  */
  this.messageID = 0
  /**
  * Користувач (ref -> uba_user)
  * @type {Number}
  */
  this.userID = 0
  /**
  * Дата підтвердження 
  * @type {Date}
  */
  this.acceptDate = null
}
/**
* Лічильник реєстраційних ключів
* @mixes EventEmitter
*/
global.ubs_numcounter = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Лічильник реєстраційних ключів"
* @class
*/
function ubs_numcounter_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Реєстраційний ключ 
  * Реєстраційний ключ
  * @type {String}
  */
  this.regKey = ''
  /**
  * Лічильник 
  * Лічильник
  * @type {Number}
  */
  this.counter = 0
}
/**
* Зарезервовані лічильники реєстраційних ключів
* @mixes EventEmitter
*/
global.ubs_numcounterreserv = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Зарезервовані лічильники реєстраційних ключів"
* @class
*/
function ubs_numcounterreserv_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Реєстраційний ключ 
  * Реєстраційний ключ
  * @type {String}
  */
  this.regKey = ''
  /**
  * Лічильник 
  * Лічильник
  * @type {Number}
  */
  this.counter = 0
  /**
  * Зарезервована дата 
  * Зарезервована дата документа
  * @type {String}
  */
  this.reservedDate = null
  /**
  * Note 
  * Description of reserved number (Department name, etc)
  * @type {String}
  */
  this.note = null
}
/**
* Шаблони звітів
* @mixes EventEmitter
*/
global.ubs_report = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Шаблони звітів"
* @class
*/
function ubs_report_object () {
  /**
  *  
  * @type {Number}
  */
  this.ID = 0
  /**
  * Модель 
  * Модель, де зберігається звіт
  * @type {String}
  */
  this.model = ''
  /**
  * Код звіту 
  * @type {String}
  */
  this.report_code = ''
  /**
  * Назва 
  * @type {String}
  */
  this.name = ''
  /**
  * Шаблон 
  * Шаблон звіту
  * @type {String}
  */
  this.template = null
  /**
  * Javascript code 
  * Javascript code
  * @type {String}
  */
  this.code = null
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
* Налаштування
* @mixes EventEmitter
*/
global.ubs_settings = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Налаштування"
* @class
*/
function ubs_settings_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Ключ 
  * Ключ налаштування
  * @type {String}
  */
  this.settingKey = ''
  /**
  * Назва 
  * Назва налаштування
  * @type {String}
  */
  this.name = ''
  /**
  * Опис 
  * Опис
  * @type {String}
  */
  this.description = null
  /**
  * Тип 
  * Тип значення
  * @type {String}
  */
  this.type = null
  /**
  * Значення 
  * Значення
  * @type {String}
  */
  this.settingValue = null
  /**
  * Значення за замовчуванням 
  * Значення за замовчуванням
  * @type {String}
  */
  this.defaultValue = null
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
* Soft lock
* @mixes EventEmitter
*/
global.ubs_softLock = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Soft lock"
* @class
*/
function ubs_softLock_object () {
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
  * ID запису 
  * ID запису сутності
  * @type {Number}
  */
  this.lockID = 0
  /**
  * Користувач (ref -> uba_user)
  * Користувач, який заблокував запис
  * @type {Number}
  */
  this.lockUser = 0
  /**
  * Тип блокування 
  * Тип блокування
  * @type {String}
  */
  this.lockType = ''
  /**
  * Час блокування 
  * Час блокування
  * @type {Date}
  */
  this.lockTime = new Date()
}
/**
* 
* @mixes EventEmitter
*/
global.fts_ftsDefault = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of ""
* @class
*/
function fts_ftsDefault_object () {
  /**
  *  
  * @type {String}
  */
  this.ID = null
  /**
  *  
  * @type {Number}
  */
  this.rowid = null
  /**
  *  
  * @type {String}
  */
  this.entity = null
  /**
  *  
  * @type {String}
  */
  this.ftsentity = null
  /**
  *  
  * @type {String}
  */
  this.dy = null
  /**
  *  
  * @type {String}
  */
  this.dm = null
  /**
  *  
  * @type {String}
  */
  this.dd = null
  /**
  *  
  * @type {String}
  */
  this.datacode = null
  /**
  *  
  * @type {String}
  */
  this.aclrls = null
  /**
  *  
  * @type {String}
  */
  this.entitydescr = null
  /**
  *  
  * @type {String}
  */
  this.databody = null
  /**
  *  
  * @type {String}
  */
  this.snippet = null
  /**
  *  
  * @type {Number}
  */
  this.rank = null
}
/**
* 
* @mixes EventEmitter
*/
global.fts_tst_ftsentity_uk = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of ""
* @class
*/
function fts_tst_ftsentity_uk_object () {
  /**
  *  
  * @type {String}
  */
  this.ID = null
  /**
  *  
  * @type {Number}
  */
  this.rowid = null
  /**
  *  
  * @type {String}
  */
  this.entity = null
  /**
  *  
  * @type {String}
  */
  this.ftsentity = null
  /**
  *  
  * @type {String}
  */
  this.dy = null
  /**
  *  
  * @type {String}
  */
  this.dm = null
  /**
  *  
  * @type {String}
  */
  this.dd = null
  /**
  *  
  * @type {String}
  */
  this.datacode = null
  /**
  *  
  * @type {String}
  */
  this.aclrls = null
  /**
  *  
  * @type {String}
  */
  this.entitydescr = null
  /**
  *  
  * @type {String}
  */
  this.databody = null
  /**
  *  
  * @type {String}
  */
  this.snippet = null
  /**
  *  
  * @type {Number}
  */
  this.rank = null
}
/**
* 
* @mixes EventEmitter
*/
global.fts_ftsDefault_uk = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of ""
* @class
*/
function fts_ftsDefault_uk_object () {
  /**
  *  
  * @type {String}
  */
  this.ID = null
  /**
  *  
  * @type {Number}
  */
  this.rowid = null
  /**
  *  
  * @type {String}
  */
  this.entity = null
  /**
  *  
  * @type {String}
  */
  this.ftsentity = null
  /**
  *  
  * @type {String}
  */
  this.dy = null
  /**
  *  
  * @type {String}
  */
  this.dm = null
  /**
  *  
  * @type {String}
  */
  this.dd = null
  /**
  *  
  * @type {String}
  */
  this.datacode = null
  /**
  *  
  * @type {String}
  */
  this.aclrls = null
  /**
  *  
  * @type {String}
  */
  this.entitydescr = null
  /**
  *  
  * @type {String}
  */
  this.databody = null
  /**
  *  
  * @type {String}
  */
  this.snippet = null
  /**
  *  
  * @type {Number}
  */
  this.rank = null
}
/**
* 
* @mixes EventEmitter
*/
global.fts_ftsSubjectSearch = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of ""
* @class
*/
function fts_ftsSubjectSearch_object () {
  /**
  *  
  * @type {String}
  */
  this.ID = null
  /**
  *  
  * @type {Number}
  */
  this.rowid = null
  /**
  *  
  * @type {String}
  */
  this.entity = null
  /**
  *  
  * @type {String}
  */
  this.ftsentity = null
  /**
  *  
  * @type {String}
  */
  this.dy = null
  /**
  *  
  * @type {String}
  */
  this.dm = null
  /**
  *  
  * @type {String}
  */
  this.dd = null
  /**
  *  
  * @type {String}
  */
  this.datacode = null
  /**
  *  
  * @type {String}
  */
  this.aclrls = null
  /**
  *  
  * @type {String}
  */
  this.entitydescr = null
  /**
  *  
  * @type {String}
  */
  this.databody = null
  /**
  *  
  * @type {String}
  */
  this.snippet = null
  /**
  *  
  * @type {Number}
  */
  this.rank = null
}
/**
* 
* @mixes EventEmitter
*/
global.fts_ftsSubjectSearch_uk = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of ""
* @class
*/
function fts_ftsSubjectSearch_uk_object () {
  /**
  *  
  * @type {String}
  */
  this.ID = null
  /**
  *  
  * @type {Number}
  */
  this.rowid = null
  /**
  *  
  * @type {String}
  */
  this.entity = null
  /**
  *  
  * @type {String}
  */
  this.ftsentity = null
  /**
  *  
  * @type {String}
  */
  this.dy = null
  /**
  *  
  * @type {String}
  */
  this.dm = null
  /**
  *  
  * @type {String}
  */
  this.dd = null
  /**
  *  
  * @type {String}
  */
  this.datacode = null
  /**
  *  
  * @type {String}
  */
  this.aclrls = null
  /**
  *  
  * @type {String}
  */
  this.entitydescr = null
  /**
  *  
  * @type {String}
  */
  this.databody = null
  /**
  *  
  * @type {String}
  */
  this.snippet = null
  /**
  *  
  * @type {Number}
  */
  this.rank = null
}
