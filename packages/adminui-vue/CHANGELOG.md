# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
## [1.4.1]
### Added
 - `Vuex` now imported inside `@unitybase/adminui-vue`. In other models:
   - for **dev** mode can be required directly ``` Vuex = require('vuex') ```
   - in case model is boundled by webpack `Vuex` should be in `externals` section of webpack config
   ```json
   externals: {
       lodash: '_',
       '@unitybase/ub-pub': 'UB',
       '@unitybase/adminui-pub': '$App',
       'vuex': {
         commonjs: 'vuex',
         commonjs2: 'vuex',
         amd: 'vuex',
         root: 'Vuex'
       }
     }
   ```  
 - new `mountHelpers` module - to be used inside form's `mount` function:
  ```javascript
    const AdminUiVue = require('@unitybase/adminui-vue')
    module.exports.mount = function (params) {
      if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
      let mountParams = {
        FormComponent: TstDictionaryFt,
        showFormParams: params
      }
      AdminUiVue.mountHelpers.mount(mountParams)
    }
  ```     
## [1.4.0]
### Changed
 - UbContext -> UContextMenu
 - UbCodeMirror -> UCodeMirror
 - UbInput -> UInput
 - All Vue components now will be inited in `packages/adminui-vue/ub-components.js`

### Added
 - `throttle-debounce` micro package added. Exported by adminui-vue as throttleDebounce  
 - added `UFormRow` component. When you need to add label in right side of form item
 - added `UErrorWrap` component. Wrap any element and show error from prop under element 
  
## [1.3.3]
### Changed
 - UbEntityEdit `value` property renamed to `instance` 
 - UbInput now use HOC pattern over ElInput
 - ToolbarComponent property `value` renamed to `instanceId`. To be used as `<u-form-toolbar :instance-id="formData.ID"...>`
 - prevent override Vue.prototype.$notify introduced by El, instead inject UDialog as `$dialog`
 - Vue forms will use `Alt+R` for "Remove" instead  of Alt+Del because DEl and Backspace because
 on Mac keyboards the key normally identified as "backspace" on PC keyboards is called "delete"
 - popover button animation removed for vue select (in remote mode)  

### Added
 - UInputNumber component - editor for Numeric field (Int, BinInt, Currency, Float, ID); HOC over ElInputNumber
 - Vue.prototype.$dialog, $dialogYesNo, #dialogInfo, $dialogError
 - controls for Vue based navbar component: 
   - UNavbarNotificationButton - `ubm_messages` notifications
   - UNavbarSearchButton - Full Text Search (+ shortcut `Ctrl + F`)
   - UNavbarUserButton - actions for logged in user
 - "Magic links" (see adminui-vue/utils/magicLinks.js for details)
  ```html
    <a href="#" data-cmd-type="showForm" data-entity="ubm_navshortcut", data-instance-id=332352169869385>
       Edit existed shortcut with specified ID
   </a>
  ```
 
### Fixed
 - Vue control UbSelectEntity now use ElSelect `remote-method` for fetching data
 - behavior of UbSelectEntity changed to be as close to desktop select as possible
 - links for set focus on attribute with invalid value and for execution of command
 now work in production mode (inline JS is removed in flavor of magic link)
  
## [1.3.2]
### Added
 - new Vue base `sidebar` component (left menu). Enabling by setting
 `UB.connection.appConfig.uiSettings.adminUI.customSidebar` to `true` in app config
 - `$notify` method to Vue.prototype
- buttons `show error on full screen` and `show info for developer` added to Error notification popup

