/**
 * Created by pavel.mash on 2018-10-03
 */

const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'Json attributes'
const assert = require('assert')

module.exports = function runJSONTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('test attributes of type Json', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('Start ' + TEST_NAME)
  testJsonAttr(conn)
}

/**
 * Select for JSON attributes
 * @param {SyncConnection} conn
 */
function testJsonAttr (conn) {
  // add new
  let data = conn.Repository('tst_dictionary').attrs('jsonColumn', 'jsonColumn.propI', 'jsonColumn.propS').where('jsonColumn.propI', '=', 10).selectAsObject()
  console.log(data)
  assert.equal(data.length, 1, 'One json with propI = 10')
  // TODO parse as object and uncomment 2 line below
  // assert.equal('' + data[0].jsonColumn.propI, '10', `integer part of Json attribute ${data[0].jsonColumn.propI} equal to '10' after selectAsObject()`)
  // assert.equal(data[0].jsonColumn.propS, 'Привет', `string part of Json attribute ${data[0].jsonColumn.propS} is parsed after selectAsObject()`)
  data = conn.Repository('tst_dictionary').attrs('jsonColumn.propI', 'jsonColumn.propS').where('jsonColumn.propI', '>', 10).selectAsObject()
  assert.equal(data.length, 3, '3 json with propI > 10')
  data = conn.Repository('tst_dictionary').attrs('jsonColumn.propI', 'jsonColumn.propS').where('jsonColumn.propS', 'startsWith', 'Пр').selectAsObject({
    'jsonColumn.propS': 'S'
  })
  assert.equal(data.length, 2, '2 json with propS starts with "Пр"')
  assert.equal(data[0].S, 'Привет', 'first json propS is "Привет"')
}
