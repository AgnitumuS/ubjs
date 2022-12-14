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

## [1.5.1] - 2022-06-19
## [1.5.0] - 2022-06-15
## [1.4.3] - 2021-12-02
### Changed
 - dependencies upgraded
   - "vue-template-compiler": "^2.6.12" -> "^2.6.14"
   
## [1.4.2] - 2021-10-27
## [1.4.1] - 2021-10-18
### Added
Vue single file components can use `<style src=`> tag to import a CSS from external file (will be injected using UB.inject). Example:

```vue
<template>
  <div>1111</div>
</template>
<script>
export default {
  data () { return {}  }
}
</script>
<style>
  div { color: red; }
</style>
<style src="./path/to/file"></style>
```

## [1.4.0] - 2021-03-25
### Changed
 - migrate build to webpack5

## [1.3.3] - 2019-05-21
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [1.3.1] - 2019-03-10
### Changed
 - code simplified - all unsupported and unused features are removed from code
 - vue compiler padding changed from `line` to `space`

## [1.3.0] - 2019-03-06
### Added
 - ES6 `export default` support for Vue SFC - parser will replace it to `module.exports.default =` in dev mode
 - vue component definition is exported as `default` so should be imported as 
   `const MyComponent = require('./MyComponent.vue').default`. `BOUNDLED_BY_WEBPACK` hack should be removed
      
## [1.2.5] - 2019-03-01
### Changed
 - use webpack4 for production build

## [1.2.2] - 2018-10-29
### Added
 - `prepublish` script added for creation minimised version of plugin into `dist` folder before publishing 
 