/*
 * Created by pavel.mash on 10.10.2014
 * Проверка русского комментария
 * на несколько строк
 */
const fs = require('fs')
const assert = require('assert')
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
App.registerEndpoint('echoToFile', echoToFile, false)

App.registerEndpoint('echoFromFile', echoFromFile, false)

if (process.isServer) {}

// disable ORG login handler for test purpose
if (global.ORG && ORG.checkOrgUnitRequired) {
  ORG.checkOrgUnitRequired = false
}

const path = require('path')
const GS_PATH = App.domainInfo.models.TST.realPath
const FIXTURES = path.join(GS_PATH, '_autotest', 'fixtures')
/**
 * write custom request body to file FIXTURES/req and echo file back to client
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoToFile (req, resp) {
  fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))
  resp.statusCode = 200
  resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), { encoding: 'bin' }))
}

/**
 * Return content of respD.txt (TExtWriter buffer bug test)
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoFromFile (req, resp) {
  const str = fs.readFileSync(path.join(FIXTURES, 'respD.txt'), 'utf8')
  resp.statusCode = 200
  resp.writeEnd(str)
}

// for event emitter test
tst_clob.on('insert:before', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'insert:before;')
  console.log('insert:before fired on the tst_clob')
})
tst_clob.on('insert:after', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'insert:after;')
})
tst_service.on('multiply:before', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'multiply:before;')
})
tst_service.on('multiply:after', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'multiply:after;')
})

/**
 * Perform logging of getDocument requests
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDocumentLog (req, resp) {
  const params = req.parsedParameters
  const reqId = req.requestId
  if (!reqId) throw new Error('req.requestId should be > 0 for UB > 5.18.1')
  if (resp.statusCode === 200) {
    console.log('User with ID', Session.userID, 'obtain document using params', params, ' inside HTTP request #', reqId)
  }
}
App.on('getDocument:before', function (req, resp) { console.log('User with ID', Session.userID, 'try to obtain document') })
App.on('getDocument:after', getDocumentLog)

App.on('timeStamp:before',
  /**
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   */
  function (req, resp) {
    console.log('timeStamp!')
    App.preventDefault()
    resp.statusCode = 200
  }
)
App.on('timeStamp:after', function (req, resp) { console.log('timeStamp after!') })

