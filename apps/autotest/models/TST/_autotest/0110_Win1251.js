const assert=require('assert'); 
const fs = require('fs')
const path = require('path')

module.exports = function testEncoding() {
  let fp = path.join(__dirname, 'fixtures', 'Win1251.txt')
  let content = fs.readFileSync(fp, {encoding: 'Windows-1251'})
  const ETALON = 'Я сказав їй привіт!'
  assert.equal(typeof content, 'string', 'Should read file as string')
  assert.equal(content.length, ETALON.length, `Should read ${ETALON.length} but got ${content.length}`) 
  console.log(content)
  assert.equal(content, ETALON, 'Should correctly transform Windows1251 to Unicode')
}
