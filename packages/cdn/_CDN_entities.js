/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Set of dictionaries, common for most enterprise systems. For internal organization structure see @ubitybase&#x2F;org module
 * @version 5.0.10
 * @module @unitybase/cdn
 */

/**
 * Addresses directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_address_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_address_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  addressType: '',
 /**
  * @type {String}
  */
  value: '',
 /**
  * Reference to address owner. No database constraint here, since we don't know all entities what want to store contacts. Entity developer must remove contacts in beforedelete manually.
  * @type {Number}
  */
  subjectID: 0,
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
* Addresses directory
* @type {cdn_address_ns}
*/
const cdn_address = new cdn_address_ns()
/**
 * Admin unit (country, region, city).
 * Main parent for countries, regions and cities
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_adminunit_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_adminunit_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> cdn_adminunit
  * @type {Number}
  */
  parentAdminUnitID: null,
 /**
  * Internal code
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
  fullName: null,
 /**
  * String representation of unit's type for fast queries
  * @type {String}
  */
  adminUnitType: '',
 /**
  * @type {String}
  */
  caption: null,
 /**
  * @type {String}
  */
  mi_unityEntity: '',
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
* Admin unit (country, region, city).
 * Main parent for countries, regions and cities
* @type {cdn_adminunit_ns}
*/
const cdn_adminunit = new cdn_adminunit_ns()
/**
 * Bank branches directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_bank_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_bank_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Bank branch code
  * @type {String}
  */
  MFO: '',
 /**
  * Bank organization code
  * @type {String}
  */
  code: null,
 /**
  * Name without quotes and ownership. For searching data.
  * @type {String}
  */
  name: '',
 /**
  * Full official bank name . For displaying in reports.
  * @type {String}
  */
  fullName: '',
 /**
  * @type {String}
  */
  phones: null,
 /**
  * @type {String}
  */
  address: null,
 /**
  * Registration country -> cdn_country
  * @type {Number}
  */
  countryID: null,
 /**
  * City -> cdn_city
  * @type {Number}
  */
  cityID: null,
 /**
  * Description
  * description
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
* Bank branches directory
* @type {cdn_bank_ns}
*/
const cdn_bank = new cdn_bank_ns()
/**
 * List of buildings
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class cdn_building_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_building_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  streetID: 0,
 /**
  * @type {Number}
  */
  postIndexID: 0,
 /**
  * Code
  * @type {String}
  */
  code: '',
 /**
  * Description
  * @type {String}
  */
  description: null,
 /**
  * Type
  * @type {String}
  */
  buildingType: '',
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
* List of buildings
* @type {cdn_building_ns}
*/
const cdn_building = new cdn_building_ns()
/**
 * Cities directory
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class cdn_city_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_city_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  parentAdminUnitID: 0,
 /**
  * City code
  * @type {String}
  */
  code: '',
 /**
  * City name
  * @type {String}
  */
  name: '',
 /**
  * @type {String}
  */
  caption: null,
 /**
  * City description
  * @type {String}
  */
  description: null,
 /**
  * City postal code
  * @type {String}
  */
  postalCode: null,
 /**
  * City phone code
  * @type {String}
  */
  phoneCode: null,
 /**
  * City type -> cdn_citytype
  * @type {Number}
  */
  cityTypeID: null,
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
* Cities directory
* @type {cdn_city_ns}
*/
const cdn_city = new cdn_city_ns()
/**
 * City types directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_citytype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_citytype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Internal code of city type
  * @type {String}
  */
  code: '',
 /**
  * City type name
  * @type {String}
  */
  name: '',
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
* City types directory
* @type {cdn_citytype_ns}
*/
const cdn_citytype = new cdn_citytype_ns()
/**
 * Contacts directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_contact_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_contact_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  contactTypeID: 0,
 /**
  * @type {String}
  */
  value: '',
 /**
  * Reference to contact owner. No database constraint here, since we don't know all entities what want to store contacts. Entity developer must remove contacts in delete:before manually
  * @type {Number}
  */
  subjectID: 0,
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
* Contacts directory
* @type {cdn_contact_ns}
*/
const cdn_contact = new cdn_contact_ns()
/**
 * Contact types directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_contacttype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_contacttype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  code: '',
 /**
  * Contact type name
  * @type {String}
  */
  name: '',
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
* Contact types directory
* @type {cdn_contacttype_ns}
*/
const cdn_contacttype = new cdn_contacttype_ns()
/**
 * Correspondent indexes directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_corrindex_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_corrindex_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of correspondent index
  * @type {String}
  */
  code: '',
 /**
  * Name of correspondent index
  * @type {String}
  */
  name: '',
 /**
  * Full name of correspondent index
  * @type {String}
  */
  fullName: '',
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
* Correspondent indexes directory
* @type {cdn_corrindex_ns}
*/
const cdn_corrindex = new cdn_corrindex_ns()
/**
 * Countries directory
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class cdn_country_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_country_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Internal code
  * @type {String}
  */
  code: '',
 /**
  * Name of the country
  * @type {String}
  */
  name: '',
 /**
  * Full official name of the country
  * @type {String}
  */
  fullName: '',
 /**
  * Digital code of the country
  * @type {Number}
  */
  intCode: 0,
 /**
  * 2-character code of the country by ISO classification
  * @type {String}
  */
  symbol2: '',
 /**
  * 3-character code of the country by IOC classification
  * @type {String}
  */
  symbol3: '',
 /**
  * Country description
  * @type {String}
  */
  description: null,
 /**
  * Country phone code
  * @type {String}
  */
  phoneCode: null,
 /**
  * Main currency of the country -> cdn_currency
  * @type {Number}
  */
  currencyID: null,
 /**
  * Capital of the country -> cdn_city
  * @type {Number}
  */
  capitalID: null,
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
* Countries directory
* @type {cdn_country_ns}
*/
const cdn_country = new cdn_country_ns()
/**
 * Currencies dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_currency_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_currency_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Digital code of currency
  * @type {Number}
  */
  intCode: 0,
 /**
  * 3-character code of currency
  * @type {String}
  */
  code3: '',
 /**
  * Name of currency
  * @type {String}
  */
  name: '',
 /**
  * Default multiplicity
  * @type {Number}
  */
  curMult: 0,
 /**
  * Description
  * Description
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
* Currencies dictionary
* @type {cdn_currency_ns}
*/
const cdn_currency = new cdn_currency_ns()
/**
 * External departments dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class cdn_department_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_department_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of the department
  * @type {String}
  */
  code: null,
 /**
  * Name of the department
  * @type {String}
  */
  name: '',
 /**
  * Full official name of the department
  * @type {String}
  */
  fullName: null,
 /**
  * Description of the department
  * @type {String}
  */
  description: null,
 /**
  * Department name in genitive case
  * @type {String}
  */
  nameGen: null,
 /**
  * Department name in dative case
  * @type {String}
  */
  nameDat: null,
 /**
  * Department full official name in genitive case
  * @type {String}
  */
  fullNameGen: null,
 /**
  * Department full official name in dative case
  * @type {String}
  */
  fullNameDat: null,
 /**
  * Type of the department -> cdn_deptype
  * @type {Number}
  */
  depTypeID: null,
 /**
  * Parent external organization -> cdn_organization
  * @type {Number}
  */
  organizationID: null,
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
* External departments dictionary
* @type {cdn_department_ns}
*/
const cdn_department = new cdn_department_ns()
/**
 * Department types dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_deptype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_deptype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of the department type
  * @type {String}
  */
  code: '',
 /**
  * Name of the department type
  * @type {String}
  */
  name: '',
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
* Department types dictionary
* @type {cdn_deptype_ns}
*/
const cdn_deptype = new cdn_deptype_ns()
/**
 * List of employees of external organizations
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class cdn_employee_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_employee_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
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
  * Employee description
  * @type {String}
  */
  description: null,
 /**
  * Employee sex
  * @type {String}
  */
  sexType: '',
 /**
  * Employee number
  * @type {String}
  */
  uniqNum: null,
 /**
  * Suffix
  * @type {String}
  */
  suffix: null,
 /**
  * Example: A.O. Ivanov
  * @type {String}
  */
  shortFIO: '',
 /**
  * Example: Anton Olegovich Ivanov
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
  * Department of external organization, which employee belongs -> cdn_department
  * @type {Number}
  */
  departmentID: null,
 /**
  * External organization, which employee belongs -> cdn_organization
  * @type {Number}
  */
  organizationID: 0,
 /**
  * Formulation of the recipient, that will appear in the formation of outgoing document
  * @type {String}
  */
  addrText: null,
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
* List of employees of external organizations
* @type {cdn_employee_ns}
*/
const cdn_employee = new cdn_employee_ns()
/**
 * Organization&#39;s current accounts dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_orgaccount_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_orgaccount_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Organization -> cdn_organization
  * @type {Number}
  */
  organizationID: 0,
 /**
  * Currency of the account -> cdn_currency
  * @type {Number}
  */
  currencyID: 0,
 /**
  * Bank of the account -> cdn_bank
  * @type {Number}
  */
  bankID: 0,
 /**
  * Code of the account
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
* Organization&#39;s current accounts dictionary
* @type {cdn_orgaccount_ns}
*/
const cdn_orgaccount = new cdn_orgaccount_ns()
/**
 * List of external organizations
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes fts
 */
