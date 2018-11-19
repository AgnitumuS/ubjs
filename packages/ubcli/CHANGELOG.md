# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.2.0]
### Added 
 - `npx ubcli` will display short commands descriptions in addition to command names
 - new command `meta-tr` added to `ubcli` to be used to transform *.meta attributes from Object to Array as
 required by latest Entity JSON schema:
```bash
 npx ubcli meta-tr -m /home/mpv/dev/ubjs/apps/autotest/models/TST/tst_document.meta
```   
  
## [5.1.4]
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

## [5.1.2]
### Fixed 
 - [unitybase/ubjs#15] - Postgre DDl generator must use `SELECT nextval('${sequenceObj}')`
 for sequence incrementing

## [5.1.0]
### Added
- `ubcli generateDDL` now support Json type attributes

### Fixed
 - database initialization scripts will create DDL for uba_els.code & uba_els.ruleType 
 as NVARCHAR instead of VARCHAR as in current metadata
 - return back creation of sequences for cached entities (lost during ub1.12 -> ub5 migration).
  This patch speed up getting of cached entities cache version (especially for large tables)
   and fix [unitybase/ubjs#15] for all DB except SQLite3 

## [5.0.40]
### Fixed
- `ubcli generateDDL` will skip DDL generation for entities without `mStorage` mixin [unitybase/ubjs#11]
- When create a new DB using `ubcli initDB -create` command, the created user for
  SQL Server database have correct default schema `dbo` [unitybase/ubjs#12]

## [5.0.30]
### Fixed
- fixed [unitybase/ubjs#9] DDL SQLite3 "Error: this.DDL.dropColumn.push is not a function"

## [5.0.29]
### Fixed
- fixed [unitybase/ubjs#7] - missing genCodeDropPK in SQL Server DDl generator

## [5.0.28]
### Fixed
- Fixed [unitybase/ubjs#5] - DDL generation will drop and re-create indexes of columns if column type is changed

## [5.0.19]
### Fixed
- PostgreSQL DDL generator will ignore functional ("func") index definition in `dbExtensions`
 section (should be applied only for Oracle as documented)
- PostgreSQL DDL generator will generate single-quoter string for estimation update of newly
 added not null attributes of string type

## [5.0.18]
### Fixed
- `ubcli createStore` will create temp path even if it is relative.
 In this case we consider path is relative to config path

## [5.0.16]
### Fixed
- fix retrieve foreign key metadata from PostgreSQL (BOOL column type not handled properly by ZEOS 7.2)

## [5.0.9]
### Fixed
 - createCodeInsightHelper will ignore models with "_public_only_" paths

## [5.0.7]
### Changed
 - stubs created by `createCodeInsightHelper` now include documentation specified in entity meta files

## [5.0.6]
### Changed
- createCodeInsightHelper command now generate stubs using ES6 syntax
- createCodeInsightHelper create [entityCode]_ns stub class for each entity
  and define e global variable [entityCode] = new [entityCode]_ns()

## [1.3.2]
### Fixed
- correctly generate a check constraints defined in `dbExtensions` section of entity metadata

## [1.2.7]
### Fixed 
- PostgreSQL DDL generator: DROP INDEX script syntax

## [1.2.3]
### Fixed
- Database metadata for PostgreSQL now loaded for a current_schema instead of current_user
- Added missed ; in the end of DDL script block

## [1.2.0]
### Added
- DDL generation for PostgreSQL including latest PostgreSQL 10 release. Required UB >= 4.1.0beta.8

## [1.0.41]
### Changed
- ublci `createCodeInsightHelper` command now generate entities stubs using **stanrard JS** code style

## [1.0.36]
### Added
- maximum database identifier length (table/constraint names etc) now depend on dialect. 30 for oracle, 116 for SQL Server

## [1.0.34]
### Fixed
- prepareGZIP command now work propertly (adding @unitybase/compressors dependency)


## [1.0.28]
### Added
- ability to create a empty database for non-default connection using `-conn` initDB parameter: `ubcli initDB -conn connectionName -create -drop`. 

### Fixed
- show a connection name duting database drop/create operations

## [1.0.26]
### Added

### Fixed
- DDL generator will skip attributes mapped to another existed attribute
