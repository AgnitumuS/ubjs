/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Set of entities for constructing a dynamically generated UnityBase UI. Enumerations, navigation desktops &amp; shortcuts, forms, ER diagrams
 * @version 5.0.7
 * @module @unitybase/ubm
 */

/**
 * Application desktops
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_desktop_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_desktop_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  caption: '',
 /**
  * Unique desktop code. Used for version upgrade
  * @type {String}
  */
  code: '',
 /**
  * Static server page URL which is displayed in screen centre of selected desktop
  * @type {String}
  */
  url: null,
 /**
  * @type {Boolean}
  */
  isDefault: undefined,
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
* Application desktops
* @type {ubm_desktop_ns}
*/
const ubm_desktop = new ubm_desktop_ns()
/**
 * Administering of desktops
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_desktop_adm_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_desktop_adm_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  instanceID: 0,
 /**
  * @type {Number}
  */
  admSubjID: 0,
}
/**
* Administering of desktops
* @type {ubm_desktop_adm_ns}
*/
const ubm_desktop_adm = new ubm_desktop_adm_ns()
/**
 * Entity relation diagrams
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_diagram_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_diagram_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * Model
  * @type {String}
  */
  model: '',
 /**
  * @type {String}
  */
  name: '',
 /**
  * Entity diagram
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
}
/**
* Entity relation diagrams
* @type {ubm_diagram_ns}
*/
const ubm_diagram = new ubm_diagram_ns()
/**
 * Enumerated values.
 * On the UI used as a lookup for attributes with dataType &#x60;Enum&#x60;
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_enum_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_enum_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  eGroup: '',
 /**
  * Value code
  * @type {String}
  */
  code: '',
 /**
  * @type {String}
  */
  shortName: null,
 /**
  * @type {String}
  */
  name: '',
 /**
  * This attribute is used for ordering enum on UI select. Default = 100 for easy change order to be more or less
  * @type {Number}
  */
  sortOrder: 0,
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
* Enumerated values.
 * On the UI used as a lookup for attributes with dataType &#x60;Enum&#x60;
* @type {ubm_enum_ns}
*/
const ubm_enum = new ubm_enum_ns()
/**
 * Definition of interface forms
 * @extends EntityNamespace
 */
class ubm_form_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_form_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {String}
  */
  code: '',
 /**
  * @type {String}
  */
  description: null,
 /**
  * Keep it empty to use entity name as form caption
  * @type {String}
  */
  caption: null,
 /**
  * Form definition type (auto or custom)
  * @type {String}
  */
  formType: '',
 /**
  * Form interface definition
  * @type {String}
  */
  formDef: null,
 /**
  * JS worm client logic
  * @type {String}
  */
  formCode: null,
 /**
  * Model where form is stored
  * Model where form is stored. If empty - entity model is used. The purpose of this attribute is to develop a form for entities form other models
  * @type {String}
  */
  model: null,
 /**
  * Entity code
  * This value is used for fount default entity form
  * @type {String}
  */
  entity: null,
 /**
  * Default entity form
  * On AdminUI execution of `doCommand.showForm` without passing a form code as a parameter client seek for form for entity, and if exist > 1 form - form with isDefault=true is selected
  * @type {Boolean}
  */
  isDefault: undefined,
 /**
  * Emulate a mStorage.mi_modifyDate for cache version calculation
  * @type {Date}
  */
  mi_modifyDate: null,
}
/**
* Definition of interface forms
* @type {ubm_form_ns}
*/
const ubm_form = new ubm_form_ns()
/**
 * Metadata for build navbars
 * @extends EntityNamespace
 * @mixes mStorage
 * @mixes tree
 */
class ubm_navshortcut_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_navshortcut_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  desktopID: 0,
 /**
  * @type {Number}
  */
  parentID: null,
 /**
  * Unique shortcut code. Used for version upgrade
  * @type {String}
  */
  code: '',
 /**
  * @type {Boolean}
  */
  isFolder: undefined,
 /**
  * @type {String}
  */
  caption: '',
 /**
  * @type {String}
  */
  cmdCode: null,
 /**
  * Display in new window
  * @type {Boolean}
  */
  inWindow: undefined,
 /**
  * Show collapsed at the first start
  * It make sense if isFolder = true
  * @type {Boolean}
  */
  isCollapsed: undefined,
 /**
  * Display order (in current node)
  * @type {Number}
  */
  displayOrder: 0,
 /**
  * @type {String}
  */
  iconCls: null,
 /**
  * @type {String}
  */
  mi_treePath: '',
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
* Metadata for build navbars
* @type {ubm_navshortcut_ns}
*/
const ubm_navshortcut = new ubm_navshortcut_ns()
/**
 * Description.
 * This entity used by $.currentUserOrUserGroupInAdmSubtable RLS macro
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ubm_navshortcut_adm_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ubm_navshortcut_adm_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  instanceID: 0,
 /**
  * @type {Number}
  */
  admSubjID: 0,
}
/**
* Description.
 * This entity used by $.currentUserOrUserGroupInAdmSubtable RLS macro
* @type {ubm_navshortcut_adm_ns}
*/
const ubm_navshortcut_adm = new ubm_navshortcut_adm_ns()