class cdn_organization_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_organization_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Organization internal code
  * @type {String}
  */
  code: null,
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
  * Index of correspondent -> cdn_corrindex
  * @type {Number}
  */
  corrIndexID: null,
 /**
  * Formulation of the recipient, that will appear in the formation of PDF outgoing document
  * @type {String}
  */
  addrText: null,
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
* List of external organizations
* @type {cdn_organization_ns}
*/
const cdn_organization = new cdn_organization_ns()
/**
 * Organization types dictionary (LTD etc.)
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_orgbusinesstype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_orgbusinesstype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of the organization type
  * @type {String}
  */
  code: '',
 /**
  * Acronim of the organization type
  * @type {String}
  */
  shortName: null,
 /**
  * Name of the organization type
  * @type {String}
  */
  name: '',
 /**
  * Description of the organization type
  * @type {String}
  */
  fullName: null,
 /**
  * Sign, that the organization of this type is a government authority
  * @type {Boolean}
  */
  isGovAuthority: undefined,
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
* Organization types dictionary (LTD etc.)
* @type {cdn_orgbusinesstype_ns}
*/
const cdn_orgbusinesstype = new cdn_orgbusinesstype_ns()
/**
 * Types of ownership
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_orgownershiptype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_orgownershiptype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of the ownership type
  * @type {String}
  */
  code: '',
 /**
  * Acronim of the ownership type
  * @type {String}
  */
  shortName: null,
 /**
  * Name of the ownership type
  * @type {String}
  */
  name: '',
 /**
  * Full name of the ownership type
  * @type {String}
  */
  fullName: null,
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
* Types of ownership
* @type {cdn_orgownershiptype_ns}
*/
const cdn_orgownershiptype = new cdn_orgownershiptype_ns()
/**
 * Physical persons dictionary.
 * The directory stores a list of persons (physical persons)
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes fts
 */
