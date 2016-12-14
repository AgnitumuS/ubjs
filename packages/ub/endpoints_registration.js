/**
 * UnityBase default endpoints registration.
 * @author pavel.mash on 17.10.2016.
 */

const {clientRequire, models, getAppInfo} = require('./modules/endpoints')

App.registerEndpoint('getAppInfo', getAppInfo, false)
App.registerEndpoint('models', models, false)
App.registerEndpoint('clientRequire', clientRequire, false)
