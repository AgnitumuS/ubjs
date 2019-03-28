const Vue = require('vue')
const { Dialog } = require('element-ui')

function mountModal (Form, title) {
  const instance = new Vue({
    Components: { Form },
    data () {
      return {
        dialogVisible: false
      }
    },
    render (h) {
      return h(Dialog, {
        ref: 'dialog',
        props: {
          title,
          visible: this.dialogVisible,
          width: '80%'
        },
        on: {
          closed: () => { this.$destroy() },
          'update:visible': (val) => {
            this.dialogVisible = val
          }
        }
      }, [
        h(Form)
      ])
    }
  }).$mount()
  document.body.append(instance.$el)
  instance.dialogVisible = true
}

function mountTab (Form, title) {
  const tab = $App.viewport.centralPanel.add({
    title,
    style: {
      padding: '1em' // we replace panel inner content below so set paddings here
    },
    closable: true
  })
  const instance = new Vue({
    render: (h) => h(Form)
  })
  instance.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  tab.on('close', () => {
    instance.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}

module.exports = (Form, { isModal, title }) => {
  if (!Form) throw new Error('FormForm is required')

  if (isModal) {
    mountModal(Form, title)
  } else {
    mountTab(Form, title)
  }
}
