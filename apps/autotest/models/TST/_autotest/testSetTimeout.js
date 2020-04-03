const assert = require('assert')
const res = [0]

console.debug('testSetTimeout')

setTimeout(function () { res.push(3) }, 300)
setTimeout(function () { res.push(2) }, 200)
setTimeout(function () { res.push(1) }, 100)

setTimeout(() => assert.deepStrictEqual(res, [0, 1, 2, 3]), 400)
