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

## [5.4.8] - 2020-02-13
### Fixed
 - UBConnection.prototype.runTransAsObject will resolves after all possible cache invalidations are finished.
   This fix `Cannot read property 'data' of undefined` for Vue based forms what based on cached entities  

## [5.4.7] - 2020-02-08
### Changed
 - i18n for `UserWithoutOrgEmployeeNotAllowed` is moved from adminui-pub into ub-pub
 
### Fixed
 - in case text of the exception raised inside server side Session.on('login') event handler is wrapped into <<<>>>
 ub-pub will translate it and show as any other handled exception. Before this patch `InvalidUserNameOrPassword` always shown.
 Fix for [UB-1728]

## [5.4.6] - 2020-02-03
## [5.4.5] - 2020-01-31
### Added
 - support for native messages extension in Firefox

## [5.4.4] - 2020-01-17
### Added
 - `UB.Reposiroty` fabric function can now accept a UBQL passed in parameter as object while keeping an ability
 to pass entity code as string
 
 ``` 
   // serialize Repository into plain java script object (UBQL)
   const ubql = UB.Repository('my_entity').attrs('ID').where('code', '=', 'a').ubql()
   // restore Repository from (UBQL)
   let repo = UB.Repository(ubql)
 ```

### Fixed
 - `AsyncConnection.logout` will close loaded private key if any
  
## [5.4.3] - 2020-01-11
### Added
  - new connection function AsyncConnection.prototype.HMAC_SHA256(secret, data)
  ```javascript
  const shaHmacAsSting = UB.connection.HMAC_SHA256('secretKey', 'data for HMAC_SHA256 calculation').toString()
  // shaHmacAsSting === 'aaa4c3a6d3a8c25cd32f366436af191ac83bc43d8655c15305877afd0975a2bc'
  ```

### Changed
 - Negotiate auth schema security improved: use secret returned form `/auth` in `X-UB-Nonce` header to complete Negotiate authentication;
  UB server must be upgraded to at last 5.17.9  
 
## [5.4.2] - 2020-01-03
## [5.4.1] - 2020-01-02
### Changed
 - remove usage of lodash from inside `UB.format` && `UB.i18n`

### Fixed
 - `AsyncConnection.userLang` will return application default language in case user is not authorised yet (anonymous)
 but appInfo is obtained

## [5.4.0] - 2019-12-30
### Added
 - service function `UB.file2Uint8Array`:
 ```
  let f = document.getElementById('inputOfTypeFile').files[0]
  ui8Arr = await UB.file2Uint8Array(f)
 ```
 - definition for SignatureValidationResult
 - definition for UbPkiInterface

### Removed
- `AsyncConnection.authHandshakeCERT` & `authHandshakeCERT2` are **REMOVED**.
   Instead `AsyncConnection.pki()` will return `UbPkiInterface` universal interface for PKI operations
 
### Fixed
 - native messages warning texts english grammar
 - fix of feature of i18n function to translate its arguments for server running in production mode

## [5.3.36] - 2019-12-27
## [5.3.35] - 2019-12-18
### Add
 - feature of i18n function to translate its arguments.  The syntax `{0:i18n}` or `{foo:i18n}` shall be used.
   - Examples:
     ```
     const UB = require('@unitybase/ub-pub')

     const result = UB.i18n('my_string_key', 'value')
     // for my_string_key = 'Error value: {0}', will return 'Error value: value', just as before 
     // for my_string_key = 'Error value: {0:i18n}', will return 'Error value: Value', the "value" itself will be i18n-ed 

     const result2 = UB.i18n('my_string_key', {value: 'value'})
     // for my_string_key = 'Error value: {value}', will return 'Error value: value', just as before 
     // for my_string_key = 'Error value: {value:i18n}', will return 'Error value: Value', the "value" itself will be i18n-ed 

     ```
 - AsyncConnection already parses and translate encoded error messages from server.  For example `<<<Some error>>>`
     string is converted to just `Some error`, moreover, if the string matches i18n resource key, it gets translated.
   Now, this feature gets even more sophisticated, it support passing string formatting arguments.  For example,
   the error returned by server `<<<file_not_found>>>|["bad_file_name"]` will be translated using call
   `i18n('file_not_found', 'bad_file_name')` and if the i18n resource is `'The file "{0}" is not accessible or does not exist'`,
   the actual message will be: "The file "bad_file_name" is not accessible or does not exist".

