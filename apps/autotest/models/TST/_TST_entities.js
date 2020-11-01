/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * UnityBasde autotest app
 * @version 1.0.0
 * @module tst
 */

/**
 * List of external organizations
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes fts
 */
class cdn_organization_ns extends EntityNamespace {}

/**
 * @typedef cdnOrganizationAttrs
 * @type {object}
 * @property {Number} ID
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
 * @property {Number|cdnCorrindexAttrs} corrIndexID - Index of correspondent
 * @property {String} addrText - Addressee formulation
 * @property {String} caption - Caption
 * @property {Number|cdnOrganizationAttrs} mi_data_id
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
 * @type {cdnOrganizationAttrs}
 */
cdn_organization_ns.attrs = {}

/**
* List of external organizations
* @type {cdn_organization_ns}
*/
const cdn_organization = new cdn_organization_ns()
/**
 * ub test main unity
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class tst_2unity_ns extends EntityNamespace {}

/**
 * @typedef tst2UnityAttrs
 * @type {object}
 * @property {Number|tstMainunityAttrs} ID
 * @property {String} code - Code
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
 * @type {tst2UnityAttrs}
 */
tst_2unity_ns.attrs = {}

/**
* ub test main unity
* @type {tst_2unity_ns}
*/
const tst_2unity = new tst_2unity_ns()
/**
 * ub test main unity
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes unity
 */
class tst_3unity_ns extends EntityNamespace {}

/**
 * @typedef tst3UnityAttrs
 * @type {object}
 * @property {Number|tst2UnityAttrs} ID
 * @property {String} code - Code
 * @property {String} caption - Caption
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
 * @type {tst3UnityAttrs}
 */
tst_3unity_ns.attrs = {}

/**
* ub test main unity
* @type {tst_3unity_ns}
*/
const tst_3unity = new tst_3unity_ns()
/**
 * Document Discussion
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_Discussion_ns extends EntityNamespace {}

/**
 * @typedef tstDiscussionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|tstDictionaryAttrs} documentID - Document
 * @property {String} commentText - Comment
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
 * @type {tstDiscussionAttrs}
 */
tst_Discussion_ns.attrs = {}

/**
* Document Discussion
* @type {tst_Discussion_ns}
*/
const tst_Discussion = new tst_Discussion_ns()
/**
 * Test for mapped ID [UB-1219]
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_IDMapping_ns extends EntityNamespace {}

/**
 * @typedef tstIdMappingAttrs
 * @type {object}
 * @property {Number} ID - Ідентифікатор запису
 * @property {String} code - Code
 * @property {Number} rnd - Random val
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstIdMappingAttrs}
 */
tst_IDMapping_ns.attrs = {}

/**
* Test for mapped ID [UB-1219]
* @type {tst_IDMapping_ns}
*/
const tst_IDMapping = new tst_IDMapping_ns()
/**
 * AclRls test
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes aclRls
 */
class tst_aclrls_ns extends EntityNamespace {}

/**
 * @typedef tstAclrlsAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} caption - Заголовок
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstAclrlsAttrs}
 */
tst_aclrls_ns.attrs = {}

/**
* AclRls test
* @type {tst_aclrls_ns}
*/
const tst_aclrls = new tst_aclrls_ns()
/**
 * Autogenerated entity for &quot;aclRls&quot; mixin
 * @extends EntityNamespace
 * @mixes aclRlsStorage
 */
class tst_aclrls_acl_ns extends EntityNamespace {}

/**
 * @typedef tstAclrlsAclAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|tstAclrlsAttrs} instanceID
 * @property {Number} valueID
 * @property {Number|orgUnitAttrs} ounitID
 * @property {Number|ubaSubjectAttrs} subjID
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstAclrlsAclAttrs}
 */
tst_aclrls_acl_ns.attrs = {}

/**
* Autogenerated entity for &quot;aclRls&quot; mixin
* @type {tst_aclrls_acl_ns}
*/
const tst_aclrls_acl = new tst_aclrls_acl_ns()
/**
 * ub test attachments
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_attachment_ns extends EntityNamespace {}

/**
 * @typedef tstAttachmentAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|tstDictionaryAttrs} dictID - Object
 * @property {String} doc_file - File
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstAttachmentAttrs}
 */