### Changed
 - `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
    `git mv my_entity-fm.js my_entity-fm.vue`
 - due to modifications in vue runtime parser all imports of `vue` files must be done as
 `const cmpName = require('cmpName.vue').default`
 - renamed CSS variables according twitter-bootstrap

### Fixed
 - ub-auth page will handle pressing of Enter key in UB authorization scheme user name field
 - UbSelectEntity vue component:
    - added shortcuts for popup actions
    - "blink" area around popup actions button is removed
 - UBToolbarComponent.vue - "Save" and "Save and close" color changed to btn-primary (green)
 
## [1.3.1]
### Changed
 - update vue@2.6.7 -> 2.6.8
 - set fixed version of element-ui@2.5.4 because of theme bug in 2.6.x

### Fixed
 - move `normalize.css` to dependencies from devDependencies to allow use a `-dev` mode
 even if modules are installed with `NODE_ENV=production`
 - `dialogInfo` return false in case user close dialog without pressing "ok" button (regression)

## [1.3.0]
### Fixed
 - relogon form should not close on Esc

### Changed
 - **BREAKING** dialogs functions now return native Promise - without a legacy `.done` method.
 All occurrence of `.done` should be replaced to `.then()[.catch()]`
 - webpack4 is used for compile production mode
 - updated vue@2.6.6 -> vue@2.6.7
 - upgraded vue-loader@14.2.4 -> vue-loader@15.6.4

## [1.2.2]
### Fixed
 - relogon form: default focused element should be password
 - relogon form: password should be cleaned after submit
 - `adminui-vue` model replace Ext-JS based dialogs with VueJS implementation.
  List of methods which was changed:
    - `Ext.Msg.confirm`
    - `$App.dialogYesNo`
    - `$App.dialogInfo`
    - `$App.dialogError`
    - `window.onerror`
    - `Ext.override` -> `UB.view.BasePanel` -> `showValidationErrors`

## [1.2.0]
### Changed
 - `adminui-vue` model replace a top Ext-JS based navbar with navbar implemented using VueJS.
  See `components/navbar`
 - `adminui-vue` model replace Ext-JS based relogon window with VueJS implementation.
  See `components/UbRelogon`

### Fixed
 - authorization form validation message localisation

## [1.1.0]
### Changed
 - vue updated 2.5.17 -> 2.6.6
 - element-ui updated 2.4.9 -> 2.5.4

## [1.0.44]
### Added
- watch for prop value changed in all controls
- open dialog with iFrame for pdf files in `UbUploadDocument`

## [1.0.43]
### Fixed
 - add missing "css" folder to the published package

## [1.0.40]
### Added
 - components folder is added to tarball for debugging purpose

## [1.0.34]
### Changed
 - hide `Forgot password?` and `Registration` on auth form when `Negotiate` enabled
 - add title to Localizable Dialog in `UbInput`

### Fixed
 - fix popovers collapse on `UbSelectEntity` control
 - add styles for low resolution screens in `UbInput` Localizable Dialog

## [1.0.33]
### Changed
 - vue loader registration is moved form `adminui-vue` to `adminui-pub`

### Fixed
 - set `ub-auth` page title to the `uiSettings.adminUI.applicationTitle` just after got an application info

## [1.0.32]
### Fixed
 - error with hidden UB auth in case this is only one possible auth method

## [1.0.31]
### Changed
 - adminui-vue auth form will hide ub auth under `options` if Kerberos or CERT2 is enabled

## [1.0.27]
### Fixed
 - let's ElementUI popups be above all Ext popups by setting initial ElementUI.zIndex to 300000

### Changed
 - change webpack configuration to decrease boundle for production build (from 847Kb to 630Kb)
 
## [1.0.26]
### Added
 - vue based login now support `onNeedChangePassword` connection event and display the password change form to the user
 
### Changed
 - `element-ui` is upgraded to `2.4.9`   
 
## [1.0.16]
### Added
 - vue based login now support `CERT2` authentication (available in UB DE)

## [1.0.11]
### Changed
 - update element-ui to 2.4.5 (2.4.6 not theme is compiled)

## [1.0.9]
### Fixed
- theme will set ExtJS fieldset border radius to 4px

## [1.0.8]
### Fixed
- ub-auth.html: hide password on password input (type="password")

## [1.0.6]
### Added
- css for round ExtJS form fields border radius (as in ElementUI)

## [1.0.6]
### Added
- ability to load Vue single file components (*.vue) - see ``@unitybase/systemjs-plugin-vue-ub` readme for restrictions

### Changed
- default size of ElementUI components is set to to `small`

## [1.0.5]
### Fixed
- login window logo css fixed in way logo looks the same on adminui-vue and adminui login windhw
- add missing `views/ub-auth.html` to the package

## [1.0.3]
### Fixed
- use Vue version with compiler (vue/dist/vue.common.js) for both dev/prod build

## [1.0.2]
### Changed
- theme css `/dist/adminui-vue.css` will loaded by adminui-vue automatically (using require)
- theme CSS will not override a body font-size, so other modules can set his own (we recommend 14px)
