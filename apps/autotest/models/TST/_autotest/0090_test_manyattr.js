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
    const opts = cmdLineOpt.describe('', TEST_NAME)
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const conn = session.connection

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
  assert.strictEqual(selected.resultData.rowCount, 23, 'Total row count in "tst_maindata" must be 23')

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
  assert.strictEqual(selected.resultData.data[0][1], '1,2', 'For row with code="Код1" many must contain 2 value: 1 и 2')

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
  assert.strictEqual(selected.resultData.rowCount, 3, '"manyValue IN (6)" condition must rerurn 3 row')

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
  assert.strictEqual(selected.resultData.rowCount, 20, '"manyValue NOT IN (6)" condition must returns 20 row')

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
  assert.strictEqual(selected.resultData.rowCount, 0, '"manyValue IS NULL" condition with manyValue in fieldList must return 0 row')

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
  assert.strictEqual(selected.resultData.rowCount, 23, '"manyValue IS NOT NULL" condition with manyValue in fieldList must return 23 row')
  selected = conn.Repository('tst_maindata').attrs('ID', 'manyValue.caption').where('code', '=', 'Код1').selectAsObject()
  assert.strictEqual(selected[0]['manyValue.caption'], 'caption 10,caption 20', 'select manyValue.caption')
  conn.insert({
    entity: 'tst_maindata',
    execParams: {
      code: 'test2Many',
      nonNullDict_ID: 1,
      manyValue: '1,2',
      manyValue2: '3,4'
    }
  })
  selected = conn.Repository('tst_maindata').attrs('ID', 'manyValue', 'manyValue2', 'mi_modifyDate').where('code', '=', 'test2Many')
    .selectSingle()
  assert.strictEqual(selected.manyValue, '1,2', 'For row with code="test2Many" many must contain 2 value: 1 & 2')
  assert.strictEqual(selected.manyValue2, '3,4', 'For row with code="test2Many" many2 must contain 2 value: 3 & 4')
  conn.update({
    entity: 'tst_maindata',
    execParams: {
      ID: selected.ID,
      manyValue: '5,6',
      manyValue2: '7',
      mi_modifyDate: selected.mi_modifyDate
    }
  })
  selected = conn.Repository('tst_maindata').attrs('ID', 'manyValue', 'manyValue2').where('code', '=', 'test2Many')
    .selectSingle()
  assert.strictEqual(selected.manyValue, '5,6', 'For row with code="test2Many" many must contain 2 value: 5 & 6')
  assert.strictEqual('' + selected.manyValue2, '7', 'For row with code="test2Many" many2 must contain 1 value: 7')
}