tst_attachment_ns.attrs = {}

/**
* ub test attachments
* @type {tst_attachment_ns}
*/
const tst_attachment = new tst_attachment_ns()
/**
 * Test BLOB attributes
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_blob_ns extends EntityNamespace {}

/**
 * @typedef tstBlobAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} description - Description
 * @property {ArrayBuffer} blb - BLOB
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstBlobAttrs}
 */
tst_blob_ns.attrs = {}

/**
* Test BLOB attributes
* @type {tst_blob_ns}
*/
const tst_blob = new tst_blob_ns()
/**
 * Kind of documents, stored in COD
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_category_ns extends EntityNamespace {}

/**
 * @typedef tstCategoryAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {Number} instanceID - InstanceID
 * @property {Number|ubaUserAttrs} ubUser - Allow for user
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstCategoryAttrs}
 */
tst_category_ns.attrs = {}

/**
* Kind of documents, stored in COD
* @type {tst_category_ns}
*/
const tst_category = new tst_category_ns()
/**
 * Test CLOB attributes
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes clobTruncate
 */
class tst_clob_ns extends EntityNamespace {}

/**
 * @typedef tstClobAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} description - Description
 * @property {String} text100 - Text100
 * @property {String} text2 - Text2
 * @property {String} text2000 - Text2000
 * @property {String} textN - textN
 * @property {String} code - Code
 * @property {String} mi_tr_text100 - Text100(100..)
 * @property {String} mi_tr_text2 - Text2(2..)
 * @property {String} mi_tr_text2000 - Text2000(2000..)
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstClobAttrs}
 */
tst_clob_ns.attrs = {}

/**
* Test CLOB attributes
* @type {tst_clob_ns}
*/
const tst_clob = new tst_clob_ns()
/**
 * ub test dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_dictionary_ns extends EntityNamespace {}

/**
 * @typedef tstDictionaryAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} caption - Caption
 * @property {Number} filterValue - filterValue
 * @property {Number} currencyValue - Currency Data
 * @property {Number} floatValue - Float Data
 * @property {Number} intValue - Int Data
 * @property {String} calculated - Назва
 * @property {Boolean} booleanColumn - Test boolean column
 * @property {*} jsonColumn - Test JSON column
 * @property {String} doc_file - Attachment example
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstDictionaryAttrs}
 */
tst_dictionary_ns.attrs = {}

/**
* ub test dictionary
* @type {tst_dictionary_ns}
*/
const tst_dictionary = new tst_dictionary_ns()
/**
 * 
 * @extends EntityNamespace
 */
class tst_dictionary_dict_ns extends EntityNamespace {}

/**
 * @typedef tstDictionaryDictAttrs
 * @type {object}
 * @property {Number|tstMaindataAttrs} sourceID
 * @property {Number|tstDictionaryAttrs} destID
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstDictionaryDictAttrs}
 */
tst_dictionary_dict_ns.attrs = {}

/**
* 
* @type {tst_dictionary_dict_ns}
*/
const tst_dictionary_dict = new tst_dictionary_dict_ns()
/**
 * ub test dictionary participants
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_dictionary_ppt_ns extends EntityNamespace {}

/**
 * @typedef tstDictionaryPptAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|tstDictionaryAttrs} objectID - Object
 * @property {Number|ubaUserAttrs} subjectID - Subject of users
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstDictionaryPptAttrs}
 */
tst_dictionary_ppt_ns.attrs = {}

/**
* ub test dictionary participants
* @type {tst_dictionary_ppt_ns}
*/
const tst_dictionary_ppt = new tst_dictionary_ppt_ns()
/**
 * ub test dictionary todo
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_dictionary_todo_ns extends EntityNamespace {}

/**
 * @typedef tstDictionaryTodoAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} name - Code
 * @property {Number|tstDictionaryAttrs} objectID - Object
 * @property {Boolean} status - Done status
 * @property {Number|tstDocumentAttrs} link - Link to entity
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstDictionaryTodoAttrs}
 */
tst_dictionary_todo_ns.attrs = {}

/**
* ub test dictionary todo
* @type {tst_dictionary_todo_ns}
*/
const tst_dictionary_todo = new tst_dictionary_todo_ns()
/**
 * Test adtDocument attributes
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes softLock
 * @mixes fts
 */
