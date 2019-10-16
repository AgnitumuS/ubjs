#  Package ub-server@5.15.2->5.16.1
### Added:
 - during shutdown server put an HTTP server statictics into log (under Server log level).
  Administrators should take care about ThreadPoolContention* values;
  For example in case ThreadPoolContentionAbortCount >=0 it's mean server reject some requests because incoming queue is full;
 - `stat` endpoint response now returns a thread pool statistic together with app statistics
 - server can be started in `authMock` mode by passing `--authMock` in the command line (ub --authMock)
  This mode is designed for testing UB from tools what do not support complex calculation requred for
 authorisation and authentication:
   - authentication will not use a cryptography random for nonce generation, instead nonce is always === `1234567890abcdef`
   - sessions ID will always starts from 100 and increased continiously 101, 102, etc (instead of random int)
   - Authorization header calculation do not require to include a continiously growing request counter (can be const across all requests inside one session)
   - session signature part of Authorization header not verified (can be constant)
   - checking of IP equality for authorization and authentication requests for session is disabled
   - auth response JSON includes `authHeader` field what can be used for `Authorization:` header value for all future request for this session
  In this mode after session is created any UBQL can be executed by POST request with 2 header:
   -  "Content-Type" = "application/json"
   -  "Authorization"= "UB 000000680000000000000000"
  where "00000068" is a session number in hex (first user session is 104 = 0x68)
  Full request can be simlpy copied from browser network tab as CURl etc 
 - ability to set log file path (`logging.path`) to the specified file and disable log rotation by setting 
 `logging.rotationSizeInMB` to 0. So under unix *logrotate* can be used for log rotation tasks
### Changed:
 - `getDomainInfo` endpoint optimization: nativeGetDomainInfo can wrote domain directly into HTTP response
 instead of serializing it to/from JS engine. This save up to 70ms on huge domains

#  Package cs-shared@5.1.7->5.1.11
### Added:
  - remove code duplication for `Date` parsing functions (truncTimeToUtcNull & iso8601ParseAsDate are moved to LocalDataStorage) 
 - `UBSession.signature` can return a fake signature if `authMock` parameter is true

#  Package ub-pub@5.3.15->5.3.24
### Added:
 - new functions `UB.iso8601ParseAsDate` (convert UnityBase server date response to Date object)
  and `UB.truncTimeToUtcNull` (convert a local DateTime to Date with zero time in UTC0 timezone
  as expected by UB server for Date attributes) 
 - AsyncConnection now support `authMock` mode (if server started with --authMock switch)
- AsyncConnection method `queryAsObject`, which acts as `query` but returns array of objects
### Fixed:
 - transformation to / from UB Date format (time 00:00 in UTC0) works correctly for dates in which
  there was a switch to winter / summer time (1988-03-27 for example)  

#  Package uba@5.3.0->5.3.9
### Added:
 - Azery localization for uba_usergroup.meta
### Fixed:
 - prevent hangs of ALS form for huge ALS rules sets 

#  Package ubs@5.2.25->5.2.45
### Changed:
 - `ubs_numcounter.getRegnum` optimization
   - new attribute ubs_numcounter.fakeLock added for select for update emulatin
   - settings key `ubs.numcounter.autoRegWithDeletedNumber` reads once 

#  Package ubcli@5.3.41->5.3.42
### Fixed:
 - Oracle DDl generator - do not wrap enum group into quotes when update a value for enum column from `null` to `not null`

#  Package base@5.1.23->5.1.29
### Added:
  -  `@unitybase/base.ubVersionNum` property - a Numeric representation of process.version.
  For example if process.version === 'v5.14.1' then ubVersionNum === 5014001; Useful for feature check
### Fixed:
 - csv parser: in case parse called with one argument, force default comma to be `;`;
 This fix a case if previous call to parse(text, ',') overrides default separator globally

#  Package org@5.2.8->5.2.17
### Fixed:
  - logon event handler will not add a staff units ID for deleted employee;
  Situation is possible when one userID assigned to different employee and one of employee is deleted

#  Package ub@5.2.32->5.2.37
### Added:
 - documented ability to set log file path (`logging.path`) to the specified file and disable log rotation by setting 
 `logging.rotationSizeInMB` to 0
 - `logging.threadingModel` is marked as deprecated
### Fixed:
 - `getDomainInfo` endpoint now compatible with UB server <= 5.16 (compatibility broken by @unitybase/ub@5.2.36) 
 - `getDomainInfo` endpoint optimization: starting from UB 5.15.4 nativeGetDomainInfo can wrote domain
  directly into HTTP response instead of serializing it to/from JS engine. This save up to 70ms on huge domains
 - `authMock` property added (if server started with --authMock switch) to getAppInfo endpoint response 
 - added documentation for `model` configuration parameter for `aclRls` mixin 

#  Package cdn@5.3.0->5.3.6
### Changed:
  - colon separator for cdn_region uk locale csv data to ';' as in all other files  
