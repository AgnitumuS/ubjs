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

## [5.1.24] - 2020-01-31
## [5.1.23] - 2020-01-13
### Added
 - optional `contentID` attribute for e-mail attachment. If contentID is defined for attachment it can be used in mail body
   for example to display embedded image as such:
 
   ```javascript
    const contentID = 'ub-generated-image-1'
    //inside e-mail body
    const eMailBody = `<img id="footer-logo" src="cid:${contentID}" alt="UB logo" title="UB logo" width="36" height="36" class="image_fix">`
   ```

## [5.1.22] - 2020-01-11
## [5.1.21] - 2019-12-17
### Fixed
 - linux build: links to valid `libsynmozjs52.so`

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
