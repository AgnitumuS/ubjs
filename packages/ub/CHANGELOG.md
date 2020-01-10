# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
 - `App.endpointContext` - an empty object what can be used to store data for a single endpoint execution.
   Application logic can store here some data what required during single HTTP method call;
   Starting from UB@5.17.9 server reset `App.endpointContext` to {} after endpoint implementation execution,
   so in the beginning of execution it's always empty  

### Changed

### Deprecated

### Removed

### Fixed

## [5.3.10] - 2019-12-27
## [5.3.9] - 2019-12-20
### Changed
 - Improved JSON schema for ubConfig.json: add support for `uiSetting.cspAllow`

## [5.3.8] - 2019-12-18
### Changed
  - UBAbort constructor now accept optional additional arguments, which will be passed down to client.
    Anticipated scenario of usage:
    ```
    throw new UB.UBAbort('<<<file_not_found>>>', 'bad_file.name')
    ```
    The "file_not_found" i18n string on client should be like `'File "{0}" is not found or not accessible'`.

## [5.3.3] - 2019-11-21
### Added
  - new server config parameter `security.excludeGroups: ["group1", ...]`
   Groups codes (uba_group.code) to EXCLUDE from available user groups during user logon.
   Useful in case a same DB is used by several server instances, and one of instance
   (private portal for example) should limit roles available to user.
   **WARNING** - roles what assigned directly to user (in uba_userroles) **NOT** filtered and remains available
   
### Changed
 - in case nginx is used as a reverse proxy (http.reverseProxy.kind === 'nginx' in app config)
 `/statics` endpoint on the UB level simply redirect to `/statics` nginx location.
 `ub-proxy.cfg` nginx config should be upgraded by `npx ubcli generateNginxCfg` (or rule for `location /statics` should be added manually)  

## [5.3.0] - 2019-10-18
### Added
 - new server config parameter `security.limitGroupsTo: ["group1", ...]`
  Groups codes (uba_group.code) to limit available user groups during user logon.
  Useful in case a same DB is used by several server instances, and one of instance
  (public portal for example) should limit roles available to user.
  **WARNING** - roles what assigned directly to user (in uba_userroles) **NOT** filtered and remains available   

 - `App.grantEndpointToRole(endpointName, roleCode)` - programmatically grant endpoint permission to specified role
 
### Changed
 - changes for UB server >= 5.17 (backward compatible):
   - data type of Session.id is changed form Number to String and retrieved lazy.
     In general this property should not be used in app code
   - `Session.runAsUser` will create a temporary session what live until the end of request (not persisted to sessionManager)
   
 
## [5.2.37] - 2019-09-28
### Fixed
 - `getDomainInfo` endpoint now compatible with UB server <= 5.16 (compatibility broken by @unitybase/ub@5.2.36) 

## [5.2.36] - 2019-09-22
### Fixed
 - `getDomainInfo` endpoint optimization: starting from UB 5.15.4 nativeGetDomainInfo can wrote domain
  directly into HTTP response instead of serializing it to/from JS engine. This save up to 70ms on huge domains
 - `authMock` property added (if server started with --authMock switch) to getAppInfo endpoint response 

## [5.2.35] - 2019-09-19
### Added
 - documented ability to set log file path (`logging.path`) to the specified file and disable log rotation by setting 
 `logging.rotationSizeInMB` to 0
 - `logging.threadingModel` is marked as deprecated
  
### Fixed
 - added documentation for `model` configuration parameter for `aclRls` mixin 