### Fixed:
 - explicitly specified fieldList for cdn_employee & cdn_person shortcuts to prevent lookup on potentially huge cdn_organization 
 - Field 'level' renamed to 'hierarchyLevel' because 'level' is a reserved word in Oracle - so this field breaks ddl generation for Oracle database
 - Forms for entering classifiers were missing

#  Package blob-stores@5.0.39->5.1.0
### Fixed:
 - BlobStores regression: for stores filled by UB < 5 (without {v: 1,..} attribute in blobStore content JSON)
 default revision should be 0 instead of 1. The content below 
 ```
{"store":"simple","fName":"my file 3000006327362","origName":"","relPath":"","ct":"application/pdf","size":170326,"md5":".."}
 ```
resolved to `pathToSimpleStore/my file 3000006327362/0.pdf` instead of `.../1.pdf`
   

#  Package adminui-vue@1.6.33->1.7.2
### Added:
 - New option for `UFormRow` label-position prop, example:
```vue
<u-form-row
  required
  label-position="top"
  :label="`${entity}.filterValue`"
  :error="$v.filterValue.$error"
  <u-input attribute-name="filterValue" />
</u-form-row>
``` 
 - `USelect*` components, prop placeholder
 - css variable `--info-light`
 - `UForm/mount` i18n to title
 - Callback `saveNotification` is added to `UForm.processing` parameters - will override default save notification
 - basic support for `dataHistory` mixin: only creation of new rows. TODO - implement adding of a new row version
### Changed:
 - update package `element-ui@2.12.0` and `element-theme-chalk@2.12.0`
 - production build now works on browsers for WinXP (Chrome 48/ FireFox 52). It's done by:
    - adding a core-js polyfills for missing things (+122 Kb boundle size) - see `.babelrc`
    - replacing DOMElement.append -> DOMElement.appendChild
    - remove object rest spread where possible
 - 1.7.x is the LAST version what supports WinXP. Polyfills **WILL BE REMOVED IN 1.8.0**  
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
```
 - **BREAKING** `USelectCollection` added required prop `entityName` it pass the entity name of the collection
 - **BREAKING** `USelectCollection` prop `subjectAttr` renamed to `associatedAttr`
 - `instance/addCollectionItem` missed call of repository function
 - `UContextMenu` do not closed just after opening in Firefox
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
### Fixed:
 - `UForm/processing` in case execParams includes locale params will replace the locale param with base param. For example in case userLang === 'en' and execParams includes key 'fullName_uk^' will replace key 'fullName' to 'fullName_en^'
 - removed `async-to-promises` babel plugin - buggy
 - added support for old Chrome browser what can run on WindowsXP by using `async-to-promises` babel plugin
 - `instance` module `SET_DATA` mutation, fix bug when assign a value to JSON attribute, and there is `null` instead
   of a regular object value.  Assign an empty object in any scenario, when value is not already an object or when
   value is `null`.
 - `instance` module, comparison array to null or object to null now works without exceptions
 - `UForm.validation` computed.mapInstanceFields maps all entity fields. Previously only required fields

#  Package ubm@5.2.0->5.3.0
### Added:
 - `ubm_desktop` props `description` and `iconCls`. Now can set description and icon for desktop which will show in sidebar desktop selector
 - `ubm_navshortcut` optional prop `description` not used yet, but will later be displayed in the sidebar
 - `ubm_navshortcut` optional prop `keywords` it needed to improve search
### Fixed:
 - added localization for shortcut form editor caption

#  Package adminui-pub@5.10.20->5.11.1
### Added:
 - new configuration parameter `adminUI.recognitionEndpoint`, used for recognize scanned documents. 
 An example of valid name is `ocr/` - this is for **Tesseract** recognition implemented by `@ub-e/ocr` package.
 - new property `BasePanel.lockOnSave` to change a default `softLock` mixin behavior:
   - if `true` then `lock()` is called JUST BEFORE save operation and `unlock()` is called just after save operation
   - if `false|undefined` `lock()` is called when user starts to edit form or creates a new record.
     While user edit a form lock renewed until form is opened and while the form is in edit mode
### Changed:
 - several patches for winXP (Chrome 48 / FireFox 52) compatibility:
   - replacing DOMElement.append -> DOMElement.appendChild
   - Promise.fin -> Promise.finally + Promise.finally polyfill for old browsers
   - Promise.done(..) -> Promise.then(..); Promise.done() -> nothing to do - just removed such calls  
   - object rest spread ( {...obj} ) -> Object.assign({}, obj)
 - **5.11.x is the LAST version what supports WinXP**. `Q`, `bluebird`, `Promise.fin`, `Promise.done`
  and `unhandledpromiserejection` polyfills will be removed in `@unitybase/adminui-pub` versions what > 5.11.x   
### Fixed:
 - prevent an error with `BasePanel.maskForm` in case of saving detail record, when master record is locked.
