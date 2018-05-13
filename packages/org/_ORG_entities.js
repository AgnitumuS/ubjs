/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Organisation structure
 * @version 5.0.10
 * @module @unitybase/org
 */

/**
 * Internal departments.
 * This dictionary contains list of departments. Each department links to org_unit by Unity mixin
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class org_department_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_department_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> org_unit
  * @type {Number}
  */
  parentID: null,
 /**
  * Internal code
  * @type {String}
  */
  code: '',
 /**
  * Name of department without the quotes and abbreviations
  * @type {String}
  */
  name: '',
 /**
  * Department full name
  * @type {String}
  */
  fullName: '',
 /**
  * Department description
  * @type {String}
  */
  description: null,
 /**
  * Department name without the quotes and abbreviations in genitive case
  * @type {String}
  */
  nameGen: null,
 /**
  * Department name without the quotes and abbreviations in dative case
  * @type {String}
  */
  nameDat: null,
 /**
  * Department full name in genitive case
  * @type {String}
  */
  fullNameGen: null,
 /**
  * Department full name in dative case
  * @type {String}
  */
  fullNameDat: null,
 /**
  * Department type -> cdn_deptype
  * @type {Number}
  */
  depTypeID: null,
 /**
  * Clerical unit mark
  * @type {Boolean}
  */
  isClerical: undefined,
 /**
  * Caption
  * @type {String}
  */
  caption: '',
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
* Internal departments.
 * This dictionary contains list of departments. Each department links to org_unit by Unity mixin
* @type {org_department_ns}
*/
const org_department = new org_department_ns()
/**
 * Diagrams
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_diagram_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_diagram_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  orgunitID: null,
 /**
  * Name
  * @type {String}
  */
  caption: null,
 /**
  * Default
  * @type {Boolean}
  */
  isdefault: undefined,
 /**
  * Organization chart
  * @type {String}
  */
  document: null,
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
* Diagrams
* @type {org_diagram_ns}
*/
const org_diagram = new org_diagram_ns()
/**
 * List of employees of internal organizations.
 * This dictionary contains list of departments.  Employee is assigned to staff units in org_employeeonstaff entity
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class org_employee_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_employee_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Employees internal code
  * @type {String}
  */
  code: '',
 /**
  * User login -> uba_user
  * @type {Number}
  */
  userID: null,
 /**
  * Employee last name
  * @type {String}
  */
  lastName: '',
 /**
  * Employee first name
  * @type {String}
  */
  firstName: '',
 /**
  * Employee middle name
  * @type {String}
  */
  middleName: null,
 /**
  * Date of birth
  * @type {Date}
  */
  birthDate: null,
 /**
  * Comment on employee
  * @type {String}
  */
  description: null,
 /**
  * Employee sex
  * @type {String}
  */
  sexType: '',
 /**
  * Suffix
  * @type {String}
  */
  suffix: null,
 /**
  * Example: Smith J.K.
  * @type {String}
  */
  shortFIO: null,
 /**
  * Example: Smith Jay Key
  * @type {String}
  */
  fullFIO: '',
 /**
  * Describes how to treat to this person
  * @type {String}
  */
  apply: null,
 /**
  * Employee last name in genitive case
  * @type {String}
  */
  lastNameGen: null,
 /**
  * Employee last name in dative case
  * @type {String}
  */
  lastNameDat: null,
 /**
  * Employee first name in genitive case
  * @type {String}
  */
  firstNameGen: null,
 /**
  * Employee first name in dative case
  * @type {String}
  */
  firstNameDat: null,
 /**
  * Employee middle name in genitive case
  * @type {String}
  */
  middleNameGen: null,
 /**
  * Employee middle name in dative case
  * @type {String}
  */
  middleNameDat: null,
 /**
  * Employee short name in genitive case
  * @type {String}
  */
  shortFIOGen: null,
 /**
  * Employee short name in dative case
  * @type {String}
  */
  shortFIODat: null,
 /**
  * Employee full name in genitive case
  * @type {String}
  */
  fullFIOGen: null,
 /**
  * Employee full name in dative case
  * @type {String}
  */
  fullFIODat: null,
 /**
  * Describes how to treat to this person in genitive case
  * @type {String}
  */
  applyGen: null,
 /**
  * Describes how to treat to this person in dative case
  * @type {String}
  */
  applyDat: null,
 /**
  * Employee signature image
  * @type {String}
  */
  facsimile: null,
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
* List of employees of internal organizations.
 * This dictionary contains list of departments.  Employee is assigned to staff units in org_employeeonstaff entity