## [5.3.28] - 2019-11-18
### Add
 - translates for iit-sign-web forms

## [5.3.27] - 2019-11-18
### Fixed
 - Correct translation crypto

## [5.3.26] - 2019-10-22
### Fixed
 - `AsyncConnection` converted `null` to `"null"` in execParams in some cases

## [5.3.26] - 2019-10-22
### Fixed
 - global exception interceptor will ignore all exceptions what starts with `ResizeObserver`. Known are:
   - ResizeObserver loop completed with undelivered notifications
   - ResizeObserver loop limit exceeded
### Added
 - Add translation for authentication form
  

### Changed
 - for nodeJS environment monkey request detection is disabled
 
## [5.3.24] - 2019-10-09
### Fixed
 - transformation to / from UB Date format (time 00:00 in UTC0) works correctly for dates in which
  there was a switch to winter / summer time (1988-03-27 for example)  

### Added
 - new functions `UB.iso8601ParseAsDate` (convert UnityBase server date response to Date object)
  and `UB.truncTimeToUtcNull` (convert a local DateTime to Date with zero time in UTC0 timezone
  as expected by UB server for Date attributes) 

## [5.3.22] - 2019-09-24
### Added
 - AsyncConnection now support `authMock` mode (if server started with --authMock switch)

## [5.3.21] - 2019-09-18
### Added
- AsyncConnection method `queryAsObject`, which acts as `query` but returns array of objects

## [5.3.15] - 2019-08-22
### Changed
 - silenceKerberosLogin support is removed from AsyncConnection and moved into @unitybase/adminui-pub;
  This is responsibility of UI to analyse localStorage key and resolve requestAuthParams promise to Negotiate algorithm  

## [5.3.14] - 2019-08-19
### Added
 - new localStorage key **UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD** added to prevent logout in case user open document
 using Document URI Schema (WebDav). Before call to document.location.href = 'ms-word....' developer must set this key value
 to `"true"` to prevent ub-pub to call $App.logout inside `document.onbeforeunload` handler 
 
## [5.3.13] - 2019-08-13
### Fixed
 - do not lost params in AsyncConnection.stringifyExecParamsValues (introduced by premature optimization in 5.3.12) 

## [5.3.12] - 2019-08-13
### Fixed
 - AsyncConnection methods `runTrans` and `runTransAsObject` now stringify execParams for `insert` and `update` methods,
 just like single `insert`, `update`. This fixes problems with saving JSON attributes and overall,
 make connection object methods more consistent

## [5.3.11] - 2019-08-09
### Changed
 - Domain-based localization logic allows get localized entity or entity attribute not just caption, but also description and documentation.
   In order to do so, use hash tag suffix and `description` or `documentation`, for example:
   - `UB.i18n('uba_user.name#description')`
   - `UB.i18n('uba_audit#documentation')`
   
## [5.3.10] - 2019-07-31
### Fixed
 - in case UBNativeMessage instantiated inside iFrame `window.parent.postMessage` will be called with 
 `targetOrign` calculated during UBNativeMessage.connect. This prevent possible XSS attack to the NativeMessages app 
 - UBNativeMessage will show extension setup instruction ASAP in case `__connect` to native messages host is failed
  Technical details: for unknown reason in chrome 75 response for message to not existing host is a valid message instead of timeout
   
## [5.3.9] - 2019-07-28
### Added
 - `ClientRepository.rawResult` property. Contains a server response in raw format. Can be used to
 get additional response parameters for `select*` methods. For example get lock information together with `select` execution:
```javascript
let repo = UB.Repository('tst_document').attrs('ID', 'reg_date').misc({lockType: 'None'}).where('ID', '=', 332729226657819)
let data = await repo.selectSingle() // {ID: 332729226657819, regDate: Date}
let lockInfo = repo.rawResult.resultLock // {success: true, ownLock: ....}
```
In general any parameters added on the server side to the `ctxt.mParams` is accessible 

