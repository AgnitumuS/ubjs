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

## [5.2.67] - 2020-01-02
## [5.2.66] - 2019-12-27
## [5.2.65] - 2019-12-20
## [5.2.64] - 2019-12-18
## [5.2.63] - 2019-12-17
## [5.2.62] - 2019-12-17

## [5.2.61] - 2019-12-11
### Fixed
  - optimized ubq_messages.addqueue:
    - remove `fieldList` form insertion to prevent select after insert
    - use global DataStore('uba_messages') instance instead of call to UB.DataStore for each method call   
  
## [5.2.36] - 2019-07-23
### Changed
 - audit trail is explicitly disabled for `ubq_messages` entity for performance reason  

## [5.2.35] - 2019-07-22
### Changed
 - all meta files and they localization transformed to array-of-attributes format

## [5.2.34] - 2019-07-17
### Fixed
 - FTS scheduler job will skip FTS commands for entities what not in domain (this prevents AV inside updateFTSIndex)

## [5.2.26] - 2019-06-04
### Added
 - new scheduler `ubqMessagesCleanup` for truncating ubq_messages table (if there are no non-pending tasks).
 Scheduled at 5:15AM by default. 

## [5.2.22] - 2019-05-16
### Fixed
 - potential issue with wrong properties values inside overrided schedulers (for example "singleton" may unexpectedly became false) 
 - for overrated schedulers fill `originalModel` attribute
 
### Changed
 - correct Ukrainian translation for `ubq_scheduler` attributes
 
## [5.2.14] - 2019-02-27
### Changed
 - Mail scheduler job will handle messages in the order
 of their arrival - added `.orderBy('[ID]')`
       
## [5.2.11] - 2019-02-13
### Added
 - Ukrainian localization

## [5.2.0] - 2018-11-28
### Changed
 - schedulers initialization rewritten using `root` auth schema
 
### Fixed
 - schedulers jobs will continue to work even if `runAs` user for job
  is blocked or his password is expired
 - text logs produced by scheduler worker is decreased (thanks to `root` auth schema)
 
## [5.1.0] - 2018-05-01
### Changed
 - `mail` job rewritten to module. Use `"module": "@unitybase/ubq/ubqMailJob"` to override mail scheduler
 - `FTSReindexFromQueue` job rewritten to module. Use `"module": "@unitybase/ubq/ubqFTSJob"` to override FTS scheduler

### Fixed
 - [unitybase/ubjs#9] - null value in column "appname" violates not-null constraint for **linux** platform

## [4.2.0] - 2017-03-27
### Added
 - ability to pass a module to scheduler instead of function from global

## [4.2.1] - 2017-03-30
### Fixed
 - allow use mail over SSL

