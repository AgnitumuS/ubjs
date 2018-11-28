const Vue = require('vue')
const ConfiguratorComponent = require('../configurator/ConfiguratorComponent.vue')
const tpl = `<el-scrollbar style="height: 100%;"><configurator-component :fileName="fileName" /></el-scrollbar>`

const $App = require('@unitybase/adminui-pub')
exports.mount = function (params) {
  if (params && params.cmdData && params.cmdData.entityCode) {
    let tab = $App.viewport.centralPanel.add({
      title: 'MetaEditor',
      style: {
        'padding-top': '3px'
      },
      closable: true
    })
    let vm = new Vue({
      components: {'configurator-component': ConfiguratorComponent},
      template: tpl,
      data: function () {
        return {
          fileName: params.cmdData.entityCode
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
}
