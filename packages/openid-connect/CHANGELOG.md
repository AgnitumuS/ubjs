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

## [5.20.19] - 2021-08-04
## [5.20.18] - 2021-07-18
### Added
 - support for id.gov.ua - see  https://id.gov.ua/downloads/IDInfoProcessingD.pdf

## [5.20.17] - 2021-07-08
## [5.20.16] - 2021-06-14
### Added
 - `openIDConnect`: id_token saving on auth handshake stage.
    This token needed for doing proper OpenID logout with `post_logout_redirect_uri` param.
    Token value can be accessed in 'getOnFinishAction' and save it to the LocalStorage/SessionStorage for example.
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
## [5.19.7] - 2021-03-23
## [5.19.6] - 2021-03-17
## [5.19.5] - 2021-03-15
## [5.19.4] - 2021-03-03
## [5.19.3] - 2021-02-10
## [5.19.2] - 2021-02-08
## [5.19.1] - 2021-02-03
## [5.19.0] - 2021-02-02
### Changed
 - use new method `req.getHeader('origin')` to get a `Origin` header value
 - use new property `req.parsedParameters` instead of `queryString.parse(req.parameters)`


## [5.1.57] - 2021-01-30
### Changed
 - use `req.getHeader('origin')` to get a `Origin` header value

## [5.1.56] - 2021-01-26
## [5.1.55] - 2021-01-19
## [5.1.54] - 2021-01-17
## [5.1.53] - 2020-12-30
## [5.1.52] - 2020-12-28
## [5.1.51] - 2020-12-22
## [5.1.50] - 2020-12-21
## [5.1.49] - 2020-12-20
## [5.1.48] - 2020-12-14
## [5.1.47] - 2020-12-09
## [5.1.46] - 2020-12-02
## [5.1.45] - 2020-11-25
## [5.1.44] - 2020-11-20
## [5.1.43] - 2020-11-19
## [5.1.42] - 2020-11-15
## [5.1.41] - 2020-11-14
## [5.1.40] - 2020-11-12
## [5.1.39] - 2020-11-10
## [5.1.38] - 2020-11-08
## [5.1.37] - 2020-11-08
## [5.1.36] - 2020-11-05
## [5.1.35] - 2020-11-01
## [5.1.34] - 2020-10-20
## [5.1.33] - 2020-10-15
## [5.1.32] - 2020-09-23
## [5.1.31] - 2020-09-22
## [5.1.30] - 2020-09-20
## [5.1.29] - 2020-09-08
## [5.1.28] - 2020-09-01
## [5.1.27] - 2020-08-31
## [5.1.26] - 2020-08-19
## [5.1.25] - 2020-08-19
## [5.1.24] - 2020-07-28
## [5.1.23] - 2020-07-26
## [5.1.22] - 2020-07-19
## [5.1.21] - 2020-07-16
## [5.1.20] - 2020-07-15
### Added
 - support for ADFS3 (Windows Server 2012 only - in Windows Server 2016+ ADFS version is 2016):
   - added `providerConfig.resource` - requested resource
   - `providerConfig.client_secret` can be omitted

## [5.1.19] - 2020-07-08
## [5.1.18] - 2020-07-01
## [5.1.17] - 2020-06-30
## [5.1.16] - 2020-06-21
## [5.1.15] - 2020-06-15
## [5.1.14] - 2020-06-15
## [5.1.13] - 2020-06-14
## [5.1.12] - 2020-05-25
## [5.1.11] - 2020-05-22
## [5.1.10] - 2020-05-17
## [5.1.9] - 2020-05-13
## [5.1.8] - 2020-05-06
## [5.1.7] - 2020-04-24
## [5.1.6] - 2020-04-10
## [5.1.5] - 2020-03-30
## [5.1.4] - 2020-03-20
## [5.1.3] - 2020-03-17
## [5.1.2] - 2020-03-09
## [5.1.1] - 2020-03-04
## [5.1.0] - 2020-02-29
## [5.0.118] - 2020-02-23
## [5.0.117] - 2020-02-18
## [5.0.116] - 2020-02-13
## [5.0.115] - 2020-02-10
## [5.0.114] - 2020-02-08
## [5.0.113] - 2020-02-03
## [5.0.112] - 2020-01-31
### Fixed
 - Set 'utf-8' encoding for html-response of authorization [UBDF-11025]

## [5.0.109] - 2019-12-24
### Changed
 - Skip user information request in case `provider.userInfoUrl` is empty (ADFS 3 does not implement this, JWT token what contains user information is used instead)
 - Set default value for getOnFinishAction event. The default value is suitable for "adminui" form.
