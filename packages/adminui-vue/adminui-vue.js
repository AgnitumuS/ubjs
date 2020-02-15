/* global SystemJS, Ext, $App */
const UB = require('@unitybase/ub-pub')
// vue internally use process.env.NODE_ENV !== 'production'
window.process = {
  env: {}
}
const IS_SYSTEM_JS = (typeof SystemJS !== 'undefined')
const isExt = (typeof window.Ext !== 'undefined')

/*
* The BOUNDLED_BY_WEBPACK variable is available only when a project is being built by a webpack.
* But not available in dev mode.
* Please note that BOUNDLED_BY_WEBPACK and window.BOUNDLED_BY_WEBPACK is not the same
* But if BOUNDLED_BY_WEBPACK is undefined app will use window.BOUNDLED_BY_WEBPACK
*/
window.BOUNDLED_BY_WEBPACK = false

const throttleDebounce = require('throttle-debounce')
if (IS_SYSTEM_JS && !SystemJS.has('throttle-debounce')) SystemJS.set('throttle-debounce', SystemJS.newModule(throttleDebounce))
/**
 * throttle-debounce see <a href=https://github.com/niksy/throttle-debounce>original doc</a>
 * @type {{throttle?, debounce?}}
 */
module.exports.throttleDebounce = throttleDebounce
const Form = require('./utils/Form/Form')
/**
 * Create a new instance of UForm
 * @param {object} cfg Config
 * @param {VueComponent} cfg.component Form component
 * @param {object} [cfg.props] Form component props
 * @param {string} [cfg.title] Form title
 * @param {string} cfg.entity Entity name of master record
 * @param {number} [cfg.instanceID] Instance ID
 * @param {boolean} [cfg.isModal] Switch mount to modal or tab
 * @param {string} [cfg.modalClass] Modal class
 * @param {string} [cfg.modalWidth] Modal width
 * @param {string} [cfg.formCode] Required to provide form code for form constructor button in toolbar
 * @returns {UForm}
 */
module.exports.Form = Form
const { mapInstanceFields, computedVuex, SET } = require('./utils/Form/helpers')
module.exports.mapInstanceFields = mapInstanceFields
module.exports.computedVuex = computedVuex
module.exports.SET = SET
module.exports.mountUtils = require('./utils/Form/mount')
module.exports.lookups = require('./utils/lookups')

const dialogs = require('./components/dialog/UDialog')
const { dialog, dialogError, dialogInfo, dialogYesNo, errorReporter } = dialogs // destructive assignment for WebStorm parameter parsing
module.exports.dialog = dialog
module.exports.dialogError = dialogError
module.exports.dialogInfo = dialogInfo
module.exports.dialogYesNo = dialogYesNo
module.exports.errorReporter = errorReporter

if ((typeof SystemJS !== 'undefined') && !SystemJS.has('@unitybase/adminui-vue')) SystemJS.set('@unitybase/adminui-vue', SystemJS.newModule(module.exports))

const Vue = require('vue').default
window.Vue = Vue
// next 2 lines for modules what use ES6 import `import Vue from 'vue' (not recommended for use)
Vue.__useDefault = Vue
Vue.default = Vue
if (IS_SYSTEM_JS && !SystemJS.has('vue')) SystemJS.set('vue', SystemJS.newModule(Vue))

const Vuex = require('vuex')
window.Vuex = Vuex
// next 2 lines for modules what use ES6 import `import Vuex from 'vuex' (not recommended for use)
Vuex.__useDefault = Vuex
Vuex.default = Vuex
if (IS_SYSTEM_JS && !SystemJS.has('vuex')) SystemJS.set('vuex', SystemJS.newModule(Vuex))
Vue.use(Vuex)

const ElementUI = require('element-ui') // adminui-pub maps element-ui -> element-ui/lib/index.js for SystemJS
window.ElementUI = ElementUI
if (IS_SYSTEM_JS && !SystemJS.has('element-ui')) SystemJS.set('element-ui', SystemJS.newModule(ElementUI))

Vue.use(ElementUI, {
  size: 'small', // set element-ui default size
  i18n: UB.i18n.bind(UB), // redirect ElementUI localization to UB.i18n
  zIndex: 300000 // lat's Vue popovers always be above Ext
})

const momentPlugin = require('./utils/moment-plugin')
Vue.use(momentPlugin)

require('normalize.css/normalize.css')
require('./theme/ub-body.css')
if (BOUNDLED_BY_WEBPACK) {
  // webpack MiniCssExtractPlugin extract all styles (for vue SFC), so we need to inject dist/adminui-vue.css
  UB.inject('/clientRequire/@unitybase/adminui-vue/dist/adminui-vue.min.css')
}
Vue.use(UB)

