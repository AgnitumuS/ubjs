/**
 * @author pavel.mash
 * Date: 17.10.14
 * Test mixins
 */
const assert = require('assert')
const fs = require('fs')
const cmdLineOpt = require('@unitybase/base').options
const base = require('@unitybase/base')
const argv = base.argv
const path = require('path')
const csv = require('@unitybase/base').csv

module.exports = function runMixinsTests (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'Mixins test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

  console.debug('testClobTruncate')
  testClobTruncate(conn)
  console.debug('testDateTime')
  testDateTime(conn)
  console.debug('test param macros')
  testParamMacros(conn)
  console.debug('test float & currency attributes')
  testFloatAndCurrency(conn)
  if (base.ubVersionNum > 5017000) {
    console.debug('test Tree mixin')
    testTreeMixin(conn)
    console.debug('test asterisk in UBQL')
    testAsterisk(conn)
  }
  testSkipSelectBeforeUpdate(conn)
  if (base.ubVersionNum >= 5018014) {
    testSuffixIndex(conn)
  }
}

/**
 * @param {SyncConnection} conn
 */
function testClobTruncate (conn) {
  const s200 = '1234567890'.repeat(2000)
  const insertedIDs = []

  const values2insert = [{
    code: '1truncate', text100: s200, text2: s200
  }, {
    code: '2strip', text100: '<i>' + s200 + '<i>', text2: '<b><i>' + s200 + '</b></i>'
  }, {
    code: '3empty', text100: null, text2: '<b><i></b></i>'
  }, {
    code: '4strip', text100: '<a>a&gt;b&lt;&nbsp;c &amp;Y&quot;</a>', text2: '<a>a&gt;b</a>'
  }]

  let mustBe = [{
    code: '1truncate', mi_tr_text100: s200.substr(0, 100), mi_tr_text2: s200.substr(0, 2)
  }, {
    code: '2strip', mi_tr_text100: s200.substr(0, 100), mi_tr_text2: s200.substr(0, 2)
  }, {
    code: '3empty', mi_tr_text100: null, mi_tr_text2: null
  }, {
    code: '4strip', mi_tr_text100: 'a>b< c &Y"', mi_tr_text2: 'a>'
  }]

  values2insert.forEach(function (item) {
    insertedIDs.push(conn.insert({
      entity: 'tst_clob',
      fieldList: ['ID'],
      execParams: item
    }))
  })

  const inserted = conn.Repository('tst_clob').attrs(['code', 'mi_tr_text100', 'mi_tr_text2']).orderBy('code').selectAsObject()
  // console.log('actual:', inserted);
  // console.log('expect:', mustBe);

  assert.deepStrictEqual(inserted, mustBe)

  let html2strip = fs.readFileSync(path.join(__dirname, 'fixtures/html2strip.html'), 'utf8')
  const LINE_DELIMITER = html2strip.indexOf('\r\n') > -1 ? '\r\n' : '\n'
  let updated = conn.query({
    entity: 'tst_clob',
    method: 'update',
    fieldList: ['mi_tr_text2000'],
    execParams: {
      ID: insertedIDs[0],
      text2000: html2strip
    }
  })
  assert.strictEqual(updated.resultData.data[0][0], `1${LINE_DELIMITER}3`)

  html2strip = fs.readFileSync(path.join(__dirname, 'fixtures/html2stripHuge.html'), 'utf8')
  updated = conn.query({
    entity: 'tst_clob',
    method: 'update',
    fieldList: ['mi_tr_text2000'],
    execParams: {
      ID: insertedIDs[1],
      text2000: html2strip
    }
  })
  const truncatedHuge = fs.readFileSync(path.join(__dirname, 'fixtures/html2stripHuge.txt'), 'utf8')
  assert.strictEqual(updated.resultData.data[0][0], truncatedHuge)

  const mResult = conn.query({ entity: 'tst_service', method: 'multiply', a: 2, b: 3 })
  assert.strictEqual(mResult.multiplyResult, 2 * 3)
  // test listeners removed - not work!! must me removed in ALL threads
  // conn.post('evaluateScript', 'tst_service.removeAllListeners("multiply:before"); return {res: true}');
  // mResult = conn.run({entity: 'tst_service', method: 'multiply', a: 200, b: 300});
  // assert.equal(mResult.multiplyResult, 200*300);

  const emitterLog = conn.post('evaluateScript', 'return {res: App.globalCacheGet("eventEmitterLog")}')
  mustBe = 'insert:before;insert:after;'.repeat(values2insert.length) + 'multiply:before;multiply:after;'
  assert.strictEqual(emitterLog.res, mustBe)
}

