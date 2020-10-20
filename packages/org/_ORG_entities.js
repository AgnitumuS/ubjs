/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Organisation structure
 * @version 5.4.7
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

/**
 * @typedef orgDepartmentAttrs
 * @type {object}
 * @property {Number|orgUnitAttrs} ID
 * @property {Number|orgUnitAttrs} parentID - Parent
 * @property {String} code - Internal code
 * @property {String} name - Department name
 * @property {String} fullName - Department full name
 * @property {String} description - Department description
 * @property {String} nameGen - Department name in genitive case
 * @property {String} nameDat - Department name in dative case
 * @property {String} fullNameGen - Department full name in genitive case
 * @property {String} fullNameDat - Department full name in dative case
 * @property {Number|cdnDeptypeAttrs} depTypeID - Department type
 * @property {Boolean} isClerical - Clerical?
 * @property {String} caption - Caption
 * @property {Number|orgDepartmentAttrs} mi_data_id
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
 * @type {orgDepartmentAttrs}
 */
org_department_ns.attrs = {}

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

/**
 * @typedef orgDiagramAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgUnitAttrs} orgunitID - Root
 * @property {String} caption - Name
 * @property {Boolean} isdefault - Default
 * @property {String} document - Organization chart
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
 * @type {orgDiagramAttrs}
 */
org_diagram_ns.attrs = {}

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

/**
 * @typedef orgEmployeeAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {Number|ubaUserAttrs} userID - User
 * @property {String} lastName - Last name
 * @property {String} firstName - First name
 * @property {String} middleName - Middle name
 * @property {Date} birthDate - Date of birth
 * @property {String} description - Comment
 * @property {String|ubmEnumAttrs} sexType - Gender
 * @property {String} suffix - Suffix
 * @property {String} shortFIO - Last name with initials
 * @property {String} fullFIO - Full name
 * @property {String} apply - Treatment
 * @property {String} lastNameGen - Last name in genitive
 * @property {String} lastNameDat - Last name in dative
 * @property {String} lastNameObj - Last name in objective
 * @property {String} firstNameGen - First name in genitive
 * @property {String} firstNameDat - First name in dative
 * @property {String} firstNameObj - First name in objective
 * @property {String} middleNameGen - Middle name in genitive
 * @property {String} middleNameDat - Middle name in dative
 * @property {String} middleNameObj - Middle name in objective
 * @property {String} shortFIOGen - Short name in genitive
 * @property {String} shortFIODat - Short name in dative
 * @property {String} shortFIOObj - Short name in objective
 * @property {String} fullFIOGen - Full name in genitive
 * @property {String} fullFIODat - Full name in dative
 * @property {String} fullFIOObj - Full name in objective
 * @property {String} applyGen - Treatment in genitive
 * @property {String} applyDat - Treatment in dative
 * @property {String} applyObj - Treatment in objective
 * @property {String} facsimile - Facsimile
 * @property {Number|orgEmployeeAttrs} mi_data_id
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
 * @type {orgEmployeeAttrs}
 */
org_employee_ns.attrs = {}

/**
* List of employees of internal organizations.
 * This dictionary contains list of departments.  Employee is assigned to staff units in org_employeeonstaff entity
* @type {org_employee_ns}
*/
const org_employee = new org_employee_ns()
/**
 * List of internal organization assignments.
 * The denouement essence, which indicates which employee on which staff unit works (appointment). There is also a type of assignment (temporary, permanent, part-time, etc.)
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class org_employeeonstaff_ns extends EntityNamespace {}

/**
 * @typedef orgEmployeeonstaffAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} tabNo - Employee №
 * @property {Number|orgEmployeeAttrs} employeeID - Employee
 * @property {Number|orgStaffunitAttrs} staffUnitID - Staff unit
 * @property {String|ubmEnumAttrs} employeeOnStaffType - Assignment type
 * @property {String} description - Description
 * @property {String} caption - Caption
 * @property {Number|orgEmployeeonstaffAttrs} mi_data_id
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
 * @type {orgEmployeeonstaffAttrs}
 */
org_employeeonstaff_ns.attrs = {}

/**
* List of internal organization assignments.
 * The denouement essence, which indicates which employee on which staff unit works (appointment). There is also a type of assignment (temporary, permanent, part-time, etc.)
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

/**
 * @typedef orgEmployeeonstaffPendingAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgEmployeeonstaffAttrs} emponstaffID - Assignment
 * @property {Date} startDate - Start
 * @property {Date} endDate - End
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {orgEmployeeonstaffPendingAttrs}
 */
org_employeeonstaff_pending_ns.attrs = {}

