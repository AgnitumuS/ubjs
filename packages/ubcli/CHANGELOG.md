# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.28]
### Added
- ability to create a empty database for non-default connection using `-conn` initDB parameter: `ubcli initDB -conn connectionName -create -drop`. 

### Fixed
- show a connection name duting database drop/create operations

## [1.0.26]
### Added

### Fixed
- DDL generator will skip attributes mapped to another existed attribute
