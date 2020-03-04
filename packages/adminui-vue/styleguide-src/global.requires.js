import Vue from 'vue'
import UB from '@unitybase/ub-pub'
import Vuex from 'vuex'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import momentPlugin from '../utils/moment-plugin'
import '../dist/adminui-vue.css'
import '../theme/el-theme-compiled.css'
import '../dist/fonts/fa/css/fontawesome.css'
import '../dist/fonts/fa/css/regular.css'
import '../dist/fonts/fa/css/solid.css'
import '../dist/fonts/fa/css/v4-shims.css'
import './style.css'

Vue.use(momentPlugin)
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
  /*conn.Repository('doc_department').attrs([
    'ID',
    'name',
    'address',
    'phone',
    'isMain',
    'status',
    'description',
    'createDate',
    'boss',
    'logo',
    'topManagers'
  ])
    .selectSingle()
    .then(function (data) {
      Window.doc_departmentData = data
      console.log(Window.doc_departmentData)
    })*/
})
