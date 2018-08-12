const path = require('path')
const fs = require('fs')

const assert = require('assert')
const ok = assert.ok

const TEST_PATH = __dirname

debugger
const compressors = require('../UBCompressors')
const ZipReader = compressors.ZipReader
const ZipWriter = compressors.ZipWriter
let zipR = new ZipReader(path.join(TEST_PATH, '_autotest.zip'))
let files = zipR.fileNames
ok(files.length === 4, `_autotest.zip must contains 4 files but got ${files.length}`)
ok(files[0] === 'file866.txt', `first file must be file866.txt but got ${files[0]}`)

const UNZIP_PATH = path.join(TEST_PATH, 'unzip')
fs.mkdirSync(UNZIP_PATH)

ok(zipR.unZipToDir(0, UNZIP_PATH), `can not unzip file ${files[0]}`)
// console.log(files)
zipR.unZipAllToDir(UNZIP_PATH)
zipR.freeNative()

const zipW = new ZipWriter(path.join(TEST_PATH, '_testZip.zip'))
zipW.addFile(path.join(UNZIP_PATH, files[0]))
zipW.addFile(path.join(UNZIP_PATH, files[1]))
zipW.addFile(path.join(UNZIP_PATH, files[2]))
zipW.addFile(path.join(UNZIP_PATH, files[3]))
zipW.freeNative()

zipR = new ZipReader(path.join(TEST_PATH, '_testZip.zip'))
ok(zipR.fileCount === 4)
zipR.freeNative()

for (let i = 0; i < 4; i++) {
  ok(fs.unlinkSync(path.join(UNZIP_PATH, files[i])))
}
let dirContent = fs.readdirSync(UNZIP_PATH)
ok(dirContent.length === 2, `must be 2 subfolder in ${UNZIP_PATH}`)
for (let i = 0; i < 2; i++) {
  ok(fs.rmdirSync(path.join(UNZIP_PATH, dirContent[i])), `can't remove ${UNZIP_PATH}`)
}
ok(fs.rmdirSync(UNZIP_PATH), `can't remove ${UNZIP_PATH}`)
