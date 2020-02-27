# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added

### Changed

### Deprecated

### Removed

### Fixed
 - `UTableEntity` filters for different columns no more overrides each other
 - FTS navbar widget will not intercept `Ctrl+F` in case fts is disabled in config and widget is hidden
 - `UAutoField` remove mistaken added properties for `Text` field, added missing input handler
 - `UTableEntity` build correct fieldList in case passed `entityName` and columnId is a path to Json attribute

## [1.9.25] - 2020-02-23
### Removed
 - usage of BigInteger.js is removed in CERT2 with login/password auth
 
### Fixed
 - `truncTimeToUTCNull` now called for insert (as for update) and truncate time for attributes of type "Date" into 00:00:00Z as expected by server
 - `showForm` command can be executed without entity code in case form code is defined and form do not use processing module
 ```
 UB.core.UBApp.doCommand({
   cmdType: 'showForm',
   formCode: 'uba_user-changeUserPassword',
   title: 'changePassword',
   isModal: true
 })
```

## [1.9.24] - 2020-02-18
### Added
 - re-logon window & ub-auth view: added support for CERT2 auth with user/password in case
 `uiSetting.adminUI.authenticationCert.requireUserName===true`
 - new view for CERT2 certificate registration (can be used as registration URL for CERT2 with requireUserName===true)
 
### Changed
 - hide `Change language` user menu item in case only one language is supported

## [1.9.23] - 2020-02-14
## [1.9.22] - 2020-02-13
### Changed
 - The "collections" property "processing" module now supports not only ability to pass callback `buildRequest`,
   but also an ability to pass `handleResponse` callback, because, know what?  Custom requests sometimes return custom
   responses! :)
   Example where the feature is useful: participants mixin, participants not an ordinary detail,
   it uses `addParticipant` instead of `insert`, and it return a response, which could not be handled by a standard
   response handler.  The callback looks like the following

    ```javascript
      handleResponse ({ commit, collection, response }) {
        const loadedState = response.resultData
        for (const loadedItem of loadedState) {
          const index = collection.items.findIndex(i => i.data.subjectID === loadedItem.subjectID)
          if (index !== -1) {
            commit('LOAD_COLLECTION_PARTIAL', {
              collection: 'participants',
              index,
              loadedState: loadedItem
            })
          }
        }
      }
    ```
 - Extended info passed to `buildRequest`, `buildDeleteRequest` and `handlerResponse`
   callbacks for collections to entire store, not just selected store members like `state` or `state` and `commit`.
  
## [1.9.21] - 2020-02-08
### Changed
 - UAutoField component will prefer props passed into component over internally defined props. This allow to override anything,
  for example:
  ```vue
    // override default placeholder and label for Date control
    <u-auto-field attribute-name="docDate" placeholder="overrides placeholder" label="My custom label"/>
    // use custom repository for Entity attribute
    <u-auto-field attribute-name="parentID" :repository="getRepo"/>
  ```
   
## [1.9.20] - 2020-02-03
### Added
 - `UTableEntity` prop `useRequestFieldList` for replacing result keys with fieldList.
 Sometimes, server returns result with altered fieldList, like entities with Entity-Attribute-Value mixin
 (see `@unitybase/forms`).  This property tells UTableEntity control to stick with original fieldList from request,
 rather than using fieldList from response.
 - `UTable`, `UTableEntity` possibility to use `column format` function as string 
 which be called by `new Function` constructor

### Changed
 - `UTableEntity` in case is set `columns` and `entityName` - `fieldList` will generated automatically by `columns`. 
 Previously request sent `fieldList` with all available entity attributes.
 - `UTableEntity` in case is set `repository` without `columns` - `columns` will generated automatically by `fieldList` which filtered by defaultView param. 
  Previously `columns` was shows **all** attributes from entity with flag defaultView
 
## [1.9.19] - 2020-01-31
### Added
 - warning text about silence unhandled exception ignoring in production build is added to unhandled exception message
   
### Changed
 - `FullTextSearch` navbar widget will hide itself in case user do not have access to any of `fts` pseudo-entities.
 This can be done either by set `application.fts.enabled: false` in ubConfig of by removing the fts
 connections from connections array
 - `UNavbarNotificationsButton` navbar widget will hides itself in case `ubs_message.getCached` is not accessible to user 

### Fixed
 - `USelectEntity` clicking on the arrow now works correctly after enabling/disabling control
 - `UTableEntity` added localization of "column" placeholder in filtration panel
 - `UFileInput`: prevent validation error in a case `accept` prop is empty
 - `USelectEntity` disable `select more` button in case component is read only
 - `UTableEntity` prevent error in case column attribute not exists in entity
 - `UCodeMirror` prevent output of error "..split of undefined.." into console (or message in DEV mode )
   in case value is `null` or `undefined` 

