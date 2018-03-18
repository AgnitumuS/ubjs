/*
 Purpose of this file is to describe objects and functions added to both server-side JavaScript thread and command line
 JavaScript thread by UnityBase
 All described here is native UB objects imported to SpiderMonkey (i.e. realisation is in Pascal or C).
 This file provide correct syntax check, code insight and documentation if we edit models in IDE like JetBrains, eclipse e.t.c.
 Also server-side documentation generated based on this file.

 Author: pavel.mash
 Date: 10.08.13
*/

/**
 * Load file content to string. Only for non-binary files!
 *
 * Do not use directly. Use fs.readFileSync(path, 'utf8') instead.
 * @private
 * @param {String} fileName Full path to file
 * @return {String} File content. In case of error - raise exception
 */
function loadFile (fileName) {}

/**
 * Create new Uint8Array and load file into it. Do not use directly. Use fs.readFileSync(path, {encoding: 'bin'})) instead
 *
 * @private
 * @param {String} fileName
 * @return {ArrayBuffer|null} Return Null in case file not exists
 */
function loadFileToBuffer (fileName) { return new ArrayBuffer(0) }

/**
 * Remove comments from JSON string (actually replace all comment content with ' ')
 * @param {String} JSONString String to remove comments from
 * @return {String} JSON string without comment's
 */
function removeCommentsFromJSON (JSONString) {}

/**
 * Check is fileName is relative path, and if true - transform it to absolute from baseDir
 * Do not use directly - use `path.join`
 * @param {String} baseDir
 * @param {String} fileName
 * @return {String}
 * @private
 */
function relToAbs (baseDir, fileName) {}

/**
 * Create GUID
 * @returns {string} GUID
 */
function createGuid () { return '' }

/*
 * Post message to worker thread. Worker call *onmessage* handler with parameter *message*
 * @param {Number} threadID
 * @param  {String} message
 */
function postWorkerMessage (threadID, message) {}

/*
 * Get message from worker thread. If worker thread didn't post any message then return undefined
 * @param {Number} threadID
 * @returns {String|undefuned}
 */
function getWorkerMessage (threadID) {}

/*
 * Terminate worker thread.
 * @param {Number} threadID
 */
function terminateWorkerThread (threadID) {}

/**
 * Perform Garbage collection for current scripting context. Use it if you know WHAT you do!
 * @global
 */
function gc () {}

/**
 * Native CRC32 implementation. Much (x100) faster compared to JS implemenattion
 * @param {Number} initialValue Must be 0 in case no initial value
 * @param {String|ArrayBuffer|ArrayBufferView} data Data to calculate CRC32. In case of string will be transformed to UFT8 before calculation
 * @returns {number}
 */
function ncrc32 (initialValue, data) { return 0 }

/**
 * Native SHA256 implementation. Much (x10) faster compared to JS implementation
 * @param {String|ArrayBuffer|ArrayBufferView} data Data to calculate SHA256. In case of string will be transformed to UFT8 before calculation
 * @returns {String} hexa string SHA256 representation
 */
function nsha256 (data) { return 'a0' }

// Classes definition. Must be AFTER global function definition for correct documentation generation

/**
 * Reader interface.
 * @interface
 */
function UBReader () {}
/**
 * Read from source
 * @param {String} [encoding] Optional encoding of source. Default to 'utf-8'.
 *          If 'bin' - return ArrayBuffer source representation without any conversion.
 *          If 'base64' - transform base64 encoded content of source to ArrayBuffer
 *          If 'bin2base64' - transform content to base64 encoded string
 * @returns {ArrayBuffer|String} Return String in case no encoding passed or ArrayBuffer
 */
UBReader.prototype.read = function (encoding) {}

/**
 * Writer interface.
 * @interface
 */
function UBWriter () {}
/**
 * Write to source.
 * @param {ArrayBuffer|Object|String} data Data to write. If Object - it stringify before write
 * @param {String} [encoding] Encode data to `encoding` before write. Default to `utf-8` in case data is String or `bin` in case data is ArrayBuffer.
 *          One of "utf-8"|"ucs2"|"bin"|"base64".
 */
UBWriter.prototype.write = function (data, encoding) {}

/**
 * @classdesc
 *  Named collection of parameters.
 *
 *  Think of it as an pain JavaScript object with property values that are stored in the `native` code,
 *  not inside a JavaScript runtime
 * @extends {TubNamedCollection}
 * @class TubList
 */
function TubList () {}

/**
 * Delete all elements from list
 */
TubList.prototype.clear = function () {}

