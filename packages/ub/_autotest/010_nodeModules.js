const opt = require('@unitybase/base').options
// disable NODE.JS tests if auto tests executed with -skipModules command line switch
if (opt.switchIndex('skipModules') !== -1) return
const fs = require('fs')
const path = require('path')

let tests = fs.readdirSync(path.join(__dirname, 'nodeModules', 'simple'))
tests.forEach(function (test) {
  console.log('\t\tRun', test)
  console.debug('Run', test)
  require('./nodeModules/simple/' + test)
})

let parallelFolder = path.join(__dirname, 'nodeModules', 'parallel')
tests = fs.readdirSync(parallelFolder).sort()
console.log('parallel', tests)
tests.forEach(function (test) {
  console.log('!!!', test)
  if (test.substr(0, 4) === 'test') {
    console.log('Run', test)
    console.debug('Run', test)
    require(path.join(parallelFolder, test))
  }
})
