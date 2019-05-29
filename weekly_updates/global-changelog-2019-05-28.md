#  Package ub-server@5.8.2->5.10.1
### Added:
 - simplified UBQL syntax: where expression now can accept parameter value in `value` prop
 instead of `values` object. Old syntax is supported for backward compatibility up to UB 6.
   - new where syntax: `{"expression": "..", "condition": "..", "value": 1}`
   - old where syntax: `{"expression": "..", "condition": "..", "values": {"p0": 1}}`
 - new method `process.binding('http_server').writeToFile(fullFilePath)` to be used used in `THTTPRequest.writeToFile`
 - allow to bind server to all IPv6 server address: hist should be "::1" in this case
 - parameter `CurrentThreadCount` added to `stat` endpoint result
 - `BeginCurrentThread` / `EndCurrentThread` events added to Debug log
 - global lock fot thread destroy during server shutdown (hope it fix random AV during shutdown on Windows)
### Changed:
 - **BREAKING** - `null` value is not allowed inside where - server will throw in this case. Client must pass `isNull` or `notIsNull` 
 condition to check nulls (Repository will do it internally). Previous implementation generates a logically wrong SQL `where something = null`
 in such cases.
 - `between` condition in where expression is **REMOVED**. Two expression should be used instead - >= and <=
 - small performance improvements for UB.DataStore() constructor
 - using of TFPGObjectList instead of TObjectLis from generics.collection
 - performance: SQL builder ExtractExpressionProps return Set of expression props instead of Record with props
 - performance: Unity mixin optimized - store pointer to unityEntity instead of calculate it for evety call
 - performance: added lazy initialization of group/order list inside SQL builder
 - performance: cache 'lunchEndpoint' value and use CallFunctionValue instead of CallFunctionName to launch JS endpoints
 - performance: TubDataStore dataCollection will be created only in case several `dataName` is present (using DataStore.currentDataName);
   Simplify dataCollection internals (TRawUTF8List -> TFPObjectList); +10% to techempower performance test `/dbRaw` endpoint
 - performance: SQLBuilder.entityList lazy initialization (required only for cached entities)
 - performance: NamedCollection (TubList) use now use objectList as internal storage instead of StringList. Names are stored inside TubVal (this prevent duplicate names storing)
 - Models collection now case sensitive
 - memory: remove JSONBuffer variable form TubNamedCollection (not required since all str values are copied to strings during serialization)
 - performance: TubSQLBuilder.LoadFromList now O(n) instead O(n*2)
 - performance: TubVal integer/decimal/boolean values parse speed improved
 - performance: TubList.byNameTyped method - faster when byName because compare type (enum) first
 - performance: speed up TubDataStore.runSQL by remove unneedeed stack variables allocation
 - performance: SQL parser will not allocate new SQL string in case statement not contains inlined parameters
 - more optimal TubVal(a value holder for TubList) internal layout (size decreased from 80 to 40 bytes).
   As a result UB served consumer less memory and overall performance is increased by several percent.
   **WARNING not tested on real project yet**
 - vectors growing algorithm optimization. UB now use 2-15% less memory (depending on load type)
 - performance optimization: use TFPObjectList instead of TObjectList to remove Notify overhead
 - performance optimization: use TFPObjectList in TubCollection to remove IObjectListWrapper interface overhead
 - performance optimization: start/stop operation will memorise last UID for SQLite3 database in controller, so delay between restarts in autotest can be removed
 - performance optimization: SQL Builder now use userLang from query context instead of passing it to PrepareSQLWhereItemExpressionText*
