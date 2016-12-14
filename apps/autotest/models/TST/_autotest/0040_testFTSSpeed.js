/**
 * Created by pavel.mash on 23.04.2015.
 * >ub ./0030_testFTS.js -cfg D:\projects\Autotest\ubConfig.json -app autotest -u admin -p admin  -n 100 -t 10
 */

var
  argv = require('@unitybase/base').argv,
  session,
  __FILE_NAME = 'СonstitutionUkr.txt',
  _conn,
  iterationCnt, transLen

session = argv.establishConnectionFromCmdLineAttributes()
_conn = session.connection
iterationCnt = parseInt(argv.findCmdLineSwitchValue('n') || '100', 10)
transLen = parseInt(argv.findCmdLineSwitchValue('t') || '10', 10)

try {
  __dirname
} catch (e) {
  global.__dirname = 'D:\\projects\\Autotest\\models\\TST\\_autotest'
}

try {
  console.debug('\tFTS test')
  testFTS(_conn)
} finally {
  if (session) session.logout()
}
if (global.__dirname) delete global.__dirname

function testFTS (connection) {
  var fs = require('fs'),
    path = require('path'),
    bibleArr, bibleLen, rndIdx, trans = [], curTrLen

  debugger
  bibleArr = fs.readFileSync(path.join(__dirname, 'fixtures', __FILE_NAME)).split('\r\n')
  bibleArr.splice(0, 72) // remove Table of content
  bibleLen = bibleArr.length

  function rnd (x) {
    return Math.floor(Math.random() * x) + 1
  }

  var
    descrMaxLen = 2000,
    d = new Date(2015, 1, 1),
    i, k, n, descr

  console.time('FTSSpeed')
  curTrLen = 0
  for (i = 0; i < iterationCnt; i++) {
    d.setDate(i % 30 + 1); d.setMonth(i % 11 + 1)
    descr = bibleArr[i].slice(0, descrMaxLen)
    trans.push({
      entity: 'tst_document',
      method: 'insert',
      execParams: {
        code: 'code' + ('000' + i).slice(-3),
        docDate: d,
        description: descr
      }
    })
    curTrLen++
    if (curTrLen = transLen || i === iterationCnt - 1) {
      connection.runList(trans); trans = []; curTrLen = 0
    }
  }
  console.timeEnd('FTSSpeed')
  console.debug('Finish FTS for ', iterationCnt, 'iteration. TransLen=', transLen)
}
