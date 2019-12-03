# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.4.0] - 2019-11-21
### Added
 - new command `ubcli linkStatic`: creating folder with all static assets (models, modules) what should be available
   for client using `/clientRequire` and `/models` endpoints. Such folder can be served by nginx as a static folder.
   See tutorial [Serving static assets by nginx](https://unitybase.info/api/server-v5/tutorial-reverse_proxy_nginx.html#serving-static-assets-by-nginx)
   for details
 - `npx ubcli generateNginxCfg` will add a location `/statics` what points to `httpServer.inetPub` folder
 - `npx ubcli generateNginxCfg` will add a locations `/clientRequire` and `/models` to nginx config
   in case reverseProxy.serveStatic is true (default)  
   
### Fixed
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json
 
## [5.3.42] - 2019-09-17
### Fixed
 - Oracle DDl generator - do not wrap enum group into quotes when update a value for enum column from `null` to `not null`
 
## [5.3.41] - 2019-09-16
### Fixed
 - Oracle DDl generator - do not wrap enum group into quotes when update a value for enum column with `not null`
   
## [5.3.38] - 2019-08-28
### Changed
 - speed up command `ubcli checkStoreIntegrity` by removing `attribute not null` expression from SQL and 
 check attachment is exist in JS

## [5.3.37] - 2019-08-27
### Added
 - `ubcli generateDoc` will add's API methods available for entities; HTML output is formatted using bootstrap  

## [5.3.36] - 2019-08-23
### Fixed
 - DDL generator will correctly add a JSON columns with `allowNull: false` and without default value;
 For such case estimated value for updating existed rows is set to `{}`
 
## [5.3.35] - 2019-08-20
### Fixed
 - DDL generator: in case database connection does not contains entities for DDL generation (all entities is marked as External for example)
 ubcli generateDDL will skip loading of DB metadata for such connections.
 This fix issue for read-only Oracle connections in which DDL generator try to create a stored procedure and speed up generation for other RDBMS    


## [5.3.30] - 2019-07-23
### Added
 - new command `ubcli checkStoreIntegrity` for validate blobStore consistency by checking equality of the
 md5 checksum stored in the database with actual file MD5
```bash
npx ubcli checkStgoreIntegrity -u ... -p ... -entity tst_document -attribute fileStoreSimple
``` 
see `npx ubcli checkStoreIntegrity --help` for details
   

## [5.3.29] - 2019-07-22
### Fixed
 - in case executed for folder `ubcli meta-tr` will skip files what contains meta in name but not a metafile itself (bla-bla.metadata for example)

## [5.3.28] - 2019-07-17
### Changed
 - `MSSQL2012` dialect will use `NVARCHAR(MAX)` instead of `NVARCHAR(4000)` for JSON 

## [5.3.22] - 2019-06-20
### Added
 - Now `meta-tr` supports path to file or directory contained `*.meta*` files as parameter 
 ```
 npx ubcli meta-tr -m C:\myFolder\myApp\models\tstModel
 ```

## [5.3.19] - 2019-05-29
### Fixed
 - in case ID attribute explicitly specified in meta file and mapped to another attribute whose isUnique===false
 then then the primary key for such an entity is not created 

## [5.3.12] - 2019-04-04
### Added
 - support for Oracle Text and CTXCAT indexes (require Oracle Text to be enabled - see https://docs.oracle.com/cd/E11882_01/install.112/e27508/initmedia.htm#DFSIG269)

## [5.3.11] - 2019-03-11
### Fixed
 - `npx ubcli meta-tr` command now work correctly. Meta content encoding before using `JSON.parse()` was fixed

### Added
 - `npx ubcli generateNginxCfg` will add a Clickjacking/sniffing/XSS protections for /app internal URL.
 This protect both login page (custom and build-in) form such kinds of attacks 
 - new option `-t` or `tests` for `npx ubcli autotest` allow to specify comma separated tests files to execute
 
## [5.3.0] - 2018-12-12
### Changed
 - `generateDDL` command now work under `root` system account and can be executed only locally.
 `-u` and `-p` command line switches not used anymore
```
npx ubcli generateDDL -cfg $UB_CFG -autorun
```
  Since `root` auth schema do not fire `Session.on('logon')` event developers can remove a conditions
  for DDL generation (when database is not fully created yet) 
```
 if (Session.userID === UBA_COMMON.USERS.ADMIN.ID) return
```
  from `Session.on('logon')` handlers
  
## [5.2.6] - 2018-12-09
### Added
 - `generateNginxCfg` now support `reverseProxy.remoteConnIDHeader` and in case
  it is not empty adds a `proxy_set_header {{remoteConnIDHeader}} $connection;`
  section to nginx config

### Changed
 - in case invalid command is passed to `ubcli` human readable error will be shown

## [5.2.4] - 2018-12-04
### Changed
 - **BREAKING** change default floating scale precision from 4 to 6
 - `initDB` will ignore `-host` parameter (always used a host from config)
 - `initDB` will ignore `-u` parameter (always used a `admin`)
 - `initDB` will set a default password for user `admin` as specified in `-p` command line parameter.
   Previous implementation always set the `admin` password to `admin`  
 
### Added 
 - DDl generator will use floating scale precision from UBDomain.FLOATING_SCALE_PRECISION constant
 (6 by default)  

## [5.2.2] - 2018-11-22
### Fixed
 - `npx ubcli generateNgingCfg` will generate correct `ssl_ciphers` list
 - `npx ubcli generateNgingCfg` will add `listen 443 ssl;` in case external URL is HTTPS
 
### Changed
 - `npx ubcli generateNgingCfg` will enable **HTTP 2.0** in case external URL is HTTPS  
 - `ln -s` sample for nginx config will change config file name to the site host name. 
   This help to manage a big productions configs.  

## [5.2.0] - 2018-11-19
### Added 
 - `npx ubcli` will display short commands descriptions in addition to command names
 - new command `meta-tr` added to `ubcli` to be used to transform *.meta attributes from Object to Array as
 required by latest Entity JSON schema:
```bash
 npx ubcli meta-tr -m /home/mpv/dev/ubjs/apps/autotest/models/TST/tst_document.meta
```   
  
## [5.1.4] - 2018-10-18
### Fixed 
 - `ubcli initDB -drop` for SQLite3 will also delete possible WAL logs (-wal and -shm files)
 - `ubcli generateNginxConfig` will add `expire` and `Cache-Control` for
  internal locations to force browser to check resources on server is actual. For DEV modes
  set expires to 0 in `../app` internal location

### Changed
 - `ubcli generateNginxConfig` now use `httpServer.externalURL` from server config for
 generation of nginx proxy server_name.
  - many improvements to nginx config generated `ubcli generateNginxConfig` - 
  **we recommend to recreate reverse proxy configs** after upgrading ub server and all packages.

## [5.1.2] - 2018-10-05
### Fixed 
 - [unitybase/ubjs#15] - Postgre DDl generator must use `SELECT nextval('${sequenceObj}')`
 for sequence incrementing

## [5.1.0] - 2018-10-03
### Added
- `ubcli generateDDL` now support Json type attributes

### Fixed
 - database initialization scripts will create DDL for uba_els.code & uba_els.ruleType 
 as NVARCHAR instead of VARCHAR as in current metadata
 - return back creation of sequences for cached entities (lost during ub1.12 -> ub5 migration).
  This patch speed up getting of cached entities cache version (especially for large tables)
   and fix [unitybase/ubjs#15] for all DB except SQLite3 

## [5.0.40] - 2018-09-07
### Fixed
- `ubcli generateDDL` will skip DDL generation for entities without `mStorage` mixin [unitybase/ubjs#11]
- When create a new DB using `ubcli initDB -create` command, the created user for
  SQL Server database have correct default schema `dbo` [unitybase/ubjs#12]

## [5.0.30] - 2018-07-27
### Fixed
- fixed [unitybase/ubjs#9] DDL SQLite3 "Error: this.DDL.dropColumn.push is not a function"

## [5.0.29] - 2018-07-25
### Fixed
- fixed [unitybase/ubjs#7] - missing genCodeDropPK in SQL Server DDl generator

## [5.0.28] - 2018-07-21
### Fixed
- Fixed [unitybase/ubjs#5] - DDL generation will drop and re-create indexes of columns if column type is changed

## [5.0.19] - 2018-06-21
### Fixed
- PostgreSQL DDL generator will ignore functional ("func") index definition in `dbExtensions`
 section (should be applied only for Oracle as documented)
- PostgreSQL DDL generator will generate single-quoter string for estimation update of newly
 added not null attributes of string type

## [5.0.18] - 2018-06-06
### Fixed
- `ubcli createStore` will create temp path even if it is relative.
 In this case we consider path is relative to config path

## [5.0.16] - 2018-05-31
### Fixed
- fix retrieve foreign key metadata from PostgreSQL (BOOL column type not handled properly by ZEOS 7.2)

## [5.0.9] - 2018-05-11
### Fixed
 - createCodeInsightHelper will ignore models with "_public_only_" paths

## [5.0.7] - 2018-05-06
### Changed
 - stubs created by `createCodeInsightHelper` now include documentation specified in entity meta files

## [5.0.6] - 2018-04-29
### Changed
- createCodeInsightHelper command now generate stubs using ES6 syntax
- createCodeInsightHelper create [entityCode]_ns stub class for each entity
  and define e global variable [entityCode] = new [entityCode]_ns()

## [1.3.2] - 2018-04-15
### Fixed
- correctly generate a check constraints defined in `dbExtensions` section of entity metadata

## [1.2.7] - 2018-02-01
### Fixed 
- PostgreSQL DDL generator: DROP INDEX script syntax

## [1.2.3] - 2017-11-28
### Fixed
- Database metadata for PostgreSQL now loaded for a current_schema instead of current_user
- Added missed ; in the end of DDL script block

## [1.2.0] - 2017-10-23
### Added
- DDL generation for PostgreSQL including latest PostgreSQL 10 release. Required UB >= 4.1.0beta.8

## [1.0.41] - 2017-10-07
### Changed
- ublci `createCodeInsightHelper` command now generate entities stubs using **standard JS** code style

## [1.0.36] - 2017-09-12
### Added
- maximum database identifier length (table/constraint names etc) now depend on dialect. 30 for oracle, 116 for SQL Server

## [1.0.34] - 2017-08-28
### Fixed
- prepareGZIP command now work properly (adding @unitybase/compressors dependency)


## [1.0.28] - 2017-05-18
### Added
- ability to create a empty database for non-default connection using `-conn` initDB parameter: `ubcli initDB -conn connectionName -create -drop`. 

### Fixed
- show a connection name during database drop/create operations

## [1.0.26] - 2017-04-28
### Added

### Fixed
- DDL generator will skip attributes mapped to another existed attribute
