/**
 * Created by pavel.mash on 23.04.2015.
 * >ub ./0030_testFTS.js -cfg D:\projects\Autotest\ubConfig.json -app autotest -u admin -p admin
 */
const assert = require('assert')
const fs = require('fs')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv
const path = require('path')
const _ = require('lodash')
const __FILE_NAME = 'ConstitutionUkr.txt'

module.exports = function runFTSTest (options) {
  if (!options) {
    const opts = cmdLineOpt.describe('', 'FTS test')
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  const session = argv.establishConnectionFromCmdLineAttributes(options)
  const _conn = session.connection

  const expectations = [
    /* 0 */{ condition: 'республіка', cnt: 1 }, // code016; стаття 5. україна є республікою.
    /* 1 */{ condition: 'БоГу', cnt: 1 }, // 006 усвідомлюючи відповідальність перед богом, власною совістю,
    /* 2 */{ condition: 'територія', cnt: 5 }, // територія, територію, території
    /* 3 */{ condition: 'консолідація націй', cnt: 1 }, // 033  стаття 11. держава сприяє консолідації та розвиткові української нації,
    /* 4 */{ condition: 'громадян', cnt: 5 }, // громадян, громадянина, громадянин, громадянами,

    /* 5 */{ condition: 'без*', cnt: 6 }, // безпека, безпосередньо

    /* 6 */{ condition: 'право україні', cnt: 4 },
    /* 7 */{ condition: 'право NEAR україні', cnt: 3 },
    /* 8 */{ condition: 'право NEAR/5 україні', cnt: 2 },
    /* 9 */{ condition: 'право NEAR україна NEAR/2 народ', cnt: 1 },

    /* 10 */{ condition: 'громадян України', cnt: 3 },
    /* 11 */{ condition: '"громадян України"', cnt: 1 },

    /* 12 */{ condition: 'громадянин OR бог', cnt: 6 }, // god expected once :)
    /* 13 */{ condition: '"громадян України" OR бог', cnt: 2 }
    //   громадян -України !!!
  ]

  console.debug('\tFTS test')
  insertFirst50Article(_conn)
  testReadFTSGlobalAndEntity(_conn)
  expectationTest(_conn, expectations)
  modifyData(_conn, expectations)
  expectationTest(_conn, expectations)
}

function insertFirst50Article (connection) {
  const descrMaxLen = 2000
  const d = new Date(2015, 1, 1)

  const data = fs.readFileSync(path.join(__dirname, 'fixtures', __FILE_NAME), 'utf8')
  const LINE_DELIMITER = data.indexOf('\r\n') > -1 ? '\r\n' : '\n'
  const testArr = data.split(LINE_DELIMITER)

  console.time('FTS')
  for (let i = 0; i < 50; i++) {
    d.setDate(i % 30 + 1); d.setMonth(i % 11 + 1)
    const descr = testArr[i].slice(0, descrMaxLen)
    connection.insert({
      entity: 'tst_document',
      execParams: {
        code: 'code' + ('000' + i).slice(-3),
        docDate: d,
        description: descr
      }
    })
  }
  console.timeEnd('FTS')
}

function testReadFTSGlobalAndEntity (connection) {
  const res = connection.run({
    entity: 'fts_ftsDefault',
    method: 'fts',
    fieldList: ['ID'],
    whereList: { match: { condition: 'match', value: 'Україна' } },
    options: { limit: 100, start: 0 }
  })
  const dataFTS = res.resultData.data

  let res2 = connection.Repository('tst_document').attrs('ID').where('', 'match', 'Україна').selectAsArray()
  const dataEntity = res2.resultData.data

  assert.deepEqual(_.chain(dataFTS).flatten().sort().value(), _.chain(dataEntity).flatten().sort().value())

  res2 = connection.Repository('tst_document', null, connection).attrs('ID')
    .where('', 'match', 'Україна')
    .where('docDate', '<', new Date(2015, 2, 13))
    .selectAsArray()
  assert.strictEqual(res2.resultData.data.length, 6, 'FTS + docDate filter fail')
}

function expectationTest (connection, matches) {
  let res, dataFTS

  const l = matches.length
  for (let i = 0; i < l; i++) {
    res = connection.run({
      entity: 'fts_ftsDefault',
      method: 'fts',
      fieldList: ['ID', 'entity', 'entitydescr', 'snippet'],
      whereList: { match: { condition: 'match', value: matches[i].condition } },
      options: { limit: 100, start: 0 }
    })
    dataFTS = res.resultData.data
    assert.strictEqual(dataFTS.length, matches[i].cnt, 'Expectation for: ' + matches[i].condition)
  }
}

/**
 * Change  `республікою` to `монархією` in record with code=code16
 * Delete  record with code006 (word 'богом')
 *
 * @param {SyncConnection} connection
 * @param {Array<Object>} expectations
 */
function modifyData (connection, expectations) {
  const modification = {
    code: 'code016',
    description: 'Стаття 5. Україна є монархією.'
  }

  const row = connection.Repository('tst_document').attrs(['ID', 'mi_modifyDate']).where('code', '=', modification.code).selectAsObject()
  connection.query({ entity: 'tst_document', method: 'select', ID: row[0].ID, lockType: 'ltTemp', fieldList: ['ID'] })
  connection.query({
    alsNeed: false,
    entity: 'tst_document',
    method: 'update',
    fieldList: ['ID'],
    execParams: {
      ID: row[0].ID,
      mi_modifyDate: row[0].mi_modifyDate,
      description: modification.description
    }
  })
  expectations[0].cnt = 0
  expectations.push({ condition: 'монархія', cnt: 1 })
  connection.query({ entity: 'tst_document', method: 'unlock', ID: row[0].ID })

  const ID = connection.lookup('tst_document', 'ID', { expression: 'code', condition: 'equal', values: { nameVal: 'code006' } })
  connection.query({
    entity: 'tst_document',
    method: 'delete',
    execParams: { ID: ID }
  })
  expectations[1].cnt = 0
  expectations[12].cnt = expectations[12].cnt - 1
  expectations[13].cnt = expectations[13].cnt - 1
}