/**
 * Add parameter with name paramName, set it type to `Blob` and value to `data`. In case parameter with same name exists - replace it.
 *
 * After call content of JavaScript variable is copied to server memory, so to avoid memory overflow developer can
 * set JS variable to NULL to allow GC to free memory.
 *
 * Use this feature to pass BLOB's as database operation parameter value.
 * @example

 var
    store = new TubDataStore('tst_blob'),
    l = new TubList(),
    fs = require('fs'),
    arr;
 arr = fs.readFileSync(process.binPath + 'UB.exe', {encoding: 'bin'}); // get content of binary file as array buffer
 l.ID = store.generateID();
 l.description = 'test1';
 l.setBLOBValue('blb', arr); // set BLOB type parameter value.
 // in case we sure arr is === ArrayBuffer can be simplified to: l.blb = arr;
 arr = null; // give a GC chance to release array memory
 store.execSQL('insert into tst_blob(id, description, blb) values(:ID:, :description:, :blb:)', l);

 * @param {String} paramName Name of a parameter to add BLOB to
 * @param {ArrayBuffer|Object|String} data Data to write. If Object - it stringify before write
 * @param {String} [encoding] Encode data to `encoding` before write. Default to `utf-8` in case data is String or `bin` in case data is ArrayBuffer.
 *                              One of "utf-8"|"ucs2"|"bin"|"base64".
 */
TubList.prototype.setBLOBValue = function (paramName, data, encoding) {}

/**
 * @classdesc Native realisation of HTTP client. Do not use it directly - instead use {@link http} module.
 * @class THTTPClient
 * @private
 * @param {String} Server
 * @param {String} aPort
 * @param {Boolean} aHttps
 * @param {Boolean} [enableCompression=false]
 * @param {String} [aProxyName=""]
 * @param {String} [aProxyByPass=""]
 * @param {Number} [connectTimeout=30000]
 * @param {Number} [sendTimeout=30000]
 * @param {Number} [receiveTimeout=30000]
 * @constructor
 */
function THTTPClient (Server, aPort, aHttps, enableCompression, aProxyName, aProxyByPass, connectTimeout, sendTimeout, receiveTimeout) {}
/**
 * @property {string} responseHeaders
 */
THTTPClient.prototype.responseHeaders = ''

/**
 * @class TubZipReader
 * Class for read zip archives. Can read from file name or from TubBuffer
 * @param {String|TubBuffer} from fileName or TubBuffer object to read zip archive from
 * @constructor
 */
function TubZipReader (from) {}
/**
 * Read only array of file names inside archive
 * @type {Array}
 */
TubZipReader.prototype.fileNames = []
/**
 * Read only file count inside archive
 * @type {number}
 */
TubZipReader.prototype.fileCount = 0
/**
 * Unzip specified file and append to existed TubBuffer.
 * @param {Number} fileIndex index of file to unzip
 * @param {TubBuffer} dest buffer to append unzipped data
 * @returns {number} Unzipped bytes count
 */
TubZipReader.prototype.unZipToBuffer = function (fileIndex, dest) { return 0 }
/**
 * Unzip specified file to specified folder.
 * @param {Number} fileIndex index of file to unzip
 * @param {String} dirName directory name to unzip file to
 * @returns {Boolean} Success
 */
TubZipReader.prototype.unZipToDir = function (fileIndex, dirName) { return true }
/**
 * Unzip all files to specified folder.
 * @param {String} dirName directory name to unzip files to
 * @returns {Boolean} Success
 */
TubZipReader.prototype.unZipAllToDir = function (dirName) { return true }

/**
 * @class TubZipWriter
 * Create zip archive. After finish working with archive creator must call freeNative() method to close file handel
 * @param fileName name of zip archive file
 * @constructor
 */
function TubZipWriter (fileName) {}
/**
 * Add byteCount bytes from source to archive as fleName
 * @param {String} fileName name of file inside archive
 * @param {Number} byteCount number of bytes to add starting from buffer position
 * @param {TubBuffer} source
 */
TubZipWriter.prototype.addBuffer = function (fileName, byteCount, source) {}
/**
 * Add specified file to archive
 * @param fileName
 */
TubZipWriter.prototype.addFile = function (fileName) {}
/**
 * Close writer
 */
TubZipWriter.prototype.freeNative = function () {}

/**
 * Fires for the {@link process} instance when application stop working for each Working Thread
 *
 *      process.on('exit', function(){
 *          console.log('thread is terminated');
 *      });
 *
 * @event exit
 */

/**
 * The main executable full path (excluding .exe file name)
 * @type {String}
 * @readonly
 */
process.binPath = ''

/**
 * Path to config file process started with
 * @type {String}
 * @readonly
 */
process.configPath = ''

/**
 * In case this is server-side thread === 1 else (client theread) ===  0
 * @type {Number}
 * @readonly
 */
process.isServer = 0

/**
 * In case this is WebSocket server-side thread === 1 else not defined
 * @type {Number}
 * @readonly
 */
process.isWebSocketServer = 0

/**
 * When WebSockets are enabled === 1 else not defined
 * @type {Number}
 * @readonly
 */
process.isWebSocketEnabled = 0

/**
 * `true` if server executed with `-dev` command line switch.
 * @type {Number}
 * @readonly
 */
process.isDebug = 0

/**
 * The UB process startup mode. One of "Service", "Console", "GUI", "CmdLine"
 * @type {String}
 * @readonly
 */
process.startupMode = 'CmdLine'