## [5.3.6] - 2019-07-11
### Changed
 - error message is added into detailed exception information with h2 HTML tag to be shown in "Details for developer"
 window together with stack trace
 - prevent put empty `file: line:` into exception details in case file name and line number is not available in error stack trace
 - highlight file names in the error stack trace even if it's name not ends wih `.js` extension     
 
### Added
 - added `filter i18n` to UB.install. Can be used as $ut replacement
```vue
<div> {{ 'uba_user' | i18n}} </div> 
<div> {{ 'login' | i18n('Mike') }} </div>
```
is equal to
```vue
<div> {{ $ut('uba_user') }} </div> 
<div> {{ $ut(login, 'Mike') }} </div>
```
  
## [5.3.5] - 2019-06-21
### Fixed
 - global exception interceptor will ignore `ResizeObserver loop limit exceeded` exception.
 [See explanation why](https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded)
 - global exception interceptor will use message as a details in case of unhandled rejection without stack (browser exception for example). 
 This prevent appears of error window with empty details. 

## [5.3.3] - 2019-06-11
### Added
 - new `switchCurrentSession` method added to the UBConnection. It is necessary to be able to quickly switch between user sessions without reconnecting on server side.

## [5.3.1] - 2019-05-21
### Added
 - new property `AsyncConnection.UBQLv2` - true in case server support `value:` instead of `values:{}` in where item
  
## [5.3.0] - 2019-05-20
### Added
 - support for UBQL v2 (value instead of values in whereList)

## [5.2.37] - 2019-05-14
### Fixed
 - ClientRepository.clone() - prevent deep cloning of connection property
 
### Changed
 - remove usage of `lodash` whenever possible

## [5.2.36] - 2019-04-23
### Added
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
 
## [5.2.35] - 2019-04-10
### Changed
 - in case response body is empty `AsyncConnection.xhr` will return null even if `Content-Type` header is iset to `*json`

## [5.2.33] - 2019-03-10
### Changed
 - separate stack trace in developer error reporter onto lines for better readability
### Added
 - optional parameter **fieldAliases** for `ClientRepository.selectById` method
 
## [5.2.31] - 2019-02-27
### Fixed
 - **CRITICAL** `ClientRepository.selectScalar` return `undefined` for cached entities
 even if row exists

### Changed
 - use webpack4 for production build

## [5.2.29] - 2019-02-22
### Fixed
 - WebStorm code insight now work inside vue classes for this.$UB

### Changed
 - `AsyncConnection.appConfig.applicationName` now localized to user language according to 
 settings from `ubConfig`

## [5.2.23] - 2018-12-07
### Added
  - new function `AsyncConnection.setDocument` to easy call a `setDocument` endpoint
  
## [5.2.19] - 2018-11-13
### Added
 - If quite the same request repeated 2 or more times in the last 100ms (so called monkey request) then 
 it putted into the `console.error`    

## [5.2.17] - 2018-10-27
### Added
 - `UBConnection` will handle a `413 Request Entity Too Large` server-side error response and raise a UB.UBAbort message.
 Such response occurs when user try to upload big files and server works behind nginx. To increase allowed payload size 
 use `ubcli generateNginxCfg -maxDocBody XXXm`   

## [5.2.16] - 2018-10-07
### Changed
 - @unitybase/ub-pub/UBConnection module is renamed to AsyncConnection.
 Code what import connection directly like `conn = require('@unitybase/ub-pub/UBConnection')`
 should use `conn = require('@unitybase/ub-pub').UBConnection` instead 
 

