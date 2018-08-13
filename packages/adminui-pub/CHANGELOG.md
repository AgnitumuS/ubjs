# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.4.3]
### Changed
 - es6 syntax in code editors is enabled by default
  
## [5.4.2]
### Changed
 - remove unused Ext classes `Ext.direct.*; Ext.data.jsonp; Ext.form.action.DirectLoad; Ext.data.flash.BinaryXhr; Ext.flash.Component`

## [5.4.1]
### Fixed
- prevent SystemJS to override global window.onerror handler defined by ub-pub by removing `nonce-` rule from SystemJS config

## [5.4.0]
### Changed
- **BREAKING** more strict Content Security Policy header: script-src 'unsafe-inline' directive is removed in flavor of 'nonce-...'
- prevent redirect to custom login page in case of silenceKerberosLogin is true in localStorage
- use

### Fixed
- added property `$App.__scanService: UBNativeScanner`
- increase left panel desktop select height to 3rem for fit 2-line caption [UBDF-7808]
- #2 - refs to attributes of "many" type should not be displayed in Details for EntityGridPanel.
 As a side effect - entities without accessible `select` should not be displayed also.
- reload store for combobox before row edit on ubdetailgrid

## [5.3.4]
### Fixed
 - long terming bug with select/date control border disappears if page are scaled

## [5.3.3]
### Added
- ubdetailgrid with RowEditing plugin will fire "changeData" when user cancel editing

### Fixed
- login window logo css fixed in way logo looks the same on adminui-vue adn adminui login window

### Changed
- remove IE9 specific CSS selectors from UBGrayTheme
- remove invalid background images CSS selectors from UBGrayTheme

## [5.3.2]
### Fixed
- fix error 404 Not Found during request to /clientRequire/systemjs-hmr.
 systemjs-hmr is moved from devDependencies to dependencies section of package.json

## [5.3.1]
### Changed
- `tabsCountLimitExceeded` message type changed from error to information

### Fixed
- Issue #6 ALS screws up attributes by prevent calling of BasePanel.updateAls if record.resultAls is undefined

## [5.3.0]
### BREAKING
- `custom` (pure ExtJS) forms must export a entry point class name.
 
 For example if form `*-fm.def` contains `Ext.define("UBM.userSettings", ...` then line
 `exports.formDef = 'UBM.userSettings'` must be added to the beginning of file

- `custom` && `auto` forms definition are not parsed for `requires: [...]` && 'uses: [...]' sections.
 All required components must be loaded using direct `require('pathToComponentImplementation')` calls.

 For example if form `*-fm.def` contains section
 ```
 requires: ['UB.ux.designer.VisualDesigner']
 ```
 then VisualDesigner implementation must be required either in model initialization script or inside component file (recommended)
 ```
 require('@unitybase/adminui-pub/_src/app/ux/designer/VisualDesigner')
 ```

- forms caching is moved to the HTTP cache level, localStorage is not used anymore for form cache