## [5.2.32] - 2019-08-28
### Changed
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
},
```  

## [5.2.29] - 2019-08-13
### Added
 - `uiSettings.adminUI.registrationURL` parameter.
 In case parameter is empty or not exists (default) then registration link do not displayed on the default
 authentication form (@unitybase/adminui-vue/views/ub-auth.html). Otherwise a link to the specified URL is displayed
 
## [5.2.24] - 2019-07-10
### Fixed
 - `Session.runAsUser` & `Session.runAsAdmin` should restore original session even if one of `login` handler fails for passed user
 
### Changed
 - server-side UB.i18n now support formatting (like client side i18n). Sample:
```js
UB.i18nExtend({
  "en": { greeting: 'Hello {0}, welcome to {1}' },
  "ru": { greeting: 'Привет {0}, добро пожаловать в {1}' }
})
UB.i18n('greeting', 'Mark', 'Kiev') // in case current user language is en -> "Hello Mark, welcome to Kiev"
UB.i18n('greeting', 'uk', 'Mark', 'Kiev') // in case ru lang is supported -> "Привет Mark, добро пожаловать в Kiev"
```

### Added
 - new configuration key `security.domainMap` - rules for transformation of fully qualified domain names to NT4-style.
 To be used for Negotiate authentication under Linux in case domain name contains dots.
 For example to prevent transformation of `user@MYCOMPANY.COM` -> `MYCOMPANY\\user` (default behavior) the following can be configured:
 ```JSON5
{
  //....
  "security": {
    "authenticationMethods": ["UB", "Negotiate"],
    "domainMap": {
      "MYCOMPANY.COM": "MYCOMPANY.COM"
    }
  }
}
```    
 In this case Negotiated user name will be  `MYCOMPANY.COM\\user`

## [5.2.22] - 2019-07-04
### Added
 - update ubConfig JSON schema about new key `uiSettings.adminUI.pdfViewer.uriSuffix`

## [5.2.18] - 2019-06-19
### Added
 - `App.dbConnection['..'].savepointWrap` function: rollback a part of transaction for PostgreSQL.
 This fix [unitybase/ub-server#26] - see issue discussion for details

## [5.2.12] - 2019-04-28
### Added
 - new method `THTTPRequest.writeToFile(fullFilePath)` - write request body content (as binary) to a file.
 Return `true` on success. Can be used to bypass moving body content between native<->JS
 if conversion of the request body is not required.  

### Fixed
 - Windows: `UB.UBAbort` server-side exception fileName & lineNum now valid in case
 file name is absolute path starts with drive letter. Prev. implementation puts drive letter instead of fileName 


## [5.2.11] - 2019-04-07
### Added
 - Entity metadata merging: in case descendant model contains entity with the same name as
 original model they `*.meta` files will be **MERGED** (before this patch descendant overrides parent).
 This allow to **override only part of meta-file attributes/properties in descendants**.
 
## [5.2.5] - 2019-02-24
### Fixed
 - removed extra files from bundle

## [5.2.4] - 2019-02-14
### Changed
  - DocFlow specific server-side i18n are removed from @unitybase/ub
  
## [5.2.0] - 2019-01-13
### Added
 - extended `App.authFromRequest` - added optional Cookies for Negotiate authentication (UB server should be updated to 5.7.7+)
 - `THTTPResponse.getBodyForDebug` function
 - `App.globalCachePut` will accept `null` as 2nd parameter. In this case key will be removed from globalCache (UBserver@5.7.7+)  

## [5.1.1] - 2018-12-17
### Fixed
 - `DataStore.initialize` will correctly init store from a flatten format in case rowCount = 0 [unitybase/ubjs#31]

## [5.1.0] - 2018-12-12
### Changed
 - initial values of `Session.uData` now filled inside JS `Session._getRBACInfo` (`@unitybase/ub`)
 instead of duplication of code inside UB server and `@unitybase/uba` model
 - in case user is a member of **security group** (uba_group / uba_usergroup) then roles assigned 
 to this groups will be added to the user roles. ELS for such a roles will be also applied to user.
 **UB server must be upgraded to >= 5.7.3**
 - uData employeeShortFIO & employeeFullFIO now initialized from uba_user.firstName & uba_user.fullName.
 In case `org` model is in domain then it will override employeeShortFIO & employeeFullFIO
 
### Added
 - `Session.uData.groupIDs` property - an array of group IDs user id assigned to
 
## [5.0.45] - 2018-10-09
### Fixed
 - **CRITICAL** endpoints `models`, `clientRequire` & `static` will return `Bad Request` in case
 of access folder (not a file). 
 
 Explanation:
 
 This patch prevent exposing of internal location to caller in case `nginx` is used as a reverse proxy.
 The problem is how `nginx` handle `location` - see [last paragraph of nginx location documentation](http://nginx.org/en/docs/http/ngx_http_core_module.html#location).
 
 In case our endpoints return 200 with `X-Accel-Redirect: path/to/folder` inside internal location, then
 `nginx` will redirect client (return 301) to `path/to/folder` + `/` with internal location inside.
 
 For example without this patch request to `http://localhost/models/UB/schemas` will redirect client to 
 `https://localhost/ubstatic-unitybase-info/app/node_modules/@unitybase/ub/public/schemas/` with 404 and
 expose to caller our internal folders structure. 

