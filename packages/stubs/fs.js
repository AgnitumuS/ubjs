/**
 * SyNode file-system routines. We try to implement here the same interface as in <a href="http://nodejs.org/api/fs.html">NodeJS fs</a>
 *
 *      var fs = require('fs');
 *      var content = fs.readFileSync('c:\\a.txt', 'utf-8);
 *
 * @module fs
 * @memberOf module:buildin
 */

const constants = process.binding('constants').fs
const internalFS = require('internal/fs')
const util = require('util')
const fs = exports;
const {fileStat, directoryExists, fileExists, readDir,
  realpath, rename, loadFileToBuffer,
  writeFile, appendFile,
  deleteFile, forceDirectories, removeDir,
} = process.binding('fs')
const pathModule = require('path');
const {
  assertEncoding,
  stringToFlags
} = internalFS;

Object.defineProperty(exports, 'constants', {
  configurable: false,
  enumerable: true,
  value: constants
})

const kMinPoolSpace = 128;
const { kMaxLength } = require('buffer')

const isWindows = process.platform === 'win32'

function getOptions(options, defaultOptions) {
  if (options === null || options === undefined ||
      typeof options === 'function') {
    return defaultOptions;
  }

  if (typeof options === 'string') {
    defaultOptions = util._extend({}, defaultOptions);
    defaultOptions.encoding = options;
    options = defaultOptions;
  } else if (typeof options !== 'object') {
    throw new TypeError('"options" must be a string or an object, got ' +
                        typeof options + ' instead.');
  }

  if (options.encoding !== 'buffer')
    assertEncoding(options.encoding);
  return options;
}

function nullCheck(path, callback) {
  if (('' + path).indexOf('\u0000') !== -1) {
    var er = new Error('Path must be a string without null bytes');
    er.code = 'ENOENT';
    // SyNode if (typeof callback !== 'function')
      throw er;
    // SyNode process.nextTick(callback, er);
    // SyNode return false;
  }
  return true;
}


/**
 * Check specified path is file (or symlynk to file)
 * @param path
 * @return {Boolean}
 */
exports.isFile  = function isFile(path){
    return fileExists(path);
};

/**
 * Check specified path is folder (or symlynk to folder)
 * @param path
 * @return {Boolean}
 */
exports.isDir = function isDir(path){
    return directoryExists(path);
};

const emptyObj = Object.create(null);
/**
 * Synchronous realpath(3). Returns the resolved path (resolve symlinks, junctions on Windows, /../)
 */
exports.realpathSync = function realpathSync(p, options){
  if (!options)
    options = emptyObj;
  else
    options = getOptions(options, emptyObj);
  if (typeof p !== 'string') {
    // SyNode handleError((p = getPathFromURL(p)));
    // SyNode if (typeof p !== 'string')
      p += '';
  }
  nullCheck(p);
  p = pathModule.resolve(p);

  const cache = options[internalFS.realpathCacheKey];
  const maybeCachedResult = cache && cache.get(p);
  if (maybeCachedResult) {
    return maybeCachedResult;
  }
  let res = realpath(p);
  if (cache) cache.set(p, res);
  return res;
};

/**
 * Reads the entire contents of a TEXT file.
 * If BOM found - decode text file to string using BOM
 * If BOM not found - use forceUFT8 parameter.
 * @param {String} fileName
 * @param {Boolean} [forceUFT8] If no BOM found and forceUFT8 is True (default) - we expect file in UTF8 format, else in ascii
 * @returns {String}
 */
exports.loadFile = function (fileName, forceUFT8){
    return loadFile(fileName, forceUFT8);
};

/**
 * Reads the entire contents of a file. If options.encoding == 'bin', then the ArrayBuffer is returned.
 * If no options is specified at all - result is String as in {@link fs.loadFile}
 * @param {String} fileName  Absolute path to file
 * @param {Object} [options]
 * @param {String|Null} [options.encoding] Default to null. Possible values: 'bin'|'ascii'|'utf-8'
 * @returns {String|ArrayBuffer}
 */
function readFileSync(fileName, options){
   let stat = fileStat(fileName);
   if (!stat) {
      throw new Error('no such file or directory, open \'' + fileName + '\'');
   }
   if (!options || (options && (options.encoding !== 'bin'))) {
      options = getOptions(options, {flag: 'r'});
   }

   if (options.encoding && ((options.encoding === 'ascii') || (options.encoding === 'utf8') || (options.encoding === 'utf-8'))) {
       return loadFile(fileName, !(options.encoding === 'ascii'));
   } else {
       let buf = loadFileToBuffer(fileName) // UInt8Array
       if (options.encoding === 'bin') return buf // ub 4.x compatibility mode
       buf = Buffer.from(buf)
       if (options.encoding)
       buf = buf.toString(options.encoding);
       return buf;
   }
};
exports.readFileSync = readFileSync

