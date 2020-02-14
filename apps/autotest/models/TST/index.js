const UB = require('@unitybase/ub')
UB.loadLegacyModules(__dirname)

const mailer = require('@unitybase/mailer')
if (!mailer.TubSendMailBodyType) throw new Error('mailer binary package is invalid')

let shouldNotThrowOnSecondThreadInitialize = UB.Repository('uba_user').attrs('ID', 'name').select()
// const Worker = require('@unitybase/base').Worker
//
// new Worker({
//   name: 'numCounter',
//   moduleName: '@unitybase/ubs/_autotest/_numCounterWorker.js'
// })
// return
// const WebDav = require('@ub-e/web-dav')
// const WebDavBlobStoreProvider = require('@ub-e/web-dav/providers/webDavBlobStoreProvider')
// const WebDavFsProvider = require('@ub-e/web-dav/providers/webDavFileSystemProvider')
// WebDav.registerEndpoint('folders')
//   .addProvider(new WebDavBlobStoreProvider({
//     name: 'doc',
//     entities: ['tst_document']
//   }))
//   .addProvider(new WebDavFsProvider({
//     name: 'fs',
//     path: process.configPath
//   }))

if (App.serverConfig.security.authenticationMethods.indexOf('OpenIDConnect') !== -1) {
  const oID = require('@unitybase/openid-connect')
  const oIdEndPoint = oID.registerEndpoint('openIDConnect')

  const baseUrl = 'https://connect-tst-lin.deals.unitybase.info'

  oIdEndPoint.registerProvider('deals', {
    authUrl: baseUrl + '/auth',
    tokenUrl: baseUrl + '/token',
    userInfoUrl: baseUrl + '/me',
    logoutUrl: baseUrl + '/session/end',

    client_id: 'oidDeals',

    client_secret: '1000dealKS3769046ycuQQv',

    userInfoHTTPMethod: 'POST',
    scope: 'openid',
    nonce: '',
    response_type: 'code',
    response_mode: 'query',

    getOnFinishAction: function (response) {
      return `var response = ${JSON.stringify(response)};
      (opener || window).postMessage(response, "*");window.close();`
    },
    getUserID: function (userInfo) {
      return 10
    }
  })
}

// require('http').setGlobalProxyConfiguration('proxy3.softline.main:3249', 'localhost');
// var oID = require('@unitybase/openid-connect')
// var oIdEndPoint = oID.registerEndpoint('openIDConnect')
//
// oIdEndPoint.registerProvider('IdentityServer', {
//   authUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/authorize',
//   tokenUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/token',
//   userInfoUrl: 'https://biztech-prototype.dev.softengi.com:4450/connect/userinfo',
//   userInfoHTTPMethod: 'POST',
//   scope: 'openid+profile+roles+environments+apps',
//   nonce: '123',
//   response_type: 'code',
//   client_id: 'ub',
//   client_secret: 'ub_secret',
//   getOnFinishAction: function (response) {
//     return '(function (response) { opener.postMessage(+ JSON.stringify(response), "*")})'
//   },
//   getUserID: function (userInfo) {
//     var inst = UB.Repository('uba_user').attrs(['ID'])
//       .where('[name]', '=', userInfo.id).select()
//     return inst.eof ? null : inst.get('ID')
//   }
// })
//
// oIdEndPoint.registerProvider('Google', {
//   authUrl: 'https://accounts.google.com/o/oauth2/auth',
//   tokenUrl: 'https://accounts.google.com/o/oauth2/token',
//   userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
//   userInfoHTTPMethod: 'GET',
//   scope: 'openid',
//   nonce: '123',
//   response_type: 'code',
//   client_id: '350085411136-lpj0qvr87ce0r0ae0a3imcm25joj2t2o.apps.googleusercontent.com',
//   client_secret: 'dF4qmUxhHoBAj-E1R8YZUCqA',
//   getOnFinishAction: function (response) {
//     return 'opener.$App.onFinishOpenIDAuth'
//   },
//   getUserID: function (userInfo) {
//     let inst = UB.Repository('uba_user').attrs(['ID'])
//       .where('[name]', '=', userInfo.id).select()
//     return inst.eof ? null : inst.get('ID')
//   }
// })

