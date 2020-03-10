#  Package ub-server@5.16.1->5.18.0
### Added:
 - server can return result of a single ubql in CSV or HTML format (in addition to MS Rowset and ODS) depending on Content-Type request header value
```
const contentType = 'text/html; charset=UTF-8' // result will be HTML table
// const contentType = 'text/csv; charset=UTF-8' // result will be tab separater CSV
// const contentType = 'application/vnd.oasis.opendocument.spreadsheet' // result will be LibreOffice spreadsheet (Excel)
// const contentType = 'text/xml; charset=UTF-8' // result will be in 'schemas-microsoft-com:rowset' XML format (ADODB.Recodrset)
connection.xhr({
  method: 'POST',
  url: 'ubql',
  data: [repo.ubql()],
  responseType: 'blob',
  headers: { 'Content-Type': contentType }
}).then(res => {
  window.saveAs(res.data, `${this.entityName}.${resultFileExtension}`)
```
 - new property `sessionBinding.zone` - security zone for UB EE. Empty for SE
 - global function `nhmac_sha256(secret, data)`
 - `App.endpointContext` - an object what can be used to cache some data for a single endpoint execution. Server will reset it to  {} after endpoint finished (or throw)
 - redisClient binding (alpha): added reconnection timeout and cleanup after connection errors 
 - Buffer.cpFrom(str, encoding) - convert a string to specified encoding
 ```
  const buf = Buffer.cpFrom('Привет!', 1251)
  console.log(buf) // <Buffer cf f0 e8 e2 e5 f2 21>
 ```
 - support for `uba_auditTrail.actionUserName` - if attribute `actionUserName` is available in uba_auditTrail it will be filled by `Session.userName` value
 - patch: CI package stage devided onto 2 part: for tagged builds artifacts will be stored for 1 year,
  for non tagged (dev) builds - for one week
 - Session.setUser will accept 3-d parameter `persist`.
   If true (default) session is persisted to sessionManager, else session lifetime is limited to current request lifetime
 - new method `App.grantEndpointToRole(endpointName, roleCode)` - programmatically grant endpoint permission to specified role;
   Resulting roles list will be == uba_role.allowedAppMethods union grantedRoles
 - CI package stage devided onto 2 part: for tagged builds artifacts will be stored for 1 year,
  for non tagged (dev) builds - for one week
 - database connection passwords inside application config can be encrypted using
  `ub --protect passwordInPlainText`. The same user should be used for secret generation and service execution.
  Currently implemented only for Windows with DPAPI.
### Changed:
 - SpiderMonkey JavaScript engine moved into libsynsm.so / synsm.dll (statically linked)
 - Negotiate (both Kerberos and NTLM) authentication will use random secret instead of user name for signing session.
  Secret key is generated inside server process `/auth` endpoint during 2-nd negotiation stage and returned in `X-UB-Nonce` header value to client.
 - warnings for ELS rules what does not match any method are:
    - grouped up to 3Kb string instead output one-by-one
    - appears only in dev mode
 - x10 speed up of ELS rules initialization (for domain with 900 entities and 8000 rules old time ~5 sec, new ~0.7 sec)
 - ALS mixin internal optimization (prevent unnecessary initialization of ALS data for insert/update for entities w/o ALS)
 - improve `getDomainInfo` endpoint performance from 1% up to 10% for apps with big domains by cache a rolesByIndex result
 - improve `Domain.byName` performance by using binary search instead of linear
 - in case http URI starts from default endpoint name (`statics` if not overrided) req.uri will drop endpoint name (as for all other endpoint)
```
  http GET http://localhost/statics/some/file.html
  console.log(req.uri) // == some/file.html; before patch == statics/some/file.htm
```
 - JS garbage collection will try to run automatically after every 6Mb memory allocation (before patch - after 100Mb);
   This helps to decrease overall server memory usage and increase stability for long running functions;
   Practically speed penalty is very small after such changes.
  - **BREAKING** web socket support using HTTP.SYS WebSocket API under windows is removed from server codebase. RabbitMQ integration should be used instead
  - user session management is rewritten from ground to prevent lock inside `auth` endpoint and allow to store sessions
    in the external storage (redis for a while. Not finished yet)
  - session ID is generated randomly (cryptography strong random)
  - under Unix default memory manager is libtbbmalloc (libtbb2 on Ubuntu, tbb on CentOS)
 - UB 1.12 SQL builder compatibility:
   - allow to mix * with field names in fieldList like `.attr('*', 'userID.name')` for
     server-side UBQL only and ONLY in case * is a first item in fieldList
   - we strongly reccoment to not use `*` at all
 - docker image for CentOS will inherits from CentOS7 (there is no Postgre10 client for CentOS8 yet)
 - CI for deploying server to unitybase.info will work for tagged commits
 - internal optimizations of SQL Builder (no functional changes)
