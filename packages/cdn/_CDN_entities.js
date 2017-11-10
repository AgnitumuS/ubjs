/* eslint-disable camelcase,no-unused-vars */
// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Адреси
* @mixes EventEmitter
*/
global.cdn_address = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Адреси"
* @class
*/
function cdn_address_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Тип адреси 
  * @type {String}
  */
  this.addressType = ''
  /**
  * Адреса 
  * @type {String}
  */
  this.value = ''
  /**
  * Субект 
  * @type {Number}
  */
  this.subjectID = 0
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
* Адміністративні одиниці
* @mixes EventEmitter
*/
global.cdn_adminunit = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Адміністративні одиниці"
* @class
*/
function cdn_adminunit_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Підпорядкування (ref -> cdn_adminunit)
  * Підпорядкування
  * @type {Number}
  */
  this.parentAdminUnitID = null
  /**
  * Код 
  * Внутрішній код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * @type {String}
  */
  this.fullName = null
  /**
  * Тип адм-ної одиниці 
  * @type {String}
  */
  this.adminUnitType = ''
  /**
  * Заголовок 
  * @type {String}
  */
  this.caption = null
  /**
  *  
  * 
  * @type {String}
  */
  this.mi_unityEntity = ''
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
* Банківські відділення
* @mixes EventEmitter
*/
global.cdn_bank = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Банківські відділення"
* @class
*/
function cdn_bank_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * МФО 
  * МФО банківського відділення
  * @type {String}
  */
  this.MFO = ''
  /**
  * ЄДРПОУ 
  * Код ЄДРПОУ
  * @type {String}
  */
  this.code = null
  /**
  * Робоча назва 
  * Назва без лапок і форм власності. Для зручності при пошуку.
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва, яка вказана у свідоцтві про реєстрацію. Використовується у звітах.
  * @type {String}
  */
  this.fullName = ''
  /**
  * Телефони 
  * @type {String}
  */
  this.phones = null
  /**
  * Адреса 
  * @type {String}
  */
  this.address = null
  /**
  * Країна (ref -> cdn_country)
  * Країна реєстрації
  * @type {Number}
  */
  this.countryID = null
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
* Список будинків
* @mixes EventEmitter
*/
global.cdn_building = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Список будинків"
* @class
*/
function cdn_building_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Вулиця (ref -> cdn_street)
  * @type {Number}
  */
  this.streetID = 0
  /**
  * Індекс (ref -> cdn_postindex)
  * @type {Number}
  */
  this.postIndexID = 0
  /**
  * № 
  * Код
  * @type {String}
  */
  this.code = ''
  /**
  * Опис 
  * Опис
  * @type {String}
  */
  this.description = null
  /**
  * Тип 
  * Тип
  * @type {String}
  */
  this.buildingType = ''
  /**
  *  (ref -> cdn_building)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Населені пункти
* @mixes EventEmitter
*/
global.cdn_city = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Населені пункти"
* @class
*/
function cdn_city_object () {
  /**
  *  (ref -> cdn_adminunit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Предок (ref -> cdn_adminunit)
  * @type {Number}
  */
  this.parentAdminUnitID = 0
  /**
  * Код 
  * Код населеного пункту
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва населеного пункту
  * @type {String}
  */
  this.name = ''
  /**
  * Заголовок 
  * @type {String}
  */
  this.caption = null
  /**
  * Опис 
  * Опис населеного пункту
  * @type {String}
  */
  this.description = null
  /**
  * Поштовий код 
  * Поштовий код населеного пункту
  * @type {String}
  */
  this.postalCode = null
  /**
  * Телефонний код 
  * Телефонний код населеного пункту
  * @type {String}
  */
  this.phoneCode = null
  /**
  * Тип населеного пункту (ref -> cdn_citytype)
  * Тип населеного пункту
  * @type {Number}
  */
  this.cityTypeID = null
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
* Типи населених пунктів
* @mixes EventEmitter
*/
global.cdn_citytype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типи населених пунктів"
* @class
*/
function cdn_citytype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код типу населеного пункту
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва типу населеного пункту
  * @type {String}
  */
  this.name = ''
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
* Контакти
* @mixes EventEmitter
*/
global.cdn_contact = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Контакти"
* @class
*/
function cdn_contact_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Тип контакту (ref -> cdn_contacttype)
  * @type {Number}
  */
  this.contactTypeID = 0
  /**
  * Контакт 
  * @type {String}
  */
  this.value = ''
  /**
  * Subject 
  * @type {Number}
  */
  this.subjectID = 0
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
* Типи контактів
* @mixes EventEmitter
*/
global.cdn_contacttype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типи контактів"
* @class
*/
function cdn_contacttype_object () {
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
  * Назва 
  * Назва типу контакта
  * @type {String}
  */
  this.name = ''
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
* Індекси кореспондентів
* @mixes EventEmitter
*/
global.cdn_corrindex = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Індекси кореспондентів"
* @class
*/
function cdn_corrindex_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код індексу кореспондента
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва індексу кореспондента
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва індексу кореспондента
  * @type {String}
  */
  this.fullName = ''
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
* Країни
* @mixes EventEmitter
*/
global.cdn_country = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Країни"
* @class
*/
function cdn_country_object () {
  /**
  *  (ref -> cdn_adminunit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва країни
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна офіційна назва країни
  * @type {String}
  */
  this.fullName = ''
  /**
  * Код цифровий 
  * Цифровий код країни
  * @type {Number}
  */
  this.intCode = 0
  /**
  * ISO код 
  * 2-х символьний код країни по класифікації ISO
  * @type {String}
  */
  this.symbol2 = ''
  /**
  * Код МОК 
  * 3-х символьний код країни по класифікації МОК
  * @type {String}
  */
  this.symbol3 = ''
  /**
  * Опис 
  * Опис країни
  * @type {String}
  */
  this.description = null
  /**
  * Телефонний код 
  * Телефонний код країни
  * @type {String}
  */
  this.phoneCode = null
  /**
  * Валюта (ref -> cdn_currency)
  * Валюта, яка використовується в країні в якості основної
  * @type {Number}
  */
  this.currencyID = null
  /**
  * Столиця (ref -> cdn_city)
  * Столиця країни
  * @type {Number}
  */
  this.capitalID = null
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
* Валюти
* @mixes EventEmitter
*/
global.cdn_currency = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Валюти"
* @class
*/
function cdn_currency_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Цифровий код 
  * Цифровий код валюти
  * @type {Number}
  */
  this.intCode = 0
  /**
  * Код 3-х символьний 
  * 3-х символьний код валюти
  * @type {String}
  */
  this.code3 = ''
  /**
  * Назва 
  * Назва валюти
  * @type {String}
  */
  this.name = ''
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
* Зовнішні підрозділи
* @mixes EventEmitter
*/
global.cdn_department = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Зовнішні підрозділи"
* @class
*/
function cdn_department_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Внутрішній код 
  * Внутрішній код підрозділу
  * @type {String}
  */
  this.code = null
  /**
  * Назва підрозділу 
  * Назва без лапок та абревіатур
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва підрозділу
  * @type {String}
  */
  this.fullName = null
  /**
  * Опис підрозділу 
  * Опис підрозділу
  * @type {String}
  */
  this.description = null
  /**
  * Назва підрозділу в родовому відмінку 
  * Назва без лапок та абревіатур у родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва підрозділу в давальному відмінку 
  * Назва без лапок та абревіатур у давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва підрозділу в родовому відмінку 
  * Повна назва підрозділу в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва підрозділу в давальному відмінку 
  * Повна назва підрозділу в давальному відмінку
  * @type {String}
  */
  this.fullNameDat = null
  /**
  * Тип підрозділу (ref -> cdn_deptype)
  * Тип підрозділу
  * @type {Number}
  */
  this.depTypeID = null
  /**
  * Організація (ref -> cdn_organization)
  * Організація, до якої належить підрозділ
  * @type {Number}
  */
  this.organizationID = null
  /**
  *  (ref -> cdn_department)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Типи департаментів
* @mixes EventEmitter
*/
global.cdn_deptype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типи департаментів"
* @class
*/
function cdn_deptype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код департамента
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва типу департамента
  * @type {String}
  */
  this.name = ''
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
* Співробітники зовнішніх організацій
* @mixes EventEmitter
*/
global.cdn_employee = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Співробітники зовнішніх організацій"
* @class
*/
function cdn_employee_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Прізвище 
  * Прізвище співробітника
  * @type {String}
  */
  this.lastName = ''
  /**
  * Ім&#39;я 
  * Ім&#39;я співробітника
  * @type {String}
  */
  this.firstName = ''
  /**
  * По-батькові 
  * По-батькові
  * @type {String}
  */
  this.middleName = null
  /**
  * Опис 
  * Опис співробітника
  * @type {String}
  */
  this.description = null
  /**
  * Стать 
  * Стать співробітника
  * @type {String}
  */
  this.sexType = ''
  /**
  * Табельний номер 
  * Табельний номер співробітника
  * @type {String}
  */
  this.uniqNum = null
  /**
  * Суфікс 
  * Суфікс
  * @type {String}
  */
  this.suffix = null
  /**
  * Коротке ПІБ 
  * Приклад: Прізвище І.Б.
  * @type {String}
  */
  this.shortFIO = ''
  /**
  * Повне ПІБ 
  * Приклад: Прізвище Ім&#39;я По-батькові
  * @type {String}
  */
  this.fullFIO = ''
  /**
  * Звернення 
  * Як звертатися до цієї людини
  * @type {String}
  */
  this.apply = null
  /**
  * Прізвище в род. відмінку 
  * Прізвище співробітника в родовому відмінку
  * @type {String}
  */
  this.lastNameGen = null
  /**
  * Прізвище в дав. відмінку 
  * Прізвище співробітника в давальному відмінку
  * @type {String}
  */
  this.lastNameDat = null
  /**
  * Ім&#39;я в род. відмінку 
  * Ім&#39;я співробітника в родовому відмінку
  * @type {String}
  */
  this.firstNameGen = null
  /**
  * Ім&#39;я в дав. відмінку 
  * Ім&#39;я співробітника в давальному відмінку
  * @type {String}
  */
  this.firstNameDat = null
  /**
  * По-батькові в род. відмінку 
  * По-батькові в родовому відмінку
  * @type {String}
  */
  this.middleNameGen = null
  /**
  * По-батькові в дав. відмінку 
  * По-батькові в давальному відмінку
  * @type {String}
  */
  this.middleNameDat = null
  /**
  * Скорочений ПІБ у род. відмінку 
  * Скорочений ПІБ співробітника в родовому відмінку
  * @type {String}
  */
  this.shortFIOGen = null
  /**
  * Скорочений ПІБ у дав. відмінку 
  * Скорочений ПІБ персони в давальному відмінку
  * @type {String}
  */
  this.shortFIODat = null
  /**
  * Повний ПІБ у род. відмінку 
  * Повний ПІБ співробітника в родовому відмінку
  * @type {String}
  */
  this.fullFIOGen = null
  /**
  * Повний ПІБ у дав. відмінку 
  * Повний ПІБ співробітника в давальному відмінку
  * @type {String}
  */
  this.fullFIODat = null
  /**
  * Звернення в род. відмінку 
  * Як звертатися до цієї людини в родовому відмінку
  * @type {String}
  */
  this.applyGen = null
  /**
  * Звернення в дав. відмінку 
  * Як звертатися до цієї людини в давальному відмінку
  * @type {String}
  */
  this.applyDat = null
  /**
  * Департамент (ref -> cdn_department)
  * Департамент зовнішньої організації, в якому працює цей співробітник
  * @type {Number}
  */
  this.departmentID = null
  /**
  * Організація (ref -> cdn_organization)
  * Зовнішня організація, в якій працює цей співробітник
  * @type {Number}
  */
  this.organizationID = 0
  /**
  * Формулювання адресата 
  * Формулювання адресата, яке буде відображатися при генерації PDF образу вихідного документа
  * @type {String}
  */
  this.addrText = null
  /**
  *  (ref -> cdn_employee)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Розрахункові коди
* @mixes EventEmitter
*/
global.cdn_orgaccount = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Розрахункові коди"
* @class
*/
function cdn_orgaccount_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Организація (ref -> cdn_organization)
  * Организація
  * @type {Number}
  */
  this.organizationID = 0
  /**
  * Валюта (ref -> cdn_currency)
  * Валюта рахунку
  * @type {Number}
  */
  this.currencyID = 0
  /**
  * Банк (ref -> cdn_bank)
  * Банк, де відкрито рахунок
  * @type {Number}
  */
  this.bankID = 0
  /**
  * Код рахунку 
  * Код рахунку (номер рахунку)
  * @type {String}
  */
  this.code = ''
  /**
  * Тип рахунку 
  * Тип рахунку
  * @type {String}
  */
  this.acctype = ''
  /**
  * Назва 
  * Назва (для вибору зі списку)
  * @type {String}
  */
  this.description = ''
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
* Зовнішні організації
* @mixes EventEmitter
*/
global.cdn_organization = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Зовнішні організації"
* @class
*/
function cdn_organization_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Внутрішній код 
  * Внутрішній код організації
  * @type {String}
  */
  this.code = null
  /**
  * ЄДРПОУ 
  * Загальний класифікатор підприємств та організацій (ЄДРПОУ)
  * @type {String}
  */
  this.OKPOCode = null
  /**
  * Податковий № 
  * Податковий номер
  * @type {String}
  */
  this.taxCode = null
  /**
  * № св. ПДВ 
  * № свідоцтва платника ПДВ
  * @type {String}
  */
  this.vatCode = null
  /**
  * Назва організації 
  * Назва без лапок та абревіатур
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва організації 
  * Повна назва організації, як це вказано в свідоцтві про реєстрацію
  * @type {String}
  */
  this.fullName = ''
  /**
  * Назва організації в родовому відмінку 
  * Назва без лапок та абревіатур у родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва організації в давальному відмінку 
  * Назва без лапок та абревіатур у давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва організації в родовому відмінку 
  * Повна назва організації, як це вказано в свідоцтві про реєстрацію, в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва організації в давальному відмінку 
  * Повна назва організації, як це вказано в свідоцтві про реєстрацію, в давальному відмінку
  * @type {String}
  */
  this.fullNameDat = null
  /**
  * Опис 
  * Опис організації
  * @type {String}
  */
  this.description = null
  /**
  * Тип організації (ref -> cdn_orgbusinesstype)
  * Тип організації
  * @type {Number}
  */
  this.orgBusinessTypeID = null
  /**
  * Тип власності (ref -> cdn_orgownershiptype)
  * Тип власності
  * @type {Number}
  */
  this.orgOwnershipTypeID = null
  /**
  * Індекс кореспондента (ref -> cdn_corrindex)
  * Індекс кореспондента
  * @type {Number}
  */
  this.corrIndexID = null
  /**
  * Формулювання адресата 
  * Формулювання адресата, яке буде відображатися при генерації PDF образу вихідного документа
  * @type {String}
  */
  this.addrText = null
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = null
  /**
  *  (ref -> cdn_organization)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Типи організацій
* @mixes EventEmitter
*/
global.cdn_orgbusinesstype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типи організацій"
* @class
*/
function cdn_orgbusinesstype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код типу організації
  * @type {String}
  */
  this.code = ''
  /**
  * Абревіатура 
  * Абревіатура типу організації
  * @type {String}
  */
  this.shortName = null
  /**
  * Назва 
  * Назва типу організації
  * @type {String}
  */
  this.name = ''
  /**
  * Опис 
  * Опис типу організації
  * @type {String}
  */
  this.fullName = null
  /**
  * Держ. Орган 
  * Ознака, що організація вказаного типу є державним органом
  * @type {Boolean}
  */
  this.isGovAuthority = undefined
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
* Форма власності
* @mixes EventEmitter
*/
global.cdn_orgownershiptype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Форма власності"
* @class
*/
function cdn_orgownershiptype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код форм власності
  * @type {String}
  */
  this.code = ''
  /**
  * Абревіатура 
  * Абревіатура форми власності
  * @type {String}
  */
  this.shortName = null
  /**
  * Назва 
  * Назва форм власності
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва форм власності
  * @type {String}
  */
  this.fullName = null
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
* Список фізичних осіб
* @mixes EventEmitter
*/
global.cdn_person = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Список фізичних осіб"
* @class
*/
function cdn_person_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Прізвище 
  * Прізвище персони
  * @type {String}
  */
  this.lastName = ''
  /**
  * Ім&#39;я 
  * Ім&#39;я персони
  * @type {String}
  */
  this.firstName = ''
  /**
  * По-батькові 
  * По-батькові
  * @type {String}
  */
  this.middleName = null
  /**
  * Посвідчення особи 
  * Посвідчення особи
  * @type {String}
  */
  this.identCard = null
  /**
  * Місце роботи, посада 
  * Місце роботи, посада
  * @type {String}
  */
  this.workPlacePos = null
  /**
  * Дата народження 
  * Дата народження
  * @type {Date}
  */
  this.birthDate = null
  /**
  * Опис 
  * Опис персони
  * @type {String}
  */
  this.description = null
  /**
  * Стать 
  * Стать персони
  * @type {String}
  */
  this.sexType = ''
  /**
  * Суфікс 
  * Суфікс
  * @type {String}
  */
  this.suffix = null
  /**
  * Скорочений ПІБ 
  * Приклад: Петренко П.П
  * @type {String}
  */
  this.shortFIO = null
  /**
  * Повний ПІБ 
  * Приклад: Петренко Петро Петрович
  * @type {String}
  */
  this.fullFIO = ''
  /**
  * Звертання 
  * Як звертатися до цієї особи
  * @type {String}
  */
  this.apply = null
  /**
  * Фото 
  * Фотографія персони
  * @type {String}
  */
  this.photo = null
  /**
  * Прізвище в род. відмінку 
  * Прізвище персони в родовому відмінку
  * @type {String}
  */
  this.lastNameGen = null
  /**
  * Прізвище в дав. відмінку 
  * Прізвище персони в давальному відмінку
  * @type {String}
  */
  this.lastNameDat = null
  /**
  * Ім&#39;я в род. відмінку 
  * Ім&#39;я персони в родовому відмінку
  * @type {String}
  */
  this.firstNameGen = null
  /**
  * Ім&#39;я в дав. відмінку 
  * Ім&#39;я персони в давальному відмінку
  * @type {String}
  */
  this.firstNameDat = null
  /**
  * По-батькові в род. відмінку 
  * По-батькові в родовому відмінку
  * @type {String}
  */
  this.middleNameGen = null
  /**
  * По-батькові в дав. відмінку 
  * По-батькові в давальному відмінку
  * @type {String}
  */
  this.middleNameDat = null
  /**
  * Скорочений ПІБ в род. відмінку 
  * Скорочений ПІБ персони в родовому відмінку
  * @type {String}
  */
  this.shortFIOGen = null
  /**
  * Скорочений ПІБ в дав. відмінку 
  * Скорочений ПІБ персони в давальному відмінку
  * @type {String}
  */
  this.shortFIODat = null
  /**
  * Повний ПІБ в род. відмінку 
  * Повний ПІБ персони в родовому відмінку
  * @type {String}
  */
  this.fullFIOGen = null
  /**
  * Повний ПІБ в дав. відмінку 
  * Повний ПІБ персони в давальному відмінку
  * @type {String}
  */
  this.fullFIODat = null
  /**
  * Звертання в род. відмінку 
  * Як звертатися до цієї особи в родовому відмінку
  * @type {String}
  */
  this.applyGen = null
  /**
  * Звертання в дав. відмінку 
  * Як звертатися до цієї особи в давальному відмінку
  * @type {String}
  */
  this.applyDat = null
  /**
  * Регіон (ref -> cdn_region)
  * Регіон мешкання персони
  * @type {Number}
  */
  this.regionID = null
  /**
  * Соціальний статус (ref -> cdn_personsocialstatus)
  * Соціальний статус
  * @type {Number}
  */
  this.socialstatusID = null
  /**
  * Категорія (ref -> cdn_personcategory)
  * Категорія
  * @type {Number}
  */
  this.categoryID = null
  /**
  *  (ref -> cdn_person)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Категорія персон
* @mixes EventEmitter
*/
global.cdn_personcategory = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Категорія персон"
* @class
*/
function cdn_personcategory_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва категорії
  * @type {String}
  */
  this.name = ''
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
* Cоціальний статус
* @mixes EventEmitter
*/
global.cdn_personsocialstatus = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Cоціальний статус"
* @class
*/
function cdn_personsocialstatus_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва соціального  статусу
  * @type {String}
  */
  this.name = ''
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
* Поштові індекси
* @mixes EventEmitter
*/
global.cdn_postindex = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Поштові індекси"
* @class
*/
function cdn_postindex_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Індекс 
  * Індекс
  * @type {String}
  */
  this.code = ''
  /**
  * Вулиця (ref -> cdn_street)
  * @type {Number}
  */
  this.streetID = 0
  /**
  * Опис 
  * Опис
  * @type {String}
  */
  this.description = ''
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
* Професії
* @mixes EventEmitter
*/
global.cdn_profession = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Професії"
* @class
*/
function cdn_profession_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код професії
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва професії
  * @type {String}
  */
  this.name = ''
  /**
  * Заголовок 
  * @type {String}
  */
  this.description = ''
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
* Регіони
* @mixes EventEmitter
*/
global.cdn_region = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Регіони"
* @class
*/
function cdn_region_object () {
  /**
  *  (ref -> cdn_adminunit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Предок (ref -> cdn_adminunit)
  * Предок
  * @type {Number}
  */
  this.parentAdminUnitID = 0
  /**
  * Код 
  * Внутрішній код
  * @type {String}
  */
  this.code = ''
  /**
  * Тип (ref -> cdn_regiontype)
  * Тип регіону
  * @type {Number}
  */
  this.regionTypeID = null
  /**
  * Назва 
  * Назва регіону
  * @type {String}
  */
  this.name = ''
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = null
  /**
  * Повна назва 
  * Повна офіційна назва регіону
  * @type {String}
  */
  this.fullName = ''
  /**
  * Опис 
  * Опис регіону
  * @type {String}
  */
  this.description = null
  /**
  * Телефонний код 
  * Телефонний код регіону
  * @type {String}
  */
  this.phoneCode = null
  /**
  * Центр (ref -> cdn_city)
  * Центр регіону
  * @type {Number}
  */
  this.centerID = null
  /**
  *  (ref -> cdn_region)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
* Типи регіонів
* @mixes EventEmitter
*/
global.cdn_regiontype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типи регіонів"
* @class
*/
function cdn_regiontype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва типу регіону
  * @type {String}
  */
  this.name = ''
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
* Типы штатних одиниць
* @mixes EventEmitter
*/
global.cdn_staffunittype = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Типы штатних одиниць"
* @class
*/
function cdn_staffunittype_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва типу штатної одиниці
  * @type {String}
  */
  this.name = ''
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
* Список вулиць
* @mixes EventEmitter
*/
global.cdn_street = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Список вулиць"
* @class
*/
function cdn_street_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Назва 
  * Назва вулиці
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва
  * @type {String}
  */
  this.fullName = ''
  /**
  * Код 
  * Код
  * @type {String}
  */
  this.code = null
  /**
  * Тип 
  * Тип
  * @type {String}
  */
  this.streetType = null
  /**
  * Нас. пункт (ref -> cdn_city)
  * Населений пункт
  * @type {Number}
  */
  this.cityID = null
  /**
  *  (ref -> cdn_street)
  * 
  * @type {Number}
  */
  this.mi_data_id = 0
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateFrom = new Date()
  /**
  *  
  * 
  * @type {Date}
  */
  this.mi_dateTo = new Date()
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
