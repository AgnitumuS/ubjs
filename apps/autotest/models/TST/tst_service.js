/* global sleep */
const tstm1 = require('./modules/tstm')
const assert = require('assert')
const _ = require('lodash')
const fs = require('fs')

const UB = require('@unitybase/ub')
const UBA = require('@unitybase/base').uba_common
const App = UB.App
const Session = UB.Session

// eslint-disable-next-line no-undef,camelcase
const me = tst_service

tstm1.myFunc('fake')

me.entity.addMethod('multiply')
/**
 * @param {ubMethodParams} ctx
 */
me.multiply = function (ctx) {
  const params = ctx.mParams
  const a = params.a || 1
  const b = params.b || 1
  params.multiplyResult = a * b
}

me.entity.addMethod('sleep3sec')
/**
 * Called by auto test in async mode to check ?async=true is work
 * @param {ubMethodParams} ctx
 * @param {THTTPRequest} req Name of a scheduler item
 * @param {THTTPResponse} resp Command to execute
 */
me.sleep3sec = function (ctx, req, resp) {
  sleep(3000)
  if (resp) { // called as rest endpoint
    resp.statusCode = 200
    resp.writeEnd({ result: true })
  } else {
    ctx.mParams.result = true
  }
}

/**
 * Called by TST model schedulers for testing purpose
 * @param {ubMethodParams} ctx
 * @returns {string}
 */
me.schedulerTest = function (ctx) {
  console.log('SCHEDULER: log message from a test scheduler')
  const store = UB.DataStore('uba_user')
  return 'test scheduler executed at' + new Date() + store.currentDataName
}

/**
 * Called by TST model schedulers. Verify reaction on process._exiting
 * @param {ubMethodParams} ctx
 * @returns {string}
 */
me.foreverSchedulerTest = function (ctx) {
  console.log('SCHEDULER: foreverSchedulerTest started')
  while (!process.terminationRequested()) {
    console.log('SCHEDULER: foreverSchedulerTest still work...')
    sleep(1000)
  }
  console.log('SCHEDULER: foreverSchedulerTest terminated')
}

me.entity.addMethod('uDataTest')
/**
 * @param {ubMethodParams} ctx
 */
me.uDataTest = function (ctx) {
  const endpointContextKeys = Object.keys(App.endpointContext)
  assert.ok(endpointContextKeys.length === 0, 'App.endpointContext should be empty before each launchEndpoint')
  const sessionData = Session.uData
  assert.deepStrictEqual(sessionData.tstNumArray, [1, 2, 3])
  assert.deepStrictEqual(sessionData.tstStrArray, ['1', '2', '3'])
  assert.deepStrictEqual(sessionData.tstNested, { a: 1, b: '2' })
  assert.ok(!sessionData.hasOwnProperty('addedNotInOnLogin'), 'uData persisted only in Session.on("login")')
  Session.uData.addedNotInOnLogin = 'must not persis between calls'
  App.endpointContext.TST_KEY = '12345' // add some key into endpointContext - should be rested after endpoint execution
}

me.entity.addMethod('ubAbortTest')
/**
 * @param {ubMethodParams} ctx
 */
me.ubAbortTest = function (ctx) {
  throw new UB.UBAbort('<<<???????????????? "??????????????">>>')
}

App.globalCachePut('aa', '12')
console.log('Got a value:', App.globalCacheGet('aa'))

me.serviceRLS = function () {
  console.log('!!! service RLS this = ', this.entity.name)
  return '(0=0)'
}

me.entity.addMethod('testDataStoreInitialization')
/**
 * @param {ubMethodParams} ctx
 */
me.testDataStoreInitialization = function (ctx) {
  const objArr = [{ ID: 1, b: 'aaa' }, { ID: 2 }]
  ctx.dataStore.initFromJSON(objArr)
}

/**
 * Test server-side report generation
 *
 *    let arr = []; for(var i=0; i< 25; i++){
 *      arr.push($App.connection.run({entity: 'tst_service', method: 'testServerReportPDF'}));
 *    }
 *    Promise.all(arr).then(UB.logDebug)
 *
 * @param {ubMethodParams} ctx
 */
me.testServerReportPDF = function (ctx) {
  console.time('testServerReportPDF')

  const UBReport = require('models/UBS/public/UBReport.js')

  const report = UBReport.makeReport('test', 'pdf', {})
  report.then(function (result) {
    if (result.reportType === 'pdf') {
      console.log('Generate PDF of', result.reportData.byteLength)
      // fs.writeFileSync('d:\\result.pdf', result.reportData );
    } else {
      console.log('Generate HTML of', result.reportData.length)
      fs.writeFileSync('d:\\result.html', result.reportData)
    }
    console.timeEnd('testServerReportPDF')
  })
}
me.entity.addMethod('testServerReportPDF')

// ubs_report.testServerRendering method for autotest
me.testServerRendering = ubs_report.testServerRendering
me.entity.addMethod('testServerRendering')

/**
 * Test UB.UBAbortError
 * @param {ubMethodParams} ctx
 */
