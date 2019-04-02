/* global $App, Ext */
const UB = require('@unitybase/ub-pub')
const Vue = require('vue')
const { Notification } = require('element-ui')
const dialogs = require('../components/dialog/UDialog')
const UNavbar = require('../components/navbar/UNavbar.vue').default
const autoForm = require('../components/AutoForm.vue').default
const { dialog, dialogInfo, dialogYesNo, dialogError } = dialogs
const mountHelpers = require('./mountHelpers')

function replaceExtJSDialogs () {
  // rename buttonText - > buttons, fn -> callback and call `dialog`
  Ext.Msg.confirm = function ({ title, msg, fn: callback, buttonText: buttons }) {
    return dialog({
      title,
      msg,
      buttons,
      type: 'info'
    }).then(r => {
      if (callback) callback(r)
      return r
    })
  }

  $App.dialogYesNo = dialogYesNo
  $App.dialogInfo = dialogInfo
  $App.dialogError = dialogError

  Ext.override(UB.view.BasePanel, {
    showValidationErrors () {
      const errors = []
      let focusCalled = false
      const me = this
      this.getForm().getFields().each(item => {
        if (!item.isValid()) {
          if (!focusCalled) {
            // in case item not rendered yet give it a chance - Ext.callback with delay
            Ext.callback(item.focus, item, [], 100)
            focusCalled = true
          }
          errors.push(item)
        }
      })
      if (errors.length) {
        const fieldLinks = errors.map(f => {
          return `<a href="#" data-cmd-type="setFocus" data-elm-id="${f.id}">${f.fieldLabel}</a>`
        }).join(', ')

        Notification.error({
          title: UB.i18n('error'),
          message: UB.i18n('fieldValidationError', me.domainEntity.caption) + '<br>' + fieldLinks,
          dangerouslyUseHTMLString: true,
          duration: 15000
        })
      }
    }
  })
}

function replaceExtJSNavbar () {
  const id = UB.core.UBApp.viewport.centralPanel.tabBar.id
  const styles = document.createElement('style')
  styles.innerHTML = `#${id}{display:none !important}`
  document.body.appendChild(styles)

  new Vue({
    mounted () {
      const { offsetHeight } = this.$el
      window.UB.core.UBApp.viewport.centralPanel.setMargin(`-${offsetHeight} 0 0 0`)
      window.UB.core.UBApp.viewport.centralPanel.tabBar.setHeight(offsetHeight)
    },
    render: (h) => h(UNavbar, {
      props: {
        withHamburger: UB.connection.appConfig.uiSettings.adminUI.customSidebar
      }
    })
  }).$mount(`#${id}`)
}

function replaceAutoForms () {
  let params = this

  if (mountHelpers.activateIfMounted(params)) return

  let mountParams = {
    FormComponent: autoForm,
    showFormParams: params
  }
  mountHelpers.mount(mountParams)
}

function getTypeLocaleString (type) {
  const capitalizeStr = type.charAt(0).toUpperCase() + type.slice(1)
  return 'msgType' + capitalizeStr
}

function replaceExtJSMessageBarDialog () {
  $App.on('portal:notify:markAsReaded', async (mess) => {
    const resp = await UB.connection.query({
      entity: 'ubs_message_recipient',
      method: 'accept',
      execParams: {
        ID: mess['recipients.ID']
      }
    })

    if (resp.resultData) {
      $App.fireEvent('portal:notify:readed', mess.ID, new Date())
    }
  })

  /* Global UBS */
  UBS.MessageBar.override({
    async doOnMessageRetrieved (messages) {
      /**
       *  show all messages type except information
       *  mark as read after user accepts dialog
       */
      for (const mess of messages) {
        if (mess.messageType !== 'information') {
          const confirm = await $App.dialogInfo(mess.messageBody, getTypeLocaleString(mess.messageType))
          if (confirm) {
            $App.fireEvent('portal:notify:markAsReaded', mess)
          }
        }
      }
    }
  })
}

module.exports = {
  replaceExtJSDialogs,
  replaceExtJSNavbar,
  replaceAutoForms,
  replaceExtJSMessageBarDialog
}
