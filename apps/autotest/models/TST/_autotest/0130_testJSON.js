/**
 * Created by pavel.mash on 2018-10-03
 */

const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'Json attributes'
const assert = require('assert')

module.exports = function runJSONTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('test attributes of type Json', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

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
  assert.strictEqual(data.length, 1, 'One json with propI = 10')
  // TODO parse as object and uncomment 2 line below
  // assert.equal('' + data[0].jsonColumn.propI, '10', `integer part of Json attribute ${data[0].jsonColumn.propI} equal to '10' after selectAsObject()`)
  // assert.equal(data[0].jsonColumn.propS, 'Привет', `string part of Json attribute ${data[0].jsonColumn.propS} is parsed after selectAsObject()`)
  data = conn.Repository('tst_dictionary').attrs('jsonColumn.propI', 'jsonColumn.propS').where('jsonColumn.propI', '>', 10).selectAsObject()
  assert.strictEqual(data.length, 3, '3 json with propI > 10')
  data = conn.Repository('tst_dictionary').attrs('jsonColumn.propI', 'jsonColumn.propS').where('jsonColumn.propS', 'startsWith', 'Пр').selectAsObject({
    'jsonColumn.propS': 'S'
  })
  assert.strictEqual(data.length, 2, '2 json with propS starts with "Пр"')
  assert.strictEqual(data[0].S, 'Привет', 'first json propS is "Привет"')

  const di = conn.getDomainInfo(true)
  const expect = di.connections[0].dialect === 'SQLite3' ? 1 : '1'
  data = conn.Repository('tst_dictionary').attrs('jsonColumn.objProp.val').where('jsonColumn.objProp.val', '=', expect).selectSingle()
  assert.ok(data !== null, 'should got 1 record in case filtering by objProp.val === "1"')
  assert.strictEqual(data['jsonColumn.objProp.val'], expect, 'should get objProp.val === "1"')

  let datesRes
  function datesSerialize () {
    datesRes = conn.query({
      entity: 'tst_service',
      method: 'datesTest',
      data: 'put test data'
    })
  }
  assert.doesNotThrow(datesSerialize, 'Dates should be serialized correctly')
  assert.notStrictEqual(datesRes.dates.zDate.toString(), 'Invalid Date', 'Dates should be serialized correctly but got' + datesRes)
}
