const common = require('../common')
const assert = require('assert')
const path = require('path')
const folder = path.join(common.fixturesDir, 'UBTest')
const fs = require('fs')

const etalon = 'Привет! Hello!'
let content

content = fs.readFileSync(path.join(folder, 'ascii.txt'), {encoding: 'ascii'})
assert.ok(content === etalon, 'ascii.txt fail')

content = fs.readFileSync(path.join(folder, 'файл.txt'), {encoding: 'utf-8'})
assert.ok(content === etalon, 'файл.txt fail')

content = fs.readFileSync(path.join(folder, 'utf8wBOM.txt'), {encoding: 'utf-8'})
assert.ok(content === etalon, 'utf8wBOM.txt fail')

content = fs.readFileSync(path.join(folder, 'utf8wBOM.txt'), {encoding: 'uft-8'})
assert.ok(content === etalon, 'utf8wBOM.txt fail')

content = fs.readFileSync(path.join(folder, 'utf8woBOM.txt'), {encoding: 'uft-8'})
assert.ok(content === etalon, 'utf8woBOM.txt fail')

content = fs.readFileSync(path.join(folder, 'utf8woBOM.txt'), {encoding: 'utf-8'})
assert.ok(content === etalon, 'utf8woBOM.txt fail')

content = fs.readFileSync(path.join(folder, 'utf8wBOM.txt'), {encoding: 'bin'})
assert.ok(content.byteLength === 23, 'utf8wBOM.txt bin lenght')
let bytes = new Uint8Array(content)
assert.ok(bytes.length === 23, 'utf8wBOM.txt bytes lenght')
assert.ok(bytes[0] === 0xEF && bytes[1] === 0xBB, 'utf8wBOM.txt bin bytes')

assert.ok(fs.writeFileSync(path.join(folder, '_utf8wBOM.txt'), content), 'write binary data to file')
let contentNew = fs.readFileSync(path.join(folder, '_utf8wBOM.txt'), {encoding: 'bin'})
assert.ok(fs.statSync(path.join(folder, '_utf8wBOM.txt')).size === 23, 'write binary data to file')

assert.deepEqual(content, contentNew, 'ArrayBuffer equal')
bytes[1] = 10
assert.notDeepEqual(content, contentNew, 'ArrayBuffer not equal')

assert.throws(function () { fs.statSync(path.join(folder, 'NOT EXISTS')) }, / ENOENT/, 'Must throw on statSync if file does not exists')
