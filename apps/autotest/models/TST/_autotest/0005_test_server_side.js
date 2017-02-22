/**
 * User: pavel.mash
 * Date: 22.10.14
 * Test server side implementations from serverSide folder
 */
var
  assert = require('assert'),
  fs = require('fs'),
  path = require('path'),
  argv = require('@unitybase/base').argv,
  session, conn

var
  folder = path.dirname(__filename),
  tests = fs.readdirSync(folder + '/serverSide'),
  content, res

session = argv.establishConnectionFromCmdLineAttributes()
conn = session.connection

try {
  console.debug('test Server-side js')
  tests.forEach(function (test) {
    if (!test.endsWith('.js')) return
    content = fs.readFileSync(folder + '/serverSide/' + test)
    console.debug('Eval a ' + test)
    res = conn.post('evaluateScript', content)
    assert.deepEqual(res, {res: true})
  })
} finally {
  session.logout()
}
