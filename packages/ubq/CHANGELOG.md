# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.1.0]
### Changed
 - `mail` job rewritten to module. Use `"module": "@unitybase/ubq/ubqMailJob"` to override mail scheduler
 - `FTSReindexFromQueue` job rewritten to module. Use `"module": "@unitybase/ubq/ubqFTSJob"` to override FTS scheduler

## [4.2.0]
### Added
 - ability to pass a module to scheduler instead of function from global

## [4.2.1]
### Fixed
 - allow use mail over SSL

