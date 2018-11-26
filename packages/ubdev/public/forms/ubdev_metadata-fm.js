const Vue = require('vue')
const ConfiguratorComponent = require('../configurator/ConfiguratorComponent.vue')
const tpl = `<configurator-component :jsonObject="jsonObject" :fileName="fileName" :schema="schema" />`

const $App = require('@unitybase/adminui-pub')
exports.mount = function () {
  let tab = $App.viewport.centralPanel.add({
    title: 'MetaEditor',
    style: {
      padding: '1em' // since we replace panel inner content below, set paddings here
    },
    closable: true
  })
  let vm = new Vue({
    components: {'configurator-component': ConfiguratorComponent},
    template: tpl,
    data: function () {
      return {
        jsonObject: {},
        fileName: 'myobject.meta',
        schema: {}
      }
    }
  })
  vm.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  // !! important
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
