/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Set of dictionaries, common for most enterprise systems. For internal organization structure see @ubitybase&#x2F;org module
 * @version 5.4.37
 * @module @unitybase/cdn
 */

/**
 * Addresses directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_address_ns extends EntityNamespace {}

/**
 * @typedef cdnAddressAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String|ubmEnumAttrs} addressType - Address type
 * @property {String} value - Address
 * @property {Number} subjectID - Subject
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnAddressAttrs}
 */
cdn_address_ns.attrs = {}

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

/**
 * @typedef cdnAdminunitAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|cdnAdminunitAttrs} parentAdminUnitID - Parent
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {String|ubmEnumAttrs} adminUnitType - Admin unit type
 * @property {String} caption - Caption
 * @property {String} mi_unityEntity
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnAdminunitAttrs}
 */
cdn_adminunit_ns.attrs = {}

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

/**
 * @typedef cdnBankAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} MFO - Bank code
 * @property {String} code - Organization code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {String} phones - Phones
 * @property {String} address - Address
 * @property {Number|cdnCountryAttrs} countryID - Country
 * @property {Number|cdnCityAttrs} cityID - City
 * @property {String} description - Description
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnBankAttrs}
 */
cdn_bank_ns.attrs = {}

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

/**
 * @typedef cdnBuildingAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|cdnStreetAttrs} streetID - Street
 * @property {Number|cdnPostindexAttrs} postIndexID - Zip
 * @property {String} code - Num
 * @property {String} description - Description
 * @property {String|ubmEnumAttrs} buildingType - Type
 * @property {Number|cdnBuildingAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnBuildingAttrs}
 */
cdn_building_ns.attrs = {}

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

/**
 * @typedef cdnCityAttrs
 * @type {object}
 * @property {Number|cdnAdminunitAttrs} ID
 * @property {Number|cdnAdminunitAttrs} parentAdminUnitID - Parent
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} caption - Caption
 * @property {String} description - Description
 * @property {String} postalCode - Postal code
 * @property {String} phoneCode - Phone code
 * @property {Number|cdnCitytypeAttrs} cityTypeID - Type
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnCityAttrs}
 */
cdn_city_ns.attrs = {}

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

/**
 * @typedef cdnCitytypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnCitytypeAttrs}
 */
cdn_citytype_ns.attrs = {}

/**
* City types directory
* @type {cdn_citytype_ns}
*/
const cdn_citytype = new cdn_citytype_ns()
/**
 * Сlassifiers
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_classifier_ns extends EntityNamespace {}

/**
 * @typedef cdnClassifierAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} description - Description
 * @property {String|ubmEnumAttrs} orderByAttr - Classifier items order
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnClassifierAttrs}
 */
cdn_classifier_ns.attrs = {}

/**
* Сlassifiers
* @type {cdn_classifier_ns}
*/
const cdn_classifier = new cdn_classifier_ns()
/**
 * Сlassifier Item
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes tree
 */
class cdn_classifieritem_ns extends EntityNamespace {}

/**
 * @typedef cdnClassifieritemAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - System code
 * @property {String} name - Name
 * @property {Number|cdnClassifierAttrs} classifierID - Classifier
 * @property {Number|cdnClassifieritemAttrs} parentID - Parent
 * @property {Number} hierarchyLevel - Level
 * @property {String} mi_treePath
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnClassifieritemAttrs}
 */
cdn_classifieritem_ns.attrs = {}

/**
* Сlassifier Item
* @type {cdn_classifieritem_ns}
*/
const cdn_classifieritem = new cdn_classifieritem_ns()
/**
 * Contacts directory
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_contact_ns extends EntityNamespace {}

/**
 * @typedef cdnContactAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|cdnContacttypeAttrs} contactTypeID - Contact type
 * @property {String} value - Contact
 * @property {Number} subjectID - Subject
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnContactAttrs}
 */
cdn_contact_ns.attrs = {}

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

/**
 * @typedef cdnContacttypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnContacttypeAttrs}
 */
cdn_contacttype_ns.attrs = {}

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

/**
 * @typedef cdnCorrindexAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnCorrindexAttrs}
 */
cdn_corrindex_ns.attrs = {}

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

/**
 * @typedef cdnCountryAttrs
 * @type {object}
 * @property {Number|cdnAdminunitAttrs} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {Number} intCode - Digital code
 * @property {String} symbol2 - ISO code
 * @property {String} symbol3 - IOC code
 * @property {String} description - Description
 * @property {String} phoneCode - Phone code
 * @property {Number|cdnCurrencyAttrs} currencyID - Currency
 * @property {Number|cdnCityAttrs} capitalID - Capital
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnCountryAttrs}
 */
cdn_country_ns.attrs = {}

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