me.abortTest = function (ctx) {
  throw new UB.UBAbort('UBAbort exception logged as ERROR log level')
}
me.entity.addMethod('abortTest')

/**
 * Test throw new Error
 * @param {ubMethodParams} ctx
 */
me.throwTest = function (ctx) {
  const mParams = ctx.mParams
  const isUnicode = (mParams.isUnicode === true)
  const isSystem = (mParams.isSystem === true)
  const isRepo = (mParams.isRepo === true)
  if (isRepo) {
    tstm1.throwStackTestInner()
  } else if (isUnicode) {
    throw new UB.UBAbort('<<<??????????????????????????>>>')
  } else if (isSystem) {
    fs.renameSync('file_not_found_exos', 'second_path_wrong')
  } else {
    throw new Error('Error exception logged as EXC level')
  }
}
me.entity.addMethod('throwTest')

/**
 * Test throw new Error
 * @param {ubMethodParams} ctx
 */
me.usualExceptionTest = function (ctx) {
  const a = {}
  ctx.mParams.res = a.b.c
}
me.entity.addMethod('usualExceptionTest')

/**
 * Test outOfMemory Exception
 * @param {ubMethodParams} ctx
 */
me.outOfMemExceptionTest = function (ctx) {
  let s = '1234567890'
  for (let i = 0; i < 10000000; i++) {
    s += s
  }
}
me.entity.addMethod('outOfMemExceptionTest')

me.handledExceptionTest = function (ctx) {
  throw new UB.UBAbort('<<<HelloFromHandledError>>>')
}
me.entity.addMethod('handledExceptionTest')

function doAsUser () {
  // uParam.ID = userID;
  // uParam.mi_modifyDate = UB.Repository('uba_user').attrs(['ID','mi_modifyDate']).where('ID', '=', 'userID').select().get('mi_modifyDate');
  const store = UB.DataStore('uba_user')
  store.run('update', {
    fieldList: ['ID'],
    __skipOptimisticLock: true,
    execParams: { ID: UBA.USERS.ADMIN.ID, name: UBA.USERS.ADMIN.NAME }
  })
  return JSON.stringify(Session.uData)
}
/**
 * Test Session.runAsAdmin
 * @param {ubMethodParams} ctx
 */
me.runAsAdminTest = function (ctx) {
  const uDataBefore = _.cloneDeep(Session.uData)
  const uDataInsidePseudoAdmin = Session.runAsAdmin(doAsUser)
  const elsUID = UB.Repository('uba_user').attrs('ID').where('name', '=', 'testelsuser').selectScalar()
  const uDatainsidePseudoAdmin2level = Session.runAsAdmin(function () {
    return Session.runAsUser(elsUID, doAsUser)
  })
  const uDataAfter = Session.uData
  console.log('uDataInsidePseudoAdmin', uDataInsidePseudoAdmin)
  ctx.mParams.runAsAdminUData = {}
  ctx.mParams.runAsAdminUData.before = uDataBefore
  ctx.mParams.runAsAdminUData.after = uDataAfter
  ctx.mParams.runAsAdminUData.uDataInsidePseudoAdmin = uDataInsidePseudoAdmin
  ctx.mParams.runAsAdminUData.uDataInsidePseudoAdmin2level = uDatainsidePseudoAdmin2level
}
me.entity.addMethod('runAsAdminTest')

/**
 * Test Session.runAsUser restore session in case login method fails
 * @param {ubMethodParams} ctx
 */
me.runAsUserFailsTest = function (ctx) {
  ctx.mParams.runAsUserData = {}
  console.log('User ID before runAs', Session.userID)
  try {
    const admin2ID = UB.Repository('uba_user').attrs('ID').where('name', '=', 'admin2').selectScalar()
    Session.runAsUser(admin2ID, doAsUser)
  } catch (e) {
    ctx.mParams.runAsUserData.error = e.toString()
  }
  console.log('User ID after runAs', Session.userID)
  ctx.mParams.runAsUserData.userAfterFailedLogin = Session.userID
}
me.entity.addMethod('runAsUserFailsTest')

me.dmlGeneratorTest = function (ctx) {
  const generator = require('@unitybase/dml-generator')
  ctx.mParams.resultSQL = generator.mssql.biuldSelectSql('tst_maindata', {
    fieldList: ['parent1@tst_maindata.manyValue.mi_modifyUser.name'],
    whereList: {
      c1: {
        expression: 'parent1@tst_maindata.manyValue.mi_modifyUser.name', condition: 'equal', values: { c1: 'admin' }
      }
    }
  })
  ctx.mParams.sql2 = generator.mssql.biuldSelectSql('tst_maindata',
    UB.Repository('tst_maindata')
      .attrs('[nonNullDict_ID.caption]', '[nonNullDict_ID.caption_en^]', 'nonNullDict_ID.filterValue', 'nonNullDict_ID.floatValue')
      .ubql()
  )
}
me.entity.addMethod('dmlGeneratorTest')

