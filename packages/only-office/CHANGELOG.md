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

## [5.23.16] - 2022-10-04
## [5.23.15] - 2022-09-30
## [5.23.14] - 2022-09-11
## [5.23.13] - 2022-08-19
## [5.23.12] - 2022-08-16
## [5.23.11] - 2022-08-09
## [5.23.10] - 2022-08-05
## [5.23.9] - 2022-08-04
## [5.23.8] - 2022-07-28
## [5.23.7] - 2022-07-26
## [5.23.6] - 2022-07-26
## [5.23.5] - 2022-07-21
## [5.23.4] - 2022-07-12
## [5.23.3] - 2022-07-11
## [5.23.2] - 2022-07-05
## [5.23.1] - 2022-06-19
## [5.23.0] - 2022-06-15
## [5.22.5] - 2022-06-01
## [5.22.4] - 2022-05-22
## [5.22.3] - 2022-03-25
## [5.22.2] - 2022-01-24
## [5.22.1] - 2022-01-14
## [5.22.0] - 2022-01-09
## [5.19.8] - 2021-11-14
## [5.19.7] - 2021-10-27
## [5.19.6] - 2021-07-08
## [5.19.5] - 2021-05-24
## [5.19.4] - 2021-04-24
## [5.19.3] - 2021-03-23
## [5.19.2] - 2021-03-15
## [5.19.1] - 2021-02-08
## [5.19.0] - 2021-02-02
### Changed
 - use new property `req.parsedParameters` instead of `queryString.parse(req.parameters)`

## [1.1.6] - 2021-01-26
## [1.1.5] - 2020-11-25
## [1.1.4] - 2020-11-19
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