/**
 * @typedef cdnCurrencyAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number} intCode - Digital code
 * @property {String} code3 - 3-character code
 * @property {String} name - Name
 * @property {Number} curMult - Default multiplicity
 * @property {String} description - Description
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnCurrencyAttrs}
 */
cdn_currency_ns.attrs = {}

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

/**
 * @typedef cdnDepartmentAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {String} description - Description
 * @property {String} nameGen - Name in genitive case
 * @property {String} nameDat - Name in dative case
 * @property {String} fullNameGen - Full name in genitive case
 * @property {String} fullNameDat - Full name in dative case
 * @property {Number|cdnDeptypeAttrs} depTypeID - Type
 * @property {Number|cdnOrganizationAttrs} organizationID - Organization
 * @property {Number|cdnDepartmentAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnDepartmentAttrs}
 */
cdn_department_ns.attrs = {}

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

/**
 * @typedef cdnDeptypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnDeptypeAttrs}
 */
cdn_deptype_ns.attrs = {}

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

/**
 * @typedef cdnEmployeeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} lastName - Last name
 * @property {String} firstName - First name
 * @property {String} middleName - Middle name
 * @property {String} description - Description
 * @property {String|ubmEnumAttrs} sexType - Gender
 * @property {String} uniqNum - Employee number
 * @property {String} suffix - Suffix
 * @property {String} shortFIO - Last name with initials
 * @property {String} fullFIO - Full name
 * @property {String} apply - Treatment
 * @property {String} lastNameGen - Last name in genitive
 * @property {String} lastNameDat - Last name in dative
 * @property {String} firstNameGen - First name in genitive
 * @property {String} firstNameDat - First name in dative
 * @property {String} middleNameGen - Middle name in genitive
 * @property {String} middleNameDat - Middle name in dative
 * @property {String} shortFIOGen - Short name in genitive
 * @property {String} shortFIODat - Short name in dative
 * @property {String} fullFIOGen - Full name in genitive
 * @property {String} fullFIODat - Full name in dative
 * @property {String} applyGen - Treatment in genitive
 * @property {String} applyDat - Treatment in dative
 * @property {Number|cdnDepartmentAttrs} departmentID - Department
 * @property {Number|cdnOrganizationAttrs} organizationID - Organization
 * @property {String} addrText - Addressee formulation
 * @property {Number|cdnEmployeeAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnEmployeeAttrs}
 */
cdn_employee_ns.attrs = {}

/**
* List of employees of external organizations
* @type {cdn_employee_ns}
*/
const cdn_employee = new cdn_employee_ns()
/**
 * Languages directory according to ISO-639-1
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_language_ns extends EntityNamespace {}

/**
 * @typedef cdnLanguageAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - ISO 639-1 code
 * @property {String} languageName - Language name
 * @property {String} nativeName - Native name (Endonym)
 * @property {Boolean} isRTL - Is right-to-left
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnLanguageAttrs}
 */
cdn_language_ns.attrs = {}

/**
* Languages directory according to ISO-639-1
* @type {cdn_language_ns}
*/
const cdn_language = new cdn_language_ns()
/**
 * Nationality
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_nationality_ns extends EntityNamespace {}

/**
 * @typedef cdnNationalityAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} nameM - Name(male)
 * @property {String} nameF - Name(female)
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnNationalityAttrs}
 */
cdn_nationality_ns.attrs = {}

/**
* Nationality
* @type {cdn_nationality_ns}
*/
const cdn_nationality = new cdn_nationality_ns()
/**
 * Organization&#39;s settlement accounts
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_orgaccount_ns extends EntityNamespace {}

/**
 * @typedef cdnOrgaccountAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|cdnOrganizationAttrs} organizationID - Organization
 * @property {Number|cdnCurrencyAttrs} currencyID - Currency
 * @property {Number|cdnBankAttrs} bankID - Bank
 * @property {String} code - Code
 * @property {String|ubmEnumAttrs} acctype - Type
 * @property {String} description - Description
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnOrgaccountAttrs}
 */
cdn_orgaccount_ns.attrs = {}

/**
* Organization&#39;s settlement accounts
* @type {cdn_orgaccount_ns}
*/
const cdn_orgaccount = new cdn_orgaccount_ns()
/**
 * Organization types dictionary (LTD etc.)
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_orgbusinesstype_ns extends EntityNamespace {}

/**
 * @typedef cdnOrgbusinesstypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} shortName - Acronim
 * @property {String} name - Name
 * @property {String} fullName - Description
 * @property {Boolean} isGovAuthority - Gov. authority
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnOrgbusinesstypeAttrs}
 */
cdn_orgbusinesstype_ns.attrs = {}

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

/**
 * @typedef cdnOrgownershiptypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} shortName - Acronim
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnOrgownershiptypeAttrs}
 */
cdn_orgownershiptype_ns.attrs = {}

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

