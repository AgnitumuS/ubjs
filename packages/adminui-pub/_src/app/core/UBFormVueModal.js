const Vue = require('vue')

function mountModal ({ FormComponent, title }) {
  const instance = new Vue({
    components: { FormComponent },
    data () {
      return {
        dialogVisible: false,
        title
      }
    },
    template: `
      <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        width="90%"
        @closed="$destroy()"
      >
        <form-component />
      </el-dialog>
    `
  })
  instance.$mount()

  instance.dialogVisible = true
}

function mountTab ({ FormComponent, title }) {
  const tab = $App.viewport.centralPanel.add({
    title,
    style: {
      padding: '1em' // we replace panel inner content below so set paddings here
    },
    closable: true
  })
  const instance = new Vue(FormComponent)
  instance.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  tab.on('close', () => {
    instance.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}

module.exports = (config) => {
  if (!config.FormComponent) throw new Error('FormComponent is required')

  if (config.isModal) {
    mountModal(config)
  } else {
    mountTab(config)
  }
}