/**
 *
 * @param {SyncConnection} conn
 */
function testDateTime (conn) {
  const dayDate = new Date()

  dayDate.setMilliseconds(0)
  const row2Insert = {
    code: '2014-01-01',
    docDate: dayDate,
    docDateTime: dayDate
  }

  const inserted = conn.insert({
    entity: 'tst_document',
    fieldList: ['code', 'docDate', 'docDateTime'],
    execParams: row2Insert
  })
  assert.strictEqual(row2Insert.code, inserted[0], 'time-like string value should not be converted into the time')
  assert.strictEqual(row2Insert.docDate.getTime(), Date.parse(inserted[1]), 'date field w/o time')
  assert.strictEqual(row2Insert.docDateTime.getTime(), Date.parse(inserted[2]), 'date0-time field')
}

/**
 *
 * @param {SyncConnection} conn
 */
function testFloatAndCurrency (conn) {
  const fContent = fs.readFileSync(path.join(__dirname, '..', '_initialData', 'tst_dictionary-TST.csv'), 'utf8').trim()
  const csvData = csv.parse(fContent, ';')
  const dictRows = conn.Repository('tst_dictionary')
    .attrs(['ID', 'code', 'caption', 'filterValue', 'booleanColumn', 'currencyValue', 'floatValue'])
    .orderBy('ID')
    .selectAsObject()
  dictRows.forEach((r, idx) => {
    // csv first row is ID;code;caption;filterValue;booleanColumn;currencyValue;floatValue
    assert.strictEqual(csvData[idx + 1][0], r.ID, 'Expect ID equality for tst_dictionary')
    assert.strictEqual(csvData[idx + 1][5], parseFloat(r.currencyValue), `Expect currencyValue equality for tst_dictionary. Got ${r.currencyValue} of type ${typeof r.currencyValue}, expect ${csvData[idx + 1][5]} of type ${typeof csvData[idx + 1][5]}`)
    assert.strictEqual(csvData[idx + 1][6], parseFloat(r.floatValue), `Expect floatValue equality for tst_dictionary. Got ${r.floatValue} of type ${typeof r.floatValue}, expect ${csvData[idx + 1][6]} of type ${typeof csvData[idx + 1][6]}`)
  })
}

/**
 *
 * @param {SyncConnection} conn
 */
function testParamMacros (conn) {
  // Этот тест проверяет, насколько корректно построитель запросов обрабатывает символ '#', на который начинаются некоторые макросы
  // Тест начался еще на этапе заполнения таблицы 'tst_maindata', где в 2 записи добавлены макросы
  let selected = conn.query({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'code'],
    whereList: {
      w1: {
        expression: '[code]',
        condition: 'like',
        values: { v1: '#Код' }
      }
    }
  })
  assert.strictEqual(selected.resultData.rowCount, 2, 'Must be 2 row with code start with "#Код"')

  console.debug('Check MAX date DDL macros "#maxdate" is valid')
  selected = conn.query({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'dateTimeValue'],
    whereList: {
      w1: {
        expression: '[dateTimeValue]',
        condition: '=',
        values: { v1: '#maxdate' }
      }
    }
  })
  // Must be 1 record
  assert.strictEqual(selected.resultData.rowCount, 1)

  console.debug('Checking the number of records in the table that have the value of "date" in the "dateTimeValue" attribute defined by the "#maxdate" macro and the "#currentdate"')
  selected = conn.query({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'dateTimeValue'],
    whereList: {
      w1: {
        expression: '[dateTimeValue]',
        condition: 'isNotNull'
      }
    }
  })
  // Must be 2 record
  assert.strictEqual(selected.resultData.rowCount, 2)
}

/**
 *
 * @param {SyncConnection} conn
 */
function testTreeMixin (conn) {
  const desktopID = conn.lookup('ubm_desktop', 'ID', {
    expression: 'code',
    condition: 'equal',
    values: { code: 'tst_desktop' }
  })
  console.info('\t\tuse existed desktop with code `tst_desktop`', desktopID)

  console.log('\t\t\tcreate `tree_deletion_test` shortcut')
  const insertedID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tree_deletion_test',
      caption: 'Shortcut deletion',
      displayOrder: 10,
      cmdCode: '{}'
    }
  })
  console.log('\t\t\tremove `tree_deletion_test` shortcut')
  conn.query({
    entity: 'ubm_navshortcut',
    method: 'delete',
    execParams: {
      ID: insertedID
    }
  })
}

