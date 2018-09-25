# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