class tst_document_ns extends EntityNamespace {}

/**
 * @typedef tstDocumentAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {Date} docDate - Document date
 * @property {Date} incomeDate - income date
 * @property {Date} regDate - reg date
 * @property {Number|tstCategoryAttrs} category - Category
 * @property {Number|tstCategoryAttrs} favorites - Favorites
 * @property {Number|tstCategoryAttrs} favorites2 - Favorites
 * @property {Date} docDateTime - Document full date
 * @property {String} description - Description
 * @property {String} fileStoreSimple - Simple
 * @property {Number|cdnPersonAttrs} person - person
 * @property {Number|cdnEmployeeAttrs} employee - employee
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstDocumentAttrs}
 */
tst_document_ns.attrs = {}

/**
* Test adtDocument attributes
* @type {tst_document_ns}
*/
const tst_document = new tst_document_ns()
/**
 * test fts data with scope&#x3D;Connection non multi lang
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes fts
 */
class tst_ftsconnection_ns extends EntityNamespace {}

/**
 * @typedef tstFtsconnectionAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} caption - Caption
 * @property {Date} regDate - Registration date
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstFtsconnectionAttrs}
 */
tst_ftsconnection_ns.attrs = {}

/**
* test fts data with scope&#x3D;Connection non multi lang
* @type {tst_ftsconnection_ns}
*/
const tst_ftsconnection = new tst_ftsconnection_ns()
/**
 * test fts data with scope&#x3D;Connection multi lang
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes fts
 */
class tst_ftsconnection_ml_ns extends EntityNamespace {}

/**
 * @typedef tstFtsconnectionMlAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} caption - Caption
 * @property {Date} regDate - Registration date
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstFtsconnectionMlAttrs}
 */
tst_ftsconnection_ml_ns.attrs = {}

/**
* test fts data with scope&#x3D;Connection multi lang
* @type {tst_ftsconnection_ml_ns}
*/
const tst_ftsconnection_ml = new tst_ftsconnection_ml_ns()
/**
 * test fts data with scope&#x3D;Entity non multi lang
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes fts
 */
class tst_ftsentity_ns extends EntityNamespace {}

/**
 * @typedef tstFtsentityAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} caption - Caption
 * @property {Date} regDate - Registration date
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstFtsentityAttrs}
 */
tst_ftsentity_ns.attrs = {}

/**
* test fts data with scope&#x3D;Entity non multi lang
* @type {tst_ftsentity_ns}
*/
const tst_ftsentity = new tst_ftsentity_ns()
/**
 * Historical dictionary
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 */
class tst_histDict_ns extends EntityNamespace {}

/**
 * @typedef tstHistDictAttrs
 * @type {object}
 * @property {Number} ID
 * @property {Number|orgOrganizationAttrs} organization - Organization
 * @property {Number} currencyValue - Currency Data
 * @property {Number|tstHistDictAttrs} mi_data_id
 * @property {Date} mi_dateFrom
 * @property {Date} mi_dateTo
 * @property {Number|ubaUserAttrs} mi_owner
 * @property {Date} mi_createDate
 * @property {Number|ubaUserAttrs} mi_createUser
 * @property {Date} mi_modifyDate
 * @property {Number|ubaUserAttrs} mi_modifyUser
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstHistDictAttrs}
 */
tst_histDict_ns.attrs = {}

/**
* Historical dictionary
* @type {tst_histDict_ns}
*/
const tst_histDict = new tst_histDict_ns()
/**
 * 
 * @extends EntityNamespace
 */
class tst_maind_dict2_ns extends EntityNamespace {}

/**
 * @typedef tstMaindDict2Attrs
 * @type {object}
 * @property {Number|tstMaindataAttrs} sourceID
 * @property {Number|tstDictionaryAttrs} destID
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstMaindDict2Attrs}
 */
tst_maind_dict2_ns.attrs = {}

/**
* 
* @type {tst_maind_dict2_ns}
*/
const tst_maind_dict2 = new tst_maind_dict2_ns()
/**
 * ub test main data
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes dataHistory
 * @mixes unity
 */
class tst_maindata_ns extends EntityNamespace {}

