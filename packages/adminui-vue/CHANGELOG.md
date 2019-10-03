# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.7.2]
### Added
 - New option for `UFormRow` label-position prop, example:
```vue
<u-form-row
  required
  label-position="top"
  :label="`${entity}.filterValue`"
  :error="$v.filterValue.$error"
>
  <u-input attribute-name="filterValue" />
</u-form-row>
``` 

## [1.7.1]
### Fixed
 - `UForm/processing` in case execParams includes locale params will replace the locale param with base param. For example in case userLang === 'en' and execParams includes key 'fullName_uk^' will replace key 'fullName' to 'fullName_en^'

## [1.7.0]
### Changed
 - update package `element-ui@2.12.0` and `element-theme-chalk@2.12.0`
 - production build now works on browsers for WinXP (Chrome 48/ FireFox 52). It's done by:
    - adding a core-js polyfills for missing things (+122 Kb boundle size) - see `.babelrc`
    - replacing DOMElement.append -> DOMElement.appendChild
    - remove object rest spread where possible
 - 1.7.x is the LAST version what supports WinXP. Polyfills **WILL BE REMOVED IN 1.8.0**  

## [1.6.41]
### Fixed
 - removed `async-to-promises` babel plugin - buggy

## [1.6.40]
### Fixed
 - added support for old Chrome browser what can run on WindowsXP by using `async-to-promises` babel plugin

## [1.6.39]
### Fixed
 - `instance` module `SET_DATA` mutation, fix bug when assign a value to JSON attribute, and there is `null` instead
   of a regular object value.  Assign an empty object in any scenario, when value is not already an object or when
   value is `null`.
 - `instance` module, comparison array to null or object to null now works without exceptions

## [1.6.38]
### Fixed
 - `UForm.validation` computed.mapInstanceFields maps all entity fields. Previously only required fields

### Added
 - Callback `saveNotification` is added to `UForm.processing` parameters - will override default save notification

