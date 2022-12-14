# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- `ubqMailjob` - added batch. Default behavior is to handle 100 messages in one scheduler call

### Changed
- `ubqMailjob` - added optional parameter `exhauseQueue`. 
  In case `exhauseQueue === true` - repeat batch sending until all messages have been sent

### Deprecated

### Removed

### Fixed

## [5.23.22] - 2022-10-04
## [5.23.21] - 2022-09-30
## [5.23.20] - 2022-09-26
## [5.23.19] - 2022-09-12
### Added
 - `ubq_scheduler.calculateNextCronTerm` - added optional parameter `isFirstExecution`; 
   In case today is monday, and we need each second (@2) monday, then first occurrence should be today (initialDate should be 00:00:01)

## [5.23.18] - 2022-09-12
### Fixed
 - use exactly `cron-parser@4.4.0` (last version what uses require) instead of `^4.4.0`

## [5.23.17] - 2022-09-11
### Added
 - new method `ubq_scheduler.calculateNextCronTerm` - return next `cnt` execution dates for specified cronExpression;
   Supports non-standard 7-part cron expression syntax, where last field `@occurrence` mean - fires on every x occurrence.
   Example - `0 0 1 * * 1 @2` = At 01:00 AM, only on Monday, once per 2 occurrence (every second Monday)

 - new entity-level method `ubq_scheduler.estimateCronSchedule` - wrapper for `ubq_scheduler.calculateNextCronTerm`
  for client-side execution. Used by UCron to show "Estimated executions"

## [5.23.16] - 2022-08-26
## [5.23.15] - 2022-08-23
## [5.23.14] - 2022-08-19
## [5.23.13] - 2022-08-16
## [5.23.12] - 2022-08-09
## [5.23.11] - 2022-08-05
## [5.23.10] - 2022-08-04
### Added
- Added captionSingular for all *.meta and *.meta.lang
### Fixed
- uk locale for ubq_scheduler

## [5.23.9] - 2022-07-28
## [5.23.8] - 2022-07-26
## [5.23.7] - 2022-07-26
## [5.23.6] - 2022-07-21
## [5.23.5] - 2022-07-12
## [5.23.4] - 2022-07-11
## [5.23.3] - 2022-07-05
### Changed
- Execution schedulers for tenants: skip virtual tenants (TID in 80..99)

### Fixed
- Typo in uk localization of `ubq_runstat` entity caption

## [5.23.2] - 2022-06-19
## [5.23.1] - 2022-06-19
## [5.23.0] - 2022-06-15
### Changed
- In the "Administrator" desktop, move items from "Messages Queue" to "Monitoring Tools"
  - Delete the empty "Message Queue" item 

### Fixed
- Tenant schedulers work in case, when TenantID header is used

## [5.22.17] - 2022-06-06
### Changed
- Moved navigation shortcut localizations into json files out of yaml files
- Pull "Schedulers" menu items from "Queues" to "Developer Tools" folder

## [5.22.16] - 2022-06-01
## [5.22.15] - 2022-05-26
## [5.22.14] - 2022-05-22
### Added
- Support for schedulers in multitenant mode:
  - do not pass "runAsID", because user ID is different in every tenant,
    for non-multitenant environments, nothing changes, runAsID still passed
  - if "runAs" passed to a job, but "runAsID" is not (which is possible for multitenant environments only),
    load "runAsID" before job execution
  - iterate tenants per scheduler job, inside `ubq_messages.executeSchedulerTask`

### Changed
- Schedulers: for schedulers with invalid commands, instead of recording failed records into `ubq_runstat`,
  just make a record in UB log

## [5.22.13] - 2022-05-10
### Added
- Ability to disable mailer scheduler, either by:
  - setting `App.serverConfig.application.customSettings.mailerConfig.enableScheduler = false`
  - using environment variable `UB_USE_MAIL_SCHEDULER=false`
  This allows having full SMTP config, so that manual
  call of email sending work, but turn off just the scheduler,
  without overriding it.
 - added Deutsch (`de`) locale translations

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
### Fixed
 - typo in the code of `ubqFTSJob` scheduler which led to the failure of the `ubqMessages.success` method due to the loss of message ID

