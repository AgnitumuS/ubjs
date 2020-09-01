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

## [5.1.28] - 2020-09-01
## [5.1.27] - 2020-08-31
## [5.1.26] - 2020-08-19
## [5.1.25] - 2020-08-19
## [5.1.24] - 2020-07-28
## [5.1.23] - 2020-07-26
## [5.1.22] - 2020-07-19
## [5.1.21] - 2020-07-16
## [5.1.20] - 2020-07-15
### Added
 - support for ADFS3 (Windows Server 2012 only - in Windows Server 2016+ ADFS version is 2016):
   - added `providerConfig.resource` - requested resource
   - `providerConfig.client_secret` can be omitted

## [5.1.19] - 2020-07-08
## [5.1.18] - 2020-07-01
## [5.1.17] - 2020-06-30
## [5.1.16] - 2020-06-21
## [5.1.15] - 2020-06-15
## [5.1.14] - 2020-06-15
## [5.1.13] - 2020-06-14
## [5.1.12] - 2020-05-25
## [5.1.11] - 2020-05-22
## [5.1.10] - 2020-05-17
## [5.1.9] - 2020-05-13
## [5.1.8] - 2020-05-06
## [5.1.7] - 2020-04-24
## [5.1.6] - 2020-04-10
## [5.1.5] - 2020-03-30
## [5.1.4] - 2020-03-20
## [5.1.3] - 2020-03-17
## [5.1.2] - 2020-03-09
## [5.1.1] - 2020-03-04
## [5.1.0] - 2020-02-29
## [5.0.118] - 2020-02-23
## [5.0.117] - 2020-02-18
## [5.0.116] - 2020-02-13
## [5.0.115] - 2020-02-10
## [5.0.114] - 2020-02-08
## [5.0.113] - 2020-02-03
## [5.0.112] - 2020-01-31
### Fixed
 - Set 'utf-8' encoding for html-response of authorization [UBDF-11025]

## [5.0.109] - 2019-12-24
### Changed
 - Skip user information request in case `provider.userInfoUrl` is empty (ADFS 3 does not implement this, JWT token what contains user information is used instead)
 - Set default value for getOnFinishAction event. The default value is suitable for "adminui" form.