### Changed
 - **BREAKING** `UForm.validation` now accept config for [vuelidate](https://vuelidate.netlify.com/#sub-basic-usage) mixin
 __instead of function__ what returns $v 
```javascript
.validation({
 computed: {
   code () {
     return this.$store.state.data.code
   }
 },
 validations: {
   code: { required }
 }
})
```
 - **BREAKING** `USelectCollection` added required prop `entityName` it pass the entity name of the collection
 - **BREAKING** `USelectCollection` prop `subjectAttr` renamed to `associatedAttr`
 
### Fixed
 - `instance/addCollectionItem` missed call of repository function
 - `UContextMenu` do not closed just after opening in Firefox

## [1.6.35]
### Added
 - basic support for `dataHistory` mixin: only creation of new rows. TODO - implement adding of a new row version

## [1.6.34]
### Changed
 - changes in how `collections` state item is handled in vuex store:
   - do NOT pass unneeded parameter "collection" from client to server - the parameter is not needed by server,
     but is passed only to help client to match response with request
   - assume `repository` is a factory function, and not the ready repository object, change all over processing module
       to reflect that. For backward compatibility, support the old way of supplying repository object,
       but output a warning to console:
      ```javascript
      collections: {
        todo: {
          repository: ({state}) => UB.connection
            .Repository('tst_dictionary_todo')
            .attrs('ID', 'objectID', 'name', 'status', 'link')
            .where('objectID', '=', state.data.ID),
          lazy: true
        }
      }
      ```
   - refactorings to simplify code: inline `initCollections` helper method, no need for it
     to be in `helpers`, add `enrichFieldList`, because in some places we need to make sure
     some system attributes are added to requests, such as `ID` or `mi_modifyDate`;
     inline `buildCollectionRequests` straight into `save`.
   - improve jsdocs
   - expose `buildDeleteRequest` in `helpers` and remove `buildCollectionRequests` from helpers.
   - when iterate collections, use `initCollectionsRequests` - metadata about which collections are there, 
     instead of using `store.collection` - state info; this shall be more reliable.

## [1.6.33]
### Fixed
 - `Form/helpers/mergeStore` merge modules, plugins and strict in store config
 - Full Text Search widget will wrap text to search into "" in case it starts from **№** - fix [UBDF-9971]
 - `Refresh` action for new record: pass a new row ID to load method instead of instanceID what undefined.
 This fix error on refresh `Where item with condition "equal" must contains "value" or "values"` [UBDF-10109] 

## [1.6.32]
### Fixed
 - duplication of store data in tabs in case store config with actions is provided as object to `Form` with state as a function
 - **async function** declaration removed from code - it's not transpiled to ES5 & do not work on Chrome under Windows XP
 - `async function helpers.hookWrap` is removed (replaced by function.prototype.call where used)  

## [1.6.31]
### Fixed
 - duplication of store data in tabs in case store config is provided as object to `Form` with state as a function
 - `Form/validation` undefined store when custom validation is used

### Added
 - `SET` mutation is exposed by adminui-vue. It need when you use `computedVuex` in store module 
 - `USelectEntity`, `USelectMultiple` click outside dropdown
 - `clickOutside` util which listen click not one but several dom elements and call's hide callback only when click target is not equal any passed dom element 

### Changed
 - **BREAKING** - `UDetailGrid` rewritten, now only works on readonly

## [1.6.30]
### Added
 - in case `props.parentContext` is passed to Form() values of `parentContext` will became a default values for a new row
 (passed to addNew method). Sample below calls a Vue form in NEW mode (instanceID not defined) and sets value of `docID`
 attribute to 123 

```javascript
  $App.doCommand({
    cmdType: 'showForm',
    entity: 'doc_controltask',
    formCode: 'doc_controltask_form',
    isModal: true,
    props: {
      parentContext: { docID: 123 }
    }
  })
```

### Fixed
 - prevent creation of empty Form life-circle hook functions (optimization)  
 - prevent call 'lock' method for new entity instances with softLock mixin (should be called only for existed instances) 

## [1.6.29]
### Fixed
 - prevent browser autocomplete in fields inside `UFormContainer` by adding `autocomplete = 'off'`
 - `Form` the problem when store config didn't override instance and processing methods 

## [1.6.28]
### Added
 - `SET_DATA` mutation of the "instance" module supports now the `path` argument, which shall be used for JSON attributes, example:
 ```js
  commit(
    'SET_DATA',
    {
      key: 'attrValues',
      path: 'myCustomAttr',
      value
    },
    {root: true}
  )
 ```
 - update "instance" module, the recognize if JSON attribute was changed or not
 - optimize work of isEqual function of the "instance" module for array values

## [1.6.27]
### Added
 - `Form.validation()` added param `validator` for creating custom validation. [Example](https://git-pub.intecracy.com/unitybase/ubjs/blob/87874ab1ce37e27240965d3fa998a40ebd3f8303/packages/adminui-vue/utils/Form/README.md#%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80-%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%BC%D0%BD%D0%BE%D0%B9-%D0%B2%D0%B0%D0%BB%D0%B8%D0%B4%D0%B0%D1%86%D0%B8%D0%B8)

## [1.6.26]
### Added
 - `UDetailGrid` component - shows data collection as a table view 

### Changed
 - update package `element-ui` **2.8.2 -> 2.11.1**

## [1.6.25]
### Fixed
 - In case vue form is mounted directly into another component it will be destroyed during destroying parent Ext or Vue component

### Added
 - `UToolbar` added prop `hideDefaultButton` which hide's default buttons

## [1.6.24]
### Changed
 - use new method `$App.generateTabId()` for tabId generation instead of hardcoded expression
   
## [1.6.23]
### Changed
 - element-ui & element-theme-chalk versions are frozen to 2.8.2 because of bugs (again) in element theme builder
 - **BREAKING** one-line function helpers.isExistAttr() is removed. Use `const schema = UB.connection.domain.get(entity); schema.attributes[attr]` instead 
 
### Fixed
 - show Registration URL on the login page independent of available auth methods
 - turn off silence kerberos login on the auth page works correctly - fix #64 

### Added 
 - VueJS based form now accept `target` in UForm constructor, and render form directly into this target. 
Target can be either id of html element or Ext component

## [1.6.21]
### Added
 - default authentication form (ub-auth.html) handle a `uiSettings.adminUI.registrationURL` parameter from config.
 In case parameter is empty or not exists (default) then registration link do not displayed on the authentication form. 
 Otherwise a link to the specified URL is displayed 
 
## [1.6.20]
### Added
 - expose `clickoutside` directive from ElementUI. `hideDropdown` in code below will be called
 in case user click outside the div: 
```vue
<div v-clickoutside="hideDropdown"></div>
```

### Fixed
 - prevent adding `document.body.onclick` handle for every `u-select-entity`/`u-select-multiple` by using `clickoutside` directive instead. Fix #65 as side effect
 - `USelectMultiple` allow to select option by clicking not only on item caption but also on checkbox
 - `Save` button in multi language dialog for input renamed to `apply` + localization added
 - the form with multi lang fields still remains dirty after saving ( fix #67 )
    
## [1.6.19]
### Fixed
 - disable sidebar shortcut "Edit" popup menu item in case user don't have access to `ubm_navshortcut.update` [UBDF-9664]
 - sidebar item deletion fixed [UBDF-9652]

## [1.6.18]
### Fixed
 - VueJS based form now accept `tabId` in UForm constructor.
 If passed it will be used to identity tab and prevent opening tab with the same tabId twice. 
 If omitted will be calculated based on entity and instanceID.
 ```js
module.exports.mount = function ({ ..., tabId }) {
    Form({
      ...,
      tabId
    }).store()
      .instance()
      .processing()
      .validation()
      .mount()
  }
```
 - locking for Vue forms based on entity without softLock mixin is remove (fix)

## [1.6.17]
### Added
 - support for `softLock` (Pessimistic locks) mixin
 - new icon-color classes for UToolbarButton: `info`, `danger`. Example:
 ```vue
<u-toolbar-button
  v-if="entitySchema.hasMixin('softLock')"
  :icon-cls="isLocked ? 'fa fa-lock' : 'fa fa-unlock'"
  :icon-color="isLocked ? (isLockedByMe ? 'green' : 'danger') : 'info'"
  :tooltip="lockInfoMessage"
/>
```
 
## [1.6.16]
### Fixed
 - placeholder translation for u-auto-field of Date/DateTime type ( #63 )
 - put moment in global even in case user language is `en`
 
### Changed
 - method `showValidationErrors` in `UB.view.BasePanel`. Now returns `entityCode.fieldCode` when fieldLabel is empty.  
 
## [1.6.14]
### Added
 - exports `dialog`, `dialogError`, `dialogInfo`, `dialogYesNo` functions from `adminui-vue`. To be used outside Vue instance:
```javascript
const adminUiVue = require('@unitybase/adminui-vue')
adminUiVue.dialogInfo('Hello')
// inside Vue instance the same can be called as this.$dialogInfo
```

### Fixed
 - `UFormContainer` should prevent submitting of form in case user press Enter key while input on form is focused 

### Changed
 - default repository for `USelectEntity` & `USelectMultiple` is sorter by description attribute.
 Pass your repository for custom sorting (or to remove sorting) 

### Fixed
 - `USelectEnum` is sorted by `ubm_enum.sortOrder`
 - `processing` - excluded fields mi_createDate, mi_createUser, mi_deleteDate, mi_deleteUser, mi_modifyUser, mi_owner from insert request

## [1.6.12]
### Fixed
 - translation of attributes inside Full Text Search widget snippets (FTS return attributes in lower case)
 - ub-auth login form: add more space between password field and "Login" button in case of http: to prevent overlap of
 login button by browser "not secure connection" warning  
 - Vue based user messages notification widget do not throw `ELS - access deny` error for non-privileged users

## [1.6.11]
### Fixed
 - fix exception `"UForm.instance()" should be called once` - occurred during opening of vue form (introduced in 1.6.10)

## [1.6.10]
### Fixed
 - moment usage fix: now `const moment = require('moment')` in underline models works as expected and 
 use `moment` instance already injected by adminui-vue
 - fix `can not read property style of undefined` in `Vue.prototype.$zIndex`  

## [1.6.8]
### Added
 - `Form->processing` added hooks:
   - beforeDelete
   - deleted
 - `Form->processing` if beforeDelete hook returns false, deleting will be canceled

## [1.6.7]
### Fixed
 - UBSelect* - set cursor to `pointer` in case `editable` prop is `false`
 
## [1.6.6]
### Fixed
 - limit error dialog width to 250px to prevent text output outside viewport for errors what appears on the right border

## [1.6.5]
### Changed
 - **Breaking** `u-input` v-model support is removed, now gets and sets value from store automatically
 - **Breaking** `u-auto-field` removed v-model, now gets and sets value from store automatically
 - **Breaking** `u-auto-field` renamed prop `code` to `attribute-name`
 - `USelectEntity` modelAttr renamed to valueAttribute
 - `USelectMultiple` modelAttr renamed to valueAttribute
 
### Added
 - `u-base-input` - when using type="number", helps to establish the precision of rounding and step
 - `USelectEntity`, `USelectMultiple` added prop displayAttribute - attribute which is display value of options
 - `u-select-entity`, `u-select-enum` added `editable` prop. False to prevent the user from typing text directly into the field; the field can only have its value set via selecting a value from the picker. In this state, the picker can also be opened by clicking directly on the input field itself. True by default for u-select-entity, false by default for u-select-enum
 - expose `mountUtils` in `@unitybase/adminui-vue` exports to be used for mounting custom Vue forms
 - new prop UCodeMirror.hintsFunction - accept a function for hint generation. See `ShortcutCmdCode.vue` in UMB model for usage sample
 
### Fixed
 - UCodeMirror now handle `editorMode` prop and perform a syntax highlight for content depending on mode (default is javascript)   

## [1.6.4]
### Fixed
 - "Always use domain for login" checkbox should be visible in navbar User menu in case "Negotiate" auth is enabled for app [UBDF-9586]
 - `class UForm` fixed the problem when two identical forms have a common store state and replace each other's data
 - `class UForm` Now any method or state property of the UForm store can be overwritten by local form store
 - `u-select-enum` fixed disabled prop

### Changed
 - `u-sidebar` changed sidebar item height to auto, paddings reduced

## [1.6.3]
### Fixed
 - fix UFormContainer registration issue introduced in 1.6.2
 
## [1.6.2]
### Fixed
 - do not break words in the $App.dialog* messages (word-break should be break-word instead of break-all) [UBDF-9571]
 - WebStorm IDE now recognize U* components inside templates instead of error "unknown HTML tag"
 
### Changed
 - `Form->processing` changed all hooks to async, now can await result
 - `Form->processing` if beforeSave hook returns false, saving will be canceled
  - Shortcut edit window now shown inside tab instead of modal
 
### Added
 - `Form->processing` added hooks:
   - beforeCreate
   - created
   - beforeLoad
   - loaded 

## [1.6.1]
### Fixed
 - `USidebar` - item text is now hidden if overflow exceeds 3 lines
 - `USidebar` - prevent work break inside menu

### Changed
 - VueJS form mount () will be called with additional config `rootComponent: exports.default`  


## [1.6.0]
### Changed
 - **BREAKING** refactor `formBoilerplate` to constructor `Form` [docs and examples](https://git-pub.intecracy.com/unitybase/ubjs/blob/11e529331f78313c4fd483e660ccad9a4e65a73f/packages/adminui-vue/utils/Form/README.md)
 - **BREAKING** `u-form` component renamed to `u-form-container`

## [1.5.6]
### Fixed
 - `USidebar` - if parent folder is not accessible due to RLS - skip shortcut
  
### Added
 - new event fired by Sidebar in case desktop is changed: `$App.fireEvent('portal:sidebar:desktopChanged', ID)`
 - `UNavbar` will handle new event `portal:navbar:prependSlot` - prepend some elements on the left of existed navbar slot elements
 - `UNavbar` will handle new event `portal:navbar:userButton:appendSlot` - insert some elements into user menu
 - Version item is added to the UNavbar user button menu. Application can define custom version number in uData `appVersion` key 

## [1.5.5]
### Changed
 - `u-code-mirror` - added shortcuts tooltip
 - `u-code-mirror` - added key bindings according old codeMirror 

## [1.5.3]
### Fixed
 - `processing` emit update grid and add loading status when dispatch 'deleteInstance'
 
### Added
 - added `u-select-multiple` component. Its multi-select for UB entity 
 - added `u-select-collection` component. Inherited from `u-select-multiple`. Component is responsible for display a collection of a details from master-detail relation inside a multiselect. Acts like a control for "Many" data type, but can be bound to any detailed entity 

### Changed
 - `u-select-entity` added 'clearable' option
 - rewritten `u-select-many`. Now this component inherited from `u-select-multiple` 

## [1.5.2]
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [1.5.1]
### Fixed
 - changed before close function in mount module, can except empty store or store without save action
 - `UInput` - fixed bug when user open popup then will send empty locale after form saved 

### Added
 - `UAutoField` - component renders form field according to the attribute type

### Changed
 - `mount` module. Renamed `mount -> mountForm`
 - `formBoilerplate` exports `activateIfMounted` and `mountForm`, instead `mountHelpers`
 - `UInput` - in case type===number will emit value in each input event instead of change
 - `Uinput` - added validation to locale fields if master field is required and form not new
 
### Added
 - `UAutoField` - component renders form field according to the attribute type

## [1.5.0]
### Fixed
 - `UDialog` fixed autofocus on accept button
 - `adminui-vue` will increase zIndex of Ext.WindowManager every time vue form opened on modal   

### Changed
 - lazy loading of `@unitybase/codemirror-full` for UCodeMirror control
 - migrate from "babel-plugin-transform-object-rest-spread": "^6.26.0 -> "@babel/plugin-proposal-object-rest-spread": "^7.4.3 
  for boundler
 - `UInput` was changed, now implemented with instance module
 - `UInputNumber` removed, now old `UInput` and `UInputNumber` united in new `UInput` component
 - `UCodeMirror` changed border color
 - `UFormRow` now can pass true/false/String to error prop. If set true will be show default text
 - `UEntityEdit` removed
 - `UbToolbarComponent` removed
 - update element-ui@2.4.3 -> 2.8.2
 - update element-theme-chalk@2.4.3 -> 2.8.2
 - !Breaking! `USelectEntity`, `USelectMany` changed prop entityName to entity. Now can take entityName string or UB.Repository object

### Added
 - form boilerplate [Docs](https://git-pub.intecracy.com/unitybase/ubjs/blob/164f10d15a1753be6505d9dd5b87d570f4404cf0/packages/adminui-vue/README.md#helper-modules)
 - `UToolbar` component. That is related with processing module in form boilerplate
 - `v-hold-focus` directive. Intercepts the tab keydown event on this element and does not allow the focus to leave it

## [1.4.1]
### Added
 - `Vuex` now imported inside `@unitybase/adminui-vue`. In other models:
   - for **dev** mode can be required directly ``` Vuex = require('vuex') ```
   - in case model is boundled by webpack `Vuex` should be in `externals` section of webpack config
   ```
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
 - added `UForm` component. Wrap for UFormRow which can set label width for child `UFormRow`s
 - added `modalWidth` option to mount formParams

### Fixed
 - fixed `ubs_message_edit` form layout on small screens
 - added `storeInstanceModule`. Vuex store which track all form changes
 - added `storeValidationPlugin`. Vuex store plugin which validate instance module changes
 - `UFormRow` now can be used without `UForm` wrapper  
 - fixed autofocus to accept button in `UDialog`

### Changed
 - `portal:navbar:appendSlot` now append child to navbar
 - `portal:navbar:defineSlot` define slot with new child (renamed `appendSlot` -> `defineSlot`)
 - `portal:sidebar:appendSlot` now append child to sidebar
 - `portal:sidebar:defineSlot` define slot with new child (renamed `appendSlot` -> `defineSlot`)
 - **BREAKING** renamed:
   - UbSelectEntity -> USelectEntity
   - UbSelectEnum -> USelectEnum
   - UbSelectMany -> UbSelectMany
   - UbUploadDocument -> UUploadDocument

### Fixed
 - set correct zIndex when open UB dialogs from magicLinks

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
    <a href="#" data-cmd-type="showForm" data-entity="ubm_navshortcut" data-instance-id=332352169869385>
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