### Fixed:
 - **CRITICAL** `mi_modifyDate` must be set to now() during `update` operation instead of previous modifyDate (issue made in UB5.9.1)
 - **CRITICAL** - SQL builder will wrap logicalPredicate expresion into () to prevent possible SQL attack
 - potential AV on int64->string convertion
 - potential AV on loading/unloading GSS/WinSock libraries
 - console.* (log, debug, error) functions under Windows will correctly output unicode chars in case UB in command line mode
 - `fs.readFileSync` will correctly read file as buffer under Windows in case file name contains unicode characters
 - Windows: put environment variables to log using UTF8 encoding (instead of OEM)
 - prevent `0.0.0.0` DNS lookup - prevent server startup delay in case DNS server is not accessible
 - SQLBuilder: WhereItem without "values" part throws with message "Where item with condition "%" must contains "values" part"
  instead of "List index out of bounds" in case condition is not isNull, isNotNull or Custom 
 - CRITICAL: prevent hangs on parse invalid JSON like `[{..},}]`
 - prevent loading of `*.meta*` files as entities. Valid entity file should ends with `*.meta`
 - fix AV during server start on Windows in case non-english environment variables exists (for example logged in user name contains russian letters)
 - prevent send `Content-Type: application/json` header for empty body
 - CRITICAL: TubVal.loadfromJSON - fix potential AV by prevent returning of a pointer to the stack variable for topmost call in recursion
 - while in shutdown state server will not accept HTTP requests and answer HTTP_UNAVAILABLE. This should allow gacefully shutdown in case of Hi load
 - Windows: prevent display confirmation message in console in case of server halt on unhandled exception
 - for multi-language attributes updation allow to pass values for default language without lang suffix
  `{ID: 3, firstName: 'Pavlo1', 'firstName_uk^': 'PavloUK1'}`.
  Prev. implementation require default user lang attribute to be with language suffix in case other lang also exists
  `{ID: 3, 'firstName_en^': 'Pavlo1', 'firstName_uk^': 'PavloUK1'}`
 - in case of call to `update` without `fieldList` return empty data instead of `selectBeforeUpdate` datastore (old data)

#  Package cs-shared@5.0.19->5.1.0
### Added:
  - support for UBQL v2 (value instead of values in whereList)
### Fixed:
 - CustomRepository.clone() - prevent deep cloning of connection property
 - error message for filtering by non-existed attribute in LocalDataStore will include entity name 

#  Package ub-pub@5.2.35->5.3.1
### Added:
 - new property `AsyncConnection.UBQLv2` - true in case server support `value:` instead of `values:{}` in where item
 - support for UBQL v2 (value instead of values in whereList)
 - new methods added to the client side `Connection` **`addNewAsObject`, `runTransAsObject`, `updateAsObject`, `insertAsObject`**
   Result data of this methods is an Object (the same as in selectAsObject()) instead of Array (the same as in .selectAsArray())
   
   Useful for non-ExtJS clients, Vue for example. See documentation for detail:
   
   ```javascript
   UB.connection.updateAsObject({
     entity: 'uba_user',
     fieldList: ['ID','name','mi_modifyDate', 'isPending'],
     execParams: {ID: 33246, name:'newName', mi_modifyDate:"2019-04-23T13:00:00Z"}
   }).then(UB.logDebug)
   // will return plain object 
   // {"ID": 332462122205200, "name": newName", "mi_modifyDate": new Date("2019-04-23T13:03:51Z"), isPending: false})
   ```   
### Changed:
 - remove usage of `lodash` whenever possible
### Fixed:
 - ClientRepository.clone() - prevent deep cloning of connection property

#  Package systemjs-plugin-vue-ub@1.3.1->1.3.3
### Changed:
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`

#  Package ubq@5.2.14->5.2.22
### Changed:
 - correct Ukrainian translation for `ubq_scheduler` attributes
### Fixed:
 - potential issue with wrong properties values inside overrided schedulers (for example "singleton" may unexpectedly became false) 
 - for overrided schedulers fill `originalModel` attribute

#  Package ubs@5.2.3->5.2.12
### Changed:
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`

