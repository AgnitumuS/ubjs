const argv = require('./argv')
const options = require('./options')
const ServerRepository = require('./ServerRepository')
const SyncConnection = require('./SyncConnection')
const csv1 = require('./csv1')
const dataLoader = require('./dataLoader')
const FileBasedStoreLoader = require('./FileBasedStoreLoader')
const Worker = require('./worker')
// eslint-disable-next-line camelcase
const uba_common = require('./uba_common')

/**
 * Classes, common for CLI and server side
 * @module @unitybase/base
 */
module.exports = {
  /**
   * Command line utils
   * @type {module:argv}
   */
  argv: argv,
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
   * Synchronous connection to external UB server
   * @type {SyncConnection}
   */
  SyncConnection,
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
   * Used for loading files & transforming it content to {@link TubCachedData} format
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
   * @private
   */
  format: function (stringToFormat, ...values) {
    const FORMAT_RE = /{(\d+)}/g
    return stringToFormat.replace(FORMAT_RE, function (m, i) {
      return values[i]
    })
  }
}