/**
 * @typedef cdnPersonAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} lastName - Last name
 * @property {String} firstName - First name
 * @property {String} middleName - Middle name
 * @property {String} identCard - Identity card
 * @property {String} workPlacePos - Place of work, position
 * @property {Date} birthDate - Birthday
 * @property {String} description - Description
 * @property {String|ubmEnumAttrs} sexType - Gender
 * @property {String} suffix - Suffix
 * @property {String} shortFIO - Short name
 * @property {String} fullFIO - Full name
 * @property {String} apply - Apply
 * @property {String} photo - Photo
 * @property {String} lastNameGen - Last name in genitive
 * @property {String} lastNameDat - Last name in dative
 * @property {String} firstNameGen - First name in genitive
 * @property {String} firstNameDat - First name in dative
 * @property {String} middleNameGen - Middle name in genitive
 * @property {String} middleNameDat - Middle name in dative
 * @property {String} shortFIOGen - Short name in genitive
 * @property {String} shortFIODat - Short name in dative
 * @property {String} fullFIOGen - Full name in genitive
 * @property {String} fullFIODat - Full name in dative
 * @property {String} applyGen - Apply in genitive
 * @property {String} applyDat - Apply in dative
 * @property {Number|cdnRegionAttrs} regionID - Region
 * @property {Number|cdnPersonsocialstatusAttrs} socialstatusID - Social status
 * @property {Number|cdnPersoncategoryAttrs} categoryID - Category
 * @property {Number|cdnNationalityAttrs} nationality - Nationality
 * @property {Boolean} resident - Resident?
 * @property {Number|cdnPersonclassAttrs} classID - Person classification
 * @property {Number|cdnPersonAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnPersonAttrs}
 */
cdn_person_ns.attrs = {}

/**
* Physical persons dictionary.
 * The directory stores a list of persons (physical persons)
* @type {cdn_person_ns}
*/
const cdn_person = new cdn_person_ns()
/**
 * Category of persons.
 * The directory stores a list of categories or physical persons
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_personcategory_ns extends EntityNamespace {}

/**
 * @typedef cdnPersoncategoryAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnPersoncategoryAttrs}
 */
cdn_personcategory_ns.attrs = {}

/**
* Category of persons.
 * The directory stores a list of categories or physical persons
* @type {cdn_personcategory_ns}
*/
const cdn_personcategory = new cdn_personcategory_ns()
/**
 * Person classification.
 * Internal classification of persons
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_personclass_ns extends EntityNamespace {}

/**
 * @typedef cdnPersonclassAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnPersonclassAttrs}
 */
cdn_personclass_ns.attrs = {}

/**
* Person classification.
 * Internal classification of persons
* @type {cdn_personclass_ns}
*/
const cdn_personclass = new cdn_personclass_ns()
/**
 * Dictionary of social status.
 * The directory stores a list of social status for individuals
 * @extends EntityNamespace
 * @mixes mStorage
 */
class cdn_personsocialstatus_ns extends EntityNamespace {}

/**
 * @typedef cdnPersonsocialstatusAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnPersonsocialstatusAttrs}
 */
cdn_personsocialstatus_ns.attrs = {}

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

/**
 * @typedef cdnPostindexAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Index
 * @property {Number|cdnStreetAttrs} streetID - Street
 * @property {String} description - Description
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnPostindexAttrs}
 */
cdn_postindex_ns.attrs = {}

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

/**
 * @typedef cdnProfessionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} description - Caption
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnProfessionAttrs}
 */
cdn_profession_ns.attrs = {}

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

/**
 * @typedef cdnRegionAttrs
 * @type {object}
 * @property {Number|cdnAdminunitAttrs} ID
 * @property {Number|cdnAdminunitAttrs} parentAdminUnitID - Parent
 * @property {String} code - Code
 * @property {Number|cdnRegiontypeAttrs} regionTypeID - Type
 * @property {String} name - Name
 * @property {String} caption - Caption
 * @property {String} fullName - Full name
 * @property {String} description - Description
 * @property {String} phoneCode - Phone code
 * @property {Number|cdnCityAttrs} centerID - Center
 * @property {Number|cdnRegionAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnRegionAttrs}
 */
cdn_region_ns.attrs = {}

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

/**
 * @typedef cdnRegiontypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnRegiontypeAttrs}
 */
cdn_regiontype_ns.attrs = {}

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

/**
 * @typedef cdnStaffunittypeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnStaffunittypeAttrs}
 */
cdn_staffunittype_ns.attrs = {}

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

/**
 * @typedef cdnStreetAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {String} code - Code
 * @property {String|ubmEnumAttrs} streetType - Type
 * @property {Number|cdnCityAttrs} cityID - City
 * @property {Number|cdnStreetAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {cdnStreetAttrs}
 */
cdn_street_ns.attrs = {}

/**
* List of streets.
 * В этом справочнике хранится перечень вулиць
* @type {cdn_street_ns}
*/
const cdn_street = new cdn_street_ns()
