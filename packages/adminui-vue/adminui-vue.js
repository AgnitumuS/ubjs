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

module.exports.mountHelpers = require('./utils/mountHelpers')

const Vue = require('vue')
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
require('./theme/el-theme-compiled.css')
if (BOUNDLED_BY_WEBPACK) {
  // webpack MiniCssExtractPlugin extract all styles (for vue SFC), so we need to inject dist/adminui-vue.css
  UB.inject('/clientRequire/@unitybase/adminui-vue/dist/adminui-vue.min.css')
}
Vue.use(UB)

const UbComponents = require('./utils/install-ub-components')
Vue.use(UbComponents)

const Vuelidate = require('vuelidate/lib/index').default
if (IS_SYSTEM_JS && !SystemJS.has('vuelidate')) SystemJS.set('vuelidate', SystemJS.newModule(Vuelidate))
Vue.use(Vuelidate)

const dialogs = require('./components/dialog/UDialog')
// add $dialog* to Vue prototype
Vue.use(dialogs)
UB.setErrorReporter(dialogs.errorReporter)
if (isExt) {
  const {
    replaceExtJSDialogs,
    replaceExtJSNavbar,
    replaceExtJSMessageBarDialog
  } = require('./utils/replaceExtJSWidgets')
  $App.on('applicationReady', replaceExtJSDialogs)
  $App.on('applicationReady', replaceExtJSNavbar)
  $App.on('applicationReady', replaceExtJSMessageBarDialog)
  $App.on('applicationReady', () => {
    $App.doCommand({
      addByCurrent: undefined,
      cmdType: "showForm",
      description: undefined,
      detailAttribute: undefined,
      entity: "uba_userrole",
      formCode: undefined,
      instanceID: undefined,
      isModal: !false,
      isModalDialog: false
    })
  })
}

const Sidebar = require('./components/sidebar/USidebar.vue').default
function addVueSidebar () {
  const SidebarConstructor = Vue.extend(Sidebar)
  const id = $App.viewport.leftPanel.id
  new SidebarConstructor({
    el: `#${id}-body`
  })
}

const Relogin = require('./components/relogin/URelogin.vue').default
function replaceDefaultRelogin () {
  const ReloginConstructor = Vue.extend(Relogin)
  const instance = new ReloginConstructor()
  const vm = instance.$mount()
  document.body.append(vm.$el)
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

if (window.$App) {
  magicLink.addCommand('showForm', magicLinkAdminUiCommand)
  magicLink.addCommand('showList', magicLinkAdminUiCommand)
  magicLink.addCommand('showReport', magicLinkAdminUiCommand)

  window.$App.on('applicationReady', replaceDefaultRelogin)
  if (UB.connection.appConfig.uiSettings.adminUI.customSidebar) {
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
}

if (isExt && window.$App && $App.connection.appConfig.uiSettings.adminUI.vueAutoForms) {
  const replaceAutoForms = require('./utils/replaceExtJSWidgets').replaceAutoForms
  UB.core.UBCommand.showAutoForm = replaceAutoForms
}
