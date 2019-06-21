# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.3.5]
### Fixed
 - global exception interceptor will ignore `ResizeObserver loop limit exceeded` exception.
 [See explanation why](https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded)
 - global exception interceptor will use message as a details in case of unhandled rejection without stack (browser exception for example). 
 This prevent appears of error window with empty details. 

## [5.3.3]
### Added
 - new `switchCurrentSession` method added to the UBConnection. It is necessary to be able to quickly switch between user sessions without reconnecting on server side.

## [5.3.1]
### Added
 - new property `AsyncConnection.UBQLv2` - true in case server support `value:` instead of `values:{}` in where item
  
## [5.3.0]
### Added
 - support for UBQL v2 (value instead of values in whereList)

## [5.2.37]
### Fixed
 - ClientRepository.clone() - prevent deep cloning of connection property
 
### Changed
 - remove usage of `lodash` whenever possible

## [5.2.36]
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
 
## [5.2.35]
### Changed
 - in case response body is empty `AsyncConnection.xhr` will return null even if `Content-Type` header is iset to `*json`

## [5.2.33]
### Changed
 - separate stack trace in developer error reporter onto lines for better readability
### Added
 - optional parameter **fieldAliases** for `ClientRepository.selectById` method
 
## [5.2.31]
### Fixed
 - **CRITICAL** `ClientRepository.selectScalar` return `undefined` for cached entities
 even if row exists

### Changed
 - use webpack4 for production build

## [5.2.29]
### Fixed
 - WebStorm code insight now work inside vue classes for this.$UB

### Changed
 - `AsyncConnection.appConfig.applicationName` now localized to user language according to 
 settings from `ubConfig`

## [5.2.23]
### Added
  - new function `AsyncConnection.setDocument` to easy call a `setDocument` endpoint
  
## [5.2.19]
### Added
 - If quite the same request repeated 2 or more times in the last 100ms (so called monkey request) then 
 it putted into the `console.error`    

## [5.2.17]
### Added
 - `UBConnection` will handle a `413 Request Entity Too Large` server-side error response and raise a UB.UBAbort message.
 Such response occurs when user try to upload big files and server works behind nginx. To increase allowed payload size 
 use `ubcli generateNginxCfg -maxDocBody XXXm`   

## [5.2.16]
### Changed
 - @unitybase/ub-pub/UBConnection module is renamed to AsyncConnection.
 Code what import connection directly like `conn = require('@unitybase/ub-pub/UBConnection')`
 should use `conn = require('@unitybase/ub-pub').UBConnection` instead 
 

## [5.2.14]
### Fixed
 - `UBConnection.update` and `UBConnection.insert` should not stringify null values - in other case `null` become "null" string    
 - [unitybase/ubjs#16] - default indexedDB name is changed from `/` to `ub`, because FF can't create indexedDB with name `/` 

## [5.2.12]
### Added
 - `UBConnection.update` and `UBConnection.insert` can accept Object as execParams value.
 Such Objects will be stringified before passing request to server   

## [5.2.10]
### Added
 - translation for `MAX_TREEPATH_DEPTH_EXCEED`
 
## [5.2.8]
### Added
 - support for `CERT2` auth
 - `CERT2` related localization added to i18n
 
## [5.2.6]
### Fixed
 - fix call to `btoa` for non-latin string (using encodeURIComponent)

## [5.2.3]
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

## [5.2.2]
### Added
- UBConnection will store last auth schema to localStorage key (UB.LDS_KEYS.LAST_AUTH_SCHEMA) if LDS is available

## [5.2.0]
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

## [5.1.0]
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
 when localStorage.silenceKerberosLogin jey is set to "true". In this case `onCredentialRequired` callback is not
 called and Kerberos/NTLM auth method will be used (if Negotiate is in the application auth list)

## [5.0.15]
### Fixed
- '@unitybase/ub-pub'.Repository (i.e. UB.Repository) will be defined inside `ub-pub` instead of `adminUI`

## [5.0.13]
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

## [5.0.12]
### Fixed
- Package `@unitybase/cryptojs` expose as SystemJS will include typed array

## [5.0.11]
### Fixed
- for environment with SystemJS (usually browser) package will expose
 itself and `@unitybase/cryptojs` as SystemJS module to prevent double-loading
- injection.addResourceVersion correctly add version to URI with parameters (if `?` exists will use `&` as separator)

## [5.0.10]
### Fixed
- request for retrieve data for cached entity from server will remove `logicalPredicates`
 in addition to where & order lists

## [4.5.0]
### Changed
- **BREAKING** Native messages features moved to the modules in `@ub-e` namespace.
  Depending on feature required for application add a `@ub-e/nm-docedit`, `@ub-e/nm-pdfsign`
  or `@ub-e/nm-scanner` to application packages (don't need to add to a domain models)

## [4.4.13]
### Fixed
 - UBNotifierWSProtocol do not connect with server after UBConnection restore session. The session can be restored when configuration parameter allowSessionPersistent = true.
 - Bug with parsing message of UBError: string caught by regexp is caught from JSON representation, not from original error message, therefore, the error message is JSON encoded string,
   which means the double-quotes would be encoded with backslashes, which does not look good
 - i18n now recognizes entity and attribute names so that `UB.i18n('uba_user')` or `UB.i18n('uba_role.description')` would be resolved
   to localized entity caption or entity attribute caption

## [4.4.11]
### Changed
 - In case of session persistent clear the session key only for 
   401 response status (instead of all > 300)
 
## [4.4.6]
### Added
- ub-pub now export a `UBCache` class, so instead of 
```
UBCache = require('@unitybase/ub-pub/UBCache')
```
better use a 
```
UBCache = require('@unitybase/ub-pub').UBCache
```


## [4.4.1]
### Changed
- UBConnection.on('passwordExpired') callback now accept connecton as a argument

### Fixed
- allow reconnect even if exception is occurred inside UBConnection 'authorized' / 'authorizationFail' event handlers
- in case language for user not stored in uba_user.uData will set a 
`UBConnection.userLang=appConfig.defaultLang` instead of `appConfig.supportedLanguages[0]` 
witch depends on how languages configured for database connections

## [4.4.0]
### Changed
 - all DSTU cryptography routines are moved to `@ub-d/mn-dstu` package

## [4.3.5]
### Fixed
- New event "notify" in UBNativeMessage instead of promise.notify

### Changed
- simplify a UBNativeMessages.features by **removing a `dstu`** feature (for UB Defence @ub-d/nm-dstu model must be added to domain)

## [4.3.4]
### Fixed
- throw correct exception text in case of clien-side auth handshake error in UBConnection

### Changed
- only `auth` & `getAppInfo` endpoint are "unauthorized" for UBConnection (remove `models` & `downloads`)


## [4.3.1]
### Fixed
 - correclty restore connsection.userLang() in case persisted session is used

## [4.3.0]
### Added
 - ability to persist session for `UBConnection` ( `allowSessionPersistent` connect config parameter) - for 
 usage inside non-SPA browser clients. Cleared after `connection.logout()` or in case server log out user.
 
## [4.2.0]
### Added
- Package @unitybase/ub-pub now can be used from nodeJS - see [usage samlpe](https://gitlab.intecracy.com/unitybase/samples/tree/master/use-nodejs)

## [4.1.5]
### Added
- parameter `onAuthorized` added to `UBConnection.connect` - Callback for authorization success. See `authorized` event
