# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added

### Changed

### Deprecated

### Removed

### Fixed

## [1.1.3] - 2020-11-15
## [1.1.2] - 2020-11-14
## [1.1.1] - 2020-11-12
## [1.1.0] - 2020-08-31
### Changed
 - `application.customSettings.mailerConfig` section now defined in model partial config
 and automatically merged into main config (starting from ub@5.18.12). See README.md for 
 environment variables list.

## [1.0.4] - 2020-06-14
## [1.0.3] - 2020-03-17
### Added
- `cspAllow` configuration for production mode 

### Changed
- `ubConfig.uiSettings.onlyOffice.serverIP` should contain protocol (**http|https**)
 ("serverIP": "https://onlyoffice.unitybase.info:4443")

### Fixed
- require path to `ubOnlyOffice.js`

## [1.0.0] - 2020-03-09
### Added
- ability to use `OnlyOffice` editor for view and edit `MS Office` documents