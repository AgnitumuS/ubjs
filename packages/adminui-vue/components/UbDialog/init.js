const UbDialog = require('./index')
const { Notification } = require('element-ui')
const UB = require('@unitybase/ub-pub')

const replaceDefaultDialogs = () => {
  window.Ext.Msg.confirm = async ({ title, msg, fn: callback, buttonText }) => {
    const answer = await UbDialog({
      title,
      msg,
      buttonText
    })

    let value = ''
    if (answer === 'accept') {
      value = 'yes'
    }
    if (answer === 'decline') {
      value = 'no'
    }

    callback(value)
  }

  window.$App.dialogYesNo = async (title, msg) => {
    const answer = await UbDialog({
      title,
      msg,
      type: 'question',
      buttonText: {
        yes: 'da',
        cancel: 'net'
      }
    })
    return Promise.resolve(answer === 'accept')
  }

  window.$App.dialogInfo = async (msg, title = 'info') => {
    const answer = await UbDialog({
      title,
      msg,
      buttonText: {
        yes: 'ok'
      }
    })
    return Promise.resolve(answer === 'accept')
  }

  window.$App.dialogError = async (msg, title = 'error', isDevInfo) => {
    const regExp = /^<<<([\S|\s]+)>>>$/
    msg = msg.replace(regExp, '$1')
    msg = formatLinks(msg)
    await UbDialog({
      title,
      msg,
      type: 'error',
      isDevInfo,
      buttonText: {
        yes: 'ok'
      }
    })
    return Promise.resolve(true)
  }

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

function formatLinks (htmlStr) {
  const temporaryEl = document.createElement('div')
  temporaryEl.innerHTML = htmlStr
  const links = temporaryEl.querySelectorAll('a[data-entity][data-id]')
  for (const link of links) {
    const entity = link.getAttribute('data-entity')
    const instanceID = link.getAttribute('data-id')
    const action = `$App.doCommand({
      cmdType: 'showForm',
      entity: '${entity}',
      instanceID: ${instanceID}
    })`
    link.setAttribute('onclick', action)
  }

  return temporaryEl.innerHTML
}

module.exports = {
  replaceDefaultDialogs,
  notifyComponent: {
    install (Vue) {
      Vue.prototype.$notify = UbDialog
    }
  }
}