/**
 * @param {SyncConnection} conn
 */
function testAsterisk (conn) {
  console.debug('Allow server-side asterisk only in first fieldList position')
  assert.throws(
    () => conn.post('evaluateScript', "UB.Repository('uba_userrole').attrs(['userID.name', '*']).select()"),
    /(Internal Server Error|Got 1 columnus from DB but 2 specified in fieldList)/,
    'Allow server-side asterisk only in first fieldList position'
  )
  console.debug('Allow asterisk in first position of server-side UBQL')
  conn.post('evaluateScript', "UB.Repository('uba_userrole').attrs('*', 'userID.name').select()")
  console.debug('For client side UBQL mixing of \'*\' and attribute names in fieldList is not allowed')
  assert.throws(
    () => conn.Repository('uba_userrole').attrs(['*', 'userID.name']).select(),
    /(Internal Server Error|For client side UBQL mixing of)/,
    'For client side UBQL mixing of \'*\' and attribute names in fieldList is not allowed'
  )
  console.debug('Allow asterisk for cachable entities')
  const q = conn.Repository('ubm_enum').attrs('*').ubql()
  q.version = '-1'
  conn.query(q)
}

/**
 * @param {SyncConnection} conn
 */
function testSkipSelectBeforeUpdate (conn) {
  console.debug('Test __skipSelectBeforeUpdate')
  const ID = conn.insert({
    entity: 'tst_IDMapping',
    fieldList: ['ID'],
    execParams: {
      code: 'testSkipSelectBeforeUpdate'
    }
  })
  conn.update({
    entity: 'tst_IDMapping',
    __skipSelectBeforeUpdate: true,
    execParams: {
      ID,
      code: 'testSkipSelectBeforeUpdate2'
    }
  })
  const serverSideUpdate = `const store = UB.DataStore('tst_IDMapping')
  store.run('update', {
    __skipSelectBeforeUpdate: true,
    execParams: {
      ID: ${ID},
      code: 'testSkipSelectBeforeUpdate3'
    }
  })`
  conn.post('evaluateScript', serverSideUpdate)
  const updatedCode = conn.Repository('tst_IDMapping').attrs('code').where('ID', '=', ID).selectScalar()
  assert.strictEqual(updatedCode, 'testSkipSelectBeforeUpdate3', 'Should update on server side while __skipSelectBeforeUpdate: true')
}

/**
* @param {SyncConnection} conn
*/
function testSuffixIndex (conn) {
  const doc = conn.Repository('tst_document').attrs('ID', 'code')
    .where('code', 'like', '01-01').selectSingle()
  assert.strictEqual(doc.code, '2014-01-01', 'Suffix index should return \'2014-01-01\' but got ' + doc.code)

  const code = conn.Repository('tst_document').attrs('code')
    .where('code', 'like', '1-01').selectScalar()
  assert.strictEqual(code, undefined, 'Suffix index should not select  \'2014-01-01\' using "0-01" as filter, but got ' + code)

  conn.insert({
    entity: 'tst_dictionary_todo',
    execParams: {
      objectID: 1,
      name: 'test link to doc',
      status: false,
      link: doc.ID
    }
  })

  const linkedCode = conn.Repository('tst_dictionary_todo').attrs('link.code')
    .where('link.code', 'like', '01-01').selectScalar()
  assert.strictEqual(linkedCode, '2014-01-01', 'Suffix index FOR JOIN should return \'2014-01-01\' but got ' + linkedCode)

  const wrongLinkedCode = conn.Repository('tst_dictionary_todo').attrs('link.code')
    .where('link.code', 'like', '1-01').selectScalar()
  assert.strictEqual(wrongLinkedCode, undefined, 'Suffix index FOR JOIN should not select  \'2014-01-01\' using "0-01" as filter, but got ' + wrongLinkedCode)

  // [{"entity":"tst_dictionary_todo","method":"insert","execParams":{"ID":334003995017217,,"fieldList":["ID","objectID","name","status","link","mi_modifyDate","mi_createDate"]}]
}
