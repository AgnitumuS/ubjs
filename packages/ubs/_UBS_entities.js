/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Reports, User messages (notifications), Settings (aka about:config), Counters
 * @version 5.0.10
 * @module @unitybase/ubs
 */

/**
 * Stored UI filters.
 * doCmd.showList.autofilter use this entity to store user filters definition
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_filter_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_filter_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Code of filter group
  * @type {String}
  */
  code: '',
 /**
  * Filter name
  * @type {String}
  */
  name: '',
 /**
  * filter
  * @type {String}
  */
  filter: '',
 /**
  * Is this filter accessible for all users
  * Is this filter accessible for all users
  * @type {Boolean}
  */
  isGlobal: undefined,
 /**
  * Filter owner -> uba_user
  * @type {Number}
  */
  owner: 0,
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
* Stored UI filters.
 * doCmd.showList.autofilter use this entity to store user filters definition
* @type {ubs_filter_ns}
*/
const ubs_filter = new ubs_filter_ns()
/**
 * System messages.
 * System messages
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_message_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_message_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  messageBody: null,
 /**
  * @type {Boolean}
  */
  complete: undefined,
 /**
  * @type {String}
  */
  messageType: '',
 /**
  * @type {Date}
  */
  startDate: new Date(),
 /**
  * @type {Date}
  */
  expireDate: new Date(),
 /**
  * System messages recipients -> ubs_message_recipient
  * @type {Number}
  */
  recipients: null,
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
* System messages.
 * System messages
* @type {ubs_message_ns}
*/
const ubs_message = new ubs_message_ns()
/**
 * System messages.
 * System messages
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_message_edit_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_message_edit_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  messageBody: null,
 /**
  * @type {Boolean}
  */
  complete: undefined,
 /**
  * @type {String}
  */
  messageType: '',
 /**
  * @type {Date}
  */
  startDate: new Date(),
 /**
  * @type {Date}
  */
  expireDate: new Date(),
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
* System messages.
 * System messages
* @type {ubs_message_edit_ns}
*/
const ubs_message_edit = new ubs_message_edit_ns()
/**
 * System messages recipients.
 * System messages recipient
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_message_recipient_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_message_recipient_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  messageID: 0,
 /**
  * @type {Number}
  */
  userID: 0,
 /**
  * @type {Date}
  */
  acceptDate: null,
}
/**
* System messages recipients.
 * System messages recipient
* @type {ubs_message_recipient_ns}
*/
const ubs_message_recipient = new ubs_message_recipient_ns()
/**
 * Registration key counter
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_numcounter_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_numcounter_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Registration key
  * @type {String}
  */
  regKey: '',
 /**
  * Counter
  * @type {Number}
  */
  counter: 0,
}
/**
* Registration key counter
* @type {ubs_numcounter_ns}
*/
const ubs_numcounter = new ubs_numcounter_ns()
/**
 * Reserved counters for registration keys
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_numcounterreserv_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_numcounterreserv_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Registration key
  * @type {String}
  */
  regKey: '',
 /**
  * Counter
  * @type {Number}
  */
  counter: 0,
 /**
  * Reserved date for document
  * @type {String}
  */
  reservedDate: null,
 /**
  * Description of reserved number (Department name, etc)
  * @type {String}
  */
  note: null,
}
/**
* Reserved counters for registration keys
* @type {ubs_numcounterreserv_ns}
*/
const ubs_numcounterreserv = new ubs_numcounterreserv_ns()
/**
 * Report templates
 * @extends EntityNamespace
 */
