/**
 * Mount helpers for Vue components
 * @module mount
 */
module.exports = {
  mountTab,
  mountModal
}

/* global $App */
const Vue = require('vue')
const UB = require('@unitybase/ub-pub')
const Dialog = require('element-ui').Dialog
const { dialog: $dialog } = require('../../components/dialog/UDialog')

// TODO: describe typdef for VueComponent and VuexStore
/**
 * Mount form in modal Dialog
 * @param {object} cfg
 * @param {VueComponent} cfg.component Form component
 * @param {object} cfg.props Form component props
 * @param {Vuex} cfg.store Store
 * @param {object} cfg.validator Vuelidate validation object
 * @param {string} cfg.title Title
 * @param {string} cfg.modalClass Modal class
 * @param {string} cfg.modalWidth Modal width
 * @param {object} cfg.provide Regular object which provide all props what which passed in it
 */
function mountModal ({
  component,
  props,
  store,
  validator,
  title: titleText,
  modalClass = '',
  modalWidth,
  provide
}) {
  modalClass += ' ub-dialog__min-width'

  if (!modalWidth) {
    modalClass += ' ub-dialog__max-width'
  }
  const instance = new Vue({
    store,
    data () {
      return {
        dialogVisible: false,
        titleText
      }
    },
    computed: {
      isDirty () {
        if (this.$store) {
          return this.$store.getters.isDirty
        } else {
          return false
        }
      },

      isNew () {
        if (this.$store) {
          return this.$store.state.isNew
        } else {
          return false
        }
      },

      title () {
        const prefix = this.isDirty ? '* ' : ''
        const suffix = this.isNew ? ` (${UB.i18n('dobavlenie')})` : ''
        return prefix + this.titleText + suffix
      }
    },
    methods: {
      setTitle (value) {
        this.titleText = value
      }
    },
    provide () {
      return {
        $v: validator,
        $formServices: {
          setTitle: this.setTitle,
          close: () => {
            beforeClose({
              close: () => {
                this.dialogVisible = false
              },
              store
            })
          },
          forceClose: () => {
            this.dialogVisible = false
          }
        },
        ...provide
      }
    },
    render (h) {
      return h(Dialog, {
        ref: 'dialog',
        class: modalClass,
        props: {
          title: this.title,
          visible: this.dialogVisible,
          width: modalWidth,
          closeOnClickModal: false,
          beforeClose: (done) => {
            beforeClose({
              close: done,
              store
            })
          }
        },
        on: {
          closed: () => { this.$destroy() },
          'update:visible': (val) => {
            this.dialogVisible = val
          }
        }
      }, [
        h(component, {
          props,
          on: {
            close: () => {
              this.dialogVisible = false
            }
          }
        })
      ])
    }
  })
  instance.$mount()
  document.body.append(instance.$el)
  instance.dialogVisible = true
}

/**
 * Mount form in tab
 * @param {object} cfg
 * @param {VueComponent} cfg.component Form component
 * @param {object} cfg.props Form component props
 * @param {VuexStore} cfg.store Store
 * @param {object} cfg.validator Vuelidate validation object
 * @param {string} cfg.title Title
 * @param {string} cfg.tabId navbar tab ID
 * @param {object} cfg.provide Regular object which provide all props what which passed in it
 */
function mountTab ({
  component,
  props,
  store,
  validator,
  title: titleText,
  tabId,
  provide
}) {
  const tab = $App.viewport.centralPanel.add({
    title: titleText,
    id: tabId,
    closable: true
  })

  const instance = new Vue({
    data () {
      return {
        titleText
      }
    },
    computed: {
      isDirty () {
        if (this.$store) {
          return this.$store.getters.isDirty
        } else {
          return false
        }
      },

      isNew () {
        if (this.$store) {
          return this.$store.state.isNew
        } else {
          return false
        }
      },

      title () {
        const prefix = this.isDirty ? '* ' : ''
        const suffix = this.isNew ? ` (${UB.i18n('dobavlenie')})` : ''
        return prefix + this.titleText + suffix
      }
    },
    watch: {
      title: {
        immediate: true,
        handler (title) {
          tab.setTitle(title)
        }
      }
    },
    methods: {
      setTitle (title) {
        this.titleText = title
      }
    },
    render: (h) => h(component, { props }),
    provide () {
      return {
        $v: validator,
        $formServices: {
          setTitle: this.setTitle,
          close: tab.close.bind(tab),
          forceClose () {
            tab.forceClose = true
            tab.close()
          }
        },
        ...provide
      }
    },
    store
  })

  instance.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  tab.on('close', () => {
    instance.$destroy()
  })

  tab.on('beforeClose', (currentTab) => {
    if (currentTab.forceClose) return true

    beforeClose({
      store,
      close: () => {
        tab.forceClose = true
        tab.close()
      }
    })

    return false
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}

/**
 * Check form isDirty then ask user what he want to do
 * @param {VuexStore} store Store
 * @param {Function} close Callback for close
 */
function beforeClose ({ store, close }) {
  if (store) {
    if (store.getters.isDirty) {
      $dialog({
        title: UB.i18n('unsavedData'),
        msg: UB.i18n('confirmSave'),
        type: 'warning',
        buttons: {
          yes: UB.i18n('save'),
          no: UB.i18n('doNotSave'),
          cancel: UB.i18n('cancel')
        }
      }).then(answer => {
        if (answer === 'yes') {
          if ('save' in store._actions) {
            store.dispatch('save').then(close)
          } else {
            close()
          }
        }
        if (answer === 'no') {
          close()
        }
      })
    } else {
      close()
    }
  } else {
    close()
  }
}
