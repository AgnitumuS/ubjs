# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.6]
### Added
- ability to load Vue single file components (*.vue) - see ``@unitybase/systemjs-plugin-vue-ub` readme for restrictions

### Changed
- default size of ElementUI components is set to to `small`

## [1.0.5]
### Fixed
- login window logo css fixed in way logo looks the same on adminui-next adn adminui login windhw
- add missing `views/ub-auth.html` to the package

## [1.0.3]
### Fixed
- use Vue version with compiler (vue/dist/vue.common.js) for both dev/prod build

## [1.0.2]
### Changed
- theme css `/dist/adminui-next.css` will loaded by adminui-next automatically (using require)
- theme CSS will not override a body font-size, so other modules can set his own (we recommend 14px)