* @type {org_employee_ns}
*/
const org_employee = new org_employee_ns()
/**
 * List of internal organization assignments.
 * Развязочная сущность, в которой указывается какой работник на какой штатной единице работает (назначение). Так же есть тип назначения (временное, постоянное, полставки и т.д.)
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class org_employeeonstaff_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_employeeonstaff_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Employee number
  * @type {String}
  */
  tabNo: '',
 /**
  * Employee -> org_employee
  * @type {Number}
  */
  employeeID: 0,
 /**
  * Internal organization staff unit -> org_staffunit
  * @type {Number}
  */
  staffUnitID: 0,
 /**
  * Assignment type
  * @type {String}
  */
  employeeOnStaffType: '',
 /**
  * Assignment description
  * @type {String}
  */
  description: null,
 /**
  * Caption
  * @type {String}
  */
  caption: null,
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
* List of internal organization assignments.
 * Развязочная сущность, в которой указывается какой работник на какой штатной единице работает (назначение). Так же есть тип назначения (временное, постоянное, полставки и т.д.)
* @type {org_employeeonstaff_ns}
*/
const org_employeeonstaff = new org_employeeonstaff_ns()
/**
 * Assignment with pending date.
 * Entity which contains links to assignments with pending date
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_employeeonstaff_pending_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_employeeonstaff_pending_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Assignment -> org_employeeonstaff
  * @type {Number}
  */
  emponstaffID: 0,
 /**
  * Assignment start date
  * @type {Date}
  */
  startDate: new Date(),
 /**
  * Assignment end date
  * @type {Date}
  */
  endDate: null,
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
* Assignment with pending date.
 * Entity which contains links to assignments with pending date
* @type {org_employeeonstaff_pending_ns}
*/
const org_employeeonstaff_pending = new org_employeeonstaff_pending_ns()
/**
 * List of current accounts of internal organizations
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_orgaccount_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_orgaccount_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Organization -> org_organization
  * @type {Number}
  */
  organizationID: 0,
 /**
  * Currency of the account
  * @type {Number}
  */
  currencyID: 0,
 /**
  * Bank of the account -> cdn_bank
  * @type {Number}
  */
  bankID: 0,
 /**
  * Code of the account (account number)
  * @type {String}
  */
  code: '',
 /**
  * Type of the account
  * @type {String}
  */
  acctype: '',
 /**
  * Description
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
* List of current accounts of internal organizations
* @type {org_orgaccount_ns}
*/
const org_orgaccount = new org_orgaccount_ns()
/**
 *  List of internal organizations.
 * This dictionary contains list of internal organizations. Each organization links to org_unit by Unity mixin
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class org_organization_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_organization_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> org_unit
  * @type {Number}
  */
  parentID: null,
 /**
  * Organization internal code
  * @type {String}
  */
  code: '',
 /**
  * Common classifier of enterprises and organizations (CCEO)
  * @type {String}
  */
  OKPOCode: null,
 /**
  * Tax number
  * @type {String}
  */
  taxCode: null,
 /**
  * VAT (value-added tax) registration certificate number
  * @type {String}
  */
  vatCode: null,
 /**
  * Name of organization without the quotes and abbreviations
  * @type {String}
  */
  name: '',
 /**
  * Full name of organization, as it&#39;s specified in the certificate of registration
  * @type {String}
  */
  fullName: '',
 /**
  * Organization name in genitive case
  * @type {String}
  */
  nameGen: null,
 /**
  * Organization name in dative case
  * @type {String}
  */
  nameDat: null,
 /**
  * Full name of organization, as it&#39;s specified in the certificate of registration, in genitive case
  * @type {String}
  */
  fullNameGen: null,
 /**
  * Full name of organization, as it&#39;s specified in the certificate of registration, in dative case
  * @type {String}
  */
  fullNameDat: null,
 /**
  * Organization description
  * @type {String}
  */
  description: null,
 /**
  * Organization type -> cdn_orgbusinesstype
  * @type {Number}
  */
  orgBusinessTypeID: null,
 /**
  * Ownership type -> cdn_orgownershiptype
  * @type {Number}
  */
  orgOwnershipTypeID: null,
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
*  List of internal organizations.
 * This dictionary contains list of internal organizations. Each organization links to org_unit by Unity mixin
