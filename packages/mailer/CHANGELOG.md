# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.1.17] - 2019-11-30
### Fixed
 - force mailer instance to be destroyed by JS engine in the same thread it's created (JSCLASS_FOREGROUND_FINALIZE)

## [5.1.16] - 2019-11-19
### Fixed
 - prevent expose a package to client by adding `"config": {"ubmodel": {} }` into package.json
 
## [5.1.0] - 2018-08-29
### Fixed
- Ubuntu 18 support

## [5.0.13] - 2018-07-24
### Fixed
- fix adding of attachments in case it is a ArrayBufferView and sliced before adding

## [5.0.6] - 2018-04-24
### Changed
- @unitybase/mailer-ssl removed. @unitybase/mailer now can create ssl connection (openSSl must be installed)

## [5.0.0] - 2018-04-22
### Removed
 - UBMail.getBodyFromMessage is removed. Use `UBMail.getBodyPart(mimeMsg).read()` instead

### Added
 - `TMimePartBind.read` method - implement a UBReader