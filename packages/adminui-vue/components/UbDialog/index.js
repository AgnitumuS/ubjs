const Vue = require('vue')
const UDialog = require('./UDialog.vue').default

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
  const UDialogConstructor = Vue.extend(UDialog)
  return new Promise(resolve => {
    let props = Object.assign({ resolver: resolve }, options)
    const instance = new UDialogConstructor({ data: props })
    const vm = instance.$mount()
    vm.visible = true
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
      yes: 'da',
      cancel: 'net'
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

// TODO - inline script don`t work in production mode - REWRITE
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

/**
 * Show error dialog. msg is translated using UB.i18n
 * @param {string} msg
 * @param {string} [title='error'] title
 * @param {boolean} [isDevInfo=false]
 * @returns {Promise<boolean>} resolved to true then user click OK in other case - false
 */
function dialogError (msg, title = 'error', isDevInfo = false) {
  const USER_MESSAGE_RE = /^<<<([\S|\s]+)>>>$/
  msg = msg.replace(USER_MESSAGE_RE, '$1')
  msg = formatLinks(msg)
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

module.exports = {
  dialog,
  dialogError,
  dialogInfo,
  dialogYesNo
}