/**
 * Test entity method execution using `rest` pattern
 * @param {null} ctx
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
me.restTest = function (ctx, req, resp) {
  resp.writeEnd({ headers: req.headers })
  resp.statusCode = 200
}
me.entity.addMethod('restTest')

me.entity.addMethod('datesTest')
/**
 * @param {ubMethodParams} ctx
 */
me.datesTest = function (ctx) {
  // verify debugger stops correctly on multiline strings
  // eslint-disable-next-line no-unused-vars
  const multilineString = `
   cx: PJSContext;
    Exp: PJSRootedObject;^
    Req: PJSRootedObject;^
    Module: PJSRootedObject;
    filename: PWideChar;
    dirname: PWideChar;^
  asdasdas
  asdasd
  `
  const params = ctx.mParams
  const zDate = new Date('2017-01-01T00:00Z')
  const uDate = new Date('2017-01-01T12:20Z')
  params.zDate = zDate
  params.uDate = uDate
  params.dates = {
    zDate, uDate
  }
}

/**
 * Test entity method execution using `rest` pattern
 * @param {ubMethodParams} ctxt
 */
me.mParamsTest = function (ctxt) {
  let p
  for (let i = 0; i < 1000000; i++) {
    p = ctxt.mParams
  }
  ctxt.mParams.resp = 'YES'
  App.globalCachePut('a', 'a')

  console.time('globalCacheGet')
  for (let i = 0; i < 1000000; i++) {
    p = _App.globalCacheGet('a')
  }
  console.timeEnd('globalCacheGet')
  console.log('globalCacheGet=', p)

  console.time('globalCacheGetS')
  for (let i = 0; i < 1000000; i++) {
    p = _SApp.globalCacheGet('a')
  }
  console.timeEnd('globalCacheGetS')
  console.log('globalCacheGetS=', p)

  // _SApp.globalCacheGet(1, 2)

  console.time('_App.els')
  for (let i = 0; i < 1000000; i++) {
    p = App.els('tst_clob', 'select')
  }
  console.timeEnd('_App.els')
  console.time('_SApp.els')
  for (let i = 0; i < 1000000; i++) {
    p = _SApp.els('tst_clob', 'select')
  }
  console.timeEnd('_SApp.els')
}
me.entity.addMethod('mParamsTest')

/**
 * Verify signature using IIT library
 * @param {ubMethodParams} ctx
 * @param {string} ctx.mParams.base64Data
 * @param {string} ctx.mParams.base64Signature
 */
me.iitVerify = function (ctx) {
  const iitCrypto = require('@ub-d/iit-crypto')
  iitCrypto.init()
  const signature = Buffer.from(ctx.mParams.base64Signature, 'base64')
  const data = Buffer.from(ctx.mParams.base64Data, 'base64')
  const verifyResult = iitCrypto.verify(signature, data)
  delete ctx.mParams.base64Data
  delete ctx.mParams.base64Signature
  ctx.mParams.result = verifyResult
}
me.entity.addMethod('iitVerify')

/**
 * Run a long query to verify a ERR_RESOURCE_LIMITS_EXCEED exception handling
 * @example
 *
UB.connection.query({
  entity: 'tst_service',
  method: 'resourceLimitationTest',
  testFetchSize: true, // false to test time limits
  level: 3
})
 * @param {ubMethodParams} ctx
 * @param {number} ctx.mParams.level
 */
me.resourceLimitationTest = function (ctx) {
  App.dbStartTransaction(me.entity.connectionConfig.name)
  let level = ctx.mParams.level || 4
  let q = (ctx.mParams.testFetchSize ? 'select *' : 'select max(at.ID)') + ' from uba_auditTrail at'
  if (level > 5) level = 5
  for (let i = 1; i <= level; i++) {
    q = q + ` cross join uba_auditTrail at${i}`
  }
  ctx.dataStore.runSQL(q, {})
}
me.entity.addMethod('resourceLimitationTest')

me.entity.addMethod('reloadConfig')
/**
 * @param {ubMethodParams} ctx
 */
me.reloadConfig = function (ctx) {
  App.reloadConfig()
  const prevTID = Session.setTempTenantID(12)
  console.log(`tenantID switched from ${prevTID}`)
}

me.entity.addMethod('testAddNew')
/**
 * @param {ubMethodParams} ctx
 */
me.testAddNew = function (ctx) {
  const uDs = UB.DataStore('uba_user')
  uDs.run('addnew', {
    fieldList: ['ID', 'name', 'mi_modifyDate'],
    execParams: { name: '22' }
  })

  const ID = uDs.get('ID')
  const name = uDs.get('name')
  const modifyDate = uDs.get('mi_modifyDate')
  console.log('ID=', ID, 'of type', typeof ID)
  console.log('name =', name, 'of type', typeof name)
  console.log('modifyDate=', modifyDate, 'of type', typeof modifyDate)
  const json = uDs.getAsJsObject()
  console.log('json=', json)
  ctx.mParams.resID = ID
  ctx.mParams.resName = name
  ctx.mParams.resJson = JSON.stringify(json)
}
