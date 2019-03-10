const UB = require('@unitybase/ub-pub')
const Vue = require('vue')
const { Notification } = require('element-ui')
const dialogs = require('../components/dialog/UDialog')
const UNavbar = require('../components/navbar/UNavbar.vue').default
const { dialog, dialogInfo, dialogYesNo, dialogError } = dialogs

function replaceExtJSDialogs () {
  // rename buttonText - > buttons, fn -> callback and call `dialog`
  window.Ext.Msg.confirm = function ({ title, msg, fn: callback, buttonText: buttons }) {
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

  window.$App.dialogYesNo = dialogYesNo
  window.$App.dialogInfo = dialogInfo
  window.$App.dialogError = dialogError

  window.Ext.override(UB.view.BasePanel, {
    showValidationErrors () {
      const errors = []
      let focusCalled = false
      const me = this
      this.getForm().getFields().each(item => {
        if (!item.isValid()) {
          if (!focusCalled) {
            item.focus()
            focusCalled = true
          }
          errors.push(item)
        }
      })
      if (errors.length) {
        const fieldLinks = errors.map(f => {
          // TODO - rewrite using onclick handler - inline JS this don'n work in production mode
          return `<a href="#" onclick="document.getElementById('${f.inputEl.id}').focus()">${f.fieldLabel}</a>`
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
module.exports = {
  replaceExtJSDialogs,
  replaceExtJSNavbar
}