## [1.9.18] - 2020-01-17
### Added
 - `UTableEntity`: added `beforeAddNew`callback which will be emitted before addNew
 - `showList` command supports for cmdData.repository - an ubql object
 - `UTableEntity` store getter `currentRepository` - returns repository with added filters, sorters, pagination
   and total requests from state
 - new actions "export to Excel|HTML|CSV" added to `UTableEntity` toolbar "All actions" menu. Require UB server @5.17.10   
 - new component `UGrid` container for align form elements into columns - a wrapper for [display: grid;](https://css-tricks.com/snippets/css/complete-guide-grid/).
 Recommended to use instead of `<el-row> <el-col>`. Usage samples are added into UGrid.vue file

### Changed
 - `UTableEntity`: all props now reactive. For example changing `entityName` property will cause table to load
  rerender data and columns using new entity name, e.t.c 

### Fixed
 - hide selected desktop icon in case sidebar is collapsed
 - signatureVerificationResult - prevent show `(undefined)` in signature status in case error code is unknown
 - `UFormRow` - positioning label on top in case css `height !== auto`

## [1.9.17] - 2020-01-11
### Added
- `UTable` new param padding for column settings. All cells by default have padding 16px 
```
<u-table 
  :columns="[{ 
    id: 'color', 
    padding: 0, 
    maxWidth: 4px
  }, {
    id: 'document'
  }]" 
/>
``` 
 - `UFileInput` - format validation of dragging files
- `USelectEnum` prop `clearable`. Adds clear icon, false by default

### Changed
 - `UTableEntity` column of type `Document`: separate download button from file name
  to prevent unexpected downloads while user click on file name
 - `UTableEntity` prop `repository` now can be `ubql` or function which returns `ClientRepository`

### Removed
 - `UForm.instance()` method is removed (marked as deprecated). Please, remove all .instance() calls on your code

### Fixed
 - `saveAndClose` action should not close form in case of errors
 - `UInput`: globe icon should be displayed instead of empty rectangle
 - `UFormRow`: in case `label-position` is left or right error text should be displayed under input instead of udder label 
 - `UFormRow` now can be used outside of `UFormContainer`
 - `UIconPicker`: added border radius
 - SignatureVerificationResult component: display a signing time as hours:minutes (instead of hours:month) 
 - `UTableEntity` resets the filter value when a column changes
 - `UTableEntity` impossible to select a condition 'contains' in filter for column with type entity

## [1.9.16] - 2020-01-03
### Added
 - SignatureValidationResult.warnings attribute added
 - FontAwesome5 Free regular icon set added (far prefix)

### Changed
 - UIconPicker will try to use a prepared list of available FontAwesome5 Free icons

## [1.9.15] - 2020-01-03
### Added
 - default slot for UAutoField. Can hold content what renders in the same u-form-row
 ``` vue
   <u-auto-field attribute-name="SQL">
     <div class="u-form-row__description">
       {{ this.entitySchema.attr('SQL').description }}
     </div>
   </u-auto-field>
 ```

## [1.9.14] - 2020-01-02
## [1.9.13] - 2020-01-02
### Added
 - `USelectEntity`: option's select emits two parameters - (value, option: Object)
 - `uba_user-changeUserPassword-fm.vue` - changed form ExtJS to vue for changing user password
 - OpenIDConnect authorization support for adminui-vue
 - `UFormRow`, `UFormContainer` prop `maxWidth`. Sets max width of row
 - `UToolbarButton`: added $ut to provide just string to tooltip prop

### Changed
 - **BREAKING** `UIconPicker`: removed the <u-form-row> wrapper, renamed classes to more general ones,
   changed the icon selection emitting event from 'select' to 'change'
 - **BREAKING** renamed class from `ub-form-container` to `u-form-layout`. Because there is a component UFormContainer that has nothing to do with the class.
 - `UFormRow` colors have become more contrast 
 - `UFormRow` fully refactor component. In case `labelPosition === 'top'` label and error text divide free space
 - `UAutoForm` by default sets `labelPosition` to `top` and `maxWidth` to `800px`
 - `UTable` text style changed from bold to regular
 - `SignatureVerificationResult` view shown in expanded mode in case validationResult array contains one result
 
## [1.9.12] - 2019-12-30
### Added
 - global Vue component `SignatureVerificationResult` - view for `pki().verify`

### Changed
 - authentication form will show error in dialog window instead of floating notification 

### Fixed
 - UFile & UTableEntity will display original (human readable) file name instead of store specific (autogenerated) file name;
 Also original file name is used for file download operation

## [1.9.11] - 2019-12-27
### Added
 - `uba_user-changeUserPassword-fm.vue` - changed form ExtJS to vue for changing user password
 - OpenIDConnect authorization support for adminui-vue

### Removed
 - `USelectCollection` prop `entityName` removed in flavor of computed property `entityName`

### Fixed
 - show actual text instead of empty <<< >>> in error window in case unhandled rejection message contains <<<text>>>
 - prevent multiple emitting of `input` event in case UInput is of type `number`
 - `UIconPicker`: entering an icon class manually doesn't drop an error
 - dynamically update desktops in sidebar on change in `ubm_desktop` form
 - prevent showing of form validation error twice in case user close tab on the unsaved form and validation error occures 
 - `enum` filter template of `UtableEntity` displays the correct locale in the filter list 

## [1.9.10] - 2019-12-20
## [1.9.9] - 2019-12-19
### Added
 - `USidebarButton` - component for use in sidebar slot

### Changed
 - additional parameter `row` added to `UTableEntity.onSelectRecord` callback as `cfg.row` parameter
   Full function signature is `function({ID: Number, row: Object, close: function})`  

### Fixed
 - `UAutoField` provide all $attrs to `UFormRow` and inner element in slot.
   This allow, for example, to override a label position for individual field:
   ```
   <u-form-container v-loading="loading" label-position="top">
      <u-auto-field attribute-name="host" label-position="left"/>
      ...
   ```

## [1.9.8] - 2019-12-18
### Added
 - `UForm/mount/mountTableEntity` prop `cfg.isModal`. For render grid in modal
 - `UTableEntity` audit action
 - `UTableEntity` prop `onSelectRecord`. Overrides the record selection event. That is, double click or enter
 - `UTableEntity` all toolbar slots is scoped and provides `store` and `close` action.
 `store` need for access table data from slot, for example "select record button".
 `close` calls close action which provides from root component.
 - `UTableEntity` added audit action to toolbar
 - `UTableEntity` added slot for audit action in toolbar

### Changed
 - `USelectEntity` show dictionary action show's UTableEntity grid
 - `UForm/mount/mountModal` by default removes paddings from dialog body of `ElDialog`
 - **BREAKING** `UTableEntity` renamed all named slots from *kebab-case* to *camelCase*.
 In case pass scopedSlots param in `UForm/mount/mountTableEntity`
 - `UTableEntity` filter submit icon changed from `el-icon-check` to `el-icon-search`

### Fixed
 - UCodeMirror: null values showing fixed
 - `UFormRow` added additional verification to el-select click hack
 - `UToolbar` audit action

## [1.9.7] - 2019-12-17
### Changed
 - `UAutoField -> date-picker` first day of the week is taken from the current locale of `moment.js`.
   AdminUI take cares of switching moment locale according to user language
 - `UFormRow` will use `flex-direction:column` instead of display:block` css rule. This allow to stretch
   internal content to the full height
  
### Added
 - support for new attribute `uba_auditTrail.actionUserName`

### Fixed
 - `USelectEntity`/`USelectMultiple`: prevent exception `Error in build SQL "where" expressions: item "XXX" not found ordinar item with name "YYY"`
 while fetching a display value 
 - `ElSelect` wrapped by `UFormRow` no longer breaks arrow click behavior 
 - `UFile` - more accurate work with previewURL inside control, to prevent situation, when `previewUrl` is still set,
   but value is no longer valid due to `window.URL.revokeObjectURL` call. 

## [1.9.6] - 2019-12-12
### Fixed
 - Fixed error when filtering `Date` type columns in `USelectEntity` using range shortcuts

## [1.9.5] - 2019-12-11
### Added
 - `doCommand -> showList` param `cfg.cmdData.slots`. Array of functions which returns vue components.
   Vue component can be created by render function which accept [createElement](https://vuejs.org/v2/guide/render-function.html#createElement-Arguments) function as argument.
   See `UTableEntity` documentation for list ov available slots. Example:
```javascript
$App.doCommand({
    renderer: 'vue',
    cmdType: 'showList',
    cmdData: {
      entityName: 'uba_user',
      slots: [
        (createElement) => createElement('div', { slot: 'name' }, 'name replaced value'), // replace column name
        (createElement) => createElement('div', { slot: 'toolbar' }, 'replaced whole toolbar'), // replace toolbar
      ]
    }
  })
```
 - `USelectEntity`, `USelectMultiple` adds warning icon in case value is not found instead of throwing error 

### Fixed
 - disable `UTable` header click for columns with sortable: false
 - `UFormRow` with error adds red border to `USelectMultiple`
 - `USelectEntity`, `USelectMultiple` fetching of display value ignore passed whereList.
   This fix situation when value what already selected do not match filter conditions.
 
### Changed
 - `processing -> save validation` will try to localize entity attribute using UB.i18n

## [1.9.3] - 2019-12-05
### Fixed
 - prevent `UDialog` to close on click outside dialog window
 - `USelectMany` prevent `split is not defined` exception in case DB is SQLite3 and only one value is selected 
 
### Fixed
 - `UNavbar` search widget
 
### Added
 - `UFileInput` binds all props to underline input controls using v-bind. This allow, for example, to pass `accept` property value
 - new property UFile.accept - optional comma-separated unique “content type specifiers”
 - UFileInput binds all props to underline input controls using v-bind. This allow, for example, to pass `accept` property value
  - new property UFile.accept - optional comma-separated unique “content type specifiers”
  - `UTable` - Added column param `isHtml`. If set true will render content as v-html directive 
  - `UTable` - Added column format. Format displayed value in cell. Will ignored if is set custom slot. Example:
  ```javascript
   {
     id: 'attributeCode',
     label: 'Example',
     format ({value, row, column}) {
       return value + 1
     }  
   }
  ``` 

### Changed
 - updated dependency **vue**@2.6.8 -> 2.6.10
 - updated dependency **vuex**@3.1.0 -> 3.1.2
 - updated dependency **element-ui**@2.12.0 -> 2.13.0
 - `UTableEntity` table cell value formats value as html. In case when full text search result returns `<b>` tag as string.
 
### Removed
 - deprecated event `desktopChanged` for UB.core.UBApp ($App in global)  is removed.
   Instead adminui-vue fires `$App.fireEvent('portal:sidebar:desktopChanged', desktopId)`
 - deprecated `$App.getDefaultDesktop` `$App.getDesktop` `$App.setDesktop` are removed 
 - deprecated `UB.core.UBStoreManager.getDesktopStore` is removed
 - `ubm_desktop` no longer loaded by Ext UB.core.UBStoreManager (only by adminui-vue)
  
## [1.9.1] - 2019-12-02
### Fixed
 - mountContainer will provide fake `$formServices` to allow use UToolbar inside vue form mounted by mountContainer
 - `USelectEntity` close opened dropdown's if clicked **arrow** of another select. Previously it didn't closed if click on arrow
 - `UFile` prevent opening preview dialog on press enter button in another input in same form
 
### Changed
 - `UContextMenu` - hide icon div when `iconCls` is unset
 - `UToolbarButton` added slot for add text to button 
 - `UToolbarButton` prop `icon-cls` renamed to `icon` 
 - `UToolbarButton` prop `icon-color` renamed to `color`. Colors list - `primary | secondary | info | danger | warning`
 - `UFormContainer` refactor from commonjs to vue component 
 - `UFormContainer` removed padding and inner div
 
### Added
 - `UFileInput` binds all props to underline input controls using v-bind. This allow, for example, to pass `accept` property value
 - `UFile` new property `accept` - optional comma-separated unique “content type specifiers”
 - `UContextMenu` - added prop width
 - Styles which adds `padding: 1em` to `<form>` inside `u-form-layout` class. 
   So `UFormContainer` will have padding just only if it is a direct descendant of the `u-form-layout`  
 - `USelectEntity` added props `buildShowDictionaryConfig`, `buildEditConfig`, `buildAddNewConfig`. 
   This props can overrides doCommand configs for base actions (edit, addNew, showDictionary). 
   Functions get current config as argument and must return new config.
   Example in component docs.
 - `UTableEntity` added props `buildEditConfig`, `buildAddNewConfig`, `buildCopyConfig`. 
   This props can overrides doCommand configs for base actions (edit, addNew, сopy). 
   Functions get current config as argument and must return new config.
   Example in component docs.
 - `UTableEntity` toolbar slots:
   - `toolbar` - Replace whole toolbar 
   - `toolbar-prepend` - Prepend new buttons to toolbar 
   - `toolbar-button-add-new` - Replace add-new button in toolbar panel 
   - `toolbar-append` - Prepend new buttons to toolbar before filter 
   - `toolbar-dropdown` - Replace whole toolbar dropdown 
   - `toolbar-dropdown-prepend` - Prepend new buttons to toolbar 
   - `toolbar-dropdown-add-new` - Replace add-new button in toolbar dropdown 
   - `toolbar-dropdown-edit` - Replace edit button in toolbar dropdown 
   - `toolbar-dropdown-copy` - Replace copy button in toolbar dropdown 
   - `toolbar-dropdown-delete` - Replace delete button in toolbar dropdown 
   - `toolbar-dropdown-append ` - Append new buttons to toolbar 

## [1.9.0] - 2019-11-19
### Fixed
 - `USelectEnum` wrong display value on open form
 - loader (spinner) added to auth form - turned on after user press "Login" button. This help to indicate
  user what something is happens in case server response is slow  

### Changed
 - **BREAKING** `UUploadDocument` removed, use `UFile` instead
 - `UFormRow` increased default label width from 120 to 150
 - `UFormRow` previously margin-top was added only if one `UFormRow` element follows another in DOM,
  instead now margin-bottom always 10px
 - element theme css extracted into separate. This allow to override element styles in our vue components

### Added
 - `UTable` component. Build's table with sticky header. Accepts `data` and columns config
 - `UTableEntity` component able to display data either using entity name or repository.
   Extends UTable and adds pagination, filters, sorts
 - `UDropdown` and `UDropdownItem` component. Wrap element which passed as default slot and 
  shows dropdown on click in this element
 - `Lookups` util. Can load any entity and get it lookup value. Lookups values are cached GLOBALLY
 - new property `uiSettings.adminUI.useVueTables` in app config. If true - replace all
   ext grids `showList` by UTableEntity component.
 - `UB.core.UBCommand.prototype.showList` showList accepts new prop `renderer`. To render Ext showList use old doCommand config
    ```javascript
    $App.doCommand({
      renderer: 'vue',
      param: [{
        entity: 'uba_user',
        fieldList: ['*']
      }]
    })
    ```
    
    Old config can be used with vue renderer, but be careful, it may not take into account all the parameters that the old renderer took into account
    ```javascript
    $App.doCommand({
      renderer: 'vue',
      cmdType: 'showList',
      cmdData: {
        params: [{
          entity: 'uba_user',
          fieldList: ['*']
        }]
      }
    })
    ```
    
    Also you can use new config of vue renderer
    ```javascript
    $App.doCommand({
      renderer: 'vue',
      cmdType: 'showList',
      cmdData: {
        entityName: 'uba_user',
        columns: [
          'name',
          {
            id: 'fullName',
            minWidth: 200,
            align: 'right'
          },
          'disabled'
        ],
        pageSize: 5
      }
    })
    ```
 - `UFile` Component for fields of type Document. Features:
   - download file or (in case mime type is application/pdf or one on supported images) - show content in dialog
   - in case prop `previewMode: true` will show document content instead of link
 - `UFileInput` file input with drag and drop, but without preview - just for upload
 - `UFileCollection` Multi file upload to UB entity. Maps to collection in UB.Form constructor
 - `Form/processing|instance`: added param `entity` to collection instance.
    Can be used for example to get entity name for `setDocument` method from collection.
 
### Changed 
 - **BREAKING** removed `UDetailGrid`
 - `UDialog` now exports `errorReporter` and it available in vue instance as `$errorReporter`
 - `UContextMenu` - registered globally, can be used in template as `<u-context-menu>...` tag.
 
## [1.8.9] - 2019-11-18
### Fixed
 - added CSP for IIT sign agent (localhost:8081 & 8083)
 - error unlock auth cert2 form on error

## [1.8.7] - 2019-11-18
### Added
 - property `disabled` in `UUploadDocument`

 - New optional props `fixedItems` to `USelectMultiple` and `USelectCollection`, example:
```vue
<template>
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
    :fixed-items="fixedItems"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: [1,2,3],
        fixedItems: [2]
      }
    }
  }
