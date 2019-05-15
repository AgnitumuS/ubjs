/* global $App, Ext */
const Vue = require('vue')
const UB = require('@unitybase/ub-pub')
const Dialog = require('element-ui').Dialog
const { dialog: $dialog } = require('../../components/dialog/UDialog')

/**
 * Mount helpers for Vue components
 * @module mountHelpers
 */
module.exports = {
  activateIfMounted,
  mount
}

/**
 * Checks if form for specified `entity` instance is already mounter and if so - activate it, else return `false`
 * @param commandConfig ShowForm config
 * @return {boolean} false if form not mounted yet
 */
function activateIfMounted (commandConfig) {
  if (!commandConfig.tabId) {
    commandConfig.tabId = commandConfig.entity
    commandConfig.tabId += commandConfig.instanceID ? commandConfig.instanceID : 'ext' + Ext.id(null, 'addNew')
  }
  let existedTab = Ext.getCmp(commandConfig.tabId)
  if (existedTab) {
    $App.viewport.centralPanel.setActiveTab(existedTab)
    return true
  }
  return false
}

/*
TODO - describe form interace (or even Vuex module interface)
form interface
isDirty
save -> promise
 */

/**
 * Mount specified Form either in a new tab or in a modal Dialog
 * @param {Object} commandConfig
 * @param {Object} commandConfig.FormComponent Form Component to render (Vue SFC)
 *   Component must contains:
 *    - either computed property or method `isDirty` - called by tab/window to check form is Dirty
 *    - async method `save`  - called by tab/window to save form data
 * @param {Object} commandConfig.showFormParams ShowForm params
 */
function mount (commandConfig) {
  if (!commandConfig.FormComponent) throw new Error('FormComponent is required')
  if (!commandConfig.showFormParams) {
    commandConfig.showFormParams = {}
  }
  if (commandConfig.showFormParams.isModal) {
    mountModal(commandConfig)
  } else {
    mountTab(commandConfig)
  }
}

/**
 * Mount form in modal Dialog
 * @param mountParams
 * @private
 * @param {String} mountParams.showFormPrams.title       form title
 * @param {String} mountParams.showFormPrams.modalClass  wrapper class for modal dialog
 * @param {String} mountParams.showFormPrams.modalWidth  width for modal dialog
 */
function mountModal (mountParams) {
  let title = mountParams.showFormParams.title
  const FormComponent = mountParams.FormComponent

  let modalClass = mountParams.showFormParams.modalClass || ''
  let modalWidth = mountParams.showFormParams.modalWidth
  modalClass += ' ub-dialog__min-width'

  if (!modalWidth) {
    modalClass = ' ub-dialog__max-width'
  }
  const instance = new Vue({
    store: mountParams.store,
    data () {
      return {
        dialogVisible: false,
        title
      }
    },
    computed: {
      isDirty () {
        if (this.$store) {
          return this.$store.getters.isDirty
        } else {
          return false
        }
      }
    },
    methods: {
      setTitle (value) {
        this.title = value
      }
    },
    provide () {
      return {
        _validation: () => mountParams.validator,
        $formServices: {
          setTitle: this.setTitle,
          close: () => {
            beforeClose({
              save: () => this.$store.dispatch('save', mountParams.validator),
              close: () => {
                this.dialogVisible = false
              },
              isDirty: this.$store.getters.isDirty
            })
          },
          forceClose: () => {
            this.dialogVisible = false
          }
        },
        showFormParams: mountParams.showFormParams
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
              save: () => this.$store.dispatch('save', mountParams.validator),
              close: done,
              isDirty: this.$store.getters.isDirty
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
        h(FormComponent, {
          props: showFormParamsToComponentProps(mountParams.showFormParams),
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
 * @param mountParams
 * @private
 */
function mountTab (mountParams) {
  let { title, tabId } = mountParams.showFormParams
  let FormComponent = mountParams.FormComponent
  // TODO - check adminui-pub in domain and if not - mount using portal-ui
  const tab = $App.viewport.centralPanel.add({
    title,
    id: tabId,
    closable: true
  })
  const store = mountParams.store

  const instance = new Vue({
    render: (h) => h(FormComponent, {
      props: showFormParamsToComponentProps(mountParams.showFormParams) // pass props programmatically
    }),
    provide: {
      _validation: () => mountParams.validator,
      $formServices: {
        setTitle: tab.setTitle.bind(tab),
        close: tab.close.bind(tab),
        forceClose () {
          tab.forceClose = true
          tab.close()
        }
      },
      showFormParams: mountParams.showFormParams
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
      save: () => store.dispatch('save', mountParams.validator),
      close: () => {
        tab.forceClose = true
        tab.close()
      },
      isDirty: store.getters.isDirty
    })
    return false
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}

function showFormParamsToComponentProps (showFormParams) {
  return {
    entityName: showFormParams.entity,
    instanceID: typeof showFormParams.instanceID === 'string' ? parseInt(showFormParams.instanceID) : showFormParams.instanceID,
    currentTabId: showFormParams.tabId,
    formCode: showFormParams.formCode,
    commandConfig: showFormParams.commandConfig,
    parentContext: showFormParams.parentContext,
    ...showFormParams.props
  }
}

/**
 * Check form isDirty then ask user what he want to do
 * @param  {Function} param.save
 * @param  {Function} param.close
 * @param  {Boolean}  param.isDirty
 */
async function beforeClose ({ save, close, isDirty }) {
  if (isDirty) {
    const answer = await $dialog({
      title: UB.i18n('unsavedData'),
      msg: UB.i18n('confirmSave'),
      type: 'warning',
      buttons: {
        yes: UB.i18n('save'),
        no: UB.i18n('doNotSave'),
        cancel: UB.i18n('cancel')
      }
    })

    if (answer === 'yes') {
      save().then(close)
    }
    if (answer === 'no') {
      close()
    }
  } else {
    close()
  }
}
