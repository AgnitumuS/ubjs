const Vue = require('vue')

function mountModal ({ FormComponent, title, commandConfig }) {
  const instance = new Vue({
    components: { FormComponent },
    data () {
      return {
        dialogVisible: false,
        title,
        commandConfig
      }
    },
    methods: {
      beforeClose (done) {
        const child = this.$refs.child.beforeClose
        if (child) {
          this.$refs.child.beforeClose(done)
        } else {
          done()
        }
      }
    },
    // render: (h) => {
    //   return h('ElDialog', {
    //     props: {
    //       title,
    //       'visible.sync': this.dialogVisible,
    //       width: '90%',
    //       beforeClose: this.beforeClose
    //     },
    //     on: {
    //       close: this.$destroy
    //     }
    //   })
    // }
    template: `
      <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        width="90%"
        @closed="$destroy()"
        :before-close="beforeClose"
      >
        <form-component ref="child" :command-config="commandConfig"/>
      </el-dialog>
    `
  }).$mount()
  document.body.append(instance.$el)
  instance.dialogVisible = true
}

function mountTab ({ FormComponent, title, commandConfig }) {
  const tab = $App.viewport.centralPanel.add({
    title,
    style: {
      padding: '1em' // we replace panel inner content below so set paddings here
    },
    closable: true
  })
  const instance = new Vue({
    render: (h) => h(FormComponent, {
      props: {
        commandConfig
      }
    })
  })
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
