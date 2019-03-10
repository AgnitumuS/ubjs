const { dialog, dialogInfo, dialogYesNo, dialogError} = require('./index')
const { Notification } = require('element-ui')
const UB = require('@unitybase/ub-pub')

const replaceDefaultDialogs = () => {
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

  window.onerror = (...args) => {
    // all styles placed in ./template.vue
    const err = args[4]
    if (err) {
      const devBtnID = 'ub-notification__error__dev-btn'
      const showMessBtnID = 'ub-notification__error__show-mess-btn'
      const devBtn = `
      <i 
        title="${UB.i18n('showDeveloperDetail')}"
        class="fa fa-wrench" 
        data-id="${devBtnID}"
      ></i>
      `
      const showMessBtn = `
      <i 
        title="${UB.i18n('showFullScreen')}"
        class="fa fa-window-restore" 
        data-id="${showMessBtnID}"
      ></i>
      `
      const footer = `
      <div class="ub-notification__error__btn-group">
        ${showMessBtn + devBtn}
      </div>
      `

      const message = `
      <div class="ub-notification__error__content">
        ${UB.i18n(err.message)}
      </div>
      ${footer}
      `
      const instance = Notification.error({
        title: UB.i18n('error'),
        message,
        dangerouslyUseHTMLString: true,
        customClass: 'ub-notification__error',
        duration: 30000,
        onClose () {
          devBtnEl.removeEventListener('click', devBtnListener)
          showMessBtnEl.removeEventListener('click', showMessBtnListener)
        }
      })

      const devBtnEl = instance.$el.querySelector(`[data-id=${devBtnID}]`)
      const showMessBtnEl = instance.$el.querySelector(`[data-id=${showMessBtnID}]`)
      const devBtnListener = (e) => {
        const devInfo = `${err.detail}<br>${err.stack}`.replace(/\\n(?!\d)/g, '\n\t\t')
        window.$App.dialogError(devInfo, err.name, true)
      }
      const showMessBtnListener = (e) => {
        window.$App.dialogError(err.message, err.name)
        instance.close()
      }
      devBtnEl.addEventListener('click', devBtnListener)
      showMessBtnEl.addEventListener('click', showMessBtnListener)
    }
  }

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
      if (errors.length > 0) {
        const fieldLinks = errors.map(f => {
          return `<a href="#" onclick="document.getElementById('${f.inputEl.id}').focus()">${f.fieldLabel}</a>`
        }).join(', ')

        Notification.error({
          title: UB.i18n('error'),
          message: UB.i18n('oshibkaVvoda', me.domainEntity.caption) + '<br>' + fieldLinks,
          dangerouslyUseHTMLString: true,
          duration: 15000
        })
      }
    }
  })
}

module.exports = {
  replaceDefaultDialogs,
  notifyComponent: {
    install (Vue) {
      Vue.prototype.$notify = dialog
    }
  }
}
