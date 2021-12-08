const UB = require('@unitybase/ub-pub')
window.UB = UB // some UB functions use window.UB
const Vue = require('vue')
window.Vue = Vue
const { lookups } = require('@unitybase/adminui-vue')
window.onerror = console.error // silent error as alert
require('@unitybase/adminui-vue/theme/el-theme-compiled.css')
UB.inject('/clientRequire/systemjs/dist/system.js').then(() => {
  System.config({
    baseURL: '/clientRequire',
    map: {
      css: 'systemjs-plugin-css/css.js'
      // placing modulesMap (defined in adminui-reg) here split Vue into 2 instances: one from SystemJS & one from adminui-vue
    },
    meta: {
      // '*': {nonce: 'cspNonce'}  if this line is added (cspNonce is a mustache variable) SystemJS override window.onerror
      '*.css': { loader: 'css' },
      'codemirror/*.js': { format: 'cjs' },
      'tinymce/*.js': { format: 'global' },
      'file-saver': { format: 'cjs' },
      '*.def': { format: 'cjs' },
      '*/adminui.app.min.js': { format: 'global' }, // important: adminui.min.js does not define anything
      '*.vue': {
        loader: '@unitybase/systemjs-plugin-vue-ub/dist/system_plugin_vue_ub.min.js'
      },
      '*/adminui-vue.min.js': { format: 'global' } // important: adminui-vue.min.js does not define anything
    },
    packageConfigPaths: ['@unitybase/*/package.json', '@ub-e/*/package.json', '@ub-d/*/package.json']
  })
})

console.log('window.location', window.location, window.location.port)
const UB_HOST = window.location.port === '6060' // webpack dev server
  ? 'http://localhost:8881'
  : window.location.origin
console.log('!!HOST', UB_HOST)

Vue.prototype._authPromise = UB.connect({
  host: UB_HOST,
  onCredentialRequired (conn, isRepeat) {
    return isRepeat
      ? Promise.reject(new UB.UBAbortError('Invalid password for user admin'))
      : Promise.resolve({ authSchema: 'UB', login: 'uuidoc', password: 'user' })
  }
}).then(conn => {
  UB.inject(`${UB_HOST}/allLocales?lang=${UB.connection.preferredLocale}`)
  /*
   basically lookups automatically calls init from adminui-vue entry file,
   but it requires $App from adminui-pub which calls lookups.init
   */
  lookups.init()
  return conn
}).then(conn => {
  const firstReqID = conn.Repository('req_request').attrs('ID').limit(1).selectScalar()
  return firstReqID
}).then(firstReqID => {
  Vue.prototype._firstReqID = firstReqID
}).catch(e => {
  console.error('UB server not respond - works in OFFLINE mode', e)
  Vue.prototype._authPromise = null
  Vue.prototype.UB_OFFLINE = true
})
