/**
 * @author pavel.mash
 * Date: 17.10.14
 * Test "many" attribute
 */
const assert = require('assert')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const TEST_NAME = 'Many attribute'

module.exports = function runFTSTest (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let session = argv.establishConnectionFromCmdLineAttributes(options)
  let conn = session.connection

  console.debug('Start ' + TEST_NAME)
  testManyAttribute(conn)
}

/**
 *
 * @param {SyncConnection} conn
 */
function testManyAttribute (conn) {
  let selected
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue']
  })
  assert.equal(selected.resultData.rowCount, 16, 'Total row count in "tst_maindata" must be 16')

  // console.debug('Проверка корректности агрегированного значения атрибута "manyValue"');
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue'],
    whereList: {
      w1: {
        expression: '[code]',
        condition: '=',
        values: { v1: 'Код1' }
      }
    }
  })
  assert.equal(selected.resultData.data[0][1], '1,2', 'For row with code="Код1" many must contain 2 value: 1 и 2')

  // console.debug('Проверка корректности фильтрации по атрибуту "manyValue" условием "IN". Важно одновременно этот же атрибут иметь в fieldList');
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue'],
    whereList: {
      w1: {
        expression: '[manyValue]',
        condition: 'in',
        values: { v1: [6] }
      }
    }
  })
  assert.equal(selected.resultData.rowCount, 3, '"manyValue IN (6)" condition must rerurn 3 row')

  // console.debug('Проверка корректности фильтрации по атрибуту "manyValue" условием "NOT IN". Важно одновременно этот же атрибут иметь в fieldList');
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue'],
    whereList: {
      w1: {
        expression: '[manyValue]',
        condition: 'notIn',
        values: { v1: [6] }
      }
    }
  })
  // Должно быть 14 записей
  assert.equal(selected.resultData.rowCount, 13, '"manyValue NOT IN (6)" condition must rerurn 13 row')

  // console.debug('Проверка корректности фильтрации по атрибуту "manyValue" условием "IS NULL". Важно одновременно этот же атрибут иметь в fieldList');
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue'],
    whereList: {
      w1: {
        expression: '[manyValue]',
        condition: 'isNull'
      }
    }
  })
  assert.equal(selected.resultData.rowCount, 0, '"manyValue IS NULL" condition with manyValue in fieldList must return 0 row')

  // console.debug('Проверка корректности фильтрации по атрибуту "manyValue" условием "IS NOT NULL". Важно одновременно этот же атрибут иметь в fieldList');
  selected = conn.run({
    entity: 'tst_maindata',
    method: 'select',
    fieldList: ['ID', 'manyValue'],
    whereList: {
      w1: {
        expression: '[manyValue]',
        condition: 'isNotNull'
      }
    }
  })
  assert.equal(selected.resultData.rowCount, 16, '"manyValue IS NOT NULL" condition with manyValue in fieldList must return 16 row')
  selected = conn.Repository('tst_maindata').attrs('ID', 'manyValue.caption').where('code', '=', 'Код1').selectAsObject()
  assert.equal(selected[0]['manyValue.caption'], 'caption 10,caption 20', 'select manyValue.caption')
}