* @type {org_organization_ns}
*/
const org_organization = new org_organization_ns()
/**
 * List of positions
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_profession_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_profession_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of position
  * @type {String}
  */
  code: '',
 /**
  * Position name
  * @type {String}
  */
  name: '',
 /**
  * Position full name
  * @type {String}
  */
  fullName: '',
 /**
  * Position name in genitive case
  * @type {String}
  */
  nameGen: null,
 /**
  * Position name in dative case
  * @type {String}
  */
  nameDat: null,
 /**
  * Position full name in genitive case
  * @type {String}
  */
  fullNameGen: null,
 /**
  * Position full name in dative case
  * @type {String}
  */
  fullNameDat: null,
 /**
  * @type {String}
  */
  description: '',
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
* List of positions
* @type {org_profession_ns}
*/
const org_profession = new org_profession_ns()
/**
 * List of staff units.
 * This dictionary contains list of staff units. Each staff unit links to org_unit by Unity mixin
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class org_staffunit_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_staffunit_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> org_unit
  * @type {Number}
  */
  parentID: null,
 /**
  * Staff unit internal code
  * @type {String}
  */
  code: '',
 /**
  * Name of staff unit without the quotes and abbreviations
  * @type {String}
  */
  name: '',
 /**
  * Staff unit full name
  * @type {String}
  */
  fullName: '',
 /**
  * Staff unit description
  * @type {String}
  */
  description: null,
 /**
  * Name of staff unit without the quotes and abbreviations in genitive case
  * @type {String}
  */
  nameGen: null,
 /**
  * Name of staff unit without the quotes and abbreviations in dative case
  * @type {String}
  */
  nameDat: null,
 /**
  * Staff unit full name in genitive case
  * @type {String}
  */
  fullNameGen: null,
 /**
  * Full name in dative case
  * @type {String}
  */
  fullNameDat: null,
 /**
  * Caption
  * @type {String}
  */
  caption: '',
 /**
  * Profession -> cdn_profession
  * @type {Number}
  */
  professionExtID: null,
 /**
  * Position -> org_profession
  * @type {Number}
  */
  professionID: 0,
 /**
  * Staff unit type -> cdn_staffunittype
  * @type {Number}
  */
  staffUnitTypeID: 0,
 /**
  * If level is lower - then staff unit is more important
  * @type {Number}
  */
  subordinationLevel: null,
 /**
  * Boss
  * @type {Boolean}
  */
  isBoss: undefined,
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
* List of staff units.
 * This dictionary contains list of staff units. Each staff unit links to org_unit by Unity mixin
* @type {org_staffunit_ns}
*/
const org_staffunit = new org_staffunit_ns()
/**
 * List of organization units.
 * Dictionary which is composed of organizations (org_organization), departments (org_department) and staff units (org_staffunit) by Unity mixin. Dictionary is self-referential, which allows to build a hierarchy of all organizational units in one tree
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes tree
 */
class org_unit_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
org_unit_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> org_unit
  * @type {Number}
  */
  parentID: null,
 /**
  * Organization unit internal code
  * @type {String}
  */
  code: '',
 /**
  * Caption
  * @type {String}
  */
  caption: '',
 /**
  * Organization unit type
  * @type {String}
  */
  unitType: '',
 /**
  * @type {String}
  */
  mi_treePath: '',
 /**
  * @type {Number}
  */
  mi_data_id: 0,
 /**
  * @type {Date}
  */
  mi_dateFrom: new Date(),
 /**
  * @type {Date}
  */
  mi_dateTo: new Date(),
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
 /**
  * @type {String}
  */
  mi_unityEntity: '',
}
/**
* List of organization units.
 * Dictionary which is composed of organizations (org_organization), departments (org_department) and staff units (org_staffunit) by Unity mixin. Dictionary is self-referential, which allows to build a hierarchy of all organizational units in one tree
* @type {org_unit_ns}
*/
const org_unit = new org_unit_ns()
