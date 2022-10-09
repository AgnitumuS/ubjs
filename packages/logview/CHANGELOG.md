# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
 - added help button. Help message contains UI tips and log line format explanation

### Changed

### Deprecated

### Removed

### Fixed

## [1.0.3] - 2022-10-04
### Added
 - added parsing of logs in Hi resolution timer format

### Changed
 - added line wrapping in preview 

### Fixed
 - fix verbalization of `c=0` for SQL log level (c=0 mean `PlaneCached=no`) 

## [1.0.2] - 2022-09-30
### Changed
 - `ULogView` moved from UB form into separate component - to be used in standalone app

## [1.0.1] - 2022-09-26
### Added
 - initial release. Limited to file based logging (journald and docker are in plans)
