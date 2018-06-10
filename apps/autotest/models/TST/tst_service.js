/* global sleep */
const tstm1 = require('./modules/tstm')
const assert = require('assert')
const _ = require('lodash')
const fs = require('fs')

const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session

const me = tst_service

tstm1.myFunc('fake')

me.entity.addMethod('multiply')
/**
 * @param {ubMethodParams} ctx
 */
me.multiply = function (ctx) {
  const params = ctx.mParams
  let a = params.a || 1
  let b = params.b || 1
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
  sleep(3)
  resp.statusCode = 200
  resp.writeEnd({result: true})
}

me.schedulerTest = function (ctx) {
  console.log('SCHEDULLER: log message from a test scheduller')
  let store = UB.DataStore('uba_user')
  return 'test scheduler executed at' + new Date() + store.currentDataName
}

me.entity.addMethod('uDataTest')
/**
 * @param {ubMethodParams} ctx
 */
me.uDataTest = function (ctx) {
  const sessionData = Session.uData
  assert.deepEqual(sessionData.tstNumArray, [1, 2, 3])
  assert.deepEqual(sessionData.tstStrArray, ['1', '2', '3'])
  assert.deepEqual(sessionData.tstNested, {a: 1, b: '2'})
  assert.ok(!sessionData.hasOwnProperty('addedNotInOnLogin'), 'uData persisted only in Session.on("login")')
  Session.uData.addedNotInOnLogin = 'must not persis between calls'
}

me.entity.addMethod('ubAbortTest')
/**
 * @param {ubMethodParams} ctx
 */
me.ubAbortTest = function (ctx) {
  throw new UB.UBAbort(`<<<Документ "Договір">>>`)
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
  let objArr = [{ID: 1, b: 'aaa'}, {ID: 2}]
  ctx.dataStore.initFromJSON(objArr)
}

/**
 * Test server-side report generation
 *
 *    let arr = []; for(var i=0; i< 25; i++){
 *      arr.push($App.connection.run({entity: 'tst_service', method: 'testServerReportPDF'}));
 *    }
 *    Q.all(arr).done(UB.logDebug)
 *
 * @param {ubMethodParams} ctx
 */
me.testServerReportPDF = function (ctx) {
  console.time('testServerReportPDF')

  const UBReport = require('models/UBS/public/UBReport.js')

  let report = UBReport.makeReport('test', 'pdf', {})
  report.done(function (result) {
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
  let mParams = ctx.mParams
  let isUnicode = (mParams.isUnicode === true)
  let isSystem = (mParams.isSystem === true)
  if (isUnicode) {
    throw new UB.UBAbort('<<<Підтримується>>>')
  } else if (isSystem) {
    fs.renameSync('file_not_found_exos', 'second_path_wrong')
  } else {
    throw new Error('Error exception logger as EXC level')
  }
}
me.entity.addMethod('throwTest')

/**
 * Test throw new Error
 * @param {ubMethodParams} ctx
 */
me.usualExceptionTest = function (ctx) {
  let a = {}
  ctx.mParams.res = a.b.c
}
me.entity.addMethod('usualExceptionTest')

/**
 * Test outOfMemory Exception
 * @param {ubMethodParams} ctx
 */
me.outOfMemExceptionTest = function (ctx) {
  let s = '1234567890'

  while (true) {
    s += s
  }
}
me.entity.addMethod('outOfMemExceptionTest')

me.handledExceptionTest = function (ctx) {
  throw new UB.UBAbort('<<<HelloFromHandledError>>>')
}
me.entity.addMethod('handledExceptionTest')

/**
 * Test Session.runAsAdmin
 * @param {ubMethodParams} ctx
 */
me.runAsAdminTest = function (ctx) {
  let uDataBefore = _.cloneDeep(Session.uData)
  Session.runAsAdmin(function () {
    // uParam.ID = userID;
    // uParam.mi_modifyDate = UB.Repository('uba_user').attrs(['ID','mi_modifyDate']).where('ID', '=', 'userID').select().get('mi_modifyDate');
    let store = UB.DataStore('uba_user')
    store.run('update', {
      fieldList: ['ID'],
      '__skipOptimisticLock': true,
        // execParams: uParam
      execParams: {ID: 10, name: 'admin'}
        // execParams: {ID: 1, name: 'Admin'}
    }
    )
  })
  let uDataAfter = Session.uData
  ctx.mParams.runAsAdminUData = {
    before: uDataBefore,
    after: uDataAfter
  }
}
me.entity.addMethod('runAsAdminTest')

me.dmlGeneratorTest = function (ctx) {
  const generator = require('@unitybase/dml-generator')
  ctx.mParams.resultSQL = generator.mssql.biuldSelectSql('tst_maindata', {
    fieldList: ['parent1@tst_maindata.manyValue.mi_modifyUser.name'],
    whereList: {c1: {
      expression: 'parent1@tst_maindata.manyValue.mi_modifyUser.name', condition: 'equal', values: {c1: 'admin'}
    }}})
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
  resp.writeEnd({headers: req.headers})
  resp.statusCode = 200
}
me.entity.addMethod('restTest')
