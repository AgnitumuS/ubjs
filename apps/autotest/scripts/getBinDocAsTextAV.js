// test for AV on obtaining binary document as UTF8 string
const argv = require('@unitybase/base').argv
const options = require('@unitybase/base').options
const http = require('http')

const opts = options.describe('getBinDocAsTExtAV',
  'Test for incorrect getDocument call',
  ''
)
  .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)

const cfg = opts.parseVerbose({}, true)
const session = argv.establishConnectionFromCmdLineAttributes(cfg)

const wrongDoc = session.connection.getDocument({
  entity: 'tst_document',
  attribute: 'fileStoreSimple',
  ID: 334133786673179
}, {
  resultIsBinary: false
})
console.log(typeof wrongDoc)
console.log(wrongDoc)