## [5.2.30] - 2019-08-14
### Changed
 - explicitly disable audit for system entity ub_blobHistory 

## [5.0.44] - 2018-10-06
### Changed
 - `$.currentUserOrUserGroupInAdmSubtable` RLS macros will add all user roles including pseudo-roles `Everyone` `User` & `Anonymous`
 Previous implementation did not check pseudo-roles

## [5.0.43] - 2018-10-05
### Changed
- `docflow` related legacy code is removed from `RLS.js` (known as $ in "rls" mixin expression)
 
## [5.0.38] - 2018-09-25
### Fixed
- domain documentation generator fixed `ubcli generateDoc -u admin -p admin` 

## [5.0.37] - 2018-09-23
### Added
- `getAppInfo` endpoint return a application version in `appVersion` key.
 Version taken from application package.json version attribute.
 Client side can read it from `connection.appConfig.appVersion`.

## [5.0.23] - 2018-07-15
### Changed
- `allLocales` endpoint will join locales from all models (since login form localization moved to ub-pub
 we do not need to skip a adminui-pub localization anymore)

## [5.0.19] - 2018-06-27
### Changed
- values from locale folder merged to the ub-pub model localization

## [5.0.19] - 2018-06-27
### Added
- the `adminui.loginURL` setting described in `ubConfig.schema.json`
- the `httpServer.externalURL` configuration parameter is added to ubConfig.
 URL that the User from the internet will use to access your server.
 To be used in case server is behind a reverse proxy
- `App.externalURL` property added - either `httpServer.externalURL` of `App.serverURL` if external URL not configured

## [5.0.18] - 2018-06-21
### Fixed
- **CRITICAL** prevent transferring of application files to client in case `httpServer.inetPub` is empty in config
- THTTPResponse methods `badRequest`, `notFound` and `notImplemented` will return charset in
 Content-Type header as required by HTTP 1.0

## [5.0.16] - 2018-06-03
### Added
- new endpoind `allLocales` - return a single localization script bundled from all models public/locale/lang-${Session.userLang} scripts
 excluding adminui-pub what injected before login window

## [5.0.12] - 2018-05-18
### Added
- new function `App.blobStores.markRevisionAsPermanent` allow to prevent
specified revision of historical store from deletion during history rotation

### Changed
- historical BLOB stores will put create a record in ub_blobHistory on commit.
 In prev. implementation a record in history was added after the update

### Fixed
- `mdb` BLOB stores will automatically crate a folder in case
it's not exists(for example user create a ER diagram etc.)

## [5.0.8] - 2018-05-07
### Fixed
- fileSystemBlobStore will add a entropy to the persistent file name to prevent
 possible file name duplication for historical data
- fileSystemBlobStore rotateHistory will delete only revisions older when `store.historyDepth`
- fix UB4 store compatibility - automatic detection of store implementation in case blobStore.implementedBy not defined

## [5.0.0] - 2018-02-13
### Added
- `UB.blobStores` interface for working with BLOBs content
- new entity `ub_blobHistory` for storing BLOB store revisions information instead of *.fti files
- BLOB stores "Monthly" and "Daily" sizes"
- automatically creation of BLOB store structure - no need to call `ubcli createStore` anymore. 
  In case of DFS folders should be created/mounted manually
  
## [4.0.30] - 2017-05-17
### Added

### Fixed
- `mdb` virtual data store correctly handle models with public path only 
- `clientRequire` endpoint return correct mime type for files (using mime-db)
- optimize `clientRequire` endpoint by caching resolved path's to globalCache
- UB.UBAbort server side exception stack trace now independent of UB.js placement