### Removed:
 - `javascript.timeout` config property is removed
### Fixed:
 - SQLite3 database: prevent self-circling of 'tree' mixin in case of parentID recursion (all other supported RDBMS already catch such error)
 - FTS: prevent AV in case FTS connection advSettings configured to use steamer but `stem=no` parameter added `Tokenizer=stemka,TokenizerParams=\"stem=no\"`;
  In such cases better to not use tokenizer at all.
 - JS debugger: script line numeration should starts from 1 - this fix 1-line up shift while debugging
 - `Session.setUser(uID, secret)` will create persisted session (as expected by prev. UB versions) instead on one-time session
 - prevent hard deletion of `Many` attribute values in case `entity.mixins.mStorage.safeDelete: true`
 - JavaScript do not create a separate GC thread for each worker thread, automatic GC now executed inside the worker thread. This increase server stability and resources usage
 - each native object (TubList, TubDataStore etc.) now take 2*sizeof(pointer) less memory. This decrease a stack usage and therefore increase a possible nested calls depth
 - `App.dbStartTransaction(..)` will internally call `Connect` in case connection is not opened yet
 - prevent exception in case `totalRequired` is true in UBQL and query contains {master} macro
 - prevent possible session timeout renew for requests with valid sessionID but invalid signatures

#  Package compressors@5.1.3->5.1.24
### Fixed:
 - linux build: links to valid `libsynmozjs52.so`
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json

#  Package cs-shared@5.1.11->5.1.15
### Added:
 - new private method `CustomRepository.fromUbql` - used in UB.Repository() constructor to create Repository from UBQL
 - `Repository.withTotal` can accept optional boolean parameter. If `false` total requirements will be removed from repository
 - `Repository.limit(rowsLimit)` will remove limit in case rowsLimit === 0   
 - new method `CustomRepository.clearWhereList` - remove all where conditions from Repository.
 Should be used instead of direct access to the private CustomRepository.whereList property   
### Changed:
 - in case expression passed to `Repository.orderBy` already exists in order list it direction will be changed;
 Before this patch the same order expression was added that led to errors with duplicates in `order by`
    

#  Package ub-pub@5.3.24->5.4.4
### Added:
 - `UB.Reposiroty` fabric function can now accept a UBQL passed in parameter as object while keeping an ability
 to pass entity code as string
 ``` 
   // serialize Repository into plain java script object (UBQL)
   const ubql = UB.Repository('my_entity').attrs('ID').where('code', '=', 'a').ubql()
   // restore Repository from (UBQL)
   let repo = UB.Repository(ubql)
 ```
  - new connection function AsyncConnection.prototype.HMAC_SHA256(secret, data)
  ```javascript
  const shaHmacAsSting = UB.connection.HMAC_SHA256('secretKey', 'data for HMAC_SHA256 calculation').toString()
  // shaHmacAsSting === 'aaa4c3a6d3a8c25cd32f366436af191ac83bc43d8655c15305877afd0975a2bc'
  ```
 - service function `UB.file2Uint8Array`:
 ```
  let f = document.getElementById('inputOfTypeFile').files[0]
  ui8Arr = await UB.file2Uint8Array(f)
 ```
 - definition for SignatureValidationResult
 - definition for UbPkiInterface
 - Add translation for authentication form
### Changed:
 - Negotiate auth schema security improved: use secret returned form `/auth` in `X-UB-Nonce` header to complete Negotiate authentication;
  UB server must be upgraded to at last 5.17.9  
 - remove usage of lodash from inside `UB.format` && `UB.i18n`
 - for nodeJS environment monkey request detection is disabled
### Removed:
- `AsyncConnection.authHandshakeCERT` & `authHandshakeCERT2` are **REMOVED**.
   Instead `AsyncConnection.pki()` will return `UbPkiInterface` universal interface for PKI operations
### Fixed:
 - `AsyncConnection.logout` will close loaded private key if any
 - `AsyncConnection.userLang` will return application default language in case user is not authorised yet (anonymous)
 but appInfo is obtained
 - native messages warning texts english grammar
 - fix of feature of i18n function to translate its arguments for server running in production mode
 - Correct translation crypto
 - `AsyncConnection` converted `null` to `"null"` in execParams in some cases
 - global exception interceptor will ignore all exceptions what starts with `ResizeObserver`. Known are:
   - ResizeObserver loop completed with undelivered notifications
   - ResizeObserver loop limit exceeded

