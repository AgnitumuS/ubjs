const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const Vue = require('vue')
const ElementUI = require('element-ui/lib/index.js')
require('element-ui/lib/theme-chalk/index.css')
// locale from 'element-ui/lib/locale/lang/en'
// Vue.use(ElementUI, { locale })
window.Vue = Vue
if (!SystemJS.has('vue')) SystemJS.set('vue', SystemJS.newModule({exports: Vue}))
Vue.use(UB)
// redirect ElementUI localization to UB.i18n
Vue.use(ElementUI, {
  i18n: UB.i18n.bind(UB)
})
