const Vue = require('vue')
const Dialog = require('element-ui').Dialog

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
 */
function mountModal (mountParams) {
  let title = mountParams.showFormParams.title
  const FormComponent = mountParams.FormComponent
  const instance = new Vue({
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
          width: '80%',
          beforeClose: onBeforeDialogClose
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
    style: {
      padding: '1em' // we replace panel inner content below so set padding's here
    },
    closable: true
  })
  const instance = new Vue({
    render: (h) => h(FormComponent, {
      props: showFormParamsToComponentProps(mountParams.showFormParams) // pass props programmatically
    })
  })
  instance.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  tab.on('close', () => {
    instance.$destroy()
  })

  tab.on('beforeClose', onBeforeTabClose.bind(instance))
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
 * Check dialog data is Dirty and ask for saving
 * @param {function} done Dialog clone function
 * @private
 */
async function onBeforeDialogClose (done) {
  let dataComponent = this
  while (dataComponent && (typeof dataComponent.isDirty === 'undefined') && dataComponent.$children) {
    if (dataComponent.$children.length) {
      dataComponent = dataComponent.$children[0]
    } else {
      dataComponent = undefined
    }
  }
  if (!dataComponent || (typeof dataComponent.isDirty === 'undefined')) done() // no data component

  let isDirty = typeof dataComponent.isDirty === 'function' ? dataComponent.isDirty() : dataComponent.isDirty
  if (isDirty) {
    const answer = await this.$dialog({
      title: this.$ut('unsavedData'),
      msg: this.$ut('confirmSave'),
      type: 'warning',
      buttons: {
        yes: this.$ut('save'),
        no: this.$ut('doNotSave'),
        cancel: this.$ut('cancel')
      }
    })
    if (answer === 'yes') {
      const validation = await dataComponent.save()
      if (validation !== 'error') {
        done()
      }
    } else if (answer === 'no') {
      done()
    }
  } else {
    done()
  }
}

/**
 * Check tab data is Dirty and ask for saving
 * @private
 */
function onBeforeTabClose () {
  let dataComponent = this
  while (dataComponent && (typeof dataComponent.isDirty === 'undefined') && dataComponent.$children) {
    if (dataComponent.$children.length) {
      dataComponent = dataComponent.$children[0]
    } else {
      dataComponent = undefined
    }
  }
  if (!dataComponent || (typeof dataComponent.isDirty === 'undefined')) return true // no data component
  let currentTab = $App.viewport.centralPanel.queryById(dataComponent.currentTabId)
  if (currentTab.forceClose) return true

  let isDirty = typeof dataComponent.isDirty === 'function' ? dataComponent.isDirty() : dataComponent.isDirty
  if (isDirty) {
    $App.viewport.centralPanel.setActiveTab(currentTab)
    this.$dialog({
      title: this.$ut('unsavedData'),
      msg: this.$ut('confirmSave'),
      type: 'warning',
      buttons: {
        yes: this.$ut('save'),
        no: this.$ut('doNotSave'),
        cancel: this.$ut('cancel')
      }
    }).then(answer => {
      if (answer === 'yes') {
        dataComponent.save().then(validation => {
          if (validation !== 'error') {
            currentTab.forceClose = true
            currentTab.close()
          }
        })
      } else if (answer === 'no') {
        currentTab.forceClose = true
        currentTab.close()
      }
    })
    return false
  } else {
    return true
  }
}
