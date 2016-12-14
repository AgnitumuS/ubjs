const UBA_COMMON = require('@unitybase/uba/modules/uba_common')
var
  assert = require('assert'),
  ok = assert.ok,
  fs = require('fs'),
  argv = require('@unitybase/base/argv'),
  session, conn

console.debug('Start uba_otp test')
session = argv.establishConnectionFromCmdLineAttributes()
conn = session.connection
try {
  testOtpEmail()
} finally {
  session.logout()
}

function testOtpEmail () {
  'use strict'
  var
    userID, otp, otpKind = 'EMail',
    inst = conn.Repository('uba_user').attrs(['ID']).where('[name]', '=', 'otp_testUser1').select()

  function genOtp (obj, lifeTime) {
    otp = conn.post('evaluateScript',
                'return {otp: uba_otp.generateOtp("' + otpKind + '", ' + userID + ', ' +
                JSON.stringify(obj) + ', ' + (lifeTime ? lifeTime : 'null') + ')};').otp
  }

  function checkAuth (fun) {
    var funStr, auth

    if (fun) {
      funStr = fun.toSource()
      funStr = ', ' + funStr.substr(1, funStr.length - 2)
    } else
            { funStr = '' }
    auth = conn.post('evaluateScript',
                'return {res: uba_otp.auth("' + otp + '", "' + otpKind + '"' + funStr + '), userID: Session.userID};')
    if (auth.res)
          { assert.equal(auth.userID, userID, 'invalid userID after successful otp.auth') }
    return auth.res
  }
//  Prepare test User
  if (inst.length === 0) {
    userID = conn.insert({
      entity: 'uba_user',
      fieldList: ['ID'],
      execParams: {
        name: 'otp_testUser1'
      }
    })
    conn.xhr({
      UBMethod: 'changePassword',
      data: {
        newPwd: 'testPwd1',
		    forUser: 'otp_testUser1'
      }
    })

    conn.insert({
      entity: 'uba_userrole',
      fieldList: ['ID'],
      execParams: {
        userID: userID,
        roleID: conn.lookup('uba_role', 'ID', {expression: 'name', condition: 'equal', values: {name: UBA_COMMON.ROLES.ADMIN.NAME}})
      }
    })
  } else {
    userID = inst[0].ID
  }
//  Start tests
  console.debug('1. Generate otp 1 (normal)')
  genOtp(null, 3)
  sleep(1000)
  ok(checkAuth(), 'otp.auth actual otp failed')
  ok(!checkAuth(), 'otp.auth already used otp successful')

  console.debug('2. Generate otp 2 (expired)')
  genOtp(null, 2)
  sleep(3000)
  ok(!checkAuth(), 'otp.auth expired otp successful')

  console.debug('3. Generate otp 3 (with uData and correct check)')
  genOtp({test: 'test'})
  ok(checkAuth(function (uData) { return (JSON.parse(uData).test === 'test') }), 'otp.auth actual otp failed')

  console.debug('4. Generate otp 4 (incorrect check)')
  genOtp()
  ok(!checkAuth(function (uData) { return false }), 'otp.auth incorrect check otp successful')

  console.debug('test complete')
}
