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

## [1.4.0] - 2022-06-15
## [1.3.1] - 2021-12-02
### Changed
 - dependencies upgraded
    - "codemirror": "^5.58.1" -> "^5.64.0"

## [1.3.0] - 2021-03-25
### Changed
 - migrate build to webpack5

## [1.2.25] - 2019-06-10
### Added
 - support for VueJS syntax - `script/x-vue` MIME type 

## [1.2.24] - 2019-05-21
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [1.2.23] - 2019-05-10
### Changed
 - upgrade jshint to 2.10.x (solved jshint 100Mb size problem + uses lodash 4.17.11 without prototype pollotion)