/**
 * @typedef tstMaindataAttrs
 * @type {object}
 * @property {Number|tstMainunityAttrs} ID
 * @property {Number} f_currency - Currency
 * @property {Number} f_float - Float
 * @property {Number} f_int - Int
 * @property {String} code - Code
 * @property {String} caption - Caption
 * @property {String} caption2 - Caption2
 * @property {String} complexCaption - complexCaption
 * @property {Number|tstDictionaryAttrs} nonNullDict_ID - nonNullDict_ID
 * @property {Number|tstDictionaryAttrs} nullDict_ID - nullDict_ID
 * @property {Number|tstMaindataAttrs} parent - parent
 * @property {Number|tstMainunityAttrs} parent1 - parent
 * @property {String|ubmEnumAttrs} enumValue - enumValue
 * @property {Date} dateTimeValue - dateTimeValue
 * @property {Boolean} booleanValue - booleanValue
 * @property {String} fileStoreSimple - Simple
 * @property {Number|tstDictionaryAttrs} manyValue - test many data
 * @property {Number|tstDictionaryAttrs} manyValue2 - test 2d many data
 * @property {Number} bigintValue - BigInt
 * @property {Number|ubaUserAttrs} mappedToSelf - mappedToSelf
 * @property {Number|orgUnitAttrs} staffUnit - OrgUnit
 * @property {Number|orgDepartmentAttrs} department - org_department
 * @property {Number|orgOrganizationAttrs} organization - organization
 * @property {Number|tstMaindataAttrs} mi_data_id
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
 * @type {tstMaindataAttrs}
 */
tst_maindata_ns.attrs = {}

/**
* ub test main data
* @type {tst_maindata_ns}
*/
const tst_maindata = new tst_maindata_ns()
/**
 * ub test main unity
 * @extends EntityNamespace
 * @mixes als
 * @mixes mStorage
 */
class tst_mainunity_ns extends EntityNamespace {}

/**
 * @typedef tstMainunityAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} code - Code
 * @property {String} caption - Caption
 * @property {String|ubmEnumAttrs} mi_wfState - Состояние
 * @property {Date} mi_deleteDate
 * @property {Number|ubaUserAttrs} mi_deleteUser
 * @property {String} mi_unityEntity
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstMainunityAttrs}
 */
tst_mainunity_ns.attrs = {}

/**
* ub test main unity
* @type {tst_mainunity_ns}
*/
const tst_mainunity = new tst_mainunity_ns()
/**
 * List of test commands
 * @extends EntityNamespace
 */
class tst_service_ns extends EntityNamespace {}

/**
 * @typedef tstServiceAttrs
 * @type {object}
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstServiceAttrs}
 */
tst_service_ns.attrs = {}

/**
* List of test commands
* @type {tst_service_ns}
*/
const tst_service = new tst_service_ns()
/**
 * Test for mapped ID [UB-1219]
 * @extends EntityNamespace
 * @mixes mStorage
 */
class tst_virtualID_ns extends EntityNamespace {}

/**
 * @typedef tstVirtualIdAttrs
 * @type {object}
 * @property {Number} ID - Ідентифікатор запису
 * @property {Number} srcID - SourceID
 */

/**
 * Attributes defined in metadata. Property does not exists in real life and added for IDE
 * @type {tstVirtualIdAttrs}
 */
tst_virtualID_ns.attrs = {}

/**
* Test for mapped ID [UB-1219]
* @type {tst_virtualID_ns}
*/
const tst_virtualID = new tst_virtualID_ns()
/**
 * Application desktops
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_desktop_ns extends EntityNamespace {}

/**
 * @typedef ubmDesktopAttrs
 * @type {object}
 * @property {Number} ID
 * @property {String} caption - Desktop name
 * @property {String} code - Code
 * @property {String} description - Desktop description
 * @property {String} iconCls - Desktop icon
 * @property {String} url - URL
 * @property {Boolean} isDefault - By default?
 * @property {Number} displayOrder - Order #
 * @property {String} overrided - Overrided by TST
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
 * @type {ubmDesktopAttrs}
 */
ubm_desktop_ns.attrs = {}

/**
* Application desktops
* @type {ubm_desktop_ns}
*/
const ubm_desktop = new ubm_desktop_ns()
