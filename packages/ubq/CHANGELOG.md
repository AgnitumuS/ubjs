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

## [5.4.11] - 2020-11-08
## [5.4.10] - 2020-11-08
## [5.4.9] - 2020-11-05
## [5.4.8] - 2020-11-01
## [5.4.7] - 2020-10-20
## [5.4.6] - 2020-10-15
## [5.4.5] - 2020-09-23
## [5.4.4] - 2020-09-22
## [5.4.3] - 2020-09-20
## [5.4.2] - 2020-09-08
## [5.4.1] - 2020-09-01
### Added
- Azerbaijani locale for initial data

### Fixed
 - mailer scheduler is enabled when `application.customSettings.mailerConfig.targetHost` not empty in the config.
 Before these changes `targetHost` is not checked, but only `mailerConfig` section availability.
 
## [5.4.0] - 2020-08-31
### Changed
 - `application.customSettings.mailerConfig` section now defined in model partial config
 and automatically merged into main config (starting from ub@5.18.12). See README.md for 
 environment variables list.
 
## [5.3.27] - 2020-08-19
## [5.3.26] - 2020-08-19
### Added
 - Tajik locale translation
 
## [5.3.25] - 2020-08-03
## [5.3.24] - 2020-07-28
## [5.3.23] - 2020-07-26
## [5.3.22] - 2020-07-19
## [5.3.21] - 2020-07-16
## [5.3.20] - 2020-07-15
## [5.3.19] - 2020-07-08
## [5.3.18] - 2020-07-01
## [5.3.17] - 2020-06-30
### Added
 - `ub-migrate` command data. Execution of ub-migrate now apply a `ubq` model changes for project

### Changed
 - `UBQ` model initialization rewritten from scripts to `ub-migrate`

## [5.3.16] - 2020-06-21
## [5.3.15] - 2020-06-15
## [5.3.14] - 2020-06-15
## [5.3.13] - 2020-06-14
## [5.3.12] - 2020-05-25
## [5.3.11] - 2020-05-22
## [5.3.10] - 2020-05-17
### Added
 - `@unitybase/ubq/modules/mail-queue` exports a property `mailerEnabled`.
   - Indicate mailer is configured in `serverConfig.application.customSettings.mailerConfig`.
   - in case this property is false calls to `queueMail` do nothing, so better to verify it before mail creation to save a server resources

### Changed
 - `queueMail` do not put a mail sending job into queue in case mailer is not configured in `serverConfig.application.customSettings.mailerConfig` 
 - replace most font-awesome and element-ui to UB icons analog

## [5.3.9] - 2020-05-13
## [5.3.8] - 2020-05-06
## [5.3.7] - 2020-04-24
## [5.3.6] - 2020-04-10
## [5.3.5] - 2020-03-30
## [5.3.4] - 2020-03-20
## [5.3.3] - 2020-03-17
### Changed
 - mail-queue.queueMail method: remove unnecessary `fieldList: ['ID']` in queue insertion 
  to prevent call of selectAfterInsert method since ID is not used 

## [5.3.2] - 2020-03-09
## [5.3.1] - 2020-03-04
## [5.3.0] - 2020-02-29
### Changed
 - entities localization files (*.meta.??) are moved to `meta_locale` folder
 
## [5.2.78] - 2020-02-23
## [5.2.77] - 2020-02-18
## [5.2.76] - 2020-02-14
## [5.2.75] - 2020-02-13
## [5.2.74] - 2020-02-10
## [5.2.73] - 2020-02-08
## [5.2.72] - 2020-02-03
## [5.2.71] - 2020-01-31
## [5.2.70] - 2020-01-17
### Changed
 - rewrote `010_create_UBQ_navshortcuts.js` config for rendering ubq forms on vue

## [5.2.69] - 2020-01-13
## [5.2.68] - 2020-01-11
### Fixed
 - scheduler worker will reuse a single http.request object instead of creation new one for each task execution command;
 Under linux http.request creation can take up to 1ms

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

