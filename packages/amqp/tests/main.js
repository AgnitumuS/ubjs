const fs = require('fs')
const testbase = require('./testbase')
// debugger

const testFileName = /test-(.+)\.js/
let info = {
  count: 0,
  passedCount: 0,
  failedCount: 0,
  /** @type {Object[]} */suites: [],
  /** @type {string[]} */failedSuites: []
}
console.log('Looking for tests in', __dirname, '...')
fs.readdirSync(__dirname).sort().forEach((fname) => {
  if (testFileName.test(fname)) {
    let suite = testFileName.exec(fname)[1]
    try {
      let module = require('./' + fname)
      if (module.TestSuite && module.TestSuite.prototype instanceof testbase.TestBase) {
        console.log(`Running suite "${suite}"`)
        /** @type testbase.TestBase */
        let inst = new (module.TestSuite)()
        let suiteInfo = { suite: suite, count: inst.count, passedCount: 0, failedCount: 0, /** @type {string[]} */failedNames: [] }
        try {
          inst.run((name, passed) => {
            if (passed) {
              suiteInfo.passedCount++
              console.log('  [PASS] -', name)
            } else {
              suiteInfo.failedCount++
              suiteInfo.failedNames.push(name)
              console.log('  [FAIL] -', name)
            }
          })
        } finally {
          info.suites.push(suiteInfo)
          info.count += suiteInfo.count
          info.passedCount += suiteInfo.passedCount
          info.failedCount += suiteInfo.failedCount
        }
      }
    } catch (e) {
      console.error('Exception:', e.message)
      info.failedSuites.push({ suite: suite })
    }
  }
})
if (info.count === 0) {
  console.log('... nothing were found')
} else {
  console.log('TOTALS:')
  console.log(`Suites count: ${info.suites.length}`)
  info.suites.forEach(({ suite, count, passedCount, failedCount }) => {
    let msg = `  "${suite}": tests - ${count}, passed - ${passedCount}, failed - ${failedCount}`
    failedCount !== 0 ? console.error(msg) : console.log(msg)
  })
  if (info.passedCount === info.count) {
    console.log('ALL TESTS PASSED!')
  } else {
    console.error(`SOME TESTS FAILED: ${info.failedCount} failed of ${info.count}, ${Math.round(100 * info.passedCount / info.count)}% passed`)
  }
}
