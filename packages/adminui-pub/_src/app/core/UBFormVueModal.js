const Vue = require('vue')
const { Dialog } = require('element-ui')

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
    render (h) {
      return h(Dialog, {
        props: {
          title,
          visible: this.dialogVisible,
          width: '90%',
          beforeClose: this.beforeClose
        },
        on: {
          closed: () => this.$destroy(),
          'update:visible': (val) => {
            this.dialogVisible = val
          }
        }
      }, [
        h(FormComponent, {
          ref: 'child',
          props: {
            commandConfig
          }
        })
      ])
    }
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
