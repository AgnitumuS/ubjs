# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.27]
### Added
  - add `name` property to Worker for better debugging experience
  
## [5.0.27]
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


## [5.0.26]
### Changed
- ServerRepository.selectSingle now accepts an optional fieldAliases parameter, which works just like in selectAsObject

## [5.0.17]
### Fixed
- ServerRepository.selectAsObject now accept two optional parameters
  `selectAsObject(fieldAliases, resultInPlainText)` to be compatible with ClientRepository.

  **WARNING** using fieldAliases on server side cause a little performance degradation

## [5.0.10]
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

## [5.0.6]
### Changed
- change default value of `-host` command line parameter from http://localhost:888 to http://localhost:8881

## [5.0.0]
### Added
- UBEntity.isUnity property added
- SyncConnection.getDocument method

## [4.2.27]
### Changed
- allow blank for mi_dateTo record history mixin attribute on browser side
 (but for DDL generator mi_dateTo must be not null, so for non-browser keep it as is)

## [4.2.26]
### Fixed
- entity localization files `*.meta.lang` now can contains `attributes` section 
defined as array 
```
"attributes": [{"name": "arrtCode", ...}, ...]
```
(object also supported)

## [4.2.24]
### Added
- `dataLoader` module, method lookup now supports optional parameter `doNotUseCache`, which allows
  loading hierarchical data, with references to itself, when each next row may point to previous rows in CSV or array.
  NOTE: use transLen = 1 for such scenarios, otherwise it won't work, because lookup would happen before parent rows inserted

## [4.2.23]
### Added
- `FileBaseStoreLoader` now use a `CRC32(fileDate.toString())` to calculate a cache version (UB only).
Prev. implementataion based on max file modification date fails in 
case we updated something backwards

## [4.2.21]
### Added
- `argv.establishConnectionFromCmdLineAttributes` can accept a `-timeout` command line which
 set a connection receive timeout. By default timeout increased to 120 set to
 allow a long-live script execution

## [4.2.20]
### Added
- UBDoman iterator callbacks described as @callback for better code insight

## [4.2.17]
### Fixed
- prevent ORA-00932 error - in case `Repository.where(attr, 'in', undefined)` -> replace it by (0=1) SQL statement

## [4.1.0]
### Added
- `argv.getConfigFileName` take a config from UB_CFG environment variable if `-cfg` cmd line switch omitted
- `FileBaseStoreLoader.load()` now return data version in TubDataCache. 
  To be used in file-based entitis select's instead of version calculation individually in each entity
- `SyncConnection.setDocument` method for convinient uploading content to temp store, for example in model initialization or
  data update/migration scripts

### Fixed
- LocalDataStore sometimes not filter by ID (known bug in TubList)
