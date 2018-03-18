const argv = require('./argv')
const CustomRepository = require('./CustomRepository')
const LocalDataStore = require('./LocalDataStore')
const options = require('./options')
const ServerRepository = require('./ServerRepository')
const UBConnection = require('./UBConnection')
const UBDomain = require('./UBDomain')
const UBSession = require('./UBSession')
const csv1 = require('./csv1')
const dataLoader = require('./dataLoader')
const FileBasedStoreLoader = require('./FileBasedStoreLoader')
const Worker = require('./worker')
// eslint-disable-next-line camelcase
const uba_common = require('./uba_common')

/**
 * Contains classes, common for CLI, server-side and browser side
 * @module @unitybase/base
 */
module.exports = {
  /**
   * Command line utils
   * @type {module:argv}
   */
  argv: argv,
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
   * Parse a command line options & environment variables and create a configuration object
   * @type {module:options}
   */
  options: options,
  /**
   * Server side & CLI side Repository
   * @type {ServerRepository}
   */
  ServerRepository,
  /**
   * Server side & CLI side connection to UB server
   * @type {UBConnection}
   */
  UBConnection,
  /**
   * Domain metadata
   * @type {UBDomain}
   */
  UBDomain,
  /**
   * UB connection user session
   * @type {UBSession}
   */
  UBSession,
  /**
   * CSV data parser
   * @type {module:csv1}
   */
  csv: csv1,
  /**
   * Bulk data loader from CSV/arrays to UB
   * @type {module:dataLoader}
   */
  dataLoader: dataLoader,
  /**
   * File-system based virtual store **select**.
   * Able to load files & transform it content to {@link TubCachedData} format
   * @type {module:FileBasedStoreLoader}
   */
  FileBasedStoreLoader,
  /**
   * Execute a script in a dedicated thread
   * @type {Worker}
   */
  Worker,
  /**
   * Constants for administrative security model
   * @type {module:uba_common}
   */
  uba_common,
  /**
   * Allows to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
   * token must be unique, and must increment in the format {0}, {1}, etc.
   * @example
   *
   *     var s = UB.format('{1}/lang-{0}.js', 'en', 'locale');
   *     // s now contains the string: ''locale/lang-en.js''
   *
   * @deprecated Use a ES6 template string literal instead
   * @param {String} stringToFormat The string to be formatted.
   * @param {...*} values The values to replace tokens `{0}`, `{1}`, etc in order.
   * @return {String} The formatted string.
   */
  format: function (stringToFormat, ...values) {
    const FORMAT_RE = /{(\d+)}/g
    return stringToFormat.replace(FORMAT_RE, function (m, i) {
      return values[i]
    })
  }
}
