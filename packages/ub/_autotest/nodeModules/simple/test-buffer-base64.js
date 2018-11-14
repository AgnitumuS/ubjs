const common = require('../common')
const assert = require('assert')
const path = require('path')
const os = require('os')
const fixturesFolder = path.join(common.fixturesDir, 'UBTest')
const fs = require('fs')

const etalon = `module.exports = 'withoutBOM'\n`
let content

console.log('\t\tBuffer from base64')
content = fs.readFileSync(path.join(fixturesFolder, 'testNoBOM.js'), {encoding: 'bin'})
const expectedLength = 29 + os.EOL.length
assert.ok(content.byteLength === expectedLength, `testNoBOM.js bin length should be ${expectedLength} but actual ${content.byteLength}`)
let b64 = Buffer.from(content, 'utf-8').toString('base64')
let text = Buffer.from(content, 'utf-8').toString('utf-8')
assert.ok(text === etalon, 'testNoBOM.js should be with 0A in the end')
let binFromB64 = Buffer.from(b64, 'base64')
assert.ok(binFromB64.byteLength === content.byteLength, 'Buffer.from(.. base64) should not drop the last 0A')

content = fs.readFileSync(path.join(fixturesFolder, 'hugeBase64_0A.txt'), {encoding: 'utf-8'})
let buf = Buffer.from(content, 'base64')
let slice = new Uint8Array(buf)
assert.ok(buf.byteLength === 66906, 'hugeBase64_0A.txt should be of length 66906 after decode from base64 but actual is ' + buf.byteLength)
assert.ok(slice[slice.byteLength - 1] === 10, 'last character in decoded hugeBase64_0A.txt should be 0A but actual is' + slice[slice.byteLength - 1])
