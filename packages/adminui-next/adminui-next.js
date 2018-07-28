/* global SystemJS */
const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')
if (IS_SYSTEM_JS) {
  SystemJS.config({
    meta: {
      '*.vue': {
        'loader': window.isDeveloperMode
          ? '@unitybase/systemjs-plugin-vue-ub'
          : '@unitybase/systemjs-plugin-vue-ub/dist/system_plugin_vue_ub.min.js'
      }
    }
  })
}

const Vue = require('vue')
window.Vue = Vue
// next 2 lines for modules what use ES6 import `import Vue from 'vue' (not recommended for use)
Vue.__useDefault = Vue
Vue.default = Vue
if (IS_SYSTEM_JS && !SystemJS.has('vue')) SystemJS.set('vue', SystemJS.newModule(Vue))
const ElementUI = require('element-ui/lib/index.js')
window.ElementUI = ElementUI
if (IS_SYSTEM_JS && !SystemJS.has('element-ui')) SystemJS.set('element-ui', SystemJS.newModule(ElementUI))

require('./dist/adminui-next.css')
Vue.use(UB)
Vue.use(ElementUI, {
  size: 'small', // set element-ui default size
  i18n: UB.i18n.bind(UB) // redirect ElementUI localization to UB.i18n
})