const UbComponents = require('./utils/install-ub-components')
Vue.use(UbComponents)

const Vuelidate = require('vuelidate').default
if (IS_SYSTEM_JS && !SystemJS.has('vuelidate')) SystemJS.set('vuelidate', SystemJS.newModule(Vuelidate))
Vue.use(Vuelidate)

// add $dialog* to Vue prototype
Vue.use(dialogs)
UB.setErrorReporter(dialogs.errorReporter)

if (isExt) {
  const {
    replaceExtJSDialogs,
    replaceExtJSNavbar,
    replaceExtJSMessageBarDialog,
    replaceShowList
  } = require('./utils/replaceExtJSWidgets')
  $App.on('applicationReady', replaceExtJSDialogs)
  $App.on('applicationReady', replaceExtJSNavbar)
  $App.on('applicationReady', replaceExtJSMessageBarDialog)
  $App.on('applicationReady', replaceShowList)
  $App.on('applicationReady', function () {
    let v = UB.connection.appConfig.serverVersion.split('.')
    if ((v[0] >= 'v5') && (v[1] < 14)) throw new Error('This version of adminui-vue require UB server to be >= 5.14')
  })
}

const Sidebar = require('./components/sidebar/USidebar.vue').default
function addVueSidebar () {
  const SidebarConstructor = Vue.extend(Sidebar)
  // eslint-disable-next-line no-new
  new SidebarConstructor({
    el: `#sidebar-placeholder`
  })
}

const Relogin = require('./components/relogin/URelogin.vue').default
function replaceDefaultRelogin () {
  const ReloginConstructor = Vue.extend(Relogin)
  const instance = new ReloginConstructor()
  const vm = instance.$mount()
  document.body.appendChild(vm.$el)
}

const magicLink = require('./utils/magicLinks')
magicLink.install()
magicLink.addCommand('setFocus', magicLinkFocusCommand)

function magicLinkAdminUiCommand (params) {
  $App.doCommand(params)
}

/**
 * Magic link to focus DOM/Ext element with specified id
 * @example

 <a href="#' data-cmd-type='setFocus" data-elm-id="my-html-element-id">focus other</a>

 * @param {Object} params
 * @param {string} params.elmId
 * @param {EventTarget} target
 */
function magicLinkFocusCommand (params, target) {
  let extCmp = isExt && Ext.getCmp(params.elmId)
  if (extCmp) { // try Ext
    Ext.callback(extCmp.focus, extCmp, [], 100)
  } else { // try DOM
    let domElm = document.getElementById(params.elmId)
    if (domElm && domElm.focus) domElm.focus()
  }
}
const Lookups = require('./utils/lookups.js')

if (window.$App) {
  magicLink.addCommand('showForm', magicLinkAdminUiCommand)
  magicLink.addCommand('showList', magicLinkAdminUiCommand)
  magicLink.addCommand('showReport', magicLinkAdminUiCommand)

  window.$App.on('applicationReady', () => {
    Lookups.loadEnum()
  })
  window.$App.on('applicationReady', replaceDefaultRelogin)
  window.$App.on('applicationReady', addVueSidebar)
  $App.on('buildMainMenu', items => {
    items.splice(0, 1) // remove top panel ExtJS hamburger menu button
  })

  // Default navbar slot
  window.$App.on('applicationReady', () => {
    const UNavbarDefaultSlot = require('./components/navbarSlotDefault/UNavbarDefaultSlot.vue').default
    $App.fireEvent('portal:navbar:defineSlot', UNavbarDefaultSlot, {})
  })
  // Example:
  //
  // window.$App.on('applicationReady', () => {
  //   const SidebarSlotExample = require('./samples/SidebarSlotExample.vue').default
  //   $App.fireEvent('portal:sidebar:defineSlot', SidebarSlotExample, { some attrs })
  //
  //   const TabbarSlotExample = require('./samples/NavbarSlotExample.vue').default
  //   $App.fireEvent('portal:navbar:defineSlot', NavbarSlotExample, { some attrs })
  // })
}

if (isExt && window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  const replaceAutoForms = require('./utils/replaceExtJSWidgets').replaceAutoForms
  UB.core.UBCommand.showAutoForm = replaceAutoForms
}

/**
 * Create fake (hidden) message and return it zIndex
 * This hack is required to obtain current ElementUI zIndex
 */
Vue.prototype.$zIndex = () => {
  let vm = Vue.prototype.$message({
    customClass: 'ub-fake-notification'
  })
  return vm.$el.style.zIndex
}

Vue.config.warnHandler = (err, vm, info) => {
  setTimeout(() => {
    console.error(err, vm, info)
    window.onerror.apply(UB, [err, info, '', '', new UB.UBError(err, info)])
  }, 0)
}
