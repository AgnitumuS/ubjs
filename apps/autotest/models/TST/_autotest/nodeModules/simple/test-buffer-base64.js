const common = require('../common')
const assert = require('assert')
const path = require('path')
const os = require('os')
const fixturesFolder = path.join(common.fixturesDir, 'UBTest')
const fs = require('fs')

const etalon = `module.exports = 'withoutBOM'${os.EOL}`

let content

console.log('\t\tBuffer from base64')

content = fs.readFileSync(path.join(fixturesFolder, 'testNoBOM.js'))
const expectedLength = 29 + os.EOL.length
assert.ok(content.byteLength === expectedLength, `testNoBOM.js bin length should be ${expectedLength} but actual ${content.byteLength}`)
let b64 = Buffer.from(content, 'utf-8').toString('base64')
let text = Buffer.from(content, 'utf-8').toString('utf-8')
assert.ok(text === etalon, 'testNoBOM.js should be with 0A in the end')
let binFromB64 = Buffer.from(b64, 'base64')
assert.ok(binFromB64.byteLength === content.byteLength, 'Buffer.from(.. base64) should not drop the last 0A')

content = fs.readFileSync(path.join(fixturesFolder, 'hugeBase64_0A.txt'), {encoding: 'utf-8'})
// transform internal representation of string from Latin1 to 2Bytechar
// by adding and removing a non - latin character
content = 'Пр' + content
content = '\r\n' + content.replace('Пр', '') + '\r\n'
let buf = Buffer.from(content, 'base64')

// uncomment below for performance test
// let c2 = content
// console.time('bb64')
// for (let i = 0; i < 1100; i++)
//   buf = Buffer.from(c2, 'base64')
// console.timeEnd('bb64')
//
// buf = Buffer.from(content, 'base64')

// fs.writeFileSync(path.join(fixturesFolder, 'hugeBase64_0A_1.pdf'), buf)
let slice = new Uint8Array(buf)
assert.ok(buf.byteLength === 66906, 'hugeBase64_0A.txt should be of length 66906 after decode from base64 but actual is ' + buf.byteLength)
assert.ok(slice[slice.byteLength - 1] === 10, 'last character in decoded hugeBase64_0A.txt should be 0A but actual is' + slice[slice.byteLength - 1])

// fs.writeFileSync(path.join(fixturesFolder, 'hugeBase64_0A.pdf'), buf)
