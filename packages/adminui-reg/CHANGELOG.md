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

## [5.23.23] - 2022-10-04
## [5.23.22] - 2022-09-30
## [5.23.21] - 2022-09-26
## [5.23.20] - 2022-09-11
## [5.23.19] - 2022-09-02
## [5.23.18] - 2022-09-01
## [5.23.17] - 2022-08-26
## [5.23.16] - 2022-08-23
## [5.23.15] - 2022-08-19
## [5.23.14] - 2022-08-16
## [5.23.13] - 2022-08-09
## [5.23.12] - 2022-08-05
## [5.23.11] - 2022-08-04
## [5.23.10] - 2022-07-28
## [5.23.9] - 2022-07-26
## [5.23.8] - 2022-07-26
### Added
 - added `uiSettings.cspAllow.frameAncestors` rules what controls for what sites our client app can be embedded indo iframe.
   **WARING** - @unitybase/ubcli should also be updated and `ubcli generateNginxCfg` executed to remove `add_header X-Frame-Options sameorigin;`
   directives in nginx config

### Changed
 - accessing to `localhost:8083` and `localhost:8081` in content security policies
   `default-src`, `script-src` `connect-src` and `object-src` now allowed only in case some of `iit` Ukraine specific
   crypto-libraries is used in `uiSettings.adminUI.encryptionImplementation`. For instances without IIT these CSP are not added 

## [5.23.7] - 2022-07-21
## [5.23.6] - 2022-07-14
## [5.23.5] - 2022-07-12
## [5.23.4] - 2022-07-11
## [5.23.3] - 2022-07-05
## [5.23.2] - 2022-06-19
## [5.23.1] - 2022-06-19
## [5.23.0] - 2022-06-15
### Changed
 - dependencies upgraded: "mustache": "^4.2.0"

### Removed
 - `plugin-types` CSP header is removed (marked as deprecated in browsers)