</script>
```

 - New events `focus` and `blur` to `USelectMultiple`, `USelectCollection` and `USelectEntity`

### Fixed
 - Styles in `UFormRow`, `USelectMultiple`, and `USelectEntity`
 - `clickOutsideDropdown` directive in `USelectEntity` now works properly

## [1.8.6] - 2019-10-31
### Added 
 - set `entity.caption` as default form title if title is not defined at `*-fm.def`
 - Registration component for authentication form
 
### Changed
 - renamed `ShortcutIconSelect` control to `UIconPicker` and allow to use it in other UB projects
 - `UCodeMirror` control now can be set readOnly (disable user input) with passing readOnly prop
 
### Fixed
 - added missing `store` parameter in processing=>addCollectionItem method
 - `processing` module now does not pass readonly attributes in execParams

    
## [1.8.5] - 2019-10-18
### Fixed
 - desktop selector Z index increased to 100 to prevent displaying behind Ext form toolbar / grid captions  

## [1.8.4] - 2019-10-16
### Added
 - Navbar tab: middle mouse button click (mouse wheel click) on tab will close it
   
### Fixed
 - `DesktopSelector` close desktop drawer after click again on button
 - sidebar doesn't overlap text popups

## [1.8.3] - 2019-10-12
### Changed
 - change icon inside error popup to "!" because original element error icon is very similar to close button
  
## [1.8.2] - 2019-10-12
### Changed
 - redesign desktop selector in sidebar
 - added optional props `sidebarLogoURL` and `sidebarLogoBigURL` to `UB.connection.appConfig.uiSettings.adminUI` in ubConfig.json.
 `sidebarLogoBigURL` will be ignored if unset `sidebarLogoURL`. 
 Example usage: 
```json
"uiSettings": {
  "adminUI": {
    "sidebarLogoURL": "/models/ub-pub/img/sidebar-logo.svg",
    "sidebarLogoBigURL": "/models/ub-pub/img/sidebar-logo-big.svg"
  }
}
```
### Fixed
 - dynamically update shortcut in sidebar on change in `ubm_navshortcut` form
 - case field is collapsed if setting for `USelectMultiple` and `USelectMany` field is disabled
 - `USelect* components` error when value is exist in dictionary but not exist in current `:repository` request
 - `USelect* components` duplicate field in the query in case `valueAttribute` is set same value which in `descriptionAttribute`

### Added
 - `USelect* components` prop readonly
 - `UFormContainer` prop autofocus. Boolean. Is true by default.
 Example usage `<u-form-container :autofocus="false">`

## [1.8.1] - 2019-10-09
### Fixed
 - transformation of attributes of type `Date` (not DateTime) to format expected by server (time must be 00:00 in UTC0) inside `buildExecParams`

## [1.8.0] - 2019-10-07
### Changed
 - winXP (Chrome 48 / FireFox 52 / IE) support is removed, as a result
 boundle size reduced by 120Kb + code became faster  

## [1.7.2] - 2019-10-03
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
 - `USelect*` components, prop placeholder
 - css variable `--info-light`
 - `UForm/mount` i18n to title

## [1.7.1] - 2019-09-30
### Fixed
 - `UForm/processing` in case execParams includes locale params will replace the locale param with base param. For example in case userLang === 'en' and execParams includes key 'fullName_uk^' will replace key 'fullName' to 'fullName_en^'

## [1.7.0] - 2019-09-27
### Changed
 - update package `element-ui@2.12.0` and `element-theme-chalk@2.12.0`
 - production build now works on browsers for WinXP (Chrome 48/ FireFox 52). It's done by:
    - adding a core-js polyfills for missing things (+122 Kb boundle size) - see `.babelrc`
    - replacing DOMElement.append -> DOMElement.appendChild
    - remove object rest spread where possible
 - 1.7.x is the LAST version what supports WinXP. Polyfills **WILL BE REMOVED IN 1.8.0**  

## [1.6.41] - 2019-09-26
### Fixed
 - removed `async-to-promises` babel plugin - buggy

## [1.6.40] - 2019-09-26
### Fixed
 - added support for old Chrome browser what can run on WindowsXP by using `async-to-promises` babel plugin

## [1.6.39] - 2019-09-25
### Fixed
 - `instance` module `SET_DATA` mutation, fix bug when assign a value to JSON attribute, and there is `null` instead
   of a regular object value.  Assign an empty object in any scenario, when value is not already an object or when
   value is `null`.
 - `instance` module, comparison array to null or object to null now works without exceptions

## [1.6.38] - 2019-09-19
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

## [1.6.35] - 2019-09-17
### Added
 - basic support for `dataHistory` mixin: only creation of new rows. TODO - implement adding of a new row version

## [1.6.34] - 2019-09-17
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

## [1.6.33] - 2019-09-16
### Fixed
 - `Form/helpers/mergeStore` merge modules, plugins and strict in store config
 - Full Text Search widget will wrap text to search into "" in case it starts from **№** - fix [UBDF-9971]
 - `Refresh` action for new record: pass a new row ID to load method instead of instanceID what undefined.
 This fix error on refresh `Where item with condition "equal" must contains "value" or "values"` [UBDF-10109] 

## [1.6.32] - 2019-09-13
### Fixed
 - duplication of store data in tabs in case store config with actions is provided as object to `Form` with state as a function
 - **async function** declaration removed from code - it's not transpiled to ES5 & do not work on Chrome under Windows XP
 - `async function helpers.hookWrap` is removed (replaced by function.prototype.call where used)  

## [1.6.31] - 2019-09-12
### Fixed
 - duplication of store data in tabs in case store config is provided as object to `Form` with state as a function
 - `Form/validation` undefined store when custom validation is used

### Added
 - `SET` mutation is exposed by adminui-vue. It need when you use `computedVuex` in store module 
 - `USelectEntity`, `USelectMultiple` click outside dropdown
 - `clickOutside` util which listen click not one but several dom elements and call's hide callback only when click target is not equal any passed dom element 

### Changed
 - **BREAKING** - `UDetailGrid` rewritten, now only works on readonly

## [1.6.30] - 2019-09-11
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

## [1.6.29] - 2019-09-10
### Fixed
 - prevent browser autocomplete in fields inside `UFormContainer` by adding `autocomplete = 'off'`
 - `Form` the problem when store config didn't override instance and processing methods 

## [1.6.28] - 2019-09-09
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

## [1.6.27] - 2019-08-31
### Added
 - `Form.validation()` added param `validator` for creating custom validation. [Example](https://git-pub.intecracy.com/unitybase/ubjs/blob/87874ab1ce37e27240965d3fa998a40ebd3f8303/packages/adminui-vue/utils/Form/README.md#%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80-%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%BC%D0%BD%D0%BE%D0%B9-%D0%B2%D0%B0%D0%BB%D0%B8%D0%B4%D0%B0%D1%86%D0%B8%D0%B8)

## [1.6.26] - 2019-08-31
### Added
 - `UDetailGrid` component - shows data collection as a table view 

### Changed
 - update package `element-ui` **2.8.2 -> 2.11.1**

## [1.6.25] - 2019-08-31
### Fixed
 - In case vue form is mounted directly into another component it will be destroyed during destroying parent Ext or Vue component

### Added
 - `UToolbar` added prop `hideDefaultButton` which hide's default buttons

## [1.6.24] - 2019-08-19
### Changed
 - use new method `$App.generateTabId()` for tabId generation instead of hardcoded expression
   
## [1.6.23] - 2019-08-13
### Changed
 - element-ui & element-theme-chalk versions are frozen to 2.8.2 because of bugs (again) in element theme builder
 - **BREAKING** one-line function helpers.isExistAttr() is removed. Use `const schema = UB.connection.domain.get(entity); schema.attributes[attr]` instead 
 
### Fixed
 - show Registration URL on the login page independent of available auth methods
 - turn off silence kerberos login on the auth page works correctly - fix #64 

### Added 
 - VueJS based form now accept `target` in UForm constructor, and render form directly into this target. 
Target can be either id of html element or Ext component

## [1.6.21] - 2019-08-13
### Added
 - default authentication form (ub-auth.html) handle a `uiSettings.adminUI.registrationURL` parameter from config.
 In case parameter is empty or not exists (default) then registration link do not displayed on the authentication form. 
 Otherwise a link to the specified URL is displayed 
 
## [1.6.20] - 2019-08-10
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
    
## [1.6.19] - 2019-08-09
### Fixed
 - disable sidebar shortcut "Edit" popup menu item in case user don't have access to `ubm_navshortcut.update` [UBDF-9664]
 - sidebar item deletion fixed [UBDF-9652]

## [1.6.18] - 2019-07-31
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

## [1.6.17] - 2019-07-30
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
 
## [1.6.16] - 2019-07-24
### Fixed
 - placeholder translation for u-auto-field of Date/DateTime type ( #63 )
 - put moment in global even in case user language is `en`
 
### Changed
 - method `showValidationErrors` in `UB.view.BasePanel`. Now returns `entityCode.fieldCode` when fieldLabel is empty.  
 
## [1.6.14] - 2019-07-15
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

## [1.6.12] - 2019-07-02
### Fixed
 - translation of attributes inside Full Text Search widget snippets (FTS return attributes in lower case)
 - ub-auth login form: add more space between password field and "Login" button in case of http: to prevent overlap of
 login button by browser "not secure connection" warning  
 - Vue based user messages notification widget do not throw `ELS - access deny` error for non-privileged users

## [1.6.11] - 2019-07-02
### Fixed
 - fix exception `"UForm.instance()" should be called once` - occurred during opening of vue form (introduced in 1.6.10)

## [1.6.10] - 2019-06-27
### Fixed
 - moment usage fix: now `const moment = require('moment')` in underline models works as expected and 
 use `moment` instance already injected by adminui-vue
 - fix `can not read property style of undefined` in `Vue.prototype.$zIndex`  

## [1.6.8] - 2019-06-25
### Added
 - `Form->processing` added hooks:
   - beforeDelete
   - deleted
 - `Form->processing` if beforeDelete hook returns false, deleting will be canceled

## [1.6.7] - 2019-06-24
### Fixed
 - UBSelect* - set cursor to `pointer` in case `editable` prop is `false`
 
## [1.6.6] - 2019-06-24
### Fixed
 - limit error dialog width to 250px to prevent text output outside viewport for errors what appears on the right border

## [1.6.5] - 2019-06-20
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

## [1.6.4] - 2019-06-18
### Fixed
 - "Always use domain for login" checkbox should be visible in navbar User menu in case "Negotiate" auth is enabled for app [UBDF-9586]
 - `class UForm` fixed the problem when two identical forms have a common store state and replace each other's data
 - `class UForm` Now any method or state property of the UForm store can be overwritten by local form store
 - `u-select-enum` fixed disabled prop

### Changed
 - `u-sidebar` changed sidebar item height to auto, reduce padding's

## [1.6.3] - 2019-06-14
### Fixed
 - fix UFormContainer registration issue introduced in 1.6.2
 
## [1.6.2] - 2019-06-14
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

## [1.6.1] - 2019-06-12
### Fixed
 - `USidebar` - item text is now hidden if overflow exceeds 3 lines
 - `USidebar` - prevent work break inside menu

### Changed
 - VueJS form mount () will be called with additional config `rootComponent: exports.default`  


## [1.6.0] - 2019-06-12
### Changed
 - **BREAKING** refactor `formBoilerplate` to constructor `Form` [docs and examples](https://git-pub.intecracy.com/unitybase/ubjs/blob/11e529331f78313c4fd483e660ccad9a4e65a73f/packages/adminui-vue/utils/Form/README.md)
 - **BREAKING** `u-form` component renamed to `u-form-container`

## [1.5.6] - 2019-06-05
### Fixed
 - `USidebar` - if parent folder is not accessible due to RLS - skip shortcut
  
### Added
 - new event fired by Sidebar in case desktop is changed: `$App.fireEvent('portal:sidebar:desktopChanged', ID)`
 - `UNavbar` will handle new event `portal:navbar:prependSlot` - prepend some elements on the left of existed navbar slot elements
 - `UNavbar` will handle new event `portal:navbar:userButton:appendSlot` - insert some elements into user menu
 - Version item is added to the UNavbar user button menu. Application can define custom version number in uData `appVersion` key 

## [1.5.5] - 2019-05-29
### Changed
 - `u-code-mirror` - added shortcuts tooltip
 - `u-code-mirror` - added key bindings according old codeMirror 

## [1.5.3] - 2019-05-24
### Fixed
 - `processing` emit update grid and add loading status when dispatch 'deleteInstance'
 
### Added
 - added `u-select-multiple` component. Its multi-select for UB entity 
 - added `u-select-collection` component. Inherited from `u-select-multiple`. Component is responsible for display a collection of a details from master-detail relation inside a multiselect. Acts like a control for "Many" data type, but can be bound to any detailed entity 

### Changed
 - `u-select-entity` added 'clearable' option
 - rewritten `u-select-many`. Now this component inherited from `u-select-multiple` 

## [1.5.2] - 2019-05-21
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [1.5.1] - 2019-05-17
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

## [1.5.0] - 2019-05-15
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

## [1.4.1] - 2019-03-30
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

## [1.4.0] - 2019-03-21
### Changed
 - UbContext -> UContextMenu
 - UbCodeMirror -> UCodeMirror
 - UbInput -> UInput
 - All Vue components now will be initialized in `packages/adminui-vue/ub-components.js`

### Added
 - `throttle-debounce` micro package added. Exported by adminui-vue as throttleDebounce  
 - added `UFormRow` component. When you need to add label in right side of form item
 - added `UErrorWrap` component. Wrap any element and show error from prop under element 
  
## [1.3.3] - 2019-03-10
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
  
## [1.3.2] - 2019-03-05
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
 
## [1.3.1] - 2019-03-03
### Changed
 - update vue@2.6.7 -> 2.6.8
 - set fixed version of element-ui@2.5.4 because of theme bug in 2.6.x

### Fixed
 - move `normalize.css` to dependencies from devDependencies to allow use a `-dev` mode
 even if modules are installed with `NODE_ENV=production`
 - `dialogInfo` return false in case user close dialog without pressing "ok" button (regression)

## [1.3.0] - 2019-03-01
### Fixed
 - relogon form should not close on Esc

### Changed
 - **BREAKING** dialogs functions now return native Promise - without a legacy `.done` method.
 All occurrence of `.done` should be replaced to `.then()[.catch()]`
 - webpack4 is used for compile production mode
 - updated vue@2.6.6 -> vue@2.6.7
 - upgraded vue-loader@14.2.4 -> vue-loader@15.6.4

## [1.2.2] - 2019-02-24
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

## [1.2.0] - 2019-02-21
### Changed
 - `adminui-vue` model replace a top Ext-JS based navbar with navbar implemented using VueJS.
  See `components/navbar`
 - `adminui-vue` model replace Ext-JS based re-logon window with VueJS implementation.
  See `components/UbRelogon`

### Fixed
 - authorization form validation message localisation

## [1.1.0] - 2019-02-13
### Changed
 - vue updated 2.5.17 -> 2.6.6
 - element-ui updated 2.4.9 -> 2.5.4

## [1.0.44] - 2019-02-12
### Added
- watch for prop value changed in all controls
- open dialog with iFrame for pdf files in `UbUploadDocument`

## [1.0.43] - 2019-01-31
### Fixed
 - add missing "css" folder to the published package

## [1.0.40] - 2019-01-25
### Added
 - components folder is added to tarball for debugging purpose

## [1.0.34] - 2019-01-10
### Changed
 - hide `Forgot password?` and `Registration` on auth form when `Negotiate` enabled
 - add title to Localize Dialog in `UbInput`

### Fixed
 - fix popovers collapse on `UbSelectEntity` control
 - add styles for low resolution screens in `UbInput` Localizable Dialog

## [1.0.33] - 2018-12-04
### Changed
 - vue loader registration is moved form `adminui-vue` to `adminui-pub`

### Fixed
 - set `ub-auth` page title to the `uiSettings.adminUI.applicationTitle` just after got an application info

## [1.0.32] - 2018-11-29
### Fixed
 - error with hidden UB auth in case this is only one possible auth method

## [1.0.31] - 2018-11-19
### Changed
 - adminui-vue auth form will hide ub auth under `options` if Kerberos or CERT2 is enabled

## [1.0.27] - 2018-11-03
### Fixed
 - let's ElementUI popups be above all Ext popups by setting initial ElementUI.zIndex to 300000

### Changed
 - change webpack configuration to decrease bundle for production build (from 847Kb to 630Kb)
 
## [1.0.26] - 2018-10-29
### Added
 - vue based login now support `onNeedChangePassword` connection event and display the password change form to the user
 
### Changed
 - `element-ui` is upgraded to `2.4.9`   
 
## [1.0.16] - 2018-09-21
### Added
 - vue based login now support `CERT2` authentication (available in UB DE)

## [1.0.11] - 2018-08-26
### Changed
 - update element-ui to 2.4.5 (2.4.6 not theme is compiled)

## [1.0.9] - 2018-08-14
### Fixed
- theme will set ExtJS fieldset border radius to 4px

## [1.0.8] - 2018-08-01
### Fixed
- ub-auth.html: hide password on password input (type="password")

## [1.0.6] - 2018-07-28
### Added
- css for round ExtJS form fields border radius (as in ElementUI)

## [1.0.6] - 2018-07-28
### Added
- ability to load Vue single file components (*.vue) - see ``@unitybase/systemjs-plugin-vue-ub` readme for restrictions

### Changed
- default size of ElementUI components is set to to `small`

## [1.0.5] - 2018-07-23
### Fixed
- login window logo css fixed in way logo looks the same on adminui-vue and adminui login windhw
- add missing `views/ub-auth.html` to the package

## [1.0.3] - 2018-07-18
### Fixed
- use Vue version with compiler (vue/dist/vue.common.js) for both dev/prod build

## [1.0.2] - 2018-07-17
### Changed
- theme css `/dist/adminui-vue.css` will loaded by adminui-vue automatically (using require)
- theme CSS will not override a body font-size, so other modules can set his own (we recommend 14px)
