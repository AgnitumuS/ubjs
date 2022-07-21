const UB = require('@unitybase/ub')
const Session = UB.Session
const App = UB.App
// Created by pavel.mash on 25.05.2015.
const _ = require('lodash')

/**
 * Check Session.uData persistence. Here we fill Session.uData and check it in tst_service.uDataTest
 * @param {THTTPRequest} req
 */
function testOnUserLogin (req) {
  console.debug('onLogin parameters are:', req.parsedParameters)
  if (req.parsedParameters.prefUData) { // client sends preferred uData - validate it and apply if possible
    try {
      const prefUData = JSON.parse(req.parsedParameters.prefUData)
      if (prefUData.depID) {
        const depID = +prefUData.depID
        // REAL IMPLEMENTATION MUST VALIDATE TWICE what passed uData keys is applicable for logged-in user,
        // and if so - apply it to uData
        Session.uData.depID = depID
      }
    } catch (e) { }
  }
  _.defaults(Session.uData, {
    tstNumArray: [1, 2, 3],
    tstStrArray: ['1', '2', '3'],
    tstNested: { a: 1, b: '2' }
  })
}

Session.on('login', testOnUserLogin)

App.on('domainIsLoaded', function () {
  console.debug('domainIsLoaded fired')
})

/**
 * Deny login for user admin2
 */
function denyAdmin2 () {
  if (Session.uData.login === 'admin2') {
    // throw new Error('Deny login for admin2')
    throw new UB.UBAbort('<<<Deny login for admin2>>>')
  }
}
Session.on('login', denyAdmin2)
