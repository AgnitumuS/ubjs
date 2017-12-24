var argv = require('@unitybase/base').argv
var assert = require('assert')
var path = require('path')
var pathDelim = process.platform === 'win32' ? '\\' : '/'
var fixturesDir = path.join(path.dirname(__filename), 'nodeModules', 'fixtures')
var obj = argv.safeParseJSONfile(fixturesDir + pathDelim + 'jsonParser.json')
assert.equal(obj.path, '\\\\fs\\Share\\')
