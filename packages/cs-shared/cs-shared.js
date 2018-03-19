const CustomRepository = require('./CustomRepository')
const LocalDataStore = require('./LocalDataStore')
const UBDomain = require('./UBDomain')
const UBSession = require('./UBSession')

/**
 * Contains classes, common for CLI, server-side and browser side
 * @module @unitybase/cs-shared
 */
module.exports = {
  /**
   * Base class for Browser / server Repository
   * @type {CustomRepository}
   */
  CustomRepository,
  /**
   * Helper class for manipulation with data, stored locally in ({@link TubCachedData} format)
   * @type {module:LocalDataStore}
   */
  LocalDataStore,
  /**
   * Domain metadata
   * @type {UBDomain}
   */
  UBDomain,
  /**
   * UB connection user session
   * @type {module:UBSession~UBSession}
   */
  UBSession
}
