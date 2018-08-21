const Vue = require('vue')
const TstForm = require('../components/TstForm.vue')
const tpl = `
<el-scrollbar style="height: 100%;">
  <tst-form form-size=""></tst-form>
  <hr/>
  <tst-form form-size="mini"></tst-form>
  <hr/>
  <tst-form form-size="small"></tst-form>
  <hr/>
  <tst-form form-size="medium"></tst-form>
</el-scrollbar>
`
const $App = require('@unitybase/adminui-pub')
exports.mount = function () {
  let tab = $App.viewport.centralPanel.add({
    title: 'VueJS form',
    style: {
      padding: '1em' // since we replace panel inner content below, set paddings here
    },
    closable: true
  })
  let vm = new Vue({
    components: {'tst-form': TstForm},
    template: tpl
  })
  vm.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  // !! important
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