### Added
 - Hot Module Replacements for forms (work only for client in `dev` mode).
 See [ub-hrm server](https://git-pub.intecracy.com/unitybase/ubjs/tree/v5.x/packages/hmr) for details

### Changed
- all forms are loading using SystemJS.import:
  - form definition can use `require('something')` and it will be parsed synchronously as expected
  - forms are cached on HTTP level (in case of reverse proxy). local storage based cache not used for cache forms anymore


## [5.2.1]
### Fixed
- skip destroying `tinymce` when it is not defined yet

### Added
- method `cmdCommand.showList` sets attribute value **description** as tabs caption

## [5.2.0]
### Fixed
- adminui-pub locales can be injected to environments what do not use ExtJS
- added add/remove class to required field label on change of allowBlank

### Changed
- UBGrayTheme now use font-size (14px) and font-family (Segoe UI) defined on body level
- all "bold" weights changed to 600 (more lighter)
- [normalize.css](https://github.com/necolas/normalize.css/) added
- Tab borders is set to `1 1 1 1`


## [5.1.4]
### Changed
- for a "required" attributes changed style to display the asterisk after delimiter, not before and align on the right side
- remove placeholder "fill value" for a "required" attributes
- "Add As" action renamed to "Copy". Glyph changed to `faCopy`
- max open tabs now 40 by default (can be changed back to 10 by `ubConfig.uiSettings.adminUI.maxMainWindowTabOpened: 10`)

## [5.1.3]
### Fixed
- remove displaying of "undefine" in UBDetailTree in minified version of adminUI

## [5.1.2]
### Changed
- unhandled errors now will be redirected to error reporter by `ub-pub`
- silence Kerberos login will be handled by `ub-pub`
- use new feature `ub-pub.setErrorReporter`

## [5.1.1]
### Fixed
- '@unitybase/ub-pub'.Repository (i.e. UB.Repository) will be defined inside `ub-pub` instead of `adminUI`

## [5.1.0]
### Changed
- Model public path initialization do not require creation of `/public/initModel.js` script.
 Instead `package.json` can contain section "browser" what point either to the model initialization script for browser

 In case model is a published module (placed in the node_modules folder) path should be relative to the `package.json`:

 ```package.json
 "browser": "./public/initModel.js"
 ```

 or for dev/prod scripts

 ```package.json
  "browser": {
    "dev": "./public/devEntryPoint.js"
    "prod": "./public/dist/modelBundle.js"
  }
 ```

 In case model is in `models` folder p[ath must be absolute
 ```package.json
   "browser": "/clientRequire/models/TST/initModel.js",
 ```


### Added
- $App.modelLoadedPromise promise added to indicate model public part is completely loaded
  In case model require asynchronous operation during loading it should add a chain to this promise.
  Next model will await chain resolving.

## [5.0.23]
### Changed
- adminUI left navbar:
 - arrow color changed to the same color as menu text
 - arrow style changed from fa-angle-left to fa-caret-right
 - increase padding (+4 px) between left arrow and workspace

### Fixed
-  set whereList property for ubcombobox when use row editing in ubdetailgrid

## [5.0.22]
### Fixed
- handle entity attribute readOnly property on adminUI as documented (regression)
- added support for `adminui.loginURL` parameter. If parameter is set, then all unauthorized users will be redirected to
  that page for authentication. Page itself should create a UBConnection with `allowSessionPersistent`
  and do a `UBConnection.connect()`. See login page example in [autotest app](https://git-pub.intecracy.com/unitybase/ubjs/blob/master/apps/autotest/inetPub/login.html)

### Changed
- add a red asterisk for required field's labels

## [5.0.21]
### Changed
- made metadata diagrams correlate with terms used in UML diagram
  - association (was "relation") - removed the diamond
  - added a whole new type of link "composition" - with diamong("cascadeDelete" is used to determine if link is "association" or "composition")
  - removed weird oval from start of "inheritance" link

## [5.0.19]
### Fixed
- package will expose 'file-saver' as SystemJS module to prevent double-loading

## [5.0.17]
### Fixed
- package will expose itself and 'lodash', 'bluebird-q' and '@unitybase/cs-shared'
 as SystemJS module to prevent double-loading

### Changed
- `adminui-pub` will inject all localization script at once using new `allLocales` endpoint.
Will speed up startup for applications with several models

## [5.0.15]
### Changed
- TinyMCE upgraded to 4.7.13

## [4.3.2]
## Fixed 
- ubdetailgrid does not load store on boxready event if forceDataLoad is true 
- ubboxselect erorr on getValue

## [4.2.56]
## Fixed 
 - in case value is empty during form refresh, `ubboxselet.value` will be set to null

## [4.2.56]
## Fixed 
- use custom fieldList for grid when choose "select From Dictionary" on ubcombobox for row editing grid
- in UBComboBox remove clearValue when call doSetValue 

### Added
- property BasePanel.formWasSaved. Becomes 'true' in case opened form was saved

## Changed
- removed execution of ubboxselect.setFocuse after store is loaded


## [4.2.54]
## Fixed 
 - prevent double downloading of document when clicking on document link
 - prevent opening of new tab browser when click on document link in the inserting mode
- `ubboxselect` can be used for attributes with dataType: Enum (will use this.valueField for data)


## [4.2.53]
## Fixed 
 - setValue in ubcobbobox on ubdetailgrid with rowEditing plugin if use 'Select from dictionary'
 - clear Value in ubcobbobox befor row edit on ubdetailgrid with rowEditing plugin
 - fix coping of line numbering for rowEditing ubdetailgrid

## [4.2.52]
### Fixed
- fix value serialization for attributes of type Many (BoxSelect, UBBoxSelect) - remove space inside CSV
- ubdetailgrid: fix bug on validateedit event for row row editing grid

## [4.2.49]
### Added
- new @cfg parameter for ubdetailgrid - `forceDataLoad`. If set to true will force grid 
 to create and load underline store even if grin is placed onto inactive tab

## [4.2.48]
### Added
- add line numbering for rowEditing ubdetailgrid

## Fixed 
- setValue() in ubcobbobox on ubdetailgrid with rowEditing plugin if use 'Select from dictionary' 
- clearValue() in ubcobbobox befor row edit on ubdetailgrid with rowEditing plugin
- entitygridpanel filters configuraion loading in case no filters is stored

## [4.2.45]
## Changed
- UBDocument.forceMIME is DEPRECATED and not handled anymore.
- UBApp.runShortcutCommand now can accept a shortcut code to run
```javascript
   $App.runShortcutCommand('tst_document')
   //or
   $App.runShortcutCommand(30000012312)
```
To use in ubm_navshortcut place this code to the `ubm_navshortcut.cmdCode` attribute:
```javascript
  {cmdType: 'showForm', formCode: function () { $App.runShortcutCommand('sia_docPayOrderOut') }}
```

## Fixed
- EntityGridPanel `Export to Excel` action now enabled even in standard edition,
 since `xlsx` module added to `adminui-pub` as chunk

## [4.2.45]
## Changed
- `ubm_navshortcut` not not load `cmdData` attribute during startup, because this is CLOB,
and fetching all CLOBS from table is very slow (at last for Oracle)

### Added
- Firing of BasePanel `beforeRefresh` event
- ubdetailgrid: set allowBlank=false for row editor fields in case allowNull===false in meta files
- ubcombobox: function getFieldValue - Get field value by name from fieldList
- set `hideTrigger: true` by default for auto generated componets for numeric attributes

## [4.2.44]
## Fixed
- set currency sign to '' for all languages to pass form validation for Currency attributes

## [4.2.43]
## Fixed
- fix "Change's history" action executed from entityGridPanel in case fieldList
 already contains mi_date[From|To] in extended format {name: 'mi_dateFrom', description: UB.i18n('mi_dateFrom')} 

### Changed
- in case entityGridPanel columns caption is empty set it to UB.i18n(attributeCode)
 Usable for translating mixin's attributes like `mi_date*` etc.

## Added
- translation for `mi_modifyDate` to global level of i18n    

## [4.2.41]
## Fixed
- errors associated with editing data in the grid
- errors associated with add new record from ubcombobox

## [4.2.40]
### Added
- new CSS class .iconPdf to display a PDF file icon
- BasePanel.aftersave event fired with with 2 parameters: `(me, result)`
 where `result` is a record state AFTER server side updating 

## [4.2.37]
### Added
  - `EntityGridPanled` can be configured to allow editing at a row level for a Grid 
  by setting `rowEditing: true` configuration property. Or in the showList or navigation shortcut:
  
  ```
  {
  	"cmdType": "showList",
	"cmpInitConfig": {"rowEditing": true},
  	"cmdData": {    
  	  "params": [
  	    {
  	      "entity": "tst_document",
  ```

## Fixed
  - prevent storing of `undefined` as a form value to localStore in case server is unavailable
   
## Changed
  - Editor for attributes mapped to Currency type changed from spin edit to edit 
  - display value for Currency type will be formated accoding to [Ext.util.Format.currency](http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.util.Format-method-currency)
   rules. Localization applied in `packages/adminui-pub/locale/lang-*.js`
 
 
## [4.2.35]
### Added
 - `BasePanel.on('manualsaving')` events added.
 Fires just after **USER** manually call `save` action (press save button or Ctrl+S shortcut)
 but **before** data passed to a server for update/insert.

## [4.2.34]
### Added
 - Developer can intercept data, returned from server as a result to select method, executed by BasePanel.
 
 To do this `BasePanel.on('recordloaded')` event handler now called with 2 parameters `(record, data)`, where 
 **record** is instance of Ext.data.Model for current form and **data** is a raw server result  
 
 - Developer can intercept data, passed by `BasePanel` to entity insert/update method 
 just before it's going to server by subscribe to `BasePanel.on('beforesave')` event.
 Event handler accept 2 parameters `(me: BasePanel, request: UBQL)`. Developer can modify `request` inside handler.    
  

## [4.2.33]
### Added

- UBBadge control, pulled and adopted code originally developed for "bpm" subsystem.

  Display an enum attribute as a badge on a form:

	```
	{attributeName: 'status', xtype: 'ub-badge'}
	```

  When need to use badge as a static label, not linked to attribute and / or enum,
  use configuration like the following:

	```
 	{
	  xtype: 'ub-badge',
	  itemId: 'overdueBadge',
	  text: UB.i18n('bpm_Task_overdue'),
	  invert: true,
	  cssClass: 'red'
	}
	```
   For this to work, an `initModel.js` file (there must be one for your model) shall contain the following initialization code:
 	```
 	UB.ux.UBBadge.setCssMap(
	  'MY_ENTITY_STATUS',
	  {
	    'pending': 'blue',
	    'in-progress': 'yellow',
	    'error': 'red',
	  },
 	  // Use invert style
	  true
 	)
	```
   To use it in grid:

	```
	initComponent: function () {
	  var myGridComponent = this.items[5] // reference to grid
	  var fieldList = UB.Utils.convertFieldListToExtended(myGridComponent.fieldList)
	  UB.ux.UBBadge.setupRenderer(fieldList, 'status', 'MY_ENTITY_STATUS')
	  this.callParent(arguments)
	},
	```


##  [4.2.29]
### Added
 - new BasePanel.postOnlySimpleAttributes property 
   
   If `true` form will post only values of modified attributes
   which do not contain a dot.
   
   Exapmle: in case def is
   ```
   items:[
     { attributeName: "nullDict_ID"},
     { attributeName: "nullDict_ID.code", readOnly: true},
     { attributeName: "nullDict_ID.caption", readOnly: true}
   ]
   ```
   
   Values of nullDict_ID.code &  nullDict_ID.caption will not be send to update/insert execParams

### Changed
 - Not-null attributes in the form builder now displayed as bold
 - `showForm` command will use a `ubm_form.caption` as a form caption (instead of description as in prev. version) 


##  [4.2.25]
### Added
 - Allow localizing application name on `adminUI` login form by specifying `applicationName` in `ubConfig` as an object with keys=locale instead of string. Thanks to Sergey.Severyn for contribution

##  [4.2.24]
### Added
 - Simple certificate authentication support in adminui. Password is not needed. The user name is extracted from the certificate or entered by the user.

### Changed
 - The ability to use different libraries for certificate authorization.

##  [4.2.22]
### Added
 - new `uiSettings.adminUI.favoriteCategoryCount` config property allow to set up to three favotite column (star) colors

### Fixed
 - Show unhandled Promise rejection messages in dialog box (replace when->es6-promise Promise polufill)

##  [4.2.20]
### Fixed
 - UB.ux.form.field.UBDateTime. Prevent exception when picker opened and button TAB pressed. [UB-1862]


##  [4.2.18]
### Added
 - Editors for OrgChart available in UB EE is moved into standard edition (this package)
 - Add `.x-grid-row-bold` css class for mark grid rows as **bold**
 - Add property `UB.view.ColumnFavorites.allowedCategoryCount` for configure allowed values count in favorite column.

###Fixed
- fix bag in cyclical opening of modal forms.(`org_staffunit` -> `org_employeeinstaff` -> `org_staffunit`)

##  [4.2.17]
### Fixed
- allow UBComboBox.setValueById to use `valueField` instead of hardcoded 'ID'
- "Remember me" feature for Negotiate authentication now don't hung a app
- "unable to change password at first logon" issue fixed 

## [4.2.15]
### Added

### Fixed
-  prevent open the same command in separate tabs in case it's opened from left or top menu
-  set `UBStore.loading = true` in method **UBStore.reload** before call **UBStore.clearCache()**.

### Changed
- enum combobox now sort enum captions by `orderNum` attribute (instead of name)
- remove ER diagram background image (not background is white )
- ignore attributes with property `defaultView: false` for automatically generated forms

## [4.2.13]
### Added

### Fixed
- UBReportEditor now draw a dashed border around sections (both paragraph and table row)

## [4.2.12]
### Added
- AdminUI: In case of first login attempt LoginWindow will activate a tab for a first auth method from server config `security.authenticationMethods` array

### Fixed
- fix systemjs version to `0.20.10-scoped` - pathced vwrsion what allow scoped modules loading without map configuration

## [4.2.11]
### Added
- UBBoxSelect now accept ubRequest as a config parameter (for store creation)
- UBReportEditor can insert image from file (Insert -> Image -> click on button with photo)
- UBReportEditor added build-in image editor (click on image to actiate)

### Fixed
- since form definitian now evaluated only once (HMR) both `EntityGridPanel` & `ubdetailgrid` now accept `customActionas` as a Ext.Action config (not a class instance)