class cdn_person_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_person_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Last name of the person
  * @type {String}
  */
  lastName: '',
 /**
  * First name of the person
  * @type {String}
  */
  firstName: '',
 /**
  * Middle name of the person
  * @type {String}
  */
  middleName: null,
 /**
  * Person&#39;s identity card
  * @type {String}
  */
  identCard: null,
 /**
  * Place of work, position
  * @type {String}
  */
  workPlacePos: null,
 /**
  * Birthday of the person
  * @type {Date}
  */
  birthDate: null,
 /**
  * Description of the person
  * @type {String}
  */
  description: null,
 /**
  * Sex of the person
  * @type {String}
  */
  sexType: '',
 /**
  * Suffix of the person
  * @type {String}
  */
  suffix: null,
 /**
  * Example: Antonov I.P.
  * @type {String}
  */
  shortFIO: null,
 /**
  * Example: Antonov Ivan Petrovich
  * @type {String}
  */
  fullFIO: '',
 /**
  * Apply to the person
  * @type {String}
  */
  apply: null,
 /**
  * Person&#39;s photo
  * @type {String}
  */
  photo: null,
 /**
  * Person&#39;s last name in genitive case
  * @type {String}
  */
  lastNameGen: null,
 /**
  * Person&#39;s last name in dative case
  * @type {String}
  */
  lastNameDat: null,
 /**
  * Person&#39;s first name in genitive case
  * @type {String}
  */
  firstNameGen: null,
 /**
  * Person&#39;s first name in dative case
  * @type {String}
  */
  firstNameDat: null,
 /**
  * Person&#39;s middle name in genitive case
  * @type {String}
  */
  middleNameGen: null,
 /**
  * Person&#39;s middle name in dative case
  * @type {String}
  */
  middleNameDat: null,
 /**
  * Person&#39;s short name in genitive case
  * @type {String}
  */
  shortFIOGen: null,
 /**
  * Person&#39;s short name in dative case
  * @type {String}
  */
  shortFIODat: null,
 /**
  * Person&#39;s full name in genitive case
  * @type {String}
  */
  fullFIOGen: null,
 /**
  * Person&#39;s full name in dative case
  * @type {String}
  */
  fullFIODat: null,
 /**
  * Apply to the person in genitive case
  * @type {String}
  */
  applyGen: null,
 /**
  * Apply to the person in dative case
  * @type {String}
  */
  applyDat: null,
 /**
  * Person&#39;s region -> cdn_region
  * @type {Number}
  */
  regionID: null,
 /**
  * Social status position -> cdn_personsocialstatus
  * @type {Number}
  */
  socialstatusID: null,
 /**
  * Category position -> cdn_personcategory
  * @type {Number}
  */
  categoryID: null,
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
* Physical persons dictionary.
 * The directory stores a list of persons (physical persons)
