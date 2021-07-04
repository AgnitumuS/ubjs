const path = require('path')
const fs = require('fs')

const assert = require('assert')
const ok = assert.ok

const TEST_PATH = __dirname

const compressors = require('../UBCompressors')
const ZipReader = compressors.ZipReader
const ZipWriter = compressors.ZipWriter
const UZip = compressors.UZip

const AUTOTEST_PATH = path.join(TEST_PATH, '_autotest.zip')

const uZip = new UZip(AUTOTEST_PATH)
console.log(uZip.files)
const numEnties = Object.keys(uZip.files).length
ok(numEnties === 5, `_autotest.zip must contains 4 files and 1 folder but got ${numEnties}`)

let zipR = new ZipReader(AUTOTEST_PATH)
const files = zipR.fileNames
ok(files.length === 4, `_autotest.zip must contains 4 files (folder excluded) but got ${files.length}`)
ok(files[0] === 'file866.txt', `first file must be file866.txt but got ${files[0]}`)

const UNZIP_PATH = path.join(TEST_PATH, 'unzip')
fs.mkdirSync(UNZIP_PATH)

ok(zipR.unZipToDir(0, UNZIP_PATH), `can not unzip file ${files[0]}`)
// console.log(files)
zipR.unZipAllToDir(UNZIP_PATH)
zipR.freeNative()
//
// const zipW = new ZipWriter(path.join(TEST_PATH, '_testZip.zip'))
// zipW.addFile(path.join(UNZIP_PATH, files[0]))
// zipW.addFile(path.join(UNZIP_PATH, files[1]))
// zipW.addFile(path.join(UNZIP_PATH, files[2]))
// zipW.addFile(path.join(UNZIP_PATH, files[3]))
// zipW.freeNative()
//
// zipR = new ZipReader(path.join(TEST_PATH, '_testZip.zip'))
// ok(zipR.fileCount === 4)
// zipR.freeNative()
//
// for (let i = 0; i < 4; i++) {
//   ok(fs.unlinkSync(path.join(UNZIP_PATH, files[i])))
// }
// const dirContent = fs.readdirSync(UNZIP_PATH)
// ok(dirContent.length === 2, `must be 2 subfolder in ${UNZIP_PATH}`)
// for (let i = 0; i < 2; i++) {
//   ok(fs.rmdirSync(path.join(UNZIP_PATH, dirContent[i])), `can't remove ${UNZIP_PATH}`)
// }
// ok(fs.rmdirSync(UNZIP_PATH), `can't remove ${UNZIP_PATH}`)

function logFiles (zip) {
  Object.keys(zip.files).forEach(k => {
    console.log('name:', zip.files[k].name, 'dir:', zip.files[k].dir)
  })
}
// fileUtf8.txt='Привет!' file1251.txt file866.txt
const B64_ZIP = `UEsDBBQAAAAIAFqRi0OFRdGtCQAAAAcAAAALAAAAZmlsZTg2Ni50eHTrf7Bi0dJHigBQSwMEFAAA
AAgAw4iLQ4KtsxMJAAAABwAAAAwAAABmaWxlMTI1MS50eHQ7/+HFo6efFAFQSwMECgAAAAAARkvd
UoI+EBcNAAAADQAAAAwAHABmaWxlVXRmOC50eHRVVAkAAwO92mD/vNpgdXgLAAEE6AMAAAToAwAA
0J/RgNC40LLQtdGCIVBLAQIfABQAAAAIAFqRi0OFRdGtCQAAAAcAAAALACQAAAAAAAAAIAAAAAAA
AABmaWxlODY2LnR4dAoAIAAAAAAAAQAYABItopCL9s4BsYM9RYv2zgGxgz1Fi/bOAVBLAQIfABQA
AAAIAMOIi0OCrbMTCQAAAAcAAAAMACQAAAAAAAAAIAAAADIAAABmaWxlMTI1MS50eHQKACAAAAAA
AAEAGABnQXqEgvbOAVsNvFuC9s4BWw28W4L2zgFQSwECHgMKAAAAAABGS91Sgj4QFw0AAAANAAAA
DAAYAAAAAAABAAAAgIFlAAAAZmlsZVV0ZjgudHh0VVQFAAMDvdpgdXgLAAEE6AMAAAToAwAAUEsF
BgAAAAADAAMADQEAALgAAAAAAA==`
const uZipB64 = new UZip(B64_ZIP, { base64: true })
// above is the same as
// uZipB64 = new UZip(); uZipB64.load(B64_ZIP, {base64: true})
// logFiles(uZipB64)
console.log(uZipB64.files)
assert.strictEqual(Object.keys(uZipB64.files).length, 3, 'base64 must contains 3 file')
const uTxt = uZipB64.file('fileUtf8.txt').asText()
assert.strictEqual(uTxt, 'Привет!', 'Text content')
const uTxtF = uZipB64.files['fileUtf8.txt'].asText()
assert.strictEqual(uTxt, uTxtF, 'Text content loaded as files[fn] and file(fn) should be equal')

const file1251 = uZipB64.file('file1251.txt').asNodeBuffer()
const hello = Buffer.from([0xCF, 0xF0, 0xE8, 0xE2, 0xE5, 0xF2, 0x21])
assert.strictEqual(Buffer.compare(file1251, hello), 0, 'cp1251 file equality')
const cp1251toUtf = file1251.cpSlice(0, file1251.byteLength, 1251)
assert.strictEqual(cp1251toUtf, 'Привет!', '1251 cp as text')

uZipB64.file('newFile', 'Привет!', { type: 'string' })
  .generate({ filename: path.join(TEST_PATH, 'gertest.zip') })
