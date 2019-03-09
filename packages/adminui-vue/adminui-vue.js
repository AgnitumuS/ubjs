/* global SystemJS, Ext, $App */
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
const ElementUI = require('element-ui') // adminui-pub maps element-ui -> element-ui/lib/index.js for SystemJS
window.ElementUI = ElementUI
if (IS_SYSTEM_JS && !SystemJS.has('element-ui')) SystemJS.set('element-ui', SystemJS.newModule(ElementUI))

require('normalize.css/normalize.css')
require('./theme/ub-body.css')
require('./theme/el-theme-compiled.css')
if (BOUNDLED_BY_WEBPACK) {
  // webpack MiniCssExtractPlugin extract all styles (for vue SFC), so we need to inject dist/adminui-vue.css
  UB.inject('/clientRequire/@unitybase/adminui-vue/dist/adminui-vue.min.css')
}
Vue.use(UB)
Vue.use(ElementUI, {
  size: 'small', // set element-ui default size
  i18n: UB.i18n.bind(UB), // redirect ElementUI localization to UB.i18n
  zIndex: 300000 // lat's Vue popovers always be above Ext
})

const replaceDefaultTabbar = require('./components/UbTabbar/init')
const replaceDefaultRelogin = require('./components/UbRelogin/init')
const { replaceDefaultDialogs, notifyComponent } = require('./components/UbDialog/init')
const addSidebar = require('./components/UbSidebar/init')

Vue.use(notifyComponent)

if (window.$App) {
  window.$App.on('applicationReady', replaceDefaultTabbar)
  window.$App.on('applicationReady', replaceDefaultRelogin)
  window.$App.on('applicationReady', replaceDefaultDialogs)
  if (UB.connection.appConfig.uiSettings.adminUI.customSidebar) {
    window.$App.on('applicationReady', addSidebar)
    $App.on('buildMainMenu', items => {
      items.splice(0, 1) // remove top panel ExtJS hamburger menu button
    })
    // Example:
    //
    // window.$App.on('applicationReady', () => {
    //   const SidebarSlotExample = require('./samples/SidebarSlotExample.vue').default
    //   $App.fireEvent('portal:sidebar:appendSlot', SidebarSlotExample, { some attrs })
    //
    //   const TabbarSlotExample = require('./samples/TabbarSlotExample.vue').default
    //   $App.fireEvent('portal:tabbar:appendSlot', TabbarSlotExample, { some attrs })
    // })
  }

}

const entityEditor = require('./components/UbEntityEditComponent.vue').default
Vue.component('ub-entity-edit', entityEditor)

if (window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  UB.core.UBCommand.showAutoForm = function () {
    let params = this

    if (!params.tabId) {
      params.tabId = params.entity
      params.tabId += params.instanceID ? params.instanceID : 'ext' + Ext.id(null, 'addNew')
    }
    let existsTab = Ext.getCmp(params.tabId)
    if (existsTab) {
      $App.viewport.centralPanel.setActiveTab(existsTab)
      return
    }

    const autoFormComponent = require('./components/AutoFormComponent.vue').default
    let entitySchema = $App.domainInfo.get(params.entity)
    let tab = $App.viewport.centralPanel.add({
      id: params.tabId,
      title: entitySchema.caption,
      tooltip: entitySchema.caption,
      closable: true
    })
    let vm = new Vue({
      components: {
        'auto-form-component': autoFormComponent
      },
      data: function () {
        return {
          entityName: params.entity,
          instanceID: params.instanceID,
          currentTabId: params.tabId,
          externalData: params.parentContext
        }
      },
      template: `<auto-form-component :entityName="entityName" :instanceID="instanceID" :currentTabId="currentTabId" :externalData="externalData"></auto-form-component>`
    })
    vm.$mount(`#${params.tabId}-outerCt`)
    tab.on('close', function () {
      vm.$destroy()
    })
    $App.viewport.centralPanel.setActiveTab(tab)
  }
}
