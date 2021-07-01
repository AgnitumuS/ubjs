/**
 * gzip / gunzip / bunzip support
 *
 * @example
 *
 * var compressors = require('@unitybase/compressors');
 * compressors.unBzipM2
 *
 * @module @unitybase/compressors
 */
const dllName = process.platform === 'win32' ? 'ubcompressors.dll' : 'libubcompressors.so'
const archPath = process.arch === 'x32' ? './bin/x32' : './bin/x86_64'
const path = require('path')
const moduleName = path.join(__dirname, archPath, dllName)
const binding = require(moduleName)
const UBCompressors = module.exports

/**
 * Decompress files from Megapolis2(TM) bzip format(first 4 bytes are length of uncompressed files)
 * @method unBzipM2
 * @param {ArrayBuffer} buffer
 * @return {ArrayBuffer}
 */
UBCompressors.unBzipM2 = binding.unBzipM2

/**
 * Compress file using gzip algorithm
 * @method gzipFile
 * @param {String} fileNameFrom
 * @param {String} fileNameTo
 */
UBCompressors.gzipFile = binding.gzipFile

/**
 * Decompress file using gzip algorithm
 * @method gunzipFile
 * @param {String} fileNameFrom
 * @param {String} fileNameTo
 */
UBCompressors.gunzipFile = binding.gunzipFile

class ZipReader {
  constructor (pathToZip) {
    this._reader = new binding.TubZipReader(pathToZip)
    this.__files = undefined
  }

  freeNative () {
    if (this._reader) this._reader.freeNative()
  }

  get fileCount () {
    if (this.__files === undefined) {
      this.__files = this._reader.fileNames()
    }
    return this.__files.length
  }

  get fileNames () {
    if (this.__files === undefined) {
      this.__files = this._reader.fileNames()
    }
    return this.__files
  }

  unZipToDir (fileIndex, dirPath) {
    return this._reader.unZipToDir(fileIndex, dirPath)
  }

  unZipAllToDir (dirPath) {
    return this._reader.unZipAllToDir(dirPath)
  }
}
UBCompressors.ZipReader = ZipReader

class ZipWriter {
  constructor (pathToZip) {
    this._writer = new binding.TubZipWriter(pathToZip)
  }

  freeNative () {
    if (this._writer) this._writer.freeNative()
  }

  addFile (filePath) {
    return this._writer.addFile(filePath)
  }
}
UBCompressors.ZipWriter = ZipWriter

class ZipEntry {
  constructor (z, e) {
    Object.defineProperty(this, '_zip', { value: z })
    Object.defineProperty(this, '_index', { value: e.index })
    this.name = e.name
    this.dir = e.dir
  }

  /**
   * Return the content as UTF8 string.
   * In case content is not a valid UTF8 string - return empty string ('')
   *
   * @return {string} the UTF8 string.
   */
  asText () {
    return this._zip._reader.unZipFileAsText(this._index)
  }

  /**
   * Returns the binary content.
   * @return {string} the content as binary.
   */
  asBinary () {
    throw new Error('ZipEntry.asBinary is not implemented')
  }

  /**
   * Returns the content as a nodejs Buffer.
   * @return {Buffer} the content as a Buffer.
   */
  asNodeBuffer () {
    const arrBuf = this._zip._reader.unZipFileAsArrayBuffer(this._index)
    return Buffer.from(arrBuf)
  }

  /**
   * Returns the content as an Uint8Array.
   * @return {Uint8Array} the content as an Uint8Array.
   */
  asUint8Array () {
    const arrBuf = this._zip._reader.unZipFileAsArrayBuffer(this._index)
    return new Uint8Array(arrBuf)
  }

  /**
   * Returns the content as an ArrayBuffer.
   * @return {ArrayBuffer} the content as an ArrayBufer.
   */
  asArrayBuffer () {
    return this._zip._reader.unZipFileAsArrayBuffer(this._index)
  }
}

/**
 * JSZip 2 / PizZip compatible synchronous ZIP archives operations
 */
class UZip {
  constructor (data, options) {
    this._reader = undefined
    /**
     * Files in archive. Keys is file names (including folders)
     * @type {Object<string, ZipEntry>}
     */
    this.files = {}
    this._inDataBuf = undefined
    this.modifiedData = {} // {name: {isFolder: bool, value: ??}
    // this._writer = new binding.TubZipWriter(pathToZip)
    if (data) this.load(data, options)
  }

  /**
   * Read ZIP archive
   *
   * Unlike JSZip if data is string, then this is a pathToFile, file content is NOT loaded into memory wholly, but only headers is loaded first.
   * After access to file inside archive - only this file content is loaded into memory
   *
   * @example
   var zip = new JSZip();
   zip.load("UEsDBAoDAAAAAJxs8T...AAAAAA==", {base64: true});

   * @param {String|ArrayBuffer|Uint8Array} data the data to load. If string - this is a file name
   * @param {Object} [options] the options for creating this objects
   * @param {boolean} [options.base64=false] set to true if the data is base64 encoded, false for binary. More.
   * @param {boolean} [options.checkCRC32=false] set to true if the read data should be checked against its CRC32. More.
   * @param {boolean} [options.optimizedBinaryString=false] set to true if (and only if) the input is a string and has already been prepared with a 0xFF mask.
   * @param {boolean} [options.createFolders=false] set to true to create folders in the file path automatically. Leaving it false will result in only virtual folders (i.e. folders that merely represent part of the file path) being created. More.
   * @param {function} [options.decodeFileName] decode from UTF-8.the function to decode the file name / comment. {@link https://stuk.github.io/jszip/documentation/api_jszip/load_async.html#decodefilename-option}
   */
  load (data, options) {
    if (typeof data === 'string') {
      if (options && options.base64) {
        this._inDataBuf = Buffer.from(data, 'base64')
      } else {
        this._inDataBuf = data // file name
      }
    } else {
      this._inDataBuf = data
    }
    this._reader = new binding.TubZipReader(this._inDataBuf)
    const allFiles = this._reader.getAllFilesInfo()
    this.files = {}
    allFiles.forEach(f => {
      this.files[f.name] = new ZipEntry(this, f)
    })
  }

  /**
   * Add a file to the zip file, or search a file.
   * @param   {string|RegExp} name The name of the file to add (if data is defined),
   * the name of the file to find (if no data) or a regex to match files.
   * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
   * @param   {Object} o     File options
   * @return  {UZip|Object|Array} this UZip object (when adding a file),
   * a ZipEntry (when searching by string) or an array of ZipEntry (when searching by regex).
   */
  file (name, data, o) {
    if (data !== undefined) { // adding a file
      return this
    } else { // read file
      if (typeof name === 'string') {
        const res = this.files[name]
        return res && !res.dir ? res : null
      } else {
        const res = []
        Object.keys(this.files).forEach(fn => {
          if (fn.test(fn) && !this.files[fn].dir) {
            res.push(this.files[fn])
          }
        })
        return res
      }
    }
  }

  freeNative () {
    if (this._reader) this._reader.freeNative()
    this.files = {}
    this._inDataBuf = undefined
    this.modifiedData = {}
  }
}
UBCompressors.UZip = UZip
