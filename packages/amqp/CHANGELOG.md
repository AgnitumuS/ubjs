# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
 - linux build: links to valid `libsynmozjs52.so`
 
## [1.0.15] - 2018-09-25
### Changed
- UBServerNotifier class moved to separate package

## [1.0.11] - 2018-09-19
### Changed
- exchange declaration removed in startup code
  due to unwanted side effects to some operations like initDB
  now 'ub-amqp-notify' topic exchange must be created manually

## [1.0.7] - 2018-09-03
### Fixed
- Ubuntu v18 support
