# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.0]
### Added
 - ES6 `export default` support for Vue SFC - parser will replace it to `module.exports.default =` in dev mode
 - vue component definition is exported as `default` so should be imported as 
   `const MyComponent = require('./MyComponent.vue').default`. `BOUNDLED_BY_WEBPACK` hack should be removed
      
## [1.2.5]
### Changed
 - use webpack4 for production build

## [1.2.2]
### Added
 - `prepublish` script added for creation minimised version of plugin into `dist` folder before publishing 
 