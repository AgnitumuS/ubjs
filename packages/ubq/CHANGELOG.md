# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.2.26]
### Added
 - new scheduler `ubqMessagesCleanup` for truncating ubq_messages table (if there are no non-pending tasks).
 Scheduled at 5:15AM by default. 

## [5.2.22]
### Fixed
 - potential issue with wrong properties values inside overrided schedulers (for example "singleton" may unexpectedly became false) 
 - for overrated schedulers fill `originalModel` attribute
 
### Changed
 - correct Ukrainian translation for `ubq_scheduler` attributes
 
## [5.2.14]
### Changed
 - Mail scheduler job will handle messages in the order
 of their arrival - added `.orderBy('[ID]')`
       
## [5.2.11]
### Added
 - Ukrainian localization

## [5.2.0]
### Changed
 - schedulers initialization rewritten using `root` auth schema
 
### Fixed
 - schedulers jobs will continue to work even if `runAs` user for job
  is blocked or his password is expired
 - text logs produced by scheduler worker is decreased (thanks to `root` auth schema)
 
## [5.1.0]
### Changed
 - `mail` job rewritten to module. Use `"module": "@unitybase/ubq/ubqMailJob"` to override mail scheduler
 - `FTSReindexFromQueue` job rewritten to module. Use `"module": "@unitybase/ubq/ubqFTSJob"` to override FTS scheduler

### Fixed
 - [unitybase/ubjs#9] - null value in column "appname" violates not-null constraint for **linux** platform

## [4.2.0]
### Added
 - ability to pass a module to scheduler instead of function from global

## [4.2.1]
### Fixed
 - allow use mail over SSL

