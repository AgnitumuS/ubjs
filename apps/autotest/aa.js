const fs = require('fs')
console.time('realpath')
var cache = {}
const p = 'D:/dev/ub-all/ubjs/apps/autotest/node_modules/@unitybase/adminui-pub'
for (let i = 0; i < 1000; i++) {
  let resolved = require.resolve('@unitybase/ubs/_autotest/_numCounterWorker')
  //cache[p] = resolved
}
console.timeEnd('realpath')

console.debug(require.resolve('@unitybase/ubs/_autotest/_numCounterWorker'))