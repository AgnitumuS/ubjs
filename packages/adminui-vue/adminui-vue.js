/* global SystemJS */
const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')
// if (IS_SYSTEM_JS) {
//   SystemJS.config({
//     meta: {
//       '*.vue': {
//         'loader': window.isDeveloperMode
//           ? '@unitybase/systemjs-plugin-vue-ub'
//           : '@unitybase/systemjs-plugin-vue-ub/dist/system_plugin_vue_ub.min.js'
//       }
//     }
//   })
// }

const Vue = require('vue')
window.Vue = Vue
// next 2 lines for modules what use ES6 import `import Vue from 'vue' (not recommended for use)
Vue.__useDefault = Vue
Vue.default = Vue
if (IS_SYSTEM_JS && !SystemJS.has('vue')) SystemJS.set('vue', SystemJS.newModule(Vue))
const ElementUI = require('element-ui/lib/index.js')
window.ElementUI = ElementUI
if (IS_SYSTEM_JS && !SystemJS.has('element-ui')) SystemJS.set('element-ui', SystemJS.newModule(ElementUI))

require('./dist/adminui-vue.css')
Vue.use(UB)
Vue.use(ElementUI, {
  size: 'small', // set element-ui default size
  i18n: UB.i18n.bind(UB), // redirect ElementUI localization to UB.i18n
  zIndex: 300000 // lat's Vue popovers always be above Ext
})

const autoFormComponent = require('./vue_components/AutoFormComponent.vue')
UB.core.UBCommand.showAutoForm = async function () {
  let entitySchema = $App.domainInfo.get(this.entity)
  let tabTitle = entitySchema.caption
  let defaultItems = UB.core.UBCommand.createDefaultItems(this.entity, this.parentContext).items
  let data = await UB.Repository(this.entity).attrs('*').selectById(this.instanceID)
  let tab = $App.viewport.centralPanel.add({
    title: tabTitle,
    tooltip: tabTitle,
    closable: true
  })
  let vm = new Vue({
    template: `<el-scrollbar style='height: 100%;'><auto-form-component :fieldsToShow="fieldsToShow" :entitySchema="entitySchema" :inputData="inputData" /></el-scrollbar>`,
    data: function () {
      return {
        fieldsToShow: defaultItems,
        entitySchema: entitySchema,
        inputData: data
      }
    },
    components: {'auto-form-component': autoFormComponent}
  })
  vm.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  // !! important
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