* @type {cdn_person_ns}
*/
const cdn_person = new cdn_person_ns()
/**
 * Ctegory of persons.
 * The directory stores a list of categories or physical persons
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_personcategory_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_personcategory_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code
  * @type {String}
  */
  code: '',
 /**
  * Name of category
  * @type {String}
  */
  name: '',
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
* Ctegory of persons.
 * The directory stores a list of categories or physical persons
* @type {cdn_personcategory_ns}
*/
const cdn_personcategory = new cdn_personcategory_ns()
/**
 * Dictionary of social status.
 * The directory stores a list of social status for individuals
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_personsocialstatus_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_personsocialstatus_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code
  * @type {String}
  */
  code: '',
 /**
  * Name of social status
  * @type {String}
  */
  name: '',
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
* Dictionary of social status.
 * The directory stores a list of social status for individuals
* @type {cdn_personsocialstatus_ns}
*/
const cdn_personsocialstatus = new cdn_personsocialstatus_ns()
/**
 * ZIP codes
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_postindex_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_postindex_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Index
  * @type {String}
  */
  code: '',
 /**
  * @type {Number}
  */
  streetID: 0,
 /**
  * Description
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
* ZIP codes
* @type {cdn_postindex_ns}
*/
const cdn_postindex = new cdn_postindex_ns()
/**
 * Dictionary of standard professions
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_profession_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_profession_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code
  * @type {String}
  */
  code: '',
 /**
  * Name of profession
  * @type {String}
  */
  name: '',
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
* Dictionary of standard professions
* @type {cdn_profession_ns}
*/
const cdn_profession = new cdn_profession_ns()
/**
 * Regions dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class cdn_region_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_region_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Parent -> cdn_adminunit
  * @type {Number}
  */
  parentAdminUnitID: 0,
 /**
  * Internal code
  * @type {String}
  */
  code: '',
 /**
  * Type of region -> cdn_regiontype
  * @type {Number}
  */
  regionTypeID: null,
 /**
  * Name of region
  * @type {String}
  */
  name: '',
 /**
  * Caption
  * @type {String}
  */
  caption: null,
 /**
  * Full name of region
  * @type {String}
  */
  fullName: '',
 /**
  * Description of region
  * @type {String}
  */
  description: null,
 /**
  * Phone code of region
  * @type {String}
  */
  phoneCode: null,
 /**
  * Center of region -> cdn_city
  * @type {Number}
  */
  centerID: null,
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
* Regions dictionary
* @type {cdn_region_ns}
*/
const cdn_region = new cdn_region_ns()
/**
 * Region types dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_regiontype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_regiontype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code
  * @type {String}
  */
  code: '',
 /**
  * Name of region type
  * @type {String}
  */
  name: '',
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
* Region types dictionary
* @type {cdn_regiontype_ns}
*/
const cdn_regiontype = new cdn_regiontype_ns()
/**
 * Staffunit types dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_staffunittype_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_staffunittype_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of the staffunit type
  * @type {String}
  */
  code: '',
 /**
  * Name of the staffunit type
  * @type {String}
  */
  name: '',
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
* Staffunit types dictionary
* @type {cdn_staffunittype_ns}
*/
const cdn_staffunittype = new cdn_staffunittype_ns()
/**
 * List of streets.
 * В этом справочнике хранится перечень вулиць
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class cdn_street_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
cdn_street_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Street name
  * @type {String}
  */
  name: '',
 /**
  * Street full name
  * @type {String}
  */
  fullName: '',
 /**
  * Code
  * @type {String}
  */
  code: null,
 /**
  * Type
  * @type {String}
  */
  streetType: null,
 /**
  * City -> cdn_city
  * @type {Number}
  */
  cityID: null,
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
* List of streets.
 * В этом справочнике хранится перечень вулиць
* @type {cdn_street_ns}
*/
const cdn_street = new cdn_street_ns()