#  Package pdf@5.0.18->5.0.20
### Changed:
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`    

# *New* Package codemirror-full@0.0.1->1.2.24
### Changed:
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 - upgrade jshint to 2.10.x (solved jshint 100Mb size problem + uses lodash 4.17.11 without prototype pollotion)

#  Package base@5.1.8->5.1.11
### Fixed:
 - ServerRepository will check UBQLv2 compatibility core both remote and local connection.
 This fix issue `where item with condition "equal" must contains "values" part"` in case ub server version is <5.10 but
 package `@unitybase/ub` is >=5.2.11  
 - ServerRepository.clone() - prevent deep cloning of connection property

#  Package ub@5.2.11->5.2.12
### Added:
 - new method `THTTPRequest.writeToFile(fullFilePath)` - write request body content (as binary) to a file.
 Return `true` on success. Can be used to bypass moving body content between native<->JS
 if conversion of the request body is not required.  
### Fixed:
 - Windows: `UB.UBAbort` server-side exception fileName & lineNum now valid in case
 file name is absolute path starts with drive letter. Prev. implementation puts drive letter instead of fileName 

#  Package adminui-vue@1.4.1->1.5.3
### Added:
 - added `u-select-multiple` component. Its multi-select for UB entity 
 - added `u-select-collection` component. Inherited from `u-select-multiple`. Component is responsible for display a collection of a details from master-detail relation inside a multiselect. Acts like a control for "Many" data type, but can be bound to any detailed entity 
 - `UAutoField` - component renders form field according to the attribute type
 - form boilerplate [Docs](https://git-pub.intecracy.com/unitybase/ubjs/blob/164f10d15a1753be6505d9dd5b87d570f4404cf0/packages/adminui-vue/README.md#helper-modules)
 - `UToolbar` component. That is related with processing module in form boilerplate
 - `v-hold-focus` directive. Intercepts the tab keydown event on this element and does not allow the focus to leave it
### Changed:
 - `u-select-entity` added 'clearable' option
 - rewritten `u-select-many`. Now this component inherited from `u-select-multiple` 
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 - `mount` module. Renamed `mount -> mountForm`
 - `formBoilerplate` exports `activateIfMounted` and `mountForm`, instead `mountHelpers`
 - `UInput` - in case type===number will emit value in each input event instead of change
 - `Uinput` - added validation to locale fields if master field is required and form not new
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
### Fixed:
 - `processing` emit update grid and add loading status when dispatch 'deleteInstance'
 - changed before close function in mount module, can except empty store or store without save action
 - `UInput` - fixed bug when user open popup then will send empty locale after form saved 
 - `UDialog` fixed autofocus on accept button
 - `adminui-vue` will increase zIndex of Ext.WindowManager every time vue form opened on modal   

#  Package udisk@5.0.43->5.0.54
### Fixed:
 - initialization script adopted for UB 5x

#  Package adminui-pub@5.8.4->5.8.14
### Added:
 - support for UBQL v2 (value instead of values in whereList)
### Changed:
 - change zIndex for Ext forms only in case `appConfig.uiSettings.adminUI.vueAutoForms` is set to `true`.
 In other case all Vue forms will be on front of Ext forms 
 - add support for UBQLv2 into `UBDetailGrid` and `UBProxy` (use value in where expression instead of values: {})
 - ExtJS store filter with `null` value will be transformed to `IsNull` / `NotIsNull` UBQL condition   
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`    
### Fixed:
 - master-detail where expression transformation fixed for cases when server do not support UBQLv2
 - UBProxy where expression transformation fixed for cases when server do not support UBQLv2 
 - enum combobox will use UBQLv2 if accessible
 - UBProxy will skip disabled store filters while building UBQL from filter list.
 Previous implementation adds wrong empty filter in this case
 - in `UBDetailTree.onDeleteItem` replaced confirm dialog **Ext.Msg.confirm(...)** to **$App.dialogYesNo(...)** for compatibility with `@unitybase/adminui-vue` 
 - fixed z index manager on click dropdown or datepicker in UB dialogs
 - potential error inside BasePanel.getFieldList for custom forms
 - prevent two server query for Audit Trail grid by moving sort to the UBQL
