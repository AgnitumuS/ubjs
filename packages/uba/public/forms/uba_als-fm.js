const Vue = require('vue')
const AlsComponent = require('../components/AlsComponent.vue')

const $App = require('@unitybase/adminui-pub')
exports.mount = function () {
  let tab = $App.viewport.centralPanel.add({
    title: 'Als',
    style: {
      'padding': '10px 20px'
    },
    closable: true
  })
  let vm = new Vue({
    components: {'als-component': AlsComponent},
    template: '<als-component value=""></als-component>',
    data: function () { return {} }
  })
  vm.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  // !! important
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
