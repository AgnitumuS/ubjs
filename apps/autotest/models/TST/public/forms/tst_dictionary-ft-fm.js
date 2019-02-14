const Vue = require('vue')
const $App = require('@unitybase/adminui-pub')

exports.mount = function (params) {
  let tstDictionaryEdit = require('../components/DictionaryEditView.vue')
  let entitySchema = $App.domainInfo.get(params.entity)
  let tabId
  if (params.instanceID) {
    tabId = entitySchema.name + params.instanceID
    let existsTab = Ext.getCmp(tabId)
    if (existsTab) {
      $App.viewport.centralPanel.setActiveTab(existsTab)
      return
    }
  } else {
    tabId = entitySchema.name + Math.random()
  }
  let tab = $App.viewport.centralPanel.add({
    id: tabId,
    title: entitySchema.caption,
    tooltip: entitySchema.caption,
    closable: true
  })
  let vm = new Vue({
    template: `<dictionary-edit-form :entityName="entityName" :instanceID="instanceID" :currentTabId="currentTabId" :formCode="formCode"></dictionary-edit-form>`,
    data () {
      return {
        entityName: params.entity,
        instanceID: params.instanceID,
        currentTabId: tabId,
        formCode: params.formCode
      }
    },
    components: {
      'dictionary-edit-form': tstDictionaryEdit
    }
  })
  vm.$mount(`#${tab.getId()}-outerCt`)
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