## [5.2.14] - 2018-10-05
### Fixed
 - `UBConnection.update` and `UBConnection.insert` should not stringify null values - in other case `null` become "null" string    
 - [unitybase/ubjs#16] - default indexedDB name is changed from `/` to `ub`, because FF can't create indexedDB with name `/` 

## [5.2.12] - 2018-09-30
### Added
 - `UBConnection.update` and `UBConnection.insert` can accept Object as execParams value.
 Such Objects will be stringified before passing request to server   

## [5.2.10] - 2018-09-25
### Added
 - translation for `MAX_TREEPATH_DEPTH_EXCEED`
 
## [5.2.8] - 2018-09-21
### Added
 - support for `CERT2` auth
 - `CERT2` related localization added to i18n
 
## [5.2.6] - 2018-09-11
### Fixed
 - fix call to `btoa` for non-latin string (using encodeURIComponent)

## [5.2.3] - 2018-08-15
### Added
- allow to override UBConnection requestAuthParams after connection is created (for custom UI for example)
```
  function myLoginForm(connection, isRepeat) {
    return new Promise((resolve, reject) => {
      resolve({
        authSchema: 'UB',
        login: '....',
        password: '.....',
        registration: 0
      })
    }
  }
  UB.connection.setRequestAuthParamsFunction(myLoginForm)
```

## [5.2.2] - 2018-08-03
### Added
- UBConnection will store last auth schema to localStorage key (UB.LDS_KEYS.LAST_AUTH_SCHEMA) if LDS is available

## [5.2.0] - 2018-07-13
### Added
- VueJS integration
```
const UB = require('@unitybase/ub-pub')
const Vue = require('vue')
Vue.use(UB)

  // localization of vue template
  <button >{{ $ut('Enter') }}</button>
  // in case translation result is HTML + use formatting
  <p v-html="$ut('UBAuthHeader', appName)"></p>
  // inside binding
  <el-tooltip :content="$ut('UBAuthTip')" placement="bottom" effect="light">
  // inside vue methods
  this.$ut('UBAuthTip')

  // using UB inside vue methods
  methods: {
     hasNegotiate: function () {
       return this.$UB.connection && (this.$UB.connection.authMethods.indexOf('Negotiate') !== -1)
     }
  }
```

- Extended i18n
```
 //Localized string can be formatted either by position args:
  UB.i18nExtend({
    greeting: 'Hello {0}, welcome to {1}'
  })
  UB.i18n('greeting', 'Mark', 'Kiev') // Hello Mark, welcome to Kiev

  //Or by named args:
  UB.i18nExtend({
    namedGreeting: 'Hello {name}, welcome to {place}'
  })
  UB.i18n('namedGreeting', {name: 'Mark', place: 'Kiev'}) // Hello Mark, welcome to Kiev

  //Localization itself can be an object:
  UB.i18nExtend({
    loginPage: { welcome: 'Welcome to our app', user: 'Dear {user}'}
  })
  UB.i18n('loginPage.welcome') // Welcome to our app
  UB.i18n('loginPage.user', {user: 'Pol}) // Dear Pol
  UB.i18n('loginPage') // return object {welcome: "Welcome to our app", user: "Dear {user}"}
```

- UB.LDS_KEYS enum with localStorage keys used by ub-pub in browser mode
- localisations for login window & server-side errors now inside ub-pub
- fake UB.view & UB.ux properties added to package to fix ExtJS components visibility in case `UB = require(''@unitybase/ub-pub')`

## [5.1.0] - 2018-07-08
### Added
- new method `setErrorReporter`. Developer can set his own function that will show
 unhandled errors to user. Default error reporter will show unhandled error as `window.alert`
 for browser environment and `console.error` for non-browsers.
   - for adminUI is set to `UBPub.setErrorReporter(UB.view.ErrorWindow.showError.bind(UB.view.ErrorWindow))`
   - for portalUI should be called by developer. Vue sample:
   ```
   vm = new Vue({
     ...
     methods: {
       showError: function({errMsg, errCode, entityCode, detail}) {
           this.$message({
             showClose: true,
             message: errMsg,
             type: 'error'
           })
         }
       }
     })
   UB.setErrorReporter(vm.showError.bind(vm))
   ```

### Changed
- for a browser environment package will add a browser-level unhandled rejection handlers
  and redirect unhandled errors to the error reported ( see new `setErrorReporter` method)
- for a browser environment `UB.connect` will automatically resolve "silence kerberos login" - situation
 when localStorage.silenceKerberosLogin key is set to "true". In this case `onCredentialRequired` callback is not
 called and Kerberos/NTLM auth method will be used (if Negotiate is in the application auth list)

## [5.0.15] - 2018-07-06
### Fixed
- '@unitybase/ub-pub'.Repository (i.e. UB.Repository) will be defined inside `ub-pub` instead of `adminUI`

## [5.0.13] - 2018-06-18
### Fixed
- UBConnection constructor will understand react native environment and create a server URL correctly

### Added
- ReactNative detection added
```
const UB = requite('@unitybase/ub-pub')
if (UB.isReactNative) {...}
```

### Changed
- for ReactNative environment set a default UB.xhr timeout to 5sec instead of 120sec to prevent freezing of ReactNative app

## [5.0.12] - 2018-06-04
### Fixed
- Package `@unitybase/cryptojs` expose as SystemJS will include typed array

## [5.0.11] - 2018-06-03
### Fixed
- for environment with SystemJS (usually browser) package will expose
 itself and `@unitybase/cryptojs` as SystemJS module to prevent double-loading
- injection.addResourceVersion correctly add version to URI with parameters (if `?` exists will use `&` as separator)

## [5.0.10] - 2018-05-24
### Fixed
- request for retrieve data for cached entity from server will remove `logicalPredicates`
 in addition to where & order lists

## [4.5.0] - 2018-02-24
### Changed
- **BREAKING** Native messages features moved to the modules in `@ub-e` namespace.
  Depending on feature required for application add a `@ub-e/nm-docedit`, `@ub-e/nm-pdfsign`
  or `@ub-e/nm-scanner` to application packages (don't need to add to a domain models)

## [4.4.13] - 2017-10-17
### Fixed
 - UBNotifierWSProtocol do not connect with server after UBConnection restore session. The session can be restored when configuration parameter allowSessionPersistent = true.
 - Bug with parsing message of UBError: string caught by regexp is caught from JSON representation, not from original error message, therefore, the error message is JSON encoded string,
   which means the double-quotes would be encoded with backslashes, which does not look good
 - i18n now recognizes entity and attribute names so that `UB.i18n('uba_user')` or `UB.i18n('uba_role.description')` would be resolved
   to localized entity caption or entity attribute caption

## [4.4.11] - 2017-10-12
### Changed
 - In case of session persistent clear the session key only for 
   401 response status (instead of all > 300)
 
## [4.4.6] - 2017-09-04
### Added
- ub-pub now export a `UBCache` class, so instead of 
```
UBCache = require('@unitybase/ub-pub/UBCache')
```
better use a 
```
UBCache = require('@unitybase/ub-pub').UBCache
```


## [4.4.1] - 2017-05-19
### Changed
- UBConnection.on('passwordExpired') callback now accept connecton as a argument

### Fixed
- allow reconnect even if exception is occurred inside UBConnection 'authorized' / 'authorizationFail' event handlers
- in case language for user not stored in uba_user.uData will set a 
`UBConnection.userLang=appConfig.defaultLang` instead of `appConfig.supportedLanguages[0]` 
witch depends on how languages configured for database connections

## [4.4.0] - 2017-05-16
### Changed
 - all DSTU cryptography routines are moved to `@ub-d/mn-dstu` package

## [4.3.5] - 2017-05-13
### Fixed
- New event "notify" in UBNativeMessage instead of promise.notify

### Changed
- simplify a UBNativeMessages.features by **removing a `dstu`** feature (for UB Defence @ub-d/nm-dstu model must be added to domain)

## [4.3.4] - 2017-04-20
### Fixed
- throw correct exception text in case of clien-side auth handshake error in UBConnection

### Changed
- only `auth` & `getAppInfo` endpoint are "unauthorized" for UBConnection (remove `models` & `downloads`)


## [4.3.1] - 2017-03-27
### Fixed
 - correclty restore connsection.userLang() in case persisted session is used

## [4.3.0] - 2017-03-27
### Added
 - ability to persist session for `UBConnection` ( `allowSessionPersistent` connect config parameter) - for 
 usage inside non-SPA browser clients. Cleared after `connection.logout()` or in case server log out user.
 
## [4.2.0] - 2017-03-20
### Added
- Package @unitybase/ub-pub now can be used from nodeJS - see [usage samlpe](https://gitlab.intecracy.com/unitybase/samples/tree/master/use-nodejs)

## [4.1.5] - 2017-03-20
### Added
- parameter `onAuthorized` added to `UBConnection.connect` - Callback for authorization success. See `authorized` event
