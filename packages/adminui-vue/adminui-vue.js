/* global SystemJS */
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

if (window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  UB.core.UBCommand.showAutoForm = async function () {
    const autoFormComponent = require('./components/AutoFormComponent.vue')
    let entitySchema = $App.domainInfo.get(this.entity)
    let tabTitle = entitySchema.caption
    let pageColumns = Object.values(entitySchema.attributes).filter((at) => {
      return at.defaultView
    }).map((at) => {
      return at.name
    })
    let data = {}
    let isNew = false
    let fieldList = UB.ux.data.UBStore.normalizeFieldList(this.entity, pageColumns || [])
    if (this.instanceID) {
      data = await UB.Repository(this.entity).attrs(fieldList).selectById(this.instanceID)
    } else {
      let params = {
        entity: this.entity,
        fieldList: fieldList
      }
      var result = await $App.connection.addNew(params)
      result.resultData.fields.forEach((item, key) => {
        data[item] = result.resultData.data[0][key]
      })
      isNew = true
    }
    if (data) {
      let tabId = entitySchema.name + data.ID
      let existsTab = Ext.getCmp(tabId)
      if (existsTab) {
        $App.viewport.centralPanel.setActiveTab(existsTab)
      } else {
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
      }
    } else {
      // TODO выдать ошибку
    }
  }
}