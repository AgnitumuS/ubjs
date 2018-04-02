const opt = require('@unitybase/base').options
// disable NODE.JS tests if auto tests executed with -skipModules command line switch
if (opt.switchIndex('skipModules') !== -1) return
const fs = require('fs')
const path = require('path')

let tests = fs.readdirSync(path.dirname(__filename) + '/nodeModules/simple')
tests.forEach(function (test) {
  console.log('Run', test)
  console.debug('Run', test)
  require('./nodeModules/simple/' + test)
})

tests = fs.readdirSync(path.dirname(__filename) + '/nodeModules/parallel').sort()
tests.forEach(function (test) {
  if (test.substr(0, 4) === 'test') {
    console.log('Run', test)
    console.debug('Run', test)
    require('./nodeModules/paralel/' + test)
  }
})
