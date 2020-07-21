# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added

### Changed
 - building of native code depend on LCL

### Deprecated

### Removed
 - cross-compilation from Windows to Linux is removed - use linux build environment to build both Win64 & Linux tagrets

### Fixed

## [5.1.32] - 2020-07-19
### Changed
 - building of native code does not depends on lazarus (fpc is enough)

## [5.1.31] - 2020-06-14
## [5.1.30] - 2020-04-24
## [5.1.29] - 2020-03-09
## [5.1.28] - 2020-02-29
## [5.1.27] - 2020-02-10
## [5.1.26] - 2020-02-08
## [5.1.25] - 2020-01-31
## [5.1.24] - 2020-01-11
## [5.1.23] - 2019-12-17
### Fixed
 - linux build: links to valid `libsynmozjs52.so`

## [5.1.19] - 2019-11-19
### Fixed
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json
 
## [5.1.3] - 2018-08-29
### Fixed
- Ubuntu 18 support

## [5.1.0] - 2018-08-12
### Added
- ZipReader & ZipWriter classes added
