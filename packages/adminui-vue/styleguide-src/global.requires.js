import Vue from 'vue'
import UB from '@unitybase/ub-pub'
import Vuex from 'vuex'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import '../dist/adminui-vue.css'
import '../theme/el-theme-compiled.css'
import '../dist/fonts/fa/css/fontawesome.css'
import '../dist/fonts/fa/css/regular.css'
import '../dist/fonts/fa/css/solid.css'
import '../dist/fonts/fa/css/v4-shims.css'

Vue.use(Element, {
  size: 'small',
  locale
})
Vue.use(Vuex)
Vue.use(UB)

const UbComponents = require('../utils/install-ub-components')
Vue.use(UbComponents)

window.UB = UB

UB.connect({
  host: 'http://localhost:8881',
  onCredentialRequired: function (conn, isRepeat) {
    if (isRepeat) {
      throw new UB.UBAbortError('invalid credential')
    } else {
      return Promise.resolve({authSchema: 'UB', login: 'admin', password: 'admin'})
    }
  },
  onAuthorizationFail: function (reason) {
    console.error(reason)
  }
}).then(function (conn) {
  console.log(`
    Hello, ${conn.userLogin()}!
    We know that you are ${JSON.stringify(conn.userData())}
  `)
  // conn.get('stat').then(function (statResp) {
  //   console.log('Current server statistics:', statResp.data)
  // })
  //
  // conn.Repository('ubm_navshortcut').attrs(['ID', 'code', 'caption'])
  //   .limit(2)
  //   .selectAsObject()
  //   .then(function (data) {
  //     console.log('First 2 adminUI shortcuts:')
  //     console.log(JSON.stringify(data, null, '\t'))
  //   })
})
