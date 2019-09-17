#  Package ub-server@5.14.2->5.15.2
### Added:
 - new global function `nhmac_sha1` adedd (temporary - the goal is to implement it inside crypto in future)
 - `TubModel.packageJSON` property adedd - a string content of model package.json file;
 extended domain info return it to client side
 - server will verify what entity scope object contains a function `methodName` for each method added by `entity.addMethod(methodName)`.
  This prevent runtime exception `undefined is not a function` during call to `DataStore.run(methodName)` in case methodName implementation is not exist
 - new option `strictSSL` for `http.request` - if false (as before patch) https will ignore SSL certificate errors (**INSECURE!**).
 We strongly recommend to set it to `true` for getting sensitive data from remote resources
### Changed:
 - auto-generated attribute for reverse link from entity to unique association is
  marked as `allowNull: true` and `defaultView: false`
 - UBLDAP auth schema use [libcurl](https://curl.haxx.se/) for LDAP query;
 ubConfig `ldapCatalogs` configuration parameters is changed - see ubConfig schema for details.
 Config example:
```
"security": {
    "authenticationMethods": [
      "UB", "UBLDAP"//, "Negotiate"
    ],
    "ldapCatalogs": [{
        "name": "MYCOMPANY",
        "URL":  "ldaps://mycompany.main:636/OU=MyCompany,DC=mycompany,DC=main?cn?sub?(sAMAccountName=%)",
        "CAPath": "",
        "ignoreSSLCertificateErrors": false
      }
    ]
```
 - maximum number of allowed query parameter is insreased from 98 to 198
 - huge refactoring of internal access to the ExecParams in all native mixins.
 Increase code readability and speed up server a little
 - linux (deb, rpm) build now use libsynmozjs.so from the ub executable folder and shared libnspr4
 - rpm package dependencies (libcurl, libnspr) added
 - property `TubDataStore.lastError` is removed (not used)
 - remove logging of SQL query parameters for uba_auditTrail insertion. Ths will decrease a log size 
 up to 15% without losing important information
 - remove duplicate logging of fetchewd row count for Oracle SQL driver
 - changes CERT2 auth for EE version (no changes to SE)
### Fixed:
 - deletion will work correctly for entities with `tree` mixin: this fix 
  issue `Parameter "ID" is required for method "delete"` introduced in 5.14.6
 - ORM will generate expression `mi_deleteDate >= #maxdate` instead of `mi_deleteDate = #maxdate` to select a non deleted rows;
   This force a RDBMS query optimizer to not use index over mi_deleteDate columnus for value #maxdate;
   This hack is required because usually 90% of values for mi_deleteDate column === #maxdate and using index is equal to table full scan
 - inside server logic `TubDataStore.lockResult` contains a stringified lock result after call to `lock` methood of softLock mixin (instead of null)
   This fix WebDav locking problem for @ub-e/web-dav model

#  Package cs-shared@5.1.5->5.1.7
### Added:
 - extended property UBDomain.UBModel.packageJSON added to the extended domain; Property value is parsed model `package.json`  

#  Package ub-pub@5.3.10->5.3.15
### Added:
 - new localStorage key **UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD** added to prevent logout in case user open document
 using Document URI Schema (WebDav). Before call to document.location.href = 'ms-word....' developer must set this key value
 to `"true"` to prevent ub-pub to call $App.logout inside `document.onbeforeunload` handler 
### Changed:
 - silenceKerberosLogin support is removed from AsyncConnection and moved into @unitybase/adminui-pub;
  This is responsibility of UI to analyse localStorage key and resolve requestAuthParams promise to Negotiate algorithm  
 - Domain-based localization logic allows get localized entity or entity attribute not just caption, but also description and documentation.
   In order to do so, use hash tag suffix and `description` or `documentation`, for example:
   - `UB.i18n('uba_user.name#description')`
   - `UB.i18n('uba_audit#documentation')`
   
### Fixed:
 - do not lost params in AsyncConnection.stringifyExecParamsValues (introduced by premature optimization in 5.3.12) 
 - AsyncConnection methods `runTrans` and `runTransAsObject` now stringify execParams for `insert` and `update` methods,
 just like single `insert`, `update`. This fixes problems with saving JSON attributes and overall,
 make connection object methods more consistent

#  Package uba@5.2.2->5.3.0
### Added:
 - TOTP (Google Authenticator) One Time Password generation and verification methods added into uba_otp
 - Auditing rights provided to Supervisor role
### Changed:
 - HTTP request headers logged into `uba_audit` during user logon now truncated to 512 characters   
 - `uba_usercertificates.serial` attribute is marked as unique    
### Fixed:
  - removes the hardcoded check for "accountAdmins" group inside changePassword endpoint.
  To change password for other used new method `uba_user.changeOtherUserPassword` is added. 
  Supervisor role is allowed to call it.
 - added ELS rule for Supervisor to allow reading roles (uba_role;select;A)

#  Package pdf@5.0.20->5.0.22
### Fixed:
 - invalid PDF file format in case `ArialBoldItalic` font is used

#  Package ubcli@5.3.30->5.3.41
### Added:
 - `ubcli generateDoc` will add's API methods available for entities; HTML output is formatted using bootstrap  
### Changed:
 - speed up command `ubcli checkStoreIntegrity` by removing `attribute not null` expression from SQL and 
 check attachment is exist in JS
### Fixed:
 - Oracle DDl generator - do not wrap enum group into quotes when update a value for enum column with `not null`
   
 - DDL generator will correctly add a JSON columns with `allowNull: false` and without default value;
 For such case estimated value for updating existed rows is set to `{}`
 - DDL generator: in case database connection does not contains entities for DDL generation (all entities is marked as External for example)
 ubcli generateDDL will skip loading of DB metadata for such connections.
 This fix issue for read-only Oracle connections in which DDL generator try to create a stored procedure and speed up generation for other RDBMS    

#  Package base@5.1.18->5.1.23
### Changed:
 - `csv` module: reformatting & fix ESLint warnings  

#  Package org@5.2.0->5.2.8
### Fixed:
 - allow to update org_employeeonstaff when parent org unit is not visible on the current date (for example department is closed)  

#  Package ub@5.2.24->5.2.32
### Added:
 - `uiSettings.adminUI.registrationURL` parameter.
 In case parameter is empty or not exists (default) then registration link do not displayed on the default
 authentication form (@unitybase/adminui-vue/views/ub-auth.html). Otherwise a link to the specified URL is displayed
### Changed:
 - for UB server >= 5.15 UBLDAP auth schema use [libcurl](https://curl.haxx.se/) for LDAP query;
 ubConfig `ldapCatalogs` configuration parameters is changed - see ubConfig schema for details. Example config:
```
"security": {
    "authenticationMethods": [
      "UB", "UBLDAP"//, "Negotiate"
    ],
    "ldapCatalogs": [{
        "name": "MYCOMPANY",
        "URL":  "ldaps://mycompany.main:636/OU=MyCompany,DC=mycompany,DC=main?cn?sub?(sAMAccountName=%)",
        "CAPath": "",
        "ignoreSSLCertificateErrors": false
      }
    ]
```  
 - explicitly disable audit for system entity ub_blobHistory 

#  Package cdn@5.2.0->5.3.0
### Added:
 - cdn_classifier & cdn_classifierType - entities that provide ability to user to classify some entity in many ways, this is like user defined expandable dictionaries
 - cdn_language - list of languages according to ISO-639-1
### Changed:
 - cdn_currency.name size to 65 and cdn_currency.description size to 128
 - initial data locale for cdn_citytype & cdn_country entities changed to english
 - initial data for cdn_region loaded only for `uk` locale  

#  Package xlsx@5.0.45->5.1.0
### Fixed:
 - export to excel works without `Cannot read property 'length' of null` exception

#  Package adminui-vue@1.6.18->1.6.33
### Added:
 - `SET` mutation is exposed by adminui-vue. It need when you use `computedVuex` in store module 
 - `USelectEntity`, `USelectMultiple` click outside dropdown
 - `clickOutside` util which listen click not one but several dom elements and call's hide callback only when click target is not equal any passed dom element 
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
 - `Form.validation()` added param `validator` for creating custom validation. [Example](https://git-pub.intecracy.com/unitybase/ubjs/blob/87874ab1ce37e27240965d3fa998a40ebd3f8303/packages/adminui-vue/utils/Form/README.md#%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80-%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%BC%D0%BD%D0%BE%D0%B9-%D0%B2%D0%B0%D0%BB%D0%B8%D0%B4%D0%B0%D1%86%D0%B8%D0%B8)
 - `UDetailGrid` component - shows data collection as a table view 
 - `UToolbar` added prop `hideDefaultButton` which hide's default buttons
 - VueJS based form now accept `target` in UForm constructor, and render form directly into this target. 
Target can be either id of html element or Ext component
 - default authentication form (ub-auth.html) handle a `uiSettings.adminUI.registrationURL` parameter from config.
 In case parameter is empty or not exists (default) then registration link do not displayed on the authentication form. 
 Otherwise a link to the specified URL is displayed 
 - expose `clickoutside` directive from ElementUI. `hideDropdown` in code below will be called
 in case user click outside the div: 
```vue
<div v-clickoutside="hideDropdown"></div>
```
### Changed:
 - **BREAKING** - `UDetailGrid` rewritten, now only works on readonly
 - update package `element-ui` **2.8.2 -> 2.11.1**
 - use new method `$App.generateTabId()` for tabId generation instead of hardcoded expression
   
 - element-ui & element-theme-chalk versions are frozen to 2.8.2 because of bugs (again) in element theme builder
 - **BREAKING** one-line function helpers.isExistAttr() is removed. Use `const schema = UB.connection.domain.get(entity); schema.attributes[attr]` instead 
### Fixed:
 - `Form/helpers/mergeStore` merge modules, plugins and strict in store config
 - Full Text Search widget will wrap text to search into "" in case it starts from **№** - fix [UBDF-9971]
 - `Refresh` action for new record: pass a new row ID to load method instead of instanceID what undefined.
 This fix error on refresh `Where item with condition "equal" must contains "value" or "values"` [UBDF-10109] 
 - duplication of store data in tabs in case store config with actions is provided as object to `Form` with state as a function
 - **async function** declaration removed from code - it's not transpiled to ES5 & do not work on Chrome under Windows XP
 - `async function helpers.hookWrap` is removed (replaced by function.prototype.call where used)  
 - duplication of store data in tabs in case store config is provided as object to `Form` with state as a function
 - `Form/validation` undefined store when custom validation is used
 - prevent creation of empty Form life-circle hook functions (optimization)  
 - prevent call 'lock' method for new entity instances with softLock mixin (should be called only for existed instances) 
 - prevent browser autocomplete in fields inside `UFormContainer` by adding `autocomplete = 'off'`
 - `Form` the problem when store config didn't override instance and processing methods 
 - In case vue form is mounted directly into another component it will be destroyed during destroying parent Ext or Vue component
 - show Registration URL on the login page independent of available auth methods
 - turn off silence kerberos login on the auth page works correctly - fix #64 
 - prevent adding `document.body.onclick` handle for every `u-select-entity`/`u-select-multiple` by using `clickoutside` directive instead. Fix #65 as side effect
 - `USelectMultiple` allow to select option by clicking not only on item caption but also on checkbox
 - `Save` button in multi language dialog for input renamed to `apply` + localization added
 - the form with multi lang fields still remains dirty after saving ( fix #67 )
    
 - disable sidebar shortcut "Edit" popup menu item in case user don't have access to `ubm_navshortcut.update` [UBDF-9664]
 - sidebar item deletion fixed [UBDF-9652]

#  Package adminui-pub@5.10.5->5.10.20
### Added:
 - new configuration parameter `adminUI.pdfViewer.customURI`. If defined then specified URL expected to be an html page URL
 what can be loaded inside iframe and display a PDF. Inside URL following placeholders can be used:
   - {0}: will be replaced by encodeURIComponent(blobUrl);
   - {1} - user language;
   - {2} - instanceID
   
 Examples:
   - PDFJs viewer: `/clientRequire/@docflow/doc/public/node_modules/pdfjs/web/viewer.html?file={0}#locale={1}`
   - PDF with annotations: `/clientRequire/@docflow/pdf-annotate/dist/index.html?file={0}&docID={2}#locale={1}`
 - new method `$App.generateTabId()` for tabId generation
 - $App.generateTabId() will include a formCode into tabId - this allow to open several different forms for the same instance
    
 - in case localStorage key UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD is set to `"true"` `document.onbeforeunload` handler
 don't call `$App.logout`. This solve unexpected logout in case document opened using WebDav
   
 - new localization key `apply`
### Changed:
 - set default value [] for EntityGridPanel.hideActions; prevent override it by `undefined` in UBCommand
 - for entities with `softLock` mixin BasePanel will send a single select request with `lockType: 'None'` instead of
 two request - one for select and one for `isLocked`. UB server >= 5.14.0 correctly handle `lockType: 'None'` requests.  
  - introduced lazy data loading for `UBDetailTree` in case it is placed onto inactive tab (as `UBDetailGrid`).
  `UBDetailTree.forceDataLoad` must be set to ** true ** to load data immediately. 
### Fixed:
 - in case `uiSettings.adminUI.pdfViewer` is not defined do not add a `undefined` to the end of PDF viewer URL
   
 - tinymce version fixed to 4.9.5. In version 4.9.6 there is a problem `tinymce detected as amd but didn't execute correctly`
 - silenceKerberosLogin now handled by adminui-pub instead of AsyncConnection. This fix [UBDF-9903] && #64
 - allow to call `EntityGridPanel.doShowDetail` for instances of EntityGridPanel with stateId and title `undefined` 
 - if `formCode` passed to `$App.doCommand` is a function then tabId algorithm will use word 'func', instead of function source code
  - loading the `ubDetailGrid`, which refers to the empty "masterField" value. (For example, when opening a form to create a new record)
