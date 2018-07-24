const fs = require('fs')
const path = require('path')
const assert = require('assert')
/*const base64String = `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`
debugger
const signBuffer = Buffer.from(base64String, 'base64')
fs.writeFileSync('D:/dev/tmp/s2.p7s', signBuffer)
*/

let buffer = new ArrayBuffer(8)
let uint8_8 = new Uint8Array(buffer) // 1-7 (matches the byteLength of the buffer)
for (let i = 0; i < uint8_8.byteLength; i++) uint8_8[i] = i + '0'.charCodeAt(0)

let res
let fn = path.join(__dirname, 'buf_res.txt')
fs.writeFileSync(fn, uint8_8)
res = fs.readFileSync(fn, 'utf8')
assert.equal('01234567', res, 'full ArrayBuffer slice')

fs.writeFileSync(fn, buffer)
res = fs.readFileSync(fn, 'utf8')
assert.equal('01234567', res, 'ArrayBuffer slice')

let uint8_1_5 = new Uint8Array(buffer, 1, 5); // 1-5 (as specified when constructing the Uint8Array)
fs.writeFileSync(fn, uint8_1_5)
res = fs.readFileSync(fn, 'utf8')
assert.equal('12345', res, 'ArrayBuffer 1-5 slice')

let uint8_2_7 = new Uint8Array(buffer, 2) // 2-7 (due to the offset of the constructed Uint8Array)
fs.writeFileSync(fn, uint8_2_7)
res = fs.readFileSync(fn, 'utf8')
assert.equal('234567', res, 'ArrayBuffer 2-END slice')
fs.unlinkSync(fn)


