const opt = require('@unitybase/base').options
// disable NODE.JS tests if auto tests executed with -skipModules command line switch
if (opt.switchIndex('skipModules') !== -1) return

const assert = require('assert')
const fs = require('fs')
const path = require('path')

let info = {
  total: 0,
  failed: 0
}

function run(folder, filter = /^test.*/) {
  let failed = 0
  let tests = fs.readdirSync(folder).filter(f => filter.test(f)).sort()
  tests.forEach(test => {
    console.log('Run', test)
    console.debug('Run', test)
    try {
      require(path.join(folder, test))
    } catch (e) {
      console.error(`failed with message "${e.message}" at` + (filename === test ? ` ${e.fileName}:${e.lineNumber}:${e.columnNumber}` : `\n${e.stack}`))
      failed++
    }
  })
  info.total += tests.length
  info.failed += failed
}

debugger
//run(path.join(__dirname, 'nodeModules', 'simple'))
run(path.join(__dirname, 'nodeModules', 'parallel'), /^test-fs-.*/)
if (info.failed === 0)
  console.log(`All ${info.total} nodeModule tests passed`)
else
  console.error(`${info.failed} of ${info.total} nodeModules tests failed`)
