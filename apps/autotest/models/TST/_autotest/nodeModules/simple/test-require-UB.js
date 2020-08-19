const common = require('../common')
const assert = require('assert')
const path = require('path')
const folder = path.join(common.fixturesDir, 'UBTest')

let wBom = require(path.join(folder, 'testBOM'))
assert.ok(wBom === 'withBOM', 'testBOM fail')

let woBom = require(path.join(folder, 'testNoBOM'))
assert.ok(woBom === 'withoutBOM', 'testNoBOM fail')

// var jsonWithComment = require(folder + 'jsonWithComment')
// assert.ok(jsonWithComment.a === 1, 'jsonWithComment fail')
