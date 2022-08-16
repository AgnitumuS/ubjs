/**
 * Modal dialogs (message boxes) for showing errors, information and confirmation
 * @module uDialogs
 * @memberOf module:@unitybase/adminui-vue
 */

const Vue = require('vue')
const UB = require('@unitybase/ub-pub')
const UDialog = require('../components/UDialog.vue').default
const { Notification } = require('element-ui')
const UDialogConstructor = Vue.extend(UDialog)

const USER_MESSAGE_RE = /^<<<([\S|\s]+)>>>$/

/**
 * Show modal dialog with 3 optional button and text/html content.
 * @example
   const resp = await $App.uDialogs.dialog({
     title: 'scan',
     msg: 'noPaperInScanner',
     type: 'warning',
     buttons: {yes: 'tryAgain', cancel: 'stopScan'}
   })
   // here `resp` is either 'yes' or 'cancel'

 * @param {Object} options
 * @param {string} options.title Dialog title (will be translated using UB.i18n)
 * @param {string} options.msg Dialog message. Text of HTML string. Will be translated using UB.i18n. Support "magic" hyperlink - see {@link module:magicLinks magicLinks}
 * @param {Object} options.buttons
 * @param {string} [options.buttons.yes] "yes" action text (will be translated). If not passed or empty "yes" button not displayed
 * @param {string} [options.buttons.no] "no" action text (will be translated). If not passed or empty "no" button not displayed
 * @param {string} [options.buttons.cancel] "cancel" action text (will be translated). If not passed or empty "cancel" button not displayed
 * @param {string} options.type Type of icon. Can be any available el-icon-[type]. For example `error` will show `el-icon-error`. Recommended types are: `error`, `info`, `question`
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
 * Confirmation dialog. Title & message are translated using {@link module:@unitybase/ub-pub~i18n UB.i18n}
 * @example

 $App.dialogYesNo('makeChangesSuccessfulTitle', 'makeChangesSuccessfulBody')
   .then(choice => {
     if (choice){
       // do something on Yes answer
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
 * Show information dialog. Title & message are translated using {@link module:@unitybase/ub-pub~i18n UB.i18n}
 * Injected into Vue prototype as `$dialogInfo`.
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
 * Show error dialog. Title & message are translated using {@link module:@unitybase/ub-pub~i18n UB.i18n}
 * @param {string} msg
 * @param {string} [title='error'] title
 * @param {boolean} [isDevInfo=false] If true adds "Copy to clipboard" button
 * @returns {Promise<boolean>} resolved to true when user press OK button, in other case (Esc) - false
 */
function dialogError (msg, title = 'error', isDevInfo = false, detail) {
  msg = msg.replace(USER_MESSAGE_RE, '$1')
  return dialog({
    title,
    msg,
    errDetail: detail,
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
  var msgToDisplay = USER_MESSAGE_RE.test(errMsg)
    ? UB.i18n(errMsg.replace(USER_MESSAGE_RE, '$1'))
    : errMsg

  function buildSupportMailURL () {
    const baseUrl = UB.connection && UB.connection.appConfig.uiSettings.adminUI.supportMailTo
    if (!baseUrl) return ''
    const isQuery = typeof baseUrl === 'string' ? baseUrl.includes('?') : false
    // build mail body
    const userLogin = UB.connection.userLogin()
    const activeTabElems = document.querySelectorAll('.x-panel.x-tabpanel-child.x-panel-default.x-closable.x-panel-closable.x-panel-default-closable')
    let activeTabID
    activeTabElems.forEach((elem) => {
      if (window.getComputedStyle(elem).display === 'block') activeTabID = elem.id
    })
    const obj = {
      login: userLogin,
      uitag: activeTabID,
      details: detail,
      message: msgToDisplay
    }
    const bodyQuery = `body=${encodeURIComponent(JSON.stringify(obj, null, ' '))}`
    let result = isQuery ? baseUrl + `&${bodyQuery}` : baseUrl + `?${bodyQuery}`
    result = 'mailto:' + result.trim()
    const maxSizeResult = 2035 // problem with max size of message in Win plathorm
    if (window?.navigator.platform.includes('Win') && result.length > maxSizeResult) {
      result = result.substring(0, maxSizeResult) + '...'
    }
    return result
  }
  // all styles placed in ./template.vue
  const devBtnID = 'ub-notification__error__dev-btn'
  const showMessBtnID = 'ub-notification__error__show-mess-btn'
  const devBtn = `<i title="${UB.i18n('showDeveloperDetail')}" class="u-icon-wrench" data-id="${devBtnID}"></i>`
  const showMessBtn = `<i title="${UB.i18n('showFullScreen')}" class="u-icon-window-top" data-id="${showMessBtnID}"></i>`
  const mailToHref = buildSupportMailURL()
  const milToBtn = mailToHref ? `<a title="${UB.i18n('supportMailToTitle')}" href="${mailToHref}"  class="fas fa-mail-bulk"></a>` : ''
  const footer = `<div class="ub-notification__error__btn-group">${showMessBtn + devBtn + milToBtn}</div>`
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
    return dialogError(detail, 'error', true, { errMsg, errCode, entityCode })
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
  const descriptionAttr = UB.connection.domain.get(entity).descriptionAttribute
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
 *  Inject $dialog into Vue prototype. Called in `adminui-vue` model initialisation.
 *  Injects:
 *   - $dialog
 *   - $dialogError
 *   - $dialogInfo
 *   - $dialogYesNo
 *   - $dialogDeleteRecord
 *   - $errorReporter
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
