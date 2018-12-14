/*
 * Created by pavel.mash on 10.10.2014.
 */
const fs = require('fs')
const assert = require('assert')
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
const queryString = require('querystring')
App.registerEndpoint('echoToFile', echoToFile, false)

App.registerEndpoint('echoFromFile', echoFromFile, false)

if (process.isServer) {}

// disable ORG login handler for test purpose
if (global.ORG && ORG.checkOrgUnitRequired) {
  ORG.checkOrgUnitRequired = false
}

const path = require('path')
const GS_PATH = App.domainInfo.models['TST'].realPath
const FIXTURES = path.join(GS_PATH, '_autotest', 'fixtures')
/**
 * write custom request body to file FIXTURES/req and echo file back to client
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoToFile (req, resp) {
  var fs = require('fs')
  fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))
  resp.statusCode = 200
  resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), {encoding: 'bin'}))
}

/**
 * Return content of respD.txt (TExtWriter buffer bug test)
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoFromFile (req, resp) {
  var fs = require('fs')
  var str = fs.readFileSync(path.join(FIXTURES, 'respD.txt'), 'utf8')
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
  var querystring = require('querystring'),
    params = querystring.parse(req.parameters)
  if (resp.statusCode === 200) {
    console.log('User with ID', Session.userID, 'obtain document using params', params)
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

// require('http').setGlobalProxyConfiguration('proxy3.softline.main:3249', 'localhost');
var oID = require('@unitybase/openid-connect'),
  oIdEndPoint = oID.registerEndpoint('openIDConnect')

oIdEndPoint.registerProvider('IdentityServer', {
  authUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/authorize',
  tokenUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/token',
  userInfoUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/userinfo',
  userInfoHTTPMethod: 'POST',
  scope: 'openid+profile+roles+environments+apps',
  nonce: '123',
  response_type: 'code',
  client_id: 'ub',
  client_secret: 'ub_secret',
  getOnFinishAction: function (response) {
    return '(function (response) { opener.postMessage(+ JSON.stringify(response), "*")})'
  },
  getUserID: function (userInfo) {
    var inst = UB.Repository('uba_user').attrs(['ID'])
      .where('[name]', '=', userInfo.id).select()
    return inst.eof ? null : inst.get('ID')
  }
})

oIdEndPoint.registerProvider('Google', {
  authUrl: 'https://accounts.google.com/o/oauth2/auth',
  tokenUrl: 'https://accounts.google.com/o/oauth2/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
  userInfoHTTPMethod: 'GET',
  scope: 'openid',
  nonce: '123',
  response_type: 'code',
  client_id: '350085411136-lpj0qvr87ce0r0ae0a3imcm25joj2t2o.apps.googleusercontent.com',
  client_secret: 'dF4qmUxhHoBAj-E1R8YZUCqA',
  getOnFinishAction: function (response) {
    return 'opener.UB.view.LoginWindow.onFinishOpenIDAuth'
  },
  getUserID: function (userInfo) {
    let inst = UB.Repository('uba_user').attrs(['ID'])
      .where('[name]', '=', userInfo.id).select()
    return inst.eof ? null : inst.get('ID')
  }
})

App.registerEndpoint('getIDTest', getIDTest, false)
/**
 * Test daw
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
let __testIDStore = UB.DataStore('tst_IDMapping')
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
    let firstDoc = UB.Repository(DOC_ENTITY)
      .attrs(['ID', DOC_ATTRIBUTE, 'mi_modifyDate'])
      .where('code', '=', DOC_CODE)
      .limit(1).selectSingle()
    assert.ok(firstDoc, `${DOC_ENTITY} with code "${DOC_CODE}" not found`)

    let content = fs.readFileSync(__filename, {encoding: 'bin'})
    let fn = path.basename(__filename)
    let blobItem = App.blobStores.putContent(
      {ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, fileName: fn},
      content
    )
    assert.equal(blobItem.store, 'simple')
    assert.equal(blobItem.origName, fn)
    assert.equal(blobItem.ct, 'application/javascript; charset=utf-8')
    let fStat = fs.statSync(__filename)
    assert.equal(blobItem.size, fStat.size)
    assert.equal(blobItem.isDirty, true, 'BLOB should be dirty after putContent')
    let tmpContent = App.blobStores.getContent(
      {ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true},
      {encoding: 'bin'}
    )
    assert.equal(tmpContent.byteLength, fStat.size, `temp content size ${tmpContent.byteLength} not match real ${fStat.size}`)

    let tmpStrContent = App.blobStores.getContent(
      {ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true},
      {encoding: 'utf-8'}
    )
    let realStrContent = fs.readFileSync(__filename, 'utf8')
    assert.equal(tmpStrContent, realStrContent, 'BLOB store content obtained as string must match')

    let dataStore = UB.DataStore(DOC_ENTITY)
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
    let newBlobItem = dataStore.get(DOC_ATTRIBUTE)
    dataStore.run('unlock', {
      ID: firstDoc.ID
    })
    assert.ok(newBlobItem, 'updated blobItem content should be non empty')
    let i = JSON.parse(newBlobItem)
    assert.equal(i.v, 1, 'blobstore v1 implementation')
    assert.equal(i.store, 'simple')
    assert.equal(i.origName, fn)
    // assert.equal(i.relPath, '')

    let binContent = App.blobStores.getContent(
      {ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE},
      {encoding: 'bin'}
    )
    assert.equal(binContent.byteLength, fStat.size, `content size ${binContent.byteLength} not match real ${fStat.size}`)
  } catch (e) {
    err = e.message + 'Server-side all stack: ' + e.stack
  }
  if (err) {
    resp.writeEnd({success: false, reason: err})
  } else {
    resp.writeEnd({success: true})
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
    script = queryString.parse(req.parameters).script
  } else if (req.method === 'POST') {
    script = req.read('utf-8')
  } else {
    return resp.badRequest('invalid HTTP verb ' + req.method)
  }
  // eslint-disable-next-line no-new-func
  let wrapped = new Function(script)
  wrapped = wrapped.bind(this)
  let funcRes = wrapped()
  resp.writeEnd(funcRes)
  resp.statusCode = 200
}
App.registerEndpoint('evaluateScript', evaluateScript)

const HttpProxy = require('@unitybase/http-proxy')
let proxy = new HttpProxy({
  endpoint: 'cms',
  targetURL: 'http://localhost:889/',
  nonAuthorizedURLs: [/./]
})