#  Package ubq@5.2.36->5.2.70
### Changed:
 - rewrote `010_create_UBQ_navshortcuts.js` config for rendering ubq forms on vue
### Fixed:
 - scheduler worker will reuse a single http.request object instead of creation new one for each task execution command;
 Under linux http.request creation can take up to 1ms
  - optimized ubq_messages.addqueue:
    - remove `fieldList` form insertion to prevent select after insert
    - use global DataStore('uba_messages') instance instead of call to UB.DataStore for each method call   

#  Package uba@5.3.9->5.3.25
### Added:
 - icon for administrator desktop
 - description for administrator desktop (+localization)
 - new attribute `uba_auditTrail.actionUserName`
### Changed:
 - rewrote `010_create_navshortcuts.js` config for rendering uba forms on vue
  - `uba_auditTrail.actionUser` attribute data type is changed form `Entity->uba_user` to `ID`.
  This prevents DDL generator from creating a check constraint to uba_user table and  allow to
  move uba_auditTrail to other Database by overriding a `uba_auditTrail.connectionName` (applicable for huge audits) 
### Fixed:
 - `uba_user-changeUserPassword`: added a separate method for changing own and someone else's password
 - ALS edit form: fix broken layout for table with pinned header/column by replacing render component from `ElTable` to `UTable`
 - prevent bug when inserting a new role at the multilingual instance
 - increased the size of `uba_subject.name` attribute to 256 characters, for compatibility with a `uba_role.description`

#  Package ubs@5.2.45->5.2.68
### Changed:
 - rewrote `020_create_UBS_navshortcuts.js` config for rendering ubs forms on vue
 - `@unitybase/pdf` && `@unitybase/xslx` packages are moved into "peerDependencies" - "optionalDependencies" handled by 
  lerna in the same way as "dependencies"
 - `@unitybase/pdf` && `@unitybase/xslx` packages are moved into "optionalDependencies" package/.json section.
 This prevent `lerna` from publishing `@unitybase/ubs` and all their dependencies each time pdf or xlsx changed
 - Report names are localizable now - "Click sample" report is an example
### Fixed:
- `@unitybase/pdf` && `@unitybase/xslx` packages are moved back into "dependencies" - neither "peerDependencies" nor
 "optionalDependencies" not works as expected for initial `lerna bootstrap` 

#  Package pdf@5.0.22->5.0.28
### Fixed:
 - long text box now correctly spilled onto more when 2 pages (PDFtextBox)
 - PDFtextBox with textIndent incorrect split on page
 - invalid size of text-indent attribute in htmlToPDF transformation 

