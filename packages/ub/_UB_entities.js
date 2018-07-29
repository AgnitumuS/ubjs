/* eslint-disable camelcase,no-unused-vars,new-cap,no-undef,comma-dangle */
// This file is generated automatically and contain definition for code insight.
// It ignored by UnityBase server because name start from "_".
// Do not modify this file directly. Run `ucli createCodeInsightHelper --help` for details

/**
 * Build-in UnityBase model
 * @version 5.0.10
 * @module @unitybase/ub
 */

/**
 * File BLOB history.
 * Store historical data for all file based BLOB stores
 * @extends EntityNamespace
 * @mixes mStorage
 */
class ub_blobHistory_ns extends EntityNamespace {}
/** Attributes defined in metadata. This property not exist in real life and added just for help */
ub_blobHistory_ns.attrs = {
 /**
  * @type {Number}
  */
  ID: 0,
 /**
  * @type {Number}
  */
  instance: 0,
 /**
  * @type {String}
  */
  attribute: null,
 /**
  * Revision number
  * @type {Number}
  */
  revision: 0,
 /**
  * 1 on case we do not delete this revision during history rotation
  * @type {Boolean}
  */
  permanent: undefined,
 /**
  * Content of historical Document attribute
  * @type {String}
  */
  blobInfo: '',
}
/**
* File BLOB history.
 * Store historical data for all file based BLOB stores
* @type {ub_blobHistory_ns}
*/
const ub_blobHistory = new ub_blobHistory_ns()