function rethrow() {
  return function(err) {
    if (err) {
      throw err; 
    }
  };
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

function makeOneArgFuncAsync(oneArgSyncFunc){
  return function(arg, cb){
	   var _res;
	   var callback = maybeCallback(cb);
	   try {
		  _res = oneArgSyncFunc(arg);
		  callback(null, _res);
	   } catch(e){
			callback(e);
	   }		
   }   	  
}	
exports.readFile = function readFile(fileName, options, callback_){
   var stat = fileStat(fileName);
   var callback = maybeCallback(arguments[arguments.length - 1]);
   if (!stat) {
       callback(new Error('no such file or directory, open \'' + fileName + '\''));
   } else {
       callback(null, readFileSync(fileName, options))
   }
};

//noinspection JSUnusedLocalSymbols
/**
 * Create all missing folders in the given path. Only absolute path supported. Throw error in case of fail
 * @param {String} path path for creation.
 * @param {Number} [mode] Ignored under Windows
 */
exports.mkdirSync = function mkdirSync(path, mode){
    if (!forceDirectories(path)){
        throw new Error('can\'t create directory ' + path);
    }
};

/** Read file names from directory (include folder names).
 * Return array of file names. In case directory not exists - throw error
 * @param {String} path
 * @return {Array.<String>}
 */
function readdirSync(path){
    var res = readDir(path, true);
    if (res == null) {
        throw new Error('can not read dir ' + path);
    } else {
        return res;
    }
};
exports.readdirSync = readdirSync; 

exports.readdir = makeOneArgFuncAsync(readdirSync);

/**
 * Get file statistics. Will throw in case file or folder does not exists.
 * @param fileName
 * @returns {Boolean|{atime: Date, mtime: Date, ctime: Date, size: number, _fileName: string, isDirectory: function}}
 */
function statSync(fileName){
    var oStat;

    oStat = fileStat(fileName);
    if (oStat === null) throw new Error('ENOENT: no such file or directory, stat ' + fileName)
    oStat._fileName = fileName;
    oStat.isDirectory = function(){
      return fs.isDir(this._fileName);
    };
	  oStat.isFile = function(){
      return !fs.isDir(this._fileName);
    };
    oStat.isSymbolicLink = function(){
        return false; //TODO - implement
    };
    return oStat;
};

exports.statSync = statSync;

exports.lstatSync = statSync;

exports.stat = function stat(fileName, callback_){
   var _stat
   var callback = maybeCallback(arguments[arguments.length - 1]);
   try {
     _stat = statSync(fileName);
     callback(null, _stat);
   } catch (e) {
     callback(e);
   }
};

//todo - lstat is a followSymLync version of stat
exports.lstat = exports.stat;

/**
 * Write to file
 * Actually implements {@link UBWriter#write}
 * @param {String} fileName  Full absolute file path
 * @param {ArrayBuffer|Object|String} data Data to write. If Object - it stringify before write
 * @param {Object} [options]
 * @param {String} [options.encoding] Encode data to `encoding` before write. Default to `utf-8` in case data is String or `bin` in case data is ArrayBuffer.
 *                              One of "utf-8"|"ucs2"|"bin"|"base64".
 */
exports.writeFileSync = function writeFileSync(fileName, data, options){
    //var res = writeFile(fileName, data);
    var
        encoding = options && options.encoding,
        res;
    res = encoding ? writeFile(fileName, data, encoding) : writeFile(fileName, data);
    if(!res)
        throw new Error('can not write file ' + fileName);
    else return res;
};

/**
 * Append data to a file, creating the file if it not yet exists
 * Actually implement {UBWriter#write}
 * @param {String} fileName  Full absolute file path
 * @param {ArrayBuffer|Object|String} data Data to write. `Object` are stringified before write
 * @param {Object} [options]
 * @param {String} [options.encoding] Encode data to `encoding` before write.
 *  Default to `utf-8` in case data is String or `bin` in case data is ArrayBuffer.
 *  Possible values: "utf-8"|"ucs2"|"bin"|"base64".
 */
exports.appendFileSync = function appendFileSync(fileName, data, options){
    var
        encoding = options && options.encoding,
        res;
    res = encoding ? appendFile(fileName, data, encoding) : appendFile(fileName, data);
    if(!res)
        throw new Error('can not write file ' + fileName);
    else return res;
};

/**
 * Check `path` exists (can be file, folder or symlync)
 * @param path
 * @return {Boolean}
 */
exports.existsSync = function existsSync(path){
    return !!fileStat(path);
};

/**
 * Delete file.
 */
function unlinkSync(path){
    try{
        return deleteFile(path)
    }catch(e){
        return false;
    }
};
exports.unlinkSync = unlinkSync; 

exports.unlink = makeOneArgFuncAsync(unlinkSync);

/**
 * Delete non-empty directory. See {@link removeDir} for details
 * @param {String} path path to remove
 */
exports.rmdirSync = function rmdirSync(path){
    return removeDir(path);
};

/**
 * Move (rename) file.
 * @param {String} oldPath
 * @param {String} newPath
 */
exports.renameSync = function renameSync(oldPath, newPath){
  nullCheck(oldPath);
  nullCheck(newPath);
  return rename(pathModule._makeLong(oldPath),
    pathModule._makeLong(newPath));
};

/**
 * Fake class for nodeJS compatibility
 */
exports.ReadStream = ReadStream;
function ReadStream(){}