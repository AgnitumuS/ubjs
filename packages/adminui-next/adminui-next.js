const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const Vue = require('vue')
window.Vue = Vue
Vue.__useDefault = Vue
if ((typeof SystemJS !== 'undefined') && !SystemJS.has('vue')) SystemJS.set('vue', SystemJS.newModule(Vue))
const ElementUI = require('element-ui/lib/index.js')
window.ElementUI = ElementUI
if ((typeof SystemJS !== 'undefined') && !SystemJS.has('element-ui')) SystemJS.set('element-ui', SystemJS.newModule(ElementUI))

require('./dist/adminui-next.css')
Vue.use(UB)
// redirect ElementUI localization to UB.i18n
Vue.use(ElementUI, {
  i18n: UB.i18n.bind(UB)
})
