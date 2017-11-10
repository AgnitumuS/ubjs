/* eslint-disable camelcase,no-unused-vars */
// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Робочий стіл
* @mixes EventEmitter
*/
global.ubm_desktop = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Робочий стіл"
* @class
*/
function ubm_desktop_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Назва десктопу 
  * @type {String}
  */
  this.caption = ''
  /**
  * Код 
  * @type {String}
  */
  this.code = ''
  /**
  * URL 
  * URL статичної сторінки сервера, яка відображається в центрі екрану при виборі робочого столу
  * @type {String}
  */
  this.url = null
  /**
  * За замовчуванням? 
  * @type {Boolean}
  */
  this.isDefault = undefined
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
* Адміністрування робочих столів
* @mixes EventEmitter
*/
global.ubm_desktop_adm = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Адміністрування робочих столів"
* @class
*/
function ubm_desktop_adm_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Робочий стіл (ref -> ubm_desktop)
  * @type {Number}
  */
  this.instanceID = 0
  /**
  * Суб&#39;єкт адміністрування (ref -> uba_subject)
  * @type {Number}
  */
  this.admSubjID = 0
}
/**
* Діаграми
* @mixes EventEmitter
*/
global.ubm_diagram = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Діаграми"
* @class
*/
function ubm_diagram_object () {
  /**
  *  
  * @type {Number}
  */
  this.ID = 0
  /**
  * Модель 
  * Модель
  * @type {String}
  */
  this.model = ''
  /**
  * Назва 
  * @type {String}
  */
  this.name = ''
  /**
  * Діаграма 
  * Діаграма сутностей
  * @type {String}
  */
  this.document = null
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
* Перераховані значення
* @mixes EventEmitter
*/
global.ubm_enum = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Перераховані значення"
* @class
*/
function ubm_enum_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Група 
  * Group of enumeration
  * @type {String}
  */
  this.eGroup = ''
  /**
  * Код 
  * Код значення
  * @type {String}
  */
  this.code = ''
  /**
  * Коротка назва 
  * @type {String}
  */
  this.shortName = null
  /**
  * Назва значення 
  * @type {String}
  */
  this.name = ''
  /**
  * № п&#x2F;п 
  * @type {Number}
  */
  this.sortOrder = 0
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
* Форма
* @mixes EventEmitter
*/
global.ubm_form = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Форма"
* @class
*/
function ubm_form_object () {
  /**
  *  
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код форми 
  * @type {String}
  */
  this.code = ''
  /**
  * Опис 
  * @type {String}
  */
  this.description = null
  /**
  * Заголовок форми 
  * Keep it empty to use entity name as form caption
  * @type {String}
  */
  this.caption = null
  /**
  * Тип форми 
  * Тип визначення форми auto чи custom
  * @type {String}
  */
  this.formType = ''
  /**
  * Визначення форми 
  * Визначення інтерфейсу форми
  * @type {String}
  */
  this.formDef = null
  /**
  * Скрипт форми 
  * JS з клієнтської логіки форми
  * @type {String}
  */
  this.formCode = null
  /**
  * Модель 
  * Модель куди зберігати
  * @type {String}
  */
  this.model = null
  /**
  * Сутність 
  * Код сутності
  * @type {String}
  */
  this.entity = null
  /**
  * За замовчуванням 
  * Використовувати за замовчуванням
  * @type {Boolean}
  */
  this.isDefault = undefined
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
* Ярлик
* @mixes EventEmitter
*/
global.ubm_navshortcut = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Ярлик"
* @class
*/
function ubm_navshortcut_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Десктоп (ref -> ubm_desktop)
  * @type {Number}
  */
  this.desktopID = 0
  /**
  * Папка ярлика (ref -> ubm_navshortcut)
  * 
  * @type {Number}
  */
  this.parentID = null
  /**
  * Код 
  * @type {String}
  */
  this.code = ''
  /**
  * Папка? 
  * @type {Boolean}
  */
  this.isFolder = undefined
  /**
  * Назва ярлика 
  * @type {String}
  */
  this.caption = ''
  /**
  * Текст команди 
  * @type {String}
  */
  this.cmdCode = null
  /**
  * В окремому вікні 
  * Відображати в окремому вікні
  * @type {Boolean}
  */
  this.inWindow = undefined
  /**
  * Згорнути 
  * Відображати згорнутим при першому запуску
  * @type {Boolean}
  */
  this.isCollapsed = undefined
  /**
  * № п&#x2F;п 
  * Порядок відображення (в рамках поточного вузла)
  * @type {Number}
  */
  this.displayOrder = 0
  /**
  * icon css class name 
  * @type {String}
  */
  this.iconCls = null
  /**
  *  
  * 
  * @type {String}
  */
  this.mi_treePath = ''
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
* Адміністрування панелі навігації
* @mixes EventEmitter
*/
global.ubm_navshortcut_adm = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Адміністрування панелі навігації"
* @class
*/
function ubm_navshortcut_adm_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Ярлик (ref -> ubm_navshortcut)
  * @type {Number}
  */
  this.instanceID = 0
  /**
  * Суб&#39;єкт адміністрування (ref -> uba_subject)
  * @type {Number}
  */
  this.admSubjID = 0
}
