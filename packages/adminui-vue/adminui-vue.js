/* global SystemJS, Ext, $App, BOUNDLED_BY_WEBPACK */
const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')

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

const Vuex = require('./node_modules/vuex/dist/vuex.common') // need to replace to 'vuex'
const ClickOutside = require('./node_modules/vue-click-outside/index') // need to replace to 'vue-click-outside'
window.Vuex = Vuex
Vue.use(Vuex)
Vue.use({
  install(Vue){
    Vue.directive('click-outside', ClickOutside)
  }
})

const {replaceDefaultTabbar} = require('./components/tabbar/init')
window.$App.on('applicationReady', replaceDefaultTabbar)

if (window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  UB.core.UBCommand.showAutoForm = function () {
    let autoFormComponent = require('./components/AutoFormComponent.vue')
    window.BOUNDLED_BY_WEBPACK = false
    if (BOUNDLED_BY_WEBPACK) {
      autoFormComponent = autoFormComponent.default
    }
    let entitySchema = $App.domainInfo.get(this.entity)
    let tabTitle = entitySchema.caption
    let pageColumns = Object.values(entitySchema.attributes)
      .filter(at => at.defaultView)
      .map(at => at.name)
    let data = {}
    let dataP
    let isNew = false
    let fieldList = UB.ux.data.UBStore.normalizeFieldList(this.entity, pageColumns || [])
    if (entitySchema.mixins.mStorage && entitySchema.mixins.mStorage.simpleAudit) fieldList.push('mi_createDate')
    if (this.instanceID) {
      dataP = UB.Repository(this.entity).attrs(fieldList).selectById(this.instanceID).then(resp => { data = resp })
    } else {
      let params = {
        entity: this.entity,
        fieldList: fieldList
      }
      dataP = $App.connection.addNew(params).then(result => {
        result.resultData.fields.forEach((item, key) => {
          data[item] = result.resultData.data[0][key]
        })
        return true
      })
      isNew = true
    }
    dataP.then(() => {
      if (!data) { /* TODO выдать ошибку */ }
      let tabId = entitySchema.name + data.ID
      let existsTab = Ext.getCmp(tabId)
      if (existsTab) {
        $App.viewport.centralPanel.setActiveTab(existsTab)
        return
      }
      let tab = $App.viewport.centralPanel.add({
        id: tabId,
        title: tabTitle,
        tooltip: tabTitle,
        closable: true
      })
      let vm = new Vue({
        template: `<auto-form-component v-model="inputData" :fieldsToShow="fieldsToShow" :entitySchema="entitySchema" :isNew="isNew" @close="closeTab.call()"/>`,
        data: function () {
          return {
            fieldsToShow: pageColumns,
            entitySchema: entitySchema,
            inputData: data,
            isNew: isNew,
            closeTab: function () {
              tab.close()
            }
          }
        },
        components: {
          'auto-form-component': autoFormComponent
        }
      })
      vm.$mount(`#${tab.getId()}-outerCt`)
      tab.on('close', function () {
        vm.$destroy()
      })
      $App.viewport.centralPanel.setActiveTab(tab)
    })
  }
}