#  Package ubcli@5.3.42->5.4.13
### Added:
 - `ubcli linkStatic` can generate cmd script if executed under Windows
 - new command `ubcli linkStatic`: creating folder with all static assets (models, modules) what should be available
   for client using `/clientRequire` and `/models` endpoints. Such folder can be served by nginx as a static folder.
   See tutorial [Serving static assets by nginx](https://unitybase.info/api/server-v5/tutorial-reverse_proxy_nginx.html#serving-static-assets-by-nginx)
   for details
 - `npx ubcli generateNginxCfg` will add a location `/statics` what points to `httpServer.inetPub` folder
 - `npx ubcli generateNginxCfg` will add a locations `/clientRequire` and `/models` to nginx config
   in case reverseProxy.serveStatic is true (default)  
   
### Changed:
 - `ubcli generateNginxCfg` will force adding redirect 80 -> 443 in case external URL is https
### Fixed:
- DDL generation for PostgreSQL 12 and UP; DDL generator now use `pg_get_constraintdef(oid)` for getting check constraints instead of obsolette `pg_constraint.consrc`
 - `ubcli generateNginxCfg` will always use `/` in staticRoot locations path independently of platform
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json

#  Package base@5.1.29->5.1.40
### Added:
  - `SyncConnection.prototype.Reposiroty` fabric function can now accept a UBQL passed in parameter as object while
  keeping an ability to pass entity code as string
   
    
 - argv.getServerConfiguration() will resolve a httpServer.inetPub location to absolute path
### Fixed:
 - prevent an error in `dataLoader.localizeEntity` when running initialization scripts on entities with `softLock` mixin

#  Package mailer@5.1.0->5.1.23
### Added:
 - optional `contentID` attribute for e-mail attachment. If contentID is defined for attachment it can be used in mail body
   for example to display embedded image as such:
   ```javascript
    const contentID = 'ub-generated-image-1'
    //inside e-mail body
    const eMailBody = `<img id="footer-logo" src="cid:${contentID}" alt="UB logo" title="UB logo" width="36" height="36" class="image_fix">`
   ```
### Fixed:
 - linux build: links to valid `libsynmozjs52.so`
 - force mailer instance to be destroyed by JS engine in the same thread it's created (JSCLASS_FOREGROUND_FINALIZE)
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json

#  Package org@5.2.17->5.2.49
### Added:
  - description for 'Org. structure' desktop (+localization)
  - synchronization of the org_employee's fullFIO attribute into uba_user fullName (in case employee is assigned to some user)
  - Entity `org_execgroup`, which is a part of organizational structure, is `unitType` is `EXECGROUP`.
    The detail entity `org_execgroupmember` contains its members, which are `org_staffunit`.
    Business value of this entity is ability to use a group of staff units at once, for example for task assignment,
    like parallel approvals.
    Added a navigational menu item for this dictionary in `org_desktop`.
### Changed:
 - renamed caption of sextype from 'Sex' to 'Gender' 
 - all fullName* attributes sizes increased to 500 for `org_department`, `org_organization`
 - all name* attributes sizes increased to 256 for `org_department`, `org_organization`
 - rewrote `010_create_navshortcuts.js` config for rendering org forms on vue
 - all fullName* attributes sizes increased to 500 for `org_department`, `org_organization`
 - all name* attributes sizes increased to 256 for `org_department`, `org_organization`
### Fixed:
 - synchronization of the `org_employee` into `uba_user` in case org_employee.userID is null
  - synchronization of the `org_employee` into `uba_user` on insert operation
  - a typo in English enum name: "Staffunit" => "Staff unit"
  - synchronization of the `org_employee` fullFIO attribute into `uba_user` fullName (in case employee is assigned to some user):
    - actually checked if employee is assigned to some user to prevent bug
    - sync not only fullFIO, but firstName and lastName
    - do not load data not present in execParams, get it from `selectBefureUpdate` dataset
    - do not do sync, if any of name attributes present in execParams
  - synchronization of the `cdn_contact` to `uba_user` email, fixes:
    - was incorrect check for contact type

#  Package ub@5.2.37->5.3.12
### Added:
 - new property `Session.zone: string` - security zone. Always empty for SE
 - new server config parameters `security.zones` and `security.zonesAuthenticationMethods` (UB EE. Ignored in UB SE)
 - `getAppInfo` endpoint wil return `authMethods` restricted to `security.zonesAuthenticationMethods` (UB EE)  
 - `App.endpointContext` - an empty object what can be used to store data for a single endpoint execution.
   Application logic can store here some data what required during single HTTP method call;
   Starting from UB@5.17.9 server reset `App.endpointContext` to {} after endpoint implementation execution,
   so in the beginning of execution it's always empty  
  - new server config parameter `security.excludeGroups: ["group1", ...]`
   Groups codes (uba_group.code) to EXCLUDE from available user groups during user logon.
   Useful in case a same DB is used by several server instances, and one of instance
   (private portal for example) should limit roles available to user.
   **WARNING** - roles what assigned directly to user (in uba_userroles) **NOT** filtered and remains available
   
 - new server config parameter `security.limitGroupsTo: ["group1", ...]`
  Groups codes (uba_group.code) to limit available user groups during user logon.
  Useful in case a same DB is used by several server instances, and one of instance
  (public portal for example) should limit roles available to user.
  **WARNING** - roles what assigned directly to user (in uba_userroles) **NOT** filtered and remains available   
 - `App.grantEndpointToRole(endpointName, roleCode)` - programmatically grant endpoint permission to specified role
### Changed:
 - Improved JSON schema for ubConfig.json: add support for `uiSetting.cspAllow`
  - UBAbort constructor now accept optional additional arguments, which will be passed down to client.
    Anticipated scenario of usage:
    ```
    throw new UB.UBAbort('<<<file_not_found>>>', 'bad_file.name')
    ```
    The "file_not_found" i18n string on client should be like `'File "{0}" is not found or not accessible'`.
 - in case nginx is used as a reverse proxy (http.reverseProxy.kind === 'nginx' in app config)
 `/statics` endpoint on the UB level simply redirect to `/statics` nginx location.
 `ub-proxy.cfg` nginx config should be upgraded by `npx ubcli generateNginxCfg` (or rule for `location /statics` should be added manually)  
 - changes for UB server >= 5.17 (backward compatible):
   - data type of Session.id is changed form Number to String and retrieved lazy.
     In general this property should not be used in app code
   - `Session.runAsUser` will create a temporary session what live until the end of request (not persisted to sessionManager)
   

#  Package cdn@5.3.6->5.3.31
### Added:
 - `cdn_employee-fm` form rewritten to Vue
 - `cdn_department-fm` form rewritten to Vue
 - `cdn_organization-fm` form rewritten to Vue
 - `cdn_person-fm` form rewritten to Vue
 - `cdn_contact-fm` form rewritten to Vue
 - `cdn_classifier-fm` form rewritten to Vue
 - `cdn_classifieritem-fm` form rewritten to Vue
 - `beforeAddNew`, `contactsRepository` mixins
  - description for 'Common dictionary' desktop (+localization)
 - navigation shortcuts for Banks and Streets
  - synchronization of the user's email with the employee's contact
### Changed:
 - renamed 'Sex' to 'Gender', added full gender name to 'CDN_SEXTYPE' enum
 - renamed 'Sex' to 'Gender', added full gender name to 'CDN_SEXTYPE'
 - `cdn_organization` 'OKPOcode' field is required
 - rewrote `010_create_navshortcuts.js` config for rendering cdn forms on vue
  - **BREAKING!!!** Classifiers entities renamed, all over the code (navigation, etc)
    - `cdn_classifiertype` => `cdn_classifier`
    - `cdn_classifier` => `cdn_classifieritem`
  - Renamed `title` to `name` for both entities
  - Made `cdn_classifier.name` and `cdn_classifier.description` attributes multi-language
  - Remove `stateCode` from `cdn_classifier` as a bit too specific to be in generic dictionary. 
    If you need this (or any other) attribute, either request a JSON attribute in this dictionary or use entity override
    feature for your project.
  - Add format description for classifiers for ub-migrate (the _date/formats.js).
### Fixed:
 - cdn_classifieritem - fix error about non-existed attribute usage inside insert/update
 - cdn_classifieritem - fix uniqueness constraint for code attribute, not code is unique inside classifier, not globally
 - Russian language name in initial data for "ru" and "tg"

#  Package amqp@1.0.15->1.0.37
### Fixed:
 - linux build: links to valid `libsynmozjs52.so`

#  Package blob-stores@5.1.0->5.1.9
### Changed:
  - `FileSystemBlobStore.saveContentToTempStore` will return a real file md5 instead of empty string.
  This allow client to prevent downloading the same file several times
### Fixed:
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json

#  Package adminui-vue@1.7.2->1.9.18
### Added:
 - `UTableEntity`: added `beforeAddNew`callback which will be emitted before addNew
 - `showList` command supports for cmdData.repository - an ubql object
 - `UTableEntity` store getter `currentRepository` - returns repository with added filters, sorters, pagination
   and total requests from state
 - new actions "export to Excel|HTML|CSV" added to `UTableEntity` toolbar "All actions" menu. Require UB server @5.17.10   
 - new component `UGrid` container for align form elements into columns - a wrapper for [display: grid;](https://css-tricks.com/snippets/css/complete-guide-grid/).
 Recommended to use instead of `<el-row> <el-col>`. Usage samples are added into UGrid.vue file
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
``` 
 - `UFileInput` - format validation of dragging files
- `USelectEnum` prop `clearable`. Adds clear icon, false by default
 - SignatureValidationResult.warnings attribute added
 - FontAwesome5 Free regular icon set added (far prefix)
 - default slot for UAutoField. Can hold content what renders in the same u-form-row
 ``` vue
   <u-auto-field attribute-name="SQL">
     <div class="u-form-row__description">
       {{ this.entitySchema.attr('SQL').description }}
     </div>
   </u-auto-field>
 ```
 - `USelectEntity`: option's select emits two parameters - (value, option: Object)
 - `uba_user-changeUserPassword-fm.vue` - changed form ExtJS to vue for changing user password
 - OpenIDConnect authorization support for adminui-vue
 - `UFormRow`, `UFormContainer` prop `maxWidth`. Sets max width of row
 - `UToolbarButton`: added $ut to provide just string to tooltip prop
 - global Vue component `SignatureVerificationResult` - view for `pki().verify`
 - `uba_user-changeUserPassword-fm.vue` - changed form ExtJS to vue for changing user password
 - OpenIDConnect authorization support for adminui-vue
 - `USidebarButton` - component for use in sidebar slot
 - `UForm/mount/mountTableEntity` prop `cfg.isModal`. For render grid in modal
 - `UTableEntity` audit action
 - `UTableEntity` prop `onSelectRecord`. Overrides the record selection event. That is, double click or enter
 - `UTableEntity` all toolbar slots is scoped and provides `store` and `close` action.
 `store` need for access table data from slot, for example "select record button".
 `close` calls close action which provides from root component.
 - `UTableEntity` added audit action to toolbar
 - `UTableEntity` added slot for audit action in toolbar
 - support for new attribute `uba_auditTrail.actionUserName`
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
 - **BREAKING** removed `UDetailGrid`
 - `UDialog` now exports `errorReporter` and it available in vue instance as `$errorReporter`
 - `UContextMenu` - registered globally, can be used in template as `<u-context-menu>...` tag.
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
 - set `entity.caption` as default form title if title is not defined at `*-fm.def`
 - Registration component for authentication form
 - Navbar tab: middle mouse button click (mouse wheel click) on tab will close it
   
 - `USelect* components` prop readonly
 - `UFormContainer` prop autofocus. Boolean. Is true by default.
 Example usage `<u-form-container :autofocus="false">`
### Changed:
 - `UTableEntity`: all props now reactive. For example changing `entityName` property will cause table to load
  rerender data and columns using new entity name, e.t.c 
 - `UTableEntity` column of type `Document`: separate download button from file name
  to prevent unexpected downloads while user click on file name
 - `UTableEntity` prop `repository` now can be `ubql` or function which returns `ClientRepository`
 - UIconPicker will try to use a prepared list of available FontAwesome5 Free icons
 - **BREAKING** `UIconPicker`: removed the <u-form-row> wrapper, renamed classes to more general ones,
   changed the icon selection emitting event from 'select' to 'change'
 - **BREAKING** renamed class from `ub-form-container` to `u-form-layout`. Because there is a component UFormContainer that has nothing to do with the class.
 - `UFormRow` colors have become more contrast 
 - `UFormRow` fully refactor component. In case `labelPosition === 'top'` label and error text divide free space
 - `UAutoForm` by default sets `labelPosition` to `top` and `maxWidth` to `800px`
 - `UTable` text style changed from bold to regular
 - `SignatureVerificationResult` view shown in expanded mode in case validationResult array contains one result
 - authentication form will show error in dialog window instead of floating notification 
 - additional parameter `row` added to `UTableEntity.onSelectRecord` callback as `cfg.row` parameter
   Full function signature is `function({ID: Number, row: Object, close: function})`  
 - `USelectEntity` show dictionary action show's UTableEntity grid
 - `UForm/mount/mountModal` by default removes paddings from dialog body of `ElDialog`
 - **BREAKING** `UTableEntity` renamed all named slots from *kebab-case* to *camelCase*.
 In case pass scopedSlots param in `UForm/mount/mountTableEntity`
 - `UTableEntity` filter submit icon changed from `el-icon-check` to `el-icon-search`
 - `UAutoField -> date-picker` first day of the week is taken from the current locale of `moment.js`.
   AdminUI take cares of switching moment locale according to user language
 - `UFormRow` will use `flex-direction:column` instead of display:block` css rule. This allow to stretch
   internal content to the full height
 - `processing -> save validation` will try to localize entity attribute using UB.i18n
 - updated dependency **vue**@2.6.8 -> 2.6.10
 - updated dependency **vuex**@3.1.0 -> 3.1.2
 - updated dependency **element-ui**@2.12.0 -> 2.13.0
 - `UTableEntity` table cell value formats value as html. In case when full text search result returns `<b>` tag as string.
 - `UContextMenu` - hide icon div when `iconCls` is unset
 - `UToolbarButton` added slot for add text to button 
 - `UToolbarButton` prop `icon-cls` renamed to `icon` 
 - `UToolbarButton` prop `icon-color` renamed to `color`. Colors list - `primary | secondary | info | danger | warning`
 - `UFormContainer` refactor from commonjs to vue component 
 - `UFormContainer` removed padding and inner div
 - **BREAKING** `UUploadDocument` removed, use `UFile` instead
 - `UFormRow` increased default label width from 120 to 150
 - `UFormRow` previously margin-top was added only if one `UFormRow` element follows another in DOM,
  instead now margin-bottom always 10px
 - element theme css extracted into separate. This allow to override element styles in our vue components
 - renamed `ShortcutIconSelect` control to `UIconPicker` and allow to use it in other UB projects
 - `UCodeMirror` control now can be set readOnly (disable user input) with passing readOnly prop
 - change icon inside error popup to "!" because original element error icon is very similar to close button
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
```
 - winXP (Chrome 48 / FireFox 52 / IE) support is removed, as a result
 boundle size reduced by 120Kb + code became faster  
### Removed:
 - `UForm.instance()` method is removed (marked as deprecated). Please, remove all .instance() calls on your code
 - `USelectCollection` prop `entityName` removed in flavor of computed property `entityName`
 - deprecated event `desktopChanged` for UB.core.UBApp ($App in global)  is removed.
   Instead adminui-vue fires `$App.fireEvent('portal:sidebar:desktopChanged', desktopId)`
 - deprecated `$App.getDefaultDesktop` `$App.getDesktop` `$App.setDesktop` are removed 
 - deprecated `UB.core.UBStoreManager.getDesktopStore` is removed
 - `ubm_desktop` no longer loaded by Ext UB.core.UBStoreManager (only by adminui-vue)
### Fixed:
 - hide selected desktop icon in case sidebar is collapsed
 - signatureVerificationResult - prevent show `(undefined)` in signature status in case error code is unknown
 - `saveAndClose` action should not close form in case of errors
 - `UInput`: globe icon should be displayed instead of empty rectangle
 - `UFormRow`: in case `label-position` is left or right error text should be displayed under input instead of udder label 
 - `UFormRow` now can be used outside of `UFormContainer`
 - `UIconPicker`: added border radius
 - SignatureVerificationResult component: display a signing time as hours:minutes (instead of hours:month) 
 - `UTableEntity` resets the filter value when a column changes
 - `UTableEntity` impossible to select a condition 'contains' in filter for column with type entity
 - UFile & UTableEntity will display original (human readable) file name instead of store specific (autogenerated) file name;
 Also original file name is used for file download operation
 - show actual text instead of empty <<< >>> in error window in case unhandled rejection message contains <<<text>>>
 - prevent multiple emitting of `input` event in case UInput is of type `number`
 - `UIconPicker`: entering an icon class manually doesn't drop an error
 - dynamically update desktops in sidebar on change in `ubm_desktop` form
 - prevent showing of form validation error twice in case user close tab on the unsaved form and validation error occures 
 - `enum` filter template of `UtableEntity` displays the correct locale in the filter list 
 - `UAutoField` provide all $attrs to `UFormRow` and inner element in slot.
   This allow, for example, to override a label position for individual field:
   ```
   <u-form-container v-loading="loading" label-position="top">
      <u-auto-field attribute-name="host" label-position="left"/>
      ...
   ```
 - UCodeMirror: null values showing fixed
 - `UFormRow` added additional verification to el-select click hack
 - `UToolbar` audit action
 - `USelectEntity`/`USelectMultiple`: prevent exception `Error in build SQL "where" expressions: item "XXX" not found ordinar item with name "YYY"`
 while fetching a display value 
 - `ElSelect` wrapped by `UFormRow` no longer breaks arrow click behavior 
 - `UFile` - more accurate work with previewURL inside control, to prevent situation, when `previewUrl` is still set,
   but value is no longer valid due to `window.URL.revokeObjectURL` call. 
 - Fixed error when filtering `Date` type columns in `USelectEntity` using range shortcuts
 - disable `UTable` header click for columns with sortable: false
 - `UFormRow` with error adds red border to `USelectMultiple`
 - `USelectEntity`, `USelectMultiple` fetching of display value ignore passed whereList.
   This fix situation when value what already selected do not match filter conditions.
 - prevent `UDialog` to close on click outside dialog window
 - `USelectMany` prevent `split is not defined` exception in case DB is SQLite3 and only one value is selected 
 - `UNavbar` search widget
 - mountContainer will provide fake `$formServices` to allow use UToolbar inside vue form mounted by mountContainer
 - `USelectEntity` close opened dropdown's if clicked **arrow** of another select. Previously it didn't closed if click on arrow
 - `UFile` prevent opening preview dialog on press enter button in another input in same form
 - `USelectEnum` wrong display value on open form
 - loader (spinner) added to auth form - turned on after user press "Login" button. This help to indicate
  user what something is happens in case server response is slow  
 - added CSP for IIT sign agent (localhost:8081 & 8083)
 - error unlock auth cert2 form on error
 - Styles in `UFormRow`, `USelectMultiple`, and `USelectEntity`
 - `clickOutsideDropdown` directive in `USelectEntity` now works properly
 - added missing `store` parameter in processing=>addCollectionItem method
 - `processing` module now does not pass readonly attributes in execParams
    
 - desktop selector Z index increased to 100 to prevent displaying behind Ext form toolbar / grid captions  
 - `DesktopSelector` close desktop drawer after click again on button
 - sidebar doesn't overlap text popups
 - dynamically update shortcut in sidebar on change in `ubm_navshortcut` form
 - case field is collapsed if setting for `USelectMultiple` and `USelectMany` field is disabled
 - `USelect* components` error when value is exist in dictionary but not exist in current `:repository` request
 - `USelect* components` duplicate field in the query in case `valueAttribute` is set same value which in `descriptionAttribute`
 - transformation of attributes of type `Date` (not DateTime) to format expected by server (time must be 00:00 in UTC0) inside `buildExecParams`

# *New* Package openid-connect@0.0.1->5.0.109
### Changed:
 - Skip user information request in case `provider.userInfoUrl` is empty (ADFS 3 does not implement this, JWT token what contains user information is used instead)
 - Set default value for getOnFinishAction event. The default value is suitable for "adminui" form.

# *New* Package dml-generator@0.0.1->5.0.65
### Changed:
 - support for value in whereList (instead of values)

#  Package adminui-pub@5.11.1->5.12.26
### Added:
 - support for new attribute `uba_auditTrail.actionUserName`
 - `UBConfig` property `uiSettings.adminUI.useVueTables` which replace all ext grids showList by UTableEntity component
 - `$App.doCommand({ cmdType: 'showList' })` new parameter `renderer` which override `uiSettings.adminUI.useVueTables` option for current grid. 
   For a case when you need replace all grids to new, but want to set some grids renderer as ext  
 - Registration component for authentication form
### Changed:
 - `locale/uk -> closeOther` added missing word "tabs" simplified in other languages
- **BREAKING** `UB.core.UBUtil.glyphs` is removed. See below.
 - **BREAKING** adminUI migrates from FontAwesome4 to "Font Awesome 5 free". For migrating Ext based forms please,
 replace all `glyph` properties to `iconCls` (the simplest way is to search all `glyphs.` occurrences). Example:
 ```
   // OLD code
   glyph: UB.core.UBUtil.glyphs.faFilter,
   // should become 
   iconCls: 'fa fa-filter',
 ```   
   - all occurrences of "font-awesome" in all package.json should be removed  
  - index.html template will expect `favicon.ico` is placed in the root of `httpServer.inetPub` folder. 
  In case `${httpServer.inetPub}/favicon.ico` not exists `npx ubcli linkStatic` will sym-lynk it from 
  `@unitybase/ub/public/img/UBLogo16.ico`
 - An ability to translate report name added: a key from localization file should be provided
   in @name field of report definition in order to have localizable report form title
 - Add translation for mi_createDate term, just like there is for mi_modifyDate
 - green spinner on startup - symbolizes only evergreen browser are supported by adminUI :)
 - winXP (Chrome 48 / FireFox 52 / IE ) support is removed, including following polyfills:
   - `bluebird-q` - was exposed as `window.Q` 
   - `es6-promise`- was adds Promises support for IE  
   - `Promise.prototype.fin` (used previously in Q promises) polyfill is removed. 
     Native `finally` should be used instead
   - `Promise.prototype.done` (used previously in Q promises) polyfill is removed.
     Native `then` or `catch` should be used instead
   Boundle size reduced by 100Kb  
 - Q promises usage is removed from UBOrgChart
### Fixed:
 - `Audit` for different auditable instances should be opened in different tabs  (fixed **tabId** generation in `BasePanel.onAudit`)
 - `showForm` command will use `description` from command config (if defined) as a form caption. Compatibility fix for UB4  
 - UDetailTree refresh icon (fas fa-refresh -> fas fa-sync)
 - `audit` action for Ext based forms (BasePanel descendants) will be shown in Tab in case form shown in tab
 - `EntityGridPanel` audit action
 - `BasePanel` audit action
 - prevent "brain split" of Vue global instance onto 2 part in production version
 - EntityGridPanel: in case entity descriptionAttribute type <> string use value of first column for deletion confirmation message [UBDF-8061]
 - `adminUI is not defined` during initial page load (missed semicolon in index.html)

#  Package adminui-reg@5.2.2->5.3.27
### Fixed:
 - Add CSP rules for PDF.js Firefox extension
 - CSP for IIT sign agent

# *New* Package update-changelog@0.0.1->1.0.2
### Added:
 - add changes types template sections just after [Unreleased] section. This prevents some types of merge conflicts in CHANGELOG's
### Fixed:
 - prevent error in case package do not have CHANGELOG.md

