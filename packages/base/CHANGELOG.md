# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- `argv.getConfigFileName` take a config from UB_CFG environment variable if `-cfg` cmd line switch omitted
- `FileBaseStoreLoader.load()` now return data version in TubDataCache. 
  To be used in file-based entitis select's instead of version calculation individually in each entity
- `UBConnection.setDocument` method for convinient uploading content to temp store, for example in model initialization or
  data update/migration scripts

### Fixed
- LocalDataStore sometimes not filter by ID (known bug in TubList)
