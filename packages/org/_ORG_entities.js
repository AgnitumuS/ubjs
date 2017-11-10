/* eslint-disable camelcase,no-unused-vars */
// This file is generated automatically and contain definition for code insight.
// Ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run ub cmd/createCodeInsightHelper -help for details

/**
* Внутрішні підрозділи
* @mixes EventEmitter
*/
global.org_department = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Внутрішні підрозділи"
* @class
*/
function org_department_object () {
  /**
  *  (ref -> org_unit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Батьківський елемент (ref -> org_unit)
  * Батьківський елемент
  * @type {Number}
  */
  this.parentID = null
  /**
  * Внутрішній код 
  * Внутрішній код підрозділу
  * @type {String}
  */
  this.code = ''
  /**
  * Назва підрозділу 
  * Назва без лапок та абревіатур
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва підрозділу 
  * Повна назва підрозділу
  * @type {String}
  */
  this.fullName = ''
  /**
  * Опис підрозділу 
  * Опис
  * @type {String}
  */
  this.description = null
  /**
  * Назва в род. відмінку 
  * Назва без лапок та абревіатур у родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва в дав. відмінку 
  * Назва без лапок та абревіатур у давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва в род. відмінку 
  * Повна назва підрозділу в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва в дав. відмінку 
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
  * Діловодне? 
  * Чи є цей підрозділ діловодним
  * @type {Boolean}
  */
  this.isClerical = undefined
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = ''
  /**
  *  (ref -> org_department)
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
* Діаграми
* @mixes EventEmitter
*/
global.org_diagram = {
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
function org_diagram_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Корінь (ref -> org_unit)
  * @type {Number}
  */
  this.orgunitID = null
  /**
  * Назва 
  * Назва
  * @type {String}
  */
  this.caption = null
  /**
  * За замовченням 
  * За замовченням
  * @type {Boolean}
  */
  this.isdefault = undefined
  /**
  * Органограма 
  * Органограма
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
* Співробітники внутрішньої організації
* @mixes EventEmitter
*/
global.org_employee = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Співробітники внутрішньої організації"
* @class
*/
function org_employee_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Внутрішній код співробітника
  * @type {String}
  */
  this.code = ''
  /**
  * Користувач (ref -> uba_user)
  * Логін користувача
  * @type {Number}
  */
  this.userID = null
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
  * По батькові 
  * По батькові співробітника
  * @type {String}
  */
  this.middleName = null
  /**
  * Дата народження 
  * Дата народження
  * @type {Date}
  */
  this.birthDate = null
  /**
  * Коментар 
  * Коментар по співробітнику
  * @type {String}
  */
  this.description = null
  /**
  * Стать 
  * Стать співробітника внутрішньої організації
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
  * Коротке ПІБ 
  * Приклад: Прізвище І.Б.
  * @type {String}
  */
  this.shortFIO = null
  /**
  * Повне ПІБ 
  * Приклад: Прізвище Ім&#39;я По батькові
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
  * Факсиміле 
  * Зображення підпису співробітника
  * @type {String}
  */
  this.facsimile = null
  /**
  *  (ref -> org_employee)
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
* Призначення внутрішньої організації
* @mixes EventEmitter
*/
global.org_employeeonstaff = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Призначення внутрішньої організації"
* @class
*/
function org_employeeonstaff_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Таб. № 
  * Табельний номер
  * @type {String}
  */
  this.tabNo = ''
  /**
  * Співробітник (ref -> org_employee)
  * Співробітник
  * @type {Number}
  */
  this.employeeID = 0
  /**
  * Штатна одиниця (ref -> org_staffunit)
  * Штатна одиниця внутрішньої організації
  * @type {Number}
  */
  this.staffUnitID = 0
  /**
  * Тип призначення 
  * Тип призначення
  * @type {String}
  */
  this.employeeOnStaffType = ''
  /**
  * Опис 
  * Опис призначення
  * @type {String}
  */
  this.description = null
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = null
  /**
  *  (ref -> org_employeeonstaff)
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
* Призначення з відкладеною датою
* @mixes EventEmitter
*/
global.org_employeeonstaff_pending = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Призначення з відкладеною датою"
* @class
*/
function org_employeeonstaff_pending_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Призначення (ref -> org_employeeonstaff)
  * Призначення
  * @type {Number}
  */
  this.emponstaffID = 0
  /**
  * Початок 
  * Початок дії призначення
  * @type {Date}
  */
  this.startDate = new Date()
  /**
  * Закінчення 
  * Закінчення дії призначення
  * @type {Date}
  */
  this.endDate = null
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
* Розрахункові коди
* @mixes EventEmitter
*/
global.org_orgaccount = {
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
function org_orgaccount_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Организація (ref -> org_organization)
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
  * Назва 
  * Назва (для вибору зі списку)
  * @type {String}
  */
  this.description = null
  /**
  * Тип рахунку 
  * Тип рахунку
  * @type {String}
  */
  this.acctype = ''
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
* Внутрішні організації
* @mixes EventEmitter
*/
global.org_organization = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Внутрішні організації"
* @class
*/
function org_organization_object () {
  /**
  *  (ref -> org_unit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Батьківський елемент (ref -> org_unit)
  * Батьківський елемент
  * @type {Number}
  */
  this.parentID = null
  /**
  * Внутрішній код 
  * Внутрішній код організації
  * @type {String}
  */
  this.code = ''
  /**
  * ЄДРПОУ 
  * Загальний класифікатор підприємств і організацій (ЄДРПОУ)
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
  * Повна назва, як воно вказано в свідоцтві про реєстрацію
  * @type {String}
  */
  this.fullName = ''
  /**
  * Назва в род. відмінку 
  * Назва без лапок та абревіатур у родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва в дав. відмінку 
  * Назва без лапок та абревіатур у давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва в род. відмінку 
  * Повна назва організації, як це вказано в свідоцтві про реєстрацію, в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва в дав. відмінку 
  * Повна назва організації, як це вказано в свідоцтві про реєстрацію, в давальному відмінку
  * @type {String}
  */
  this.fullNameDat = null
  /**
  * Опис організації 
  * Опис
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
  *  (ref -> org_organization)
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
* Посади
* @mixes EventEmitter
*/
global.org_profession = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Посади"
* @class
*/
function org_profession_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Код 
  * Код посади
  * @type {String}
  */
  this.code = ''
  /**
  * Назва 
  * Назва посади
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва посади
  * @type {String}
  */
  this.fullName = ''
  /**
  * Назва в род. відмінку 
  * Назва посади в родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва в дав. відмінку 
  * Назва посади в давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва в род. відмінку 
  * Повна назва посади в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва в дав. відмінку 
  * Повна назва посади в давальному відмінку
  * @type {String}
  */
  this.fullNameDat = null
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
* Штатні одиниці
* @mixes EventEmitter
*/
global.org_staffunit = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Штатні одиниці"
* @class
*/
function org_staffunit_object () {
  /**
  *  (ref -> org_unit)
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Батьківський елемент (ref -> org_unit)
  * Батьківський елемент
  * @type {Number}
  */
  this.parentID = null
  /**
  * Внутрішній код 
  * Внутрішній код штатної одиниці
  * @type {String}
  */
  this.code = ''
  /**
  * Назва штатної одиниці 
  * Назва без лапок і абревіатур
  * @type {String}
  */
  this.name = ''
  /**
  * Повна назва 
  * Повна назва штатної одиниці
  * @type {String}
  */
  this.fullName = ''
  /**
  * Опис штатної одиниці 
  * Опис штатної одиниці
  * @type {String}
  */
  this.description = null
  /**
  * Назва штатної одиниці в род. відмінку 
  * Назва без лапок і абревіатур у родовому відмінку
  * @type {String}
  */
  this.nameGen = null
  /**
  * Назва штатної одиниці в дав. відмінку 
  * Назва без лапок і абревіатур у давальному відмінку
  * @type {String}
  */
  this.nameDat = null
  /**
  * Повна назва в род. відмінку 
  * Повна назва штатної одиниці в родовому відмінку
  * @type {String}
  */
  this.fullNameGen = null
  /**
  * Повна назва в дав. відмінку 
  * Повна назва штатної одиниці в давальному відмінку
  * @type {String}
  */
  this.fullNameDat = null
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = ''
  /**
  * Професія (ref -> cdn_profession)
  * Професія
  * @type {Number}
  */
  this.professionExtID = null
  /**
  * Посада (ref -> org_profession)
  * Посада
  * @type {Number}
  */
  this.professionID = 0
  /**
  * Тип штатної одиниці (ref -> cdn_staffunittype)
  * Тип штатної одиниці
  * @type {Number}
  */
  this.staffUnitTypeID = 0
  /**
  * Рівень субординації 
  * Рівень субординації - чим нижче, тим штатна одиниця вважається більш важливою по орг. структурі
  * @type {Number}
  */
  this.subordinationLevel = null
  /**
  * Керівник 
  * Керівник
  * @type {Boolean}
  */
  this.isBoss = undefined
  /**
  *  (ref -> org_staffunit)
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
* Організаційні одиниці
* @mixes EventEmitter
*/
global.org_unit = {
  /** 
   * Reference to entity metadata
   * @type {UBEntity} 
   */
  entity: null
}

/**
* Attributes of "Організаційні одиниці"
* @class
*/
function org_unit_object () {
  /**
  *  
  * 
  * @type {Number}
  */
  this.ID = 0
  /**
  * Батьківський елемент (ref -> org_unit)
  * Батьківський елемент
  * 
  * @type {Number}
  */
  this.parentID = null
  /**
  * Внутрішній код 
  * Внутрішній код організаційної одиниці
  * @type {String}
  */
  this.code = ''
  /**
  * Заголовок 
  * Заголовок
  * @type {String}
  */
  this.caption = ''
  /**
  * Тип орг. одиниці 
  * Тип організаційної одиниці
  * @type {String}
  */
  this.unitType = ''
  /**
  *  
  * 
  * @type {String}
  */
  this.mi_treePath = ''
  /**
  *  (ref -> org_unit)
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
  /**
  *  
  * 
  * @type {String}
  */
  this.mi_unityEntity = ''
}