class ubs_report_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_report_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Model code where to store report
  * @type {String}
  */
  model: '',
 /**
  * @type {String}
  */
  report_code: '',
 /**
  * @type {String}
  */
  name: '',
 /**
  * Template
  * @type {String}
  */
  template: null,
 /**
  * Javascript code
  * @type {String}
  */
  code: null,
 /**
  * Emulate a mStorage.mi_modifyDate for cache version calculation
  * @type {Date}
  */
  mi_modifyDate: null,
}
/**
* Report templates
* @type {ubs_report_ns}
*/
const ubs_report = new ubs_report_ns()
/**
 * Entity with information about system settings
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_settings_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_settings_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Setting key
  * @type {String}
  */
  settingKey: '',
 /**
  * Setting name
  * @type {String}
  */
  name: '',
 /**
  * Description
  * @type {String}
  */
  description: null,
 /**
  * Value type
  * @type {String}
  */
  type: null,
 /**
  * Value
  * @type {String}
  */
  settingValue: null,
 /**
  * Default value
  * @type {String}
  */
  defaultValue: null,
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
* Entity with information about system settings
* @type {ubs_settings_ns}
*/
const ubs_settings = new ubs_settings_ns()
/**
 * Soft lock
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubs_softLock_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubs_softLock_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Entity
  * @type {String}
  */
  entity: '',
 /**
  * Instance ID
  * @type {Number}
  */
  lockID: 0,
 /**
  * User, who locking record -> uba_user
  * @type {Number}
  */
  lockUser: 0,
 /**
  * Lock type
  * @type {String}
  */
  lockType: '',
 /**
  * Lock time
  * @type {Date}
  */
  lockTime: new Date(),
}
/**
* Soft lock
* @type {ubs_softLock_ns}
*/
const ubs_softLock = new ubs_softLock_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes ftsservice
 */
class fts_ftsDefault_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsDefault_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsDefault_ns}
*/
const fts_ftsDefault = new fts_ftsDefault_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_tst_ftsentity_en_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_tst_ftsentity_en_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_tst_ftsentity_en_ns}
*/
const fts_tst_ftsentity_en = new fts_tst_ftsentity_en_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_tst_ftsentity_uk_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_tst_ftsentity_uk_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_tst_ftsentity_uk_ns}
*/
const fts_tst_ftsentity_uk = new fts_tst_ftsentity_uk_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_ftsDefault_en_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsDefault_en_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsDefault_en_ns}
*/
const fts_ftsDefault_en = new fts_ftsDefault_en_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_ftsDefault_uk_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsDefault_uk_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsDefault_uk_ns}
*/
const fts_ftsDefault_uk = new fts_ftsDefault_uk_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes ftsservice
 */
class fts_ftsSubjectSearch_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsSubjectSearch_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsSubjectSearch_ns}
*/
const fts_ftsSubjectSearch = new fts_ftsSubjectSearch_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_ftsSubjectSearch_en_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsSubjectSearch_en_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsSubjectSearch_en_ns}
*/
const fts_ftsSubjectSearch_en = new fts_ftsSubjectSearch_en_ns()
/**
 * 
 * @extends EntityNamespace
 * @mixes mStorage
 */
class fts_ftsSubjectSearch_uk_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
fts_ftsSubjectSearch_uk_ns.attrs = {
 /**
  * @type {String}
  */
  ID: null,
 /**
  * @type {Number}
  */
  rowid: null,
 /**
  * @type {String}
  */
  entity: null,
 /**
  * @type {String}
  */
  ftsentity: null,
 /**
  * @type {String}
  */
  dy: null,
 /**
  * @type {String}
  */
  dm: null,
 /**
  * @type {String}
  */
  dd: null,
 /**
  * @type {String}
  */
  datacode: null,
 /**
  * @type {String}
  */
  aclrls: null,
 /**
  * @type {String}
  */
  entitydescr: null,
 /**
  * @type {String}
  */
  databody: null,
 /**
  * @type {String}
  */
  snippet: null,
 /**
  * @type {Number}
  */
  rank: null,
}
/**
* 
* @type {fts_ftsSubjectSearch_uk_ns}
*/
const fts_ftsSubjectSearch_uk = new fts_ftsSubjectSearch_uk_ns()
