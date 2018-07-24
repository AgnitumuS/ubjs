# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.13]
### Fixed
- fix adding of attachments in case it is a ArrayBufferView and sliced before adding

## [5.0.6]
### Changed
- @unitybase/mailer-ssl removed. @unitybase/mailer now can create ssl connection (openSSl must be installed)

## [5.0.0]
### Removed
 - UBMail.getBodyFromMessage is removed. Use `UBMail.getBodyPart(mimeMsg).read()` instead

### Added
 - `TMimePartBind.read` method - implement a UBReader