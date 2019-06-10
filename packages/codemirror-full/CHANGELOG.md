# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.25]
### Added
 - support for VueJS syntax - `script/x-vue` MIME type 

## [1.2.24]
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [1.2.23]
### Changed
 - upgrade jshint to 2.10.x (solved jshint 100Mb size problem + uses lodash 4.17.11 without prototype pollotion)
