# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.3]
### Fixed
- use Vue version with compiler (vue/dist/vue.common.js) for both dev/prod build

## [1.0.2]
### Changed
- theme css `/dist/adminui-next.css` will loaded by adminui-next automatically (using require)
- theme CSS will not override a body font-size, so other modules can set his own (we recommend 14px)
