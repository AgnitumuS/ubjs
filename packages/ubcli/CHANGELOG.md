# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
