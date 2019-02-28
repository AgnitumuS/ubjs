# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.2.5]
### Fixed
 - removed extra files from boundle

## [5.2.4]
### Changed
  - DocFlow specific server-side i18n are removed from @unitybase/ub
  
## [5.2.0]
### Added
 - extended `App.authFromRequest` - added optional Cookies for Negotiate authentication (UB server should be updated to 5.7.7+)
 - `THTTPResponse.getBodyForDebug` function
 - `App.globalCachePut` will accept `null` as 2nd parameter. In this case key will be removed from globalCache (UBserver@5.7.7+)  

## [5.1.1]
### Fixed
 - `DataStore.initialize` will correctly init store from a flatten format in case rowCount = 0 [unitybase/ubjs#31]

## [5.1.0]
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
 
## [5.0.45]
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

## [5.0.44]
### Changed
 - `$.currentUserOrUserGroupInAdmSubtable` RLS macros will add all user roles including pseudo-roles `Everyone` `User` & `Anonymous`
 Previous implementation did not check pseudo-roles.    

## [5.0.43]
### Changed
- `docflow` related legacy code is removed from `RLS.js` (known as $ in "rls" mixin expression)
 
## [5.0.38]
### Fixed
- domain documentation generator fixed `ubcli generateDoc -u admin -p admin` 

## [5.0.37]
### Added
- `getAppInfo` endpoint return a application version in `appVersion` key.
 Version taken from application package.json version attribute.
 Client side can read it from `connection.appConfig.appVersion`.

## [5.0.23]
### Changed
- `allLocales` endpoint will join locales from all models (since login form localization moved to ub-pub
 we do not need to skip a adminui-pub localization anymore)

## [5.0.19]
### Changed
- values from locale folder merged to the ub-pub model localization

## [5.0.19]
### Added
- the `adminui.loginURL` setting described in `ubConfig.schema.json`
- the `httpServer.externalURL` configuration parameter is added to ubConfig.
 URL that the User from the internet will use to access your server.
 To be used in case server is behind a reverse proxy
- `App.externalURL` property added - either `httpServer.externalURL` of `App.serverURL` if external URL not configured

## [5.0.18]
### Fixed
- **CRITICAL** prevent transferring of application files to client in case `httpServer.inetPub` is empty in config
- THTTPResponse methods `badRequest`, `notFound` and `notImplemented` will return charset in
 Content-Type header as required by HTTP 1.0

## [5.0.16]
### Added
- new endpoind `allLocales` - return a single localization script bundled from all models public/locale/lang-${Session.userLang} scripts
 excluding adminui-pub what injected before login window

## [5.0.12]
### Added
- new function `App.blobStores.markRevisionAsPermanent` allow to prevent
specified revision of historical store from deletion during history rotation

### Changed
- historical BLOB stores will put create a record in ub_blobHistory on commit.
 In prev. implementation a record in history was added after the update

### Fixed
- `mdb` BLOB stores will automatically crate a folder in case
it's not exists(for example user create a ER diagram etc.)

## [5.0.8]
### Fixed
- fileSystemBlobStore will add a entropy to the persistent file name to prevent
 possible file name duplication for historical data
- fileSystemBlobStore rotateHistory will delete only revisions older when `store.historyDepth`
- fix UB4 store compatibility - automatic detection of store implementation in case blobStore.implementedBy not defined

## [5.0.0]
### Added
- `UB.blobStores` interface for working with BLOBs content
- new entity `ub_blobHistory` for storing BLOB store revisions information instead of *.fti files
- BLOB stores "Monthly" and "Daily" sizes"
- automatically creation of BLOB store structure - no need to call `ubcli createStore` anymore. 
  In case of DFS folders should be created/mounted manually
  
## [4.0.30]
### Added

### Fixed
- `mdb` virtual data store correctly handle models with public path only 
- `clientRequire` endpoint return correct mime type for files (using mime-db)
- optimize `clientRequire` endpoint by caching resolved path's to globalCache
- UB.UBAbort server side exception stack trace now independent of UB.js placement
