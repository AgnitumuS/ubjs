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

## [5.23.9] - 2022-08-04
### Added
- Added captionSingular for all *.meta and *.meta.lang

### Removed
- for attributes of type `Boolean` removed `allowNull: false` and `defaultValue` - not needed anymore

## [5.23.8] - 2022-07-28
## [5.23.7] - 2022-07-26
## [5.23.6] - 2022-07-26
## [5.23.5] - 2022-07-21
## [5.23.4] - 2022-07-12
## [5.23.3] - 2022-07-11
## [5.23.2] - 2022-07-05
## [5.23.1] - 2022-06-19
### Changed
 - `UDisk` desktop display order changed to 1000 (folder moved down)

## [5.23.0] - 2022-06-15
### Removed
 - "peerDependencies" - removed @unitybase/adminui-pub

## [5.22.16] - 2022-06-01
## [5.22.15] - 2022-05-26
## [5.22.14] - 2022-05-22
## [5.22.13] - 2022-05-10
## [5.22.12] - 2022-05-04
## [5.22.11] - 2022-04-29
## [5.22.10] - 2022-04-27
## [5.22.9] - 2022-04-25
## [5.22.8] - 2022-04-20
## [5.22.7] - 2022-04-19
### Added
 - added Deutsch (`de`) locale (stub for a while)

## [5.22.6] - 2022-04-14
## [5.22.5] - 2022-04-08
## [5.22.4] - 2022-03-25
## [5.22.3] - 2022-02-16
## [5.22.2] - 2022-01-24
## [5.22.1] - 2022-01-14
## [5.22.0] - 2022-01-09
## [5.20.33] - 2021-12-02
## [5.20.32] - 2021-11-30
## [5.20.31] - 2021-11-23
## [5.20.30] - 2021-11-14
## [5.20.29] - 2021-11-05
## [5.20.28] - 2021-10-27
## [5.20.27] - 2021-10-18
## [5.20.26] - 2021-09-24
### Changed
- role definition is moved from `_initialData` scripts to `01_roles.yml` file
  in order to prevent situations when navigation items are initialized before
  the roles which define access rules for them

## [5.20.25] - 2021-09-16
### Changed
- English (en) localization for desktop/shortcut captions: the words are
  capitalized according to English rules for captions
- navigation definition is moved from `_initialData` scripts to `03_navigation.yml`
  file in order to use `ub-migrate` for migration of the navigation data

## [5.20.24] - 2021-09-08
## [5.20.23] - 2021-09-02
## [5.20.22] - 2021-08-31
## [5.20.21] - 2021-08-18
## [5.20.20] - 2021-08-09
## [5.20.19] - 2021-08-04
### Fixed
 - default BLOB store path changed to "%UB_APPDATA%stores/..." (as in all other models)

## [5.20.18] - 2021-07-18
### Added
 - Dutch (nl) localization

## [5.20.17] - 2021-07-08
## [5.20.16] - 2021-06-14
## [5.20.15] - 2021-05-24
## [5.20.14] - 2021-05-13
## [5.20.13] - 2021-05-07
## [5.20.12] - 2021-05-05
## [5.20.11] - 2021-04-24
## [5.20.10] - 2021-04-23
## [5.20.9] - 2021-04-22
## [5.20.8] - 2021-04-19
## [5.20.7] - 2021-04-19
## [5.20.6] - 2021-04-16
## [5.20.5] - 2021-04-13
## [5.20.4] - 2021-04-02
## [5.20.3] - 2021-04-01
## [5.20.2] - 2021-03-30
## [5.20.1] - 2021-03-29
## [5.20.0] - 2021-03-25
## [5.19.7] - 2021-03-23
## [5.19.6] - 2021-03-17
## [5.19.5] - 2021-03-15
## [5.19.4] - 2021-03-03
### Changed
 - client side locales reformatted into JSON
 - server-side locales reformatted into JSON

## [5.19.3] - 2021-02-10
## [5.19.2] - 2021-02-08
## [5.19.1] - 2021-02-03
## [5.19.0] - 2021-02-02
## [5.0.170] - 2021-01-30
## [5.0.169] - 2021-01-26
## [5.0.168] - 2021-01-19
## [5.0.167] - 2021-01-17
## [5.0.166] - 2020-12-30
## [5.0.165] - 2020-12-28
## [5.0.164] - 2020-12-22
## [5.0.163] - 2020-12-21
## [5.0.162] - 2020-12-20
## [5.0.161] - 2020-12-14
## [5.0.160] - 2020-12-09
## [5.0.159] - 2020-12-02
## [5.0.158] - 2020-11-25
## [5.0.157] - 2020-11-20
## [5.0.156] - 2020-11-19
## [5.0.155] - 2020-11-15
## [5.0.154] - 2020-11-14
## [5.0.153] - 2020-11-12
## [5.0.152] - 2020-11-10
## [5.0.151] - 2020-11-08
## [5.0.150] - 2020-11-08
## [5.0.149] - 2020-11-05
## [5.0.148] - 2020-11-01
## [5.0.147] - 2020-10-20
## [5.0.146] - 2020-10-15
### Changed
- `application.blobStores` section now defined in model partial config
  and automatically merged into main config (starting from ub@5.18.12). See README.md for
  environment variables list.
  
## [5.0.145] - 2020-09-23
## [5.0.144] - 2020-09-22
## [5.0.143] - 2020-09-20
## [5.0.142] - 2020-09-08
## [5.0.141] - 2020-09-01
## [5.0.140] - 2020-08-31
## [5.0.139] - 2020-08-19
## [5.0.138] - 2020-08-19
### Added
 - Tajik locale translation
 
## [5.0.137] - 2020-07-28
### Added
 - added new attributes `objectID` and `objectEntity` into `udisk_card` for further integration with the `Scriptum` system
 - rewritten form opening by double click on file

## [5.0.136] - 2020-07-26
## [5.0.135] - 2020-07-19
## [5.0.134] - 2020-07-16
## [5.0.133] - 2020-07-15
## [5.0.132] - 2020-07-08
## [5.0.131] - 2020-07-01
## [5.0.130] - 2020-06-30
## [5.0.129] - 2020-06-21
## [5.0.128] - 2020-06-15
## [5.0.127] - 2020-06-15
## [5.0.126] - 2020-06-14
## [5.0.125] - 2020-05-25
## [5.0.124] - 2020-05-22
## [5.0.123] - 2020-05-17
## [5.0.122] - 2020-05-13
## [5.0.121] - 2020-05-06
## [5.0.120] - 2020-04-24
## [5.0.119] - 2020-04-10
## [5.0.118] - 2020-03-30
## [5.0.117] - 2020-03-20
## [5.0.116] - 2020-03-17
## [5.0.115] - 2020-03-09
## [5.0.114] - 2020-03-04
## [5.0.113] - 2020-02-29
### Changed
 - entities localization files (*.meta.??) are moved to `meta_locale` folder
 
## [5.0.54] - 2019-04-28
### Fixed
 - initialization script adopted for UB 5x

## [5.0.43] - 2019-01-31
### Fixed
 - missing comma in server-side localization file

