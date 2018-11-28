# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.69]
### Fixed
 - Content Security Policy for WebSocket should be limited to `uiSettings.adminUI.amqpNotificationUrl`
 instead of server-side `application.customSettings.amqpNotificationUrl` setting
 
## [5.0.68]
### Changed
 - Content Security Policy for WebSocket is limited to (optional) URL from `application.customSettings.amqpNotificationUrl`
 
## [5.0.52]
### Fixed 
- allow blob: source for connect-src CSP rules. It required by UBDocument (ER diagrams, Org chart)

## [5.0.37]
### Fixed
- allow blob: source for object-src and frame-src CSP rules. It required by pdf viewer

## [5.0.26]
### Fixed
 - regression in case model package.json not contains a "browser" section

## [4.1.7]
### Fixed
- adminUI endpoint will redirect permanently http://host:port/endpointName/ -> http://host:port/endpointName

