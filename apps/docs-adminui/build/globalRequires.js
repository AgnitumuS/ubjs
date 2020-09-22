const UB = require('@unitybase/ub-pub')
window.UB = UB // some UB functions use window.UB
const Vue = require('vue')
window.Vue = Vue
const { lookups } = require('@unitybase/adminui-vue')
window.onerror = console.error // silent error as alert
require('../../../packages/adminui-vue/theme/el-theme-compiled.css')

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
      : Promise.resolve({ authSchema: 'UB', login: 'admin', password: 'admin' })
  }
}).then(async resp => {
  await UB.inject(`${UB_HOST}/allLocales?lang=${UB.connection.preferredLocale}`)
  /*
   basically lookups automatically calls init from adminui-vue entry file,
   but it requires $App from adminui-pub which calls lookups.init
   */
  await lookups.init()
  return resp
}).catch(e => {
  console.error('UB server not respond - works in OFFLINE mode', e)
  Vue.prototype._authPromise = null
  Vue.prototype.UB_OFFLINE = true
})
