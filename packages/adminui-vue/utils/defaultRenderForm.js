const Vue = require('vue')
const { Dialog } = require('element-ui')

function mountModal (Component, title) {
  const instance = new Vue({
    components: { Component },
    data () {
      return {
        dialogVisible: false
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
          width: '80%',
          beforeClose: this.beforeClose
        },
        on: {
          closed: () => { this.$destroy() },
          'update:visible': (val) => {
            this.dialogVisible = val
          }
        }
      }, [
        h(Component, {
          ref: 'child',
          on: {
            close: () => { this.dialogVisible = false }
          }
        })
      ])
    }
  }).$mount()
  document.body.append(instance.$el)
  instance.dialogVisible = true
}

function mountTab (Component, title) {
  const tab = $App.viewport.centralPanel.add({
    title,
    style: {
      padding: '1em' // we replace panel inner content below so set paddings here
    },
    closable: true
  })
  const instance = new Vue({
    render: (h) => h(Component)
  })
  instance.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  tab.on('close', () => {
    instance.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}

module.exports = (Component, { isModal, title }) => {
  if (!Component) throw new Error('FormComponent is required')

  if (isModal) {
    mountModal(Component, title)
  } else {
    mountTab(Component, title)
  }
}
