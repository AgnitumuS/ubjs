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

## [5.23.1] - 2022-06-19
## [5.23.0] - 2022-06-15
## [5.22.5] - 2022-06-01
## [5.22.4] - 2022-05-22
## [5.22.3] - 2022-03-25
## [5.22.2] - 2022-01-24
## [5.22.1] - 2022-01-14
## [5.22.0] - 2022-01-09
## [5.2.8] - 2021-12-02
## [5.2.7] - 2021-11-23
### Fixed
 - `UZip.file` accept incoming `data` of type `ArrayBuffer` in addition to TypedArray and Buffer

## [5.2.6] - 2021-11-17
### Fixed
 - UZip produce zip archive with Unix as "operating system of origin" - this fix displaying of unicode file names
   inside archive for most ZIP tools

## [5.2.5] - 2021-11-14
## [5.2.4] - 2021-10-27
## [5.2.3] - 2021-09-08
## [5.2.2] - 2021-08-18
### Fixed
 - UZip: fix getting files from ZIP using RegExp `UZip.file(/../)`

## [5.2.1] - 2021-08-04
### Fixed
 - ub-server@5.20.4 compatibility (IsValidUTF8)

## [5.2.0] - 2021-07-08
### Added
  - UZip - a JSZip@2 / PizZip compatible zip reader/writer
     - *x10 faster* 
     - read (load/constructor) can work directly with files in fs (without reading a full ZIP archive into memory), so *uses less memory*
     - write operations can add data to archive from file in file system (without reading full source file into memory)

## [5.1.46] - 2021-05-24
## [5.1.45] - 2021-04-24
## [5.1.44] - 2021-03-23
## [5.1.43] - 2021-03-15
## [5.1.42] - 2021-02-08
## [5.1.41] - 2021-01-26
## [5.1.40] - 2020-11-25
## [5.1.39] - 2020-11-19
## [5.1.38] - 2020-11-15
## [5.1.37] - 2020-11-14
## [5.1.36] - 2020-11-12
## [5.1.35] - 2020-08-19
## [5.1.34] - 2020-08-19
## [5.1.33] - 2020-07-26
### Changed
 - building of native code depend on LCL

### Removed
 - cross-compilation from Windows to Linux is removed - use linux build environment to build both Win64 & Linux tagrets

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
