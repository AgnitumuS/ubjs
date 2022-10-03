const UB = require('@unitybase/ub-pub')
window.UB = UB
const _ = require('lodash')
window._ = _
if (window.Vue === undefined) {
  window.Vue = require('vue')
}
const Vue = window.Vue
// next 2 lines for modules what use ES6 import `import Vue from 'vue' (not recommended for use)
Vue.__useDefault = Vue
Vue.default = Vue
const $App = require('@unitybase/adminui-vue')
window.$App = $App

//
// require('@unitybase/adminui-vue/dist/fonts/fa/css/fa-all4ub.min.css')
require('@unitybase/adminui-vue/theme/el-theme-compiled.css')
// require('@unitybase/adminui-vue/dist/adminui-vue.min.css')

const ULogView = require('@unitybase/logview/public/forms/components/ULogView.vue').default
Vue.component('ULogView', ULogView)

const app = new Vue({
  el: '#app'
})
