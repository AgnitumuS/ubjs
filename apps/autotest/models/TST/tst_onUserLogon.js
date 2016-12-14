/**
 * Created by pavel.mash on 25.05.2015.
 */

/**
 * Check Session.uData persistence. Here we fill Session.uData and check it in tst_service.uDataTest
 */
function testOnUserLogin () {
  _.defaults(Session.uData, {
    tstNumArray: [1, 2, 3],
    tstStrArray: ['1', '2', '3'],
    tstNested: {a: 1, b: '2'}
  })
}

Session.on('login', testOnUserLogin)

App.on('domainIsLoaded', function () {
  console.debug('domainIsLoaded fired')
})
