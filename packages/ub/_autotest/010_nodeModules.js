const opt = require('@unitybase/base').options
// disable NODE.JS tests if auto tests executed with -skipModules command line switch
if (opt.switchIndex('skipModules') !== -1) return

const assert = require('assert')
const fs = require('fs')
const path = require('path')

function run(folder, filter = /^test.*/) {
  let ok = true
  let tests = fs.readdirSync(folder).sort()
  tests.filter(f => filter.test(f)).forEach(test => {
    console.log('Run', test)
    console.debug('Run', test)
    try {
      require(path.join(folder, test))
    } catch (e) {
      console.error(`failed with message "${e.message}" at` + (filename === test ? ` ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : `\n${e.stack}`))
      ok = false
    }
  })
  return ok
}

let ok = true; debugger
//ok = run(path.join(__dirname, 'nodeModules', 'simple')) && ok
ok = run(path.join(__dirname, 'nodeModules', 'parallel'), /^test-fs-write.*/) && ok
assert(ok, 'Some nodeModules tests failed')
