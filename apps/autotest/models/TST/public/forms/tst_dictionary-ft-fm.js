const Vue = require('vue')
const $App = require('@unitybase/adminui-pub')

exports.mount = function (params) {
  let tstDictionaryEdit = require('../components/DictionaryEditView.vue')
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
    template: `<dictionary-edit-form :entityName="entityName" :instanceID="instanceID" :currentTabId="currentTabId" :formCode="formCode"></dictionary-edit-form>`,
    data () {
      return {
        entityName: params.entity,
        instanceID: typeof params.instanceID === 'string' ? parseInt(params.instanceID) : params.instanceID,
        currentTabId: params.tabId,
        formCode: params.formCode
      }
    },
    components: {
      'dictionary-edit-form': tstDictionaryEdit
    }
  })
  vm.$mount(`#${params.tabId}-outerCt`)
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