App.registerEndpoint('getIDTest', getIDTest, false)
/**
 * Test daw
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
const __testIDStore = UB.DataStore('tst_IDMapping')
function getIDTest (req, resp) {
  resp.statusCode = 200
  resp.writeEnd(__testIDStore.generateID())
}

App.registerEndpoint('testTimeout', testTimeout, false)
/**
 * Test http timeout
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testTimeout (req, resp) {
  sleep(40000)
  resp.statusCode = 200
  resp.writeEnd('OK')
}

/**
 * Test server-side BLOB stores
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testServerSideBLOB (req, resp) {
  const DOC_CODE = '2014-01-01'
  const DOC_ENTITY = 'tst_document'
  const DOC_ATTRIBUTE = 'fileStoreSimple'
  resp.statusCode = 200
  let err
  try {
    const firstDoc = UB.Repository(DOC_ENTITY)
      .attrs(['ID', DOC_ATTRIBUTE, 'mi_modifyDate'])
      .where('code', '=', DOC_CODE)
      .limit(1).selectSingle()
    assert.ok(firstDoc, `${DOC_ENTITY} with code "${DOC_CODE}" not found`)

    const content = fs.readFileSync(__filename, { encoding: 'bin' })
    const fn = path.basename(__filename)
    const blobItem = App.blobStores.putContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, fileName: fn },
      content
    )
    assert.strictEqual(blobItem.store, 'simple')
    assert.strictEqual(blobItem.origName, fn)
    assert.strictEqual(blobItem.ct, 'application/javascript; charset=utf-8')
    const fStat = fs.statSync(__filename)
    assert.strictEqual(blobItem.size, fStat.size)
    assert.strictEqual(blobItem.isDirty, true, 'BLOB should be dirty after putContent')
    const tmpContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true },
      { encoding: 'bin' }
    )
    assert.strictEqual(tmpContent.byteLength, fStat.size, `temp content size ${tmpContent.byteLength} not match real ${fStat.size}`)

    const tmpStrContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true },
      { encoding: 'utf-8' }
    )
    const realStrContent = fs.readFileSync(__filename, 'utf8')
    assert.strictEqual(tmpStrContent, realStrContent, 'BLOB store content obtained as string must match')

    const dataStore = UB.DataStore(DOC_ENTITY)
    dataStore.run('lock', {
      lockType: 'ltTemp',
      ID: firstDoc.ID
    })
    dataStore.run('update', {
      fieldList: ['ID', DOC_ATTRIBUTE],
      execParams: {
        ID: firstDoc.ID,
        [DOC_ATTRIBUTE]: JSON.stringify(blobItem),
        mi_modifyDate: firstDoc.mi_modifyDate
      }
    })
    dataStore.currentDataName = dataStore.DATA_NAMES.AFTER_UPDATE
    const newBlobItem = dataStore.get(DOC_ATTRIBUTE)
    dataStore.run('unlock', {
      ID: firstDoc.ID
    })
    assert.ok(newBlobItem, 'updated blobItem content should be non empty')
    const i = JSON.parse(newBlobItem)
    assert.strictEqual(i.v, 1, 'blobstore v1 implementation')
    assert.strictEqual(i.store, 'simple')
    assert.strictEqual(i.origName, fn)
    // assert.equal(i.relPath, '')

    const binContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE },
      { encoding: 'bin' }
    )
    assert.strictEqual(binContent.byteLength, fStat.size, `content size ${binContent.byteLength} not match real ${fStat.size}`)
  } catch (e) {
    err = e.message + 'Server-side all stack: ' + e.stack
  }
  if (err) {
    resp.writeEnd({ success: false, reason: err })
  } else {
    resp.writeEnd({ success: true })
  }
}
App.registerEndpoint('testServerSideBLOB', testServerSideBLOB, false)

/**
 * Evaluate script (for test purpose)
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function evaluateScript (req, resp) {
  if (App.localIPs.indexOf(Session.callerIP) === -1) {
    throw new Error('evaluateScript: remote execution is not allowed')
  }
  let script
  if (req.method === 'GET') {
    script = req.parsedParameters.script
  } else if (req.method === 'POST') {
    script = req.read('utf-8')
  } else {
    return resp.badRequest('invalid HTTP verb ' + req.method)
  }
  // eslint-disable-next-line no-new-func
  let wrapped = new Function(script)
  wrapped = wrapped.bind(this)
  const funcRes = wrapped()
  resp.writeEnd(funcRes)
  resp.statusCode = 200
}
App.registerEndpoint('evaluateScript', evaluateScript)

const HttpProxy = require('@unitybase/http-proxy')
const proxy = new HttpProxy({
  endpoint: 'cms',
  targetURL: 'http://localhost:889/',
  nonAuthorizedURLs: [/./]
})

const SQL = 'select id, name from uba_user'
const dataStore = UB.DataStore('uba_user')

/**
 * Single database query (RAW) for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function dbRaw (req, resp) {
  dataStore.runSQL(SQL, {})
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ id: dataStore.get(0), name: dataStore.get(1) })
}
App.registerEndpoint('dbRaw', dbRaw, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function db (req, resp) {
  const data = UB.Repository('uba_user').attrs(['ID', 'name']).where('ID', '>', 0).selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data[0])
}
App.registerEndpoint('db', db, false)

const UBQL = UB.Repository('cdn_country').attrs(['ID', 'code', 'name_uk^', 'intCode']).limit(10).ubql()
const inst = UB.DataStore('cdn_country')
const Q_ITER = 10000
/**
 * test dataStore.asJSONArray
 * @private
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function asJSONArrayTest (req, resp) {
  inst.run('select', UBQL)
  let l = 0
  for (let i = 0; i < Q_ITER; i++) {
    // noinspection JSDeprecatedSymbols
    const data = JSON.parse(inst.asJSONArray)
    l += data.data.length
  }
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ cnt: l })
}
App.registerEndpoint('asJSONArrayTest', asJSONArrayTest, false)

/**
 * test dataStore.asJSONArray
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getAsJsArrayTest (req, resp) {
  inst.run('select', UBQL)
  let l = 0
  for (let i = 0; i < Q_ITER; i++) {
    const data = inst.getAsJsArray()
    l += data.data.length
  }
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ cnt: l })
}
App.registerEndpoint('getAsJsArrayTest', getAsJsArrayTest, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function dbLong (req, resp) {
  const data = UB.Repository('tst_document').attrs('*').selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data)
}
App.registerEndpoint('dbLong', dbLong, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function arrayBind (req, resp) {
  const s = UB.DataStore('uba_user')
  s.execSQL('insert into uba_user (ID, name) values (?,?)', { ids: [1, 2], names: ['aa', 'bb'] })
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ ok: true })
}
App.registerEndpoint('arrayBind', arrayBind, false)

/**
* pdfsigner multi-thread test
* @param {THTTPRequest} req
* @param {THTTPResponse} resp
*/
function pdfsigner (req, resp) {
  const nps = require('@ub-e/pdfsign/_autotest/test_TubSigner.js')
  nps()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ ok: true })
}
App.registerEndpoint('pdfsigner', pdfsigner, false)

/**
 * Get body as JSON and echo to resp
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function bodyJson (req, resp) {
  const j = req.json()
  resp.statusCode = 200
  resp.writeEnd(j)
}
App.registerEndpoint('bodyJson', bodyJson, false)

/**
 * Get body as JSON and echo to resp
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function bodyParse (req, resp) {
  const j = JSON.parse(req.read())
  resp.statusCode = 200
  resp.writeEnd(j)
}
App.registerEndpoint('bodyParse', bodyParse, false)
