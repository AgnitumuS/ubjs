const Vue = require('vue')
const UB = require('@unitybase/ub-pub')
const UDialog = require('./UDialog.vue').default
const { Notification } = require('element-ui')
const UDialogConstructor = Vue.extend(UDialog)

const USER_MESSAGE_RE = /^<<<([\S|\s]+)>>>$/

/**
 * Show modal dialog with 3 optional button
 * @param {Object} options
 * @param {string} options.title Dialog title (will be translated using UB.i18n)
 * @param {string} options.msg Dialog message. Text of HTML string. Will be translated using UB.i18n. Support "magic" hyperlink
 * @param {Object} options.buttons
 * @param {string} [options.buttons.yes] "yes" action text (will be translated). If not passed or empty "yes" button not displayed
 * @param {string} [options.buttons.no] "no" action text (will be translated). If not passed or empty "no" button not displayed
 * @param {string} [options.buttons.cancel] "cancel" action text (will be translated). If not passed or empty "cancel" button not displayed
 * @param {string} options.type dialog type (affects the icon). One of TODO `error`, `info`, `question` ...
 * @param [options.isDevInfo = false] If true adds "Copy to clipboard" button
 * @returns {Promise<string>} Promise resolved to one of 'yes', 'no' 'cancel' depending on button clicked.
 *   If dialog is closed using Esc key or by pressing window "close" button result is `cancel`
 */
function dialog (options) {
  return new Promise(resolve => {
    const instance = new UDialogConstructor({ data: options, resolver: resolve })
    instance.$mount().visible = true
  })
}

/**
 * Confirmation dialog. Title & message are translated using UB.i18n
 * @example

 $App.dialogYesNo('makeChangesSuccessfullTitle', 'makeChangesSuccessfullBody')
   .then(choice => {
     if (choice){
       // do somethong on Yes answer
     } else {
       // do something on No answer
     }
  })
 *
 * @param {String} title
 * @param {String} msg
 * @returns {Promise<boolean>} user choice true or false
 */
function dialogYesNo (title, msg) {
  return dialog({
    title,
    msg,
    type: 'question',
    buttons: {
      yes: 'Yes',
      cancel: 'No'
    }
  }).then(r => r === 'yes')
}

/**
 * Show information dialog. msg is translated using UB.i18n
 * @param {string} msg
 * @param {String} [title='info'] title
 * @returns {Promise<boolean>} resolved to true then user click OK in other case - false
 */
function dialogInfo (msg, title = 'info') {
  return dialog({
    title,
    msg,
    buttons: {
      yes: 'ok'
    }
  }).then(r => r === 'yes')
}

/**
 * Show error dialog. msg is translated using UB.i18n
 * @param {string} msg
 * @param {string} [title='error'] title
 * @param {boolean} [isDevInfo=false]
 * @returns {Promise<boolean>} resolved to true then user click OK in other case - false
 */
function dialogError (msg, title = 'error', isDevInfo = false) {
  msg = msg.replace(USER_MESSAGE_RE, '$1')
  return dialog({
    title,
    msg,
    type: 'error',
    isDevInfo,
    buttons: {
      yes: 'ok'
    }
  })
}

/**
 * Vue based error reported. To be used by ub-pub.setErrorReporter
 * @param {String} errMsg
 * @param errCode
 * @param entityCode
 * @param {string} detail
 */
function errorReporter ({ errMsg, errCode, entityCode, detail }) {
  // all styles placed in ./template.vue
  const devBtnID = 'ub-notification__error__dev-btn'
  const showMessBtnID = 'ub-notification__error__show-mess-btn'
  const devBtn = `<i title="${UB.i18n('showDeveloperDetail')}" class="fa fa-wrench" data-id="${devBtnID}"></i>`
  const showMessBtn = `<i title="${UB.i18n('showFullScreen')}" class="fa fa-window-restore" data-id="${showMessBtnID}"></i>`
  const footer = `<div class="ub-notification__error__btn-group">${showMessBtn + devBtn}</div>`
  const msgToDisplay = USER_MESSAGE_RE.test(errMsg)
    ? UB.i18n(errMsg.replace(USER_MESSAGE_RE, '$1'))
    : errMsg
  const message = `<div class="ub-notification__error__content">${msgToDisplay}</div>${footer}`
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
  const devBtnListener = () => {
    return dialogError(detail, 'error', true)
  }
  const showMessBtnListener = () => {
    dialogError(errMsg, 'error')
    instance.close()
  }
  devBtnEl.addEventListener('click', devBtnListener)
  showMessBtnEl.addEventListener('click', showMessBtnListener)
}

/**
 * Shows deletion confirmation message.
 *
 * @param {string} entity Entity code
 * @param {object} [instanceData] Instance data needed to determine description attribute value
 * @returns {Promise<boolean>}
 */
function dialogDeleteRecord (entity, instanceData = {}) {
  const descriptionAttr = UB.connection.domain.get(entity).getDescriptionAttribute()
  const hasDescriptionAttr = descriptionAttr && descriptionAttr in instanceData
  const defaultMess = hasDescriptionAttr
    ? UB.i18n('deleteConfirmationWithCaption', UB.i18n(entity), instanceData[descriptionAttr])
    : UB.i18n('deleteConfirmation', UB.i18n(entity))
  const customMessCode = `${entity}:deleteInquiry`
  const customMess = UB.i18n(customMessCode, UB.i18n(entity), instanceData[descriptionAttr])
  const hasCustomMess = customMessCode !== customMess

  if (hasCustomMess) {
    return dialogYesNo('deletionDialogConfirmCaption', customMess)
  } else {
    return dialogYesNo('deletionDialogConfirmCaption', defaultMess)
  }
}

/**
 *  Inject $dialog into Vie prototype. To be used as Vue.use(dialog)
 *  @param {Vue} Vue
 * */
function install (Vue) {
  Vue.prototype.$dialog = dialog
  Vue.prototype.$dialogError = dialogError
  Vue.prototype.$dialogInfo = dialogInfo
  Vue.prototype.$dialogYesNo = dialogYesNo
  Vue.prototype.$dialogDeleteRecord = dialogDeleteRecord
  Vue.prototype.$errorReporter = errorReporter
}

module.exports = {
  dialog,
  dialogError,
  dialogInfo,
  dialogYesNo,
  dialogDeleteRecord,
  errorReporter,
  install
}
