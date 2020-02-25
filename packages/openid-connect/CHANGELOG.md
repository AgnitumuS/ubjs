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

## [5.0.118] - 2020-02-23
## [5.0.117] - 2020-02-18
## [5.0.116] - 2020-02-13
## [5.0.115] - 2020-02-10
## [5.0.114] - 2020-02-08
## [5.0.113] - 2020-02-03
## [5.0.112] - 2020-01-31
### Fixed
 - Set 'utf-8' encoding for html-response of authorization [UBDF-11025]

## [5.0.109]
### Changed
 - Skip user information request in case `provider.userInfoUrl` is empty (ADFS 3 does not implement this, JWT token what contains user information is used instead)
 - Set default value for getOnFinishAction event. The default value is suitable for "adminui" form.
