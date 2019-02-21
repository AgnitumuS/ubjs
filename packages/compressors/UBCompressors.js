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
let UBCompressors = module.exports

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
