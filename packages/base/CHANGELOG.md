# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
  - `SyncConnection.prototype.Reposiroty` fabric function can accept serialized UBQL as a parameter (instead of entity code)
   In this case result will be a Repository de-serialized rom a given UBQL
   
    
## [5.1.34] - 2019-11-19
### Added
 - argv.getServerConfiguration() will resolve a httpServer.inetPub location to absolute path

## [5.1.33] - 2019-11-07
### Fixed
 - prevent an error in `dataLoader.localizeEntity` when running initialization scripts on entities with `softLock` mixin

## [5.1.29] - 2019-10-01
### Fixed
 - csv parser: in case parse called with one argument, force default comma to be `;`;
 This fix a case if previous call to parse(text, ',') overrides default separator globally
 
## [5.1.28] - 2019-09-28
### Added
  -  `@unitybase/base.ubVersionNum` property - a Numeric representation of process.version.
  For example if process.version === 'v5.14.1' then ubVersionNum === 5014001; Useful for feature check
  
## [5.1.23] - 2019-08-13
### Changed
 - `csv` module: reformatting & fix ESLint warnings  
 
## [5.1.18] - 2019-07-10
### Changed
 - added support of UBQLv2 for `DataLoader.localizeEntity`
  
## [5.1.16] - 2019-06-25
### Fixed
 - `ServerRepository.using('methodOtherWhenSelect')` now work as expected. Before this patch using is ignored and `select` is called
 
## [5.1.11] - 2019-05-22
### Fixed
 - ServerRepository will check UBQLv2 compatibility core both remote and local connection.
 This fix issue `where item with condition "equal" must contains "values" part"` in case ub server version is <5.10 but
 package `@unitybase/ub` is >=5.2.11  

## [5.1.9] - 2019-05-14
### Fixed
 - ServerRepository.clone() - prevent deep cloning of connection property

## [5.1.8] - 2019-04-10
### Changed
 - in case response body is empty `SyncConnection.xhr` will return null even if `Content-Type` header is iset to `*json`

## [5.1.7] - 2019-04-02
### Added
 - optional parameter **fieldAliases** for `ServerRepository.selectById` method 

## [5.1.5] - 2019-03-06
### Fixed
 - @unitybase/base.options will accept `--help` for show help (also `-help` and `-?` is supported)
 - better formatting for `ubcli command --help`

## [5.1.1] - 2018-12-29
### Added
 - `GC_KEYS` dictionary to store all known by UB global cache keys (ot prefixes) in the single place

## [5.1.0] - 2018-12-12
### Added
 - handling of new authentication schema 'ROOT' in `argv.establishConnectionFromCmdLineAttributes`.
 Can be used in case client and server is the same process (client explicitly call `startServer()`)

## [5.0.32] - 2018-12-09
### Changed
 - `SyncConnection.setDocument` can accept optional `dataEncoding` parameter.
 Set it to `base64` if content is a base64 encoded binary.

### Added
 - default value (X-Conn-ID) for new `reverseProxy.remoteConnIDHeader` is added
 to `argv.getServerConfiguration`

## [5.0.28] - 2018-12-05
### Changed
  - `UBA_COMMON.isSuperUser` method now return `true` only is user is exactly `admin` or `root`.
    Prev. implementation return `true` for any user what member of `admin` role. Method is useful 
    for example to prevent Session.on(`login`) event handlers for DDL generations
```
const UBA_COMMON = require('@unitybase/base').uba_common
Session.on('login', () => {
  if (UBA_COMMON.isSuperUser()) return
  // get data from other tables what may not exists while DDL is not ready
})
```

### Added
 - `UBA_COMMON.haveAdminRole` method is added - check logged in user is a member of `admin` role
   
  
## [5.0.27] - 2018-10-20
### Added
  - add `name` property to Worker for better debugging experience
  
