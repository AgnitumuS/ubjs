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
    this._writer = pathToZip
      ? new binding.TubZipWriter(pathToZip)
      : new binding.TubZipWriter()
  }

  freeNative () {
    if (this._writer) this._writer.freeNative()
  }

  /**
   * Add string or binary data into archive as `zipName`
   * @param {string} zipName Name of new zip entry, can be a relative path 'folder/file.txt'.
   * @param {string|ArrayBufferView} data
   */
  add (zipName, data) {
    return this._writer.add(zipName, data)
  }

  /**
   * Add file content into archive
   * @param {string} filePath Path to file to add
   * @param {string} [zipName] zip entry name. Can be a relative path 'folder/file.txt'.
   *   If not specified, fileName(filePath) is used
   */
  addFile (filePath, zipName) {
    return this._writer.addFile(filePath, zipName)
  }

  /**
   * Copy compressed zip entry from `reader` archive into this archive (without recompression)
   * @param {ZipReader} reader instance of reader
   * @param {number} index file index inside reader archive
   */
  addZipEntry (reader, index) {
    return this._writer.addZipEntry(reader, index)
  }
}
UBCompressors.ZipWriter = ZipWriter

class ZipEntry {
  constructor (z, e) {
    Object.defineProperty(this, '_reader', { value: z._reader })
    /** data index in original ZIP */
    this._index = e.index
    // unmodified files can be added deflated from reader using _index, modified - from data
    this._data = e.data
    this._dataType = e.dataType
    this._modified = false
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
    return this._reader.unZipFileAsText(this._index)
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
    const arrBuf = this._reader.unZipFileAsArrayBuffer(this._index)
    return Buffer.from(arrBuf)
  }

  /**
   * Returns the content as an Uint8Array.
   * @return {Uint8Array} the content as an Uint8Array.
   */
  asUint8Array () {
    const arrBuf = this._reader.unZipFileAsArrayBuffer(this._index)
    return new Uint8Array(arrBuf)
  }

  /**
   * Returns the content as an ArrayBuffer.
   * @return {ArrayBuffer} the content as an ArrayBufer.
   */
  asArrayBuffer () {
    return this._reader.unZipFileAsArrayBuffer(this._index)
  }
}

/**
 * JSZip@2 / PizZip compatible synchronous ZIP archives operations.
 *
 * Differences from JSZip@2 / PizZip:
 *   - can load from file if data is string and options.base64=false. In this case file content is NOT loaded
 *     into memory wholly, but only headers is loaded first.
 *     After access to file inside archive - only this file content is loaded into memory
 *   - can generate into file. In this case data is written using buffers, so zip content can be huge
 */
class UZip {
  constructor (data, options) {
    this._reader = undefined
    this._writer = undefined
    /**
     * Files in archive. Keys is file names (including folders)
     * @type {Object<string, ZipEntry>}
     */
    this.files = {}
    this._inDataBuf = undefined
    /**
     * @type {ZipEntry[]}
     * @private
     */
    this._modified = [] // files to be added into new archive using generate()
    // this._writer = new binding.TubZipWriter(pathToZip)
    if (data) this.load(data, options)
  }

  /**
   * Read ZIP archive
   *
   * differences from JSZip@2 / PizZip:
   *   - if data is string, then this is a pathToFile, file content is NOT loaded into memory wholly, but only headers is loaded first.
   * After access to file inside archive - only this file content is loaded into memory
   *
   * @example
   var zip = new UZip();
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
      this._modified[f.name] = new ZipEntry(this, f)
    })
  }

  /**
   * Add a file to the archive, or search a file.
   * @param {string|RegExp} fn The name of the file to add (if data is defined),
   * the name of the file to find (if no data) or a regex to match files.
   * @param {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
   * @param {Object} o File options
   * @param {boolean} [o.base64=false] set to true if the data is base64 encoded string
   * @param {boolean} [o.isFilename=false] UZIp specific - set to true if data is a path to file
   * @param {Date} [o.date=Date.now()] the last modification date
   * @param {boolean} [o.dir=false] Set to true if this is a directory and content should be ignored
   * @return  {UZip|Object|Array} this UZip object (when adding a file),
   * a ZipEntry (when searching by string) or an array of ZipEntry (when searching by regex).
   */
  file (fn, data, o) {
    if (arguments.length === 1) { // read a file
      if (typeof fn === 'string') {
        const res = this.files[fn]
        return res && !res.dir ? res : null
      } else {
        const res = []
        Object.keys(this.files).forEach(f => {
          if (f.test(fn) && !this.files[f].dir) {
            res.push(this.files[f])
          }
        })
        return res
      }
    } else { // adding a file
      let entry = this._modified.find(f => f.name === fn)
      let dataType = ''
      if (typeof data === 'string') {
        dataType = o.base64
          ? 'base64'
          : o.isFilename ? 'file' : 'string'
      } else if (Buffer.isBuffer(data) || ArrayBuffer.isView(data)) {
        dataType = 'buffer'
      } else {
        throw new Error('UZip.file: data should be string Buffer of arrayBufferView')
      }
      if (!entry) {
        entry = new ZipEntry(this, { data, dataType, name: fn, dir: o.dir || fn.endsWith('/') })
        this._modified.push(entry)
      } else {
        entry._data = data
        entry._dataType = dataType
      }
      entry._modified = true
      return this
    }
  }

  folder (name) {
    throw new Error('UZip.folder is not implemented')
  }

  /**
   * Mark file or folder (recursively) to be removed from archive
   * @param {string} fn
   * @return {UZip}
   */
  remove (fn) {
    const entryIdx = this._modified.findIndex(f => f.name === fn)
    if (!entryIdx === -1) return this
    if (this._modified[entryIdx].dir) {
      this._modified = this._modified.filter(f => !f.name.startsWith(fn))
    } else {
      this._modified.splice(entryIdx, 1)
    }
    return this
  }

  /**
   * Generate the zip. Zipped content can be prepared in-memory (as JSZip/PizZip did) or written
   * directly into file (UZip feature) in case options.type='file'. File to write into is passed as option.filename.
   *
   * Writing zip directly into file uses buffering io, so file content can be huge.
   *
   * @param {Object} o the options to generate the zip file
   * @param {boolean} o.base64  (deprecated, use type instead) true to generate base64
   * @param {string} [o.compression='STORE'] "STORE" by default (no compression at all) or DEFLATE
   * @param {string} [o.type='base64'] Values are : string, base64, uint8array, arraybuffer, blob, file
   * @param {string} [o.filename] if options.type='file' - sets a file name to create an archive
   * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob|boolean} the zip file
   */
  generate (o) {
    if (!this._writer) {
      if (o.filename) {
        this._writer = new ZipWriter(o.filename)
      } else {
        this._writer = new ZipWriter()
      }
    }
    this._modified.forEach(ze => {
      if (ze.dir) return // skip empty folder TODO - implement
      if (ze._modified) {
        if (ze._dataType === 'file') { // add file from fs
          this._writer.addFile(ze._data, ze.name)
        } else {
          let data
          if (ze._dataType === 'base64') {
            data = Buffer.from(this._data, 'base64')
          } else {
            data = this._data
          }
          this._writer.add(ze.name, data)
        }
      } else {
        this._writer.addZipEntry(ze._reader, ze._index)
      }
    })
    if (o.filename) {
      this._writer.freeNative()
      return true
    } else {
      throw new Error('not impl')
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