## [5.22.21] - 2022-06-06
## [5.22.20] - 2022-06-01
## [5.22.19] - 2022-05-26
## [5.22.18] - 2022-05-22
### Added
 - added support for `uiSettings.adminUI.customTheme` while generation an index page.
   See [Customizing UI tutorial](https://unitybase.info/api/server-v5/tutorial-customizing_ui.html) for details

## [5.22.17] - 2022-05-10
## [5.22.16] - 2022-05-04
## [5.22.15] - 2022-04-29
## [5.22.14] - 2022-04-27
## [5.22.13] - 2022-04-25
## [5.22.12] - 2022-04-20
## [5.22.11] - 2022-04-20
## [5.22.10] - 2022-04-20
## [5.22.9] - 2022-04-19
## [5.22.8] - 2022-04-14
## [5.22.7] - 2022-04-08
## [5.22.6] - 2022-03-29
## [5.22.5] - 2022-03-25
## [5.22.4] - 2022-02-16
## [5.22.3] - 2022-02-08
## [5.22.2] - 2022-01-24
## [5.22.1] - 2022-01-14
## [5.22.0] - 2022-01-09
## [5.20.36] - 2021-12-14
## [5.20.35] - 2021-12-07
## [5.20.34] - 2021-12-07
## [5.20.33] - 2021-12-02
## [5.20.32] - 2021-11-30
## [5.20.31] - 2021-11-23
## [5.20.30] - 2021-11-14
## [5.20.29] - 2021-11-05
## [5.20.28] - 2021-10-27
## [5.20.27] - 2021-10-18
## [5.20.26] - 2021-09-24
## [5.20.25] - 2021-09-16
## [5.20.24] - 2021-09-08
## [5.20.23] - 2021-09-02
## [5.20.22] - 2021-08-31
## [5.20.21] - 2021-08-18
## [5.20.20] - 2021-08-09
## [5.20.19] - 2021-08-04
## [5.20.18] - 2021-07-18
## [5.20.17] - 2021-07-08
## [5.20.16] - 2021-06-14
## [5.20.15] - 2021-05-24
## [5.20.14] - 2021-05-13
## [5.20.13] - 2021-05-07
## [5.20.12] - 2021-05-05
## [5.20.11] - 2021-04-24
## [5.20.10] - 2021-04-23
## [5.20.9] - 2021-04-22
## [5.20.8] - 2021-04-19
## [5.20.7] - 2021-04-19
## [5.20.6] - 2021-04-16
## [5.20.5] - 2021-04-13
## [5.20.4] - 2021-04-02
## [5.20.3] - 2021-04-01
## [5.20.2] - 2021-03-30
## [5.20.1] - 2021-03-29
## [5.20.0] - 2021-03-25
## [5.19.10] - 2021-03-23
## [5.19.9] - 2021-03-17
## [5.19.8] - 2021-03-16
## [5.19.7] - 2021-03-15
## [5.19.6] - 2021-03-15
## [5.19.5] - 2021-03-03
## [5.19.4] - 2021-02-25
## [5.19.3] - 2021-02-10
## [5.19.2] - 2021-02-08
## [5.19.1] - 2021-02-03
## [5.19.0] - 2021-02-02
## [5.4.73] - 2021-01-30
## [5.4.72] - 2021-01-28
## [5.4.71] - 2021-01-26
## [5.4.70] - 2021-01-19
## [5.4.69] - 2021-01-17
## [5.4.68] - 2021-01-11
## [5.4.67] - 2020-12-30
## [5.4.66] - 2020-12-28
## [5.4.65] - 2020-12-22
## [5.4.64] - 2020-12-21
## [5.4.63] - 2020-12-20
## [5.4.62] - 2020-12-17
## [5.4.61] - 2020-12-16
## [5.4.60] - 2020-12-14
## [5.4.59] - 2020-12-09
## [5.4.58] - 2020-12-09
## [5.4.57] - 2020-12-02
## [5.4.56] - 2020-11-25
## [5.4.55] - 2020-11-23
## [5.4.54] - 2020-11-20
## [5.4.53] - 2020-11-19
## [5.4.52] - 2020-11-15
## [5.4.51] - 2020-11-14
## [5.4.50] - 2020-11-12
## [5.4.49] - 2020-11-10
## [5.4.48] - 2020-11-08
## [5.4.47] - 2020-11-08
## [5.4.46] - 2020-11-05
## [5.4.45] - 2020-11-01
## [5.4.44] - 2020-10-20
## [5.4.43] - 2020-10-15
## [5.4.42] - 2020-09-23
## [5.4.41] - 2020-09-22
## [5.4.40] - 2020-09-21
## [5.4.39] - 2020-09-20
## [5.4.38] - 2020-09-09
## [5.4.37] - 2020-09-08
## [5.4.36] - 2020-09-01
## [5.4.35] - 2020-08-31
## [5.4.34] - 2020-08-20
## [5.4.33] - 2020-08-19
## [5.4.32] - 2020-08-19
## [5.4.31] - 2020-08-03
## [5.4.30] - 2020-07-29
## [5.4.29] - 2020-07-28
## [5.4.28] - 2020-07-26
## [5.4.27] - 2020-07-19
## [5.4.26] - 2020-07-16
## [5.4.25] - 2020-07-15
## [5.4.24] - 2020-07-08
## [5.4.23] - 2020-07-01
## [5.4.22] - 2020-06-30
## [5.4.21] - 2020-06-24
## [5.4.20] - 2020-06-21
## [5.4.19] - 2020-06-15
## [5.4.18] - 2020-06-15
## [5.4.17] - 2020-06-14
## [5.4.16] - 2020-05-31
## [5.4.15] - 2020-05-27
## [5.4.14] - 2020-05-25
## [5.4.13] - 2020-05-22
## [5.4.12] - 2020-05-21
## [5.4.11] - 2020-05-17
## [5.4.10] - 2020-05-13
## [5.4.9] - 2020-05-06
## [5.4.8] - 2020-04-24
## [5.4.7] - 2020-04-10
## [5.4.6] - 2020-04-03
## [5.4.5] - 2020-03-30
## [5.4.4] - 2020-03-20
## [5.4.3] - 2020-03-17
## [5.4.2] - 2020-03-09
## [5.4.1] - 2020-03-04
## [5.4.0] - 2020-02-29
## [5.3.34] - 2020-02-23
## [5.3.33] - 2020-02-18
## [5.3.32] - 2020-02-13
## [5.3.31] - 2020-02-10
## [5.3.30] - 2020-02-08
## [5.3.29] - 2020-02-03
## [5.3.28] - 2020-01-31
## [5.3.27] - 2020-01-17
## [5.3.26] - 2020-01-11
## [5.3.25] - 2020-01-03
## [5.3.24] - 2020-01-02
## [5.3.23] - 2020-01-02
## [5.3.22] - 2019-12-30
## [5.3.21] - 2019-12-27
## [5.3.20] - 2019-12-20
### Fixed
 - Add CSP rules for PDF.js Firefox extension

## [5.3.6] - 2019-11-18
### Fixed
 - CSP for IIT sign agent

## [5.2.2] - 2019-07-16
### Added
 - more details will be shown to user in case server works in production mode but user use a `-dev` endpoint 

## [5.2.0] - 2019-07-08
### Changed
 - Ext based login form is removed. In case `uiSettings.adminUI.loginURL` is not defined and `adminui-vue` is in domain then 
  vue-based login form will be used, if `loginURL` not defined and `adminui-vue` not in domain - error page will be displayed 
  
## [5.1.13] - 2019-03-22
### Changed
 - upgrade mustache 2.3.0 -> 3.0.1 
 
## [5.1.12] - 2019-03-11
### Added
 - protection against Clickjacking/sniffing/XSS attack is added for main HTML page.
 In case custom login page is used it's strongly recommended to use nginx config
 generated by `npx ubcli generateNginxCfg` command
    
## [5.1.0] - 2018-12-28
### Changed
 - sped-up index.html generation by replacing resource versions calculation algorithm from md5 to `version` from package.json
 - re-generation of cached `index.html` based on file system changes events is **removed**. In case developer change
 an `index.html` mustache template or update an application packages __server should be restarted__ to apply a new changes    
 
## [5.0.69] - 2018-11-21
### Fixed
 - Content Security Policy for WebSocket should be limited to `uiSettings.adminUI.amqpNotificationUrl`
 instead of server-side `application.customSettings.amqpNotificationUrl` setting
 
## [5.0.68] - 2018-11-20
### Changed
 - Content Security Policy for WebSocket is limited to (optional) URL from `application.customSettings.amqpNotificationUrl`
 
## [5.0.52] - 2018-09-17
### Fixed 
- allow blob: source for connect-src CSP rules. It required by UBDocument (ER diagrams, Org chart)

## [5.0.37] - 2018-08-06
### Fixed
- allow blob: source for object-src and frame-src CSP rules. It required by pdf viewer

## [5.0.26] - 2018-07-09
### Fixed
 - regression in case model package.json not contains a "browser" section

## [4.1.7] - 2018-07-09
### Fixed
- adminUI endpoint will redirect permanently http://host:port/endpointName/ -> http://host:port/endpointName