## [5.0.27] - 2018-10-20
### Changed
- `argv.getServerConfiguration` will transform `blobStore.path` & `blobStore.tempPath` to absolute path
 If path is relative it will be transformed to absolute starting from `process.configPath`.
 So now paths inside `App.serverConfig.application.blobStores` is absolutes.
- `argv.getServerConfiguration` will add default for `httpServer.externalURL`
- if `reverseProxy.kind` === `nginx` then default values for reverse proxy config are:
  - `reverseProxy.remoteIPHeader`: 'X-Real-IP'
  - `reverseProxy.sendFileHeader`: 'X-Accel-Redirect'
  - `reverseProxy.sendFileLocationRoot`: HTTPServer.externalURL.hostname with dots replaced to '-' (http://myhost.com - > myhost-com)

  Please, **upgrade ub server to at last 5.4.2** to default values work properly.


## [5.0.26] - 2018-10-20
### Changed
- ServerRepository.selectSingle now accepts an optional fieldAliases parameter, which works just like in selectAsObject

## [5.0.17] - 2018-07-25
### Fixed
- ServerRepository.selectAsObject now accept two optional parameters
  `selectAsObject(fieldAliases, resultInPlainText)` to be compatible with ClientRepository.

  **WARNING** using fieldAliases on server side cause a little performance degradation

## [5.0.10] - 2018-05-13
### Changed
- argv.getServerConfiguration during parsing ubConfig application.domain.models
 config will take model parameters from model package.json config.ubmodel
 object in case model `name` is omitted in config. This allow simplify a config as such:

 ```
 "models": [
    {
      "path": "./node_modules/@unitybase/ub"
    }, {
      "path": "./node_modules/@unitybase/uba"
    }, ...
  ```

## [5.0.6] - 2018-05-04
### Changed
- change default value of `-host` command line parameter from http://localhost:888 to http://localhost:8881

## [5.0.0] - 2018-01-15
### Added
- UBEntity.isUnity property added
- SyncConnection.getDocument method

## [4.2.27] - 2018-01-08
### Changed
- allow blank for mi_dateTo record history mixin attribute on browser side
 (but for DDL generator mi_dateTo must be not null, so for non-browser keep it as is)

## [4.2.26] - 2018-01-08
### Fixed
- entity localization files `*.meta.lang` now can contains `attributes` section 
defined as array 
```
"attributes": [{"name": "arrtCode", ...}, ...]
```
(object also supported)

## [4.2.24] - 2018-01-03
### Added
- `dataLoader` module, method lookup now supports optional parameter `doNotUseCache`, which allows
  loading hierarchical data, with references to itself, when each next row may point to previous rows in CSV or array.
  NOTE: use transLen = 1 for such scenarios, otherwise it won't work, because lookup would happen before parent rows inserted

## [4.2.23] - 2017-10-26
### Added
- `FileBaseStoreLoader` now use a `CRC32(fileDate.toString())` to calculate a cache version (UB only).
Prev. implementataion based on max file modification date fails in 
case we updated something backwards

## [4.2.21] - 2017-10-05
### Added
- `argv.establishConnectionFromCmdLineAttributes` can accept a `-timeout` command line which
 set a connection receive timeout. By default timeout increased to 120 set to
 allow a long-live script execution

## [4.2.20] - 2017-09-22
### Added
- UBDoman iterator callbacks described as @callback for better code insight

## [4.2.17] - 2017-09-13
### Fixed
- prevent ORA-00932 error - in case `Repository.where(attr, 'in', undefined)` -> replace it by (0=1) SQL statement

## [4.1.0] - 2018-09-27
### Added
- `argv.getConfigFileName` take a config from UB_CFG environment variable if `-cfg` cmd line switch omitted
- `FileBaseStoreLoader.load()` now return data version in TubDataCache. 
  To be used in file-based entitis select's instead of version calculation individually in each entity
- `SyncConnection.setDocument` method for convinient uploading content to temp store, for example in model initialization or
  data update/migration scripts

### Fixed
- LocalDataStore sometimes not filter by ID (known bug in TubList)