## [5.20.30] - 2021-11-14
### Added
 - terminate *mail scheduler job* ASAP, without waiting until current 100 pending mails sends, in case process termination is requested.
   Require UB@5.20.10, for older server version will work as before (wait until current 100 pending mail sends)
 - terminate *async FTS scheduler job* ASAP, without waiting until current 1000 pending fts tasks is handled, in case process termination is requested.
   Require UB@5.20.10, for older server version will work as before (wait until current 1000 pending tasks done)

## [5.20.29] - 2021-11-05
### Changed
 - `ubq_messages` nav shortcut - explicitly define fieldList as `["mi_createDate", "queueCode", "completeDate", "msgCmd"]` 
   for better UX
 - **mail job** will retrieve ubq_messages.msgData CLOB (a message body) one record at once.
   This prevents `<<<ERR_RESOURCE_LIMITS_EXCEED>>>` error in case overall size of mail bodies for 100 queued messages
   exceed 50Mb [UBDF-14156] 

## [5.20.28] - 2021-10-27
## [5.20.27] - 2021-10-18
### Added
 - Azerbaijani (az) localization for items with omitted translation
 - direct modification of `ubq_runstat` is disabled by ELS new rule

### Changed
 - UBQ Navigation shortcuts localization are taken from i18n (from entities caption)

## [5.20.26] - 2021-09-24
## [5.20.25] - 2021-09-16
### Changed
- English (en) localization for desktop/shortcut captions: the words are
  capitalized according to English rules for captions

## [5.20.24] - 2021-09-08
## [5.20.23] - 2021-09-02
## [5.20.22] - 2021-08-31
## [5.20.21] - 2021-08-18
## [5.20.20] - 2021-08-09
## [5.20.19] - 2021-08-04
### Added
- ability to pass attachments to the `queueMail` method as a buffer
- Dutch (nl) localization

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
### Changed
 - log level for scheduler initiation message `SCHEDULER: Job command for ... sent at ...` changed from `info` to `debug`

## [5.20.4] - 2021-04-02
## [5.20.3] - 2021-04-01
## [5.20.2] - 2021-03-30
## [5.20.1] - 2021-03-29
## [5.20.0] - 2021-03-25
## [5.19.7] - 2021-03-23
## [5.19.6] - 2021-03-17
## [5.19.5] - 2021-03-15
## [5.19.4] - 2021-03-03
## [5.19.3] - 2021-02-10
## [5.19.2] - 2021-02-08
## [5.19.1] - 2021-02-03
## [5.19.0] - 2021-02-02
## [5.4.33] - 2021-01-30
## [5.4.32] - 2021-01-28
### Fixed
 - ubqMailjob (e-mail sender) will add a fake attachment with text
   `File not exists, please forward this message to administrator` in case attached file not exists in file-based BLOB store

## [5.4.31] - 2021-01-26
## [5.4.30] - 2021-01-19
### Fixed
 - mail sending job: fix attachments (should use isBase64: false when attached from file)

## [5.4.29] - 2021-01-17
### Added
 - e-mail sending job uses deferred SMTP log-in (helps to locate a source of AV during sending some mails)

### Changed
 - e-mail sending job pass a path to the blob store file into UBMailSender instead of
   reading a file content into JS memory and pass it as base64.

   This decrease JS memory usage and breaks a long BASE64 string into 78-char lines as
   required by RFC-5322

### Fixed
 - mail sending job calls a logout from mail server in finally block.
   This force closing POP3 connection in case MTA returns an error. 

## [5.4.28] - 2021-01-11
## [5.4.27] - 2020-12-30
## [5.4.26] - 2020-12-28
## [5.4.25] - 2020-12-22
## [5.4.24] - 2020-12-21
## [5.4.23] - 2020-12-20
## [5.4.22] - 2020-12-14
## [5.4.21] - 2020-12-09
## [5.4.20] - 2020-12-02
## [5.4.19] - 2020-11-25
## [5.4.18] - 2020-11-23
### Added
 - `mailerConfig.fullSSL` parameter added to UBQ partial config - use a TLS tunnel for SMTP. 
   Environment variable - `UB_SMTP_FULL_SSL` (false by default)
    
## [5.4.17] - 2020-11-20
## [5.4.16] - 2020-11-19
## [5.4.15] - 2020-11-15
## [5.4.14] - 2020-11-14
## [5.4.13] - 2020-11-12
## [5.4.12] - 2020-11-10
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
