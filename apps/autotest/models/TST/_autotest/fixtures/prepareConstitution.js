// ub prepareConstitution.js -fn D:\projects\Autotest\models\TST\_autotest\fixtures\ConstitutionUkr.txt

var
  fs = require('fs'),
  argv = require('@unitybase/base').argv,
  fn = argv.findCmdLineSwitchValue('fn')

var arr = fs.readFileSync(fn, 'utf8').split('\r\n')
console.log(arr.length)
arr = arr.filter(row => row.length > 15)
console.log(arr.length)
fs.writeFileSync(fn, arr.join('\r\n'))
