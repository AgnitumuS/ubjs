# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.11]
### Changed
- exchange declaration removed in startup code
  due to unwanted side effects to some operations like initDB
  now 'ub-amqp-notify' topic exchange must be created manually

## [1.0.7]
### Fixed
- Ubuntu 18 support