/**
* Assignment with pending date.
 * Entity which contains links to assignments with pending date
* @type {org_employeeonstaff_pending_ns}
*/
const org_employeeonstaff_pending = new org_employeeonstaff_pending_ns()
/**
 * List of typical executors groups for tasks executors
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class org_execgroup_ns extends EntityNamespace {}

/**
 * @typedef orgExecgroupAttrs
 * @type {object}
 * @property {Number|orgUnitAttrs} ID
 * @property {Number|orgOrganizationAttrs} parentID - Parent unit
 * @property {String|ubmEnumAttrs} groupType - Type
 * @property {String} code - Code
 * @property {String} name - Name of the group
 * @property {String} nameGen - Name in genitive case
 * @property {String} nameDat - Name in dative case
 * @property {Number|orgExecgroupAttrs} mi_data_id
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
 * @type {orgExecgroupAttrs}
 */
org_execgroup_ns.attrs = {}

/**
* List of typical executors groups for tasks executors
* @type {org_execgroup_ns}
*/
const org_execgroup = new org_execgroup_ns()
/**
 * Executors who attached to group and used for executors autofilling in resolutions on group addition
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_execgroupmember_ns extends EntityNamespace {}

/**
 * @typedef orgExecgroupmemberAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgExecgroupAttrs} execGroupID - Executors group
 * @property {Number|orgStaffunitAttrs} orgUnitID - Executor
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {orgExecgroupmemberAttrs}
 */
org_execgroupmember_ns.attrs = {}

/**
* Executors who attached to group and used for executors autofilling in resolutions on group addition
* @type {org_execgroupmember_ns}
*/
const org_execgroupmember = new org_execgroupmember_ns()
/**
 * Settlement accounts for internal organizations
 * @extends EntityNamespace
 * @mixes mStorage
 */
class org_orgaccount_ns extends EntityNamespace {}

/**
 * @typedef orgOrgaccountAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgOrganizationAttrs} organizationID - Organization
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
 * @type {orgOrgaccountAttrs}
 */
org_orgaccount_ns.attrs = {}

/**
* Settlement accounts for internal organizations
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

/**
 * @typedef orgOrganizationAttrs
 * @type {object}
 * @property {Number|orgUnitAttrs} ID
 * @property {Number|orgUnitAttrs} parentID - Parent
 * @property {String} code - Internal code
 * @property {String} OKPOCode - CCEO
 * @property {String} taxCode - Tax number
 * @property {String} vatCode - VAT number
 * @property {String} name - Organization name
 * @property {String} fullName - Organization full name
 * @property {String} nameGen - Name in genitive case
 * @property {String} nameDat - Name in dative case
 * @property {String} fullNameGen - Full name in genitive case
 * @property {String} fullNameDat - Full name in dative case
 * @property {String} description - Organization description
 * @property {Number|cdnOrgbusinesstypeAttrs} orgBusinessTypeID - Organization type
 * @property {Number|cdnOrgownershiptypeAttrs} orgOwnershipTypeID - Ownership type
 * @property {Number|orgOrganizationAttrs} mi_data_id
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
 * @type {orgOrganizationAttrs}
 */
org_organization_ns.attrs = {}

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

/**
 * @typedef orgProfessionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} name - Name
 * @property {String} fullName - Full name
 * @property {String} nameGen - Name in genitive case
 * @property {String} nameDat - Name in dative case
 * @property {String} fullNameGen - Full name in genitive case
 * @property {String} fullNameDat - Full name in dative case
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
 * @type {orgProfessionAttrs}
 */
org_profession_ns.attrs = {}

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

/**
 * @typedef orgStaffunitAttrs
 * @type {object}
 * @property {Number|orgUnitAttrs} ID
 * @property {Number|orgUnitAttrs} parentID - Parent
 * @property {String} code - Internal code
 * @property {String} name - Staff unit name
 * @property {String} fullName - Full name
 * @property {String} description - Staff unit description
 * @property {String} nameGen - Staff unit name in genitive case
 * @property {String} nameDat - Staff unit name in dative case
 * @property {String} fullNameGen - Full name in genitive case
 * @property {String} fullNameDat - Full name in dative case
 * @property {String} caption - Caption
 * @property {Number|cdnProfessionAttrs} professionExtID - Profession
 * @property {Number|orgProfessionAttrs} professionID - Position
 * @property {Number|cdnStaffunittypeAttrs} staffUnitTypeID - Staff unit type
 * @property {Number} subordinationLevel - Subordination level
 * @property {Boolean} isBoss - Boss
 * @property {Number|orgStaffunitAttrs} mi_data_id
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
 * @type {orgStaffunitAttrs}
 */
org_staffunit_ns.attrs = {}

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

/**
 * @typedef orgUnitAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgUnitAttrs} parentID - Parent
 * @property {String} code - Internal code
 * @property {String} caption - Caption
 * @property {String|ubmEnumAttrs} unitType - Org. unit type
 * @property {String} mi_treePath
 * @property {Number|orgUnitAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 * @property {String} mi_unityEntity
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {orgUnitAttrs}
 */
org_unit_ns.attrs = {}

/**
* List of organization units.
 * Dictionary which is composed of organizations (org_organization), departments (org_department) and staff units (org_staffunit) by Unity mixin. Dictionary is self-referential, which allows to build a hierarchy of all organizational units in one tree
* @type {org_unit_ns}
*/
const org_unit = new org_unit_ns()
