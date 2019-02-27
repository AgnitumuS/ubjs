/* global SystemJS, Ext, $App, BOUNDLED_BY_WEBPACK */
const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')

/*
* The BOUNDLED_BY_WEBPACK variable is available only when a project is being built by a webpack.
* But not available in dev mode.
* Please note that BOUNDLED_BY_WEBPACK and window.BOUNDLED_BY_WEBPACK is not the same
* But if BOUNDLED_BY_WEBPACK is undefined app will use window.BOUNDLED_BY_WEBPACK
*/
window.BOUNDLED_BY_WEBPACK = false

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

const {replaceDefaultTabbar} = require('./components/tabbar/init')

if (window.$App) {
  window.$App.on('applicationReady', replaceDefaultTabbar)
}

let entityEditor = require('./components/UbEntityEditComponent.vue')
if (BOUNDLED_BY_WEBPACK) {
  entityEditor = entityEditor.default
}
Vue.component('ub-entity-edit', entityEditor)

if (window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  UB.core.UBCommand.showAutoForm = function () {
    let autoFormComponent = require('./components/AutoFormComponent.vue')
    // window.BOUNDLED_BY_WEBPACK = false
    if (BOUNDLED_BY_WEBPACK) {
      autoFormComponent = autoFormComponent.default
    }
    let params = this
    let entitySchema = $App.domainInfo.get(params.entity)
    if (params.instanceID) {
      let existsTab = Ext.getCmp(params.tabId)
      if (existsTab) {
        $App.viewport.centralPanel.setActiveTab(existsTab)
        return
      }
    }

    let tab = $App.viewport.centralPanel.add({
      id: params.tabId,
      title: entitySchema.caption,
      tooltip: entitySchema.caption,
      closable: true
    })
    let vm = new Vue({
      template: `<auto-form-component :entityName="entityName" :instanceID="instanceID" :currentTabId="currentTabId" :externalData="externalData"></auto-form-component>`,
      data: function () {
        return {
          entityName: params.entity,
          instanceID: params.instanceID,
          currentTabId: params.tabId,
          externalData: params.parentContext
        }
      },
      components: {
        'auto-form-component': autoFormComponent
      }
    })
    vm.$mount(`#${params.tabId}-outerCt`)
    tab.on('close', function () {
      vm.$destroy()
    })
    $App.viewport.centralPanel.setActiveTab(tab)
  }
}
