# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.12]
### Changed
- file system based BLOB store will use default tempPath: `path.join(this.path, '_temp')` to prevent
 situation from [unitybase/ub-server#11]

## [5.0.6]
### Fixed
- fix exception during saving cleaned Document type attribute value for historical stores (ub-server #10)
