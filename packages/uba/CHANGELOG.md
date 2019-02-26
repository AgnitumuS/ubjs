# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.1.17]
### Added
 - navshortcuts access initialization for Supervisor role
 
## [5.1.15]
### Added
 - new API method `uba_user.setUDataKey(key, value)` - set key value inside `uba_user.uData` and store new JSON do DB
 
## [5.1.14]
### Added
 - **Attribute Level Security editor** (can be ronned from ALS grid).
 This editor is a direct replacement of desktop ALS application.
 `adminui-vue` model must be added to application domain for this feature.

## [5.1.12]
### Fixed
 - allow Supervisor role to manage uba_grouprole
 - allow Supervisor role read uba_userrole, uba_usergroup and uba_grouprole [unitybase/ubjs#33]
 
### Changed
 - add warning to ELS form about insecure usage of method mask in ELS rules [unitybase/ubjs#38]

## [5.1.7]
### Fixed
- Write to security audit when group gets or lost a role
- Write to security audit when user is added/removed to/from group
- Added localization to `uba_group` entity for en/uk/ru

### Changed
 - UBA model `Session.on('login')` handler now check advanced security only. All required uData properties 
 are filled in UB model `Session._getRBACInfo` method (called by server during authorization stage) 

## [5.1.3]
### Fixed
 - uba_user.name attribute Georgian translation changed

## [5.1.1]
### Fixed 
 - fix update/insert of uba_usercertificate (setBlob method)

## [5.1.0]
### Fixed 
 - fix logging of security violation in case user without admin role try
 to change password for another user

### Changed
 - Pseudo roles Everyone, Anonymous (if user is not logged in) or User (if logged in)
  are added to `Session.uData.roles` & `Session.uData.roleIDs`. In prev. implementation `uData` not contains this roles

## [5.0.32]
### Fixed
- `uba_auditTrail-fm` fixed bug in case show changed values by attribute of type **document**

## [5.0.19]
### Changed
- `uba_user.publicRegistration` rest endpoint will use a App.externalURL  for a callbacks (in case server is behind a reverse proxy)

## [5.0.6]
### Changed
- put user name into uba_audit.actionuser for login/loginFail operations

## [4.1.32]
### Changed
- `uba_als.code` length increased to 128 to allow developer to create a unique ELS rule codes based on code = role.name + entity.name + method.name pattern

## [4.1.22]
### Added
- new attribute `uba_usercertificate.revocationDate` - not null in case certificate is revoked

## [4.1.21]
### Added
- new entity uba_advSecurity: advanced security (Associating a user with a keyMedia, IP address & device fingerprint) + new version 1.0.0.7 of IITCrypto feature [UB-1817] [UB-1818] [UB-1819]
- new shortcut `Advanced security`
- Session.on('logon') event now take a req: THTTPRequest input param
- grant rights to uba_advSecurity for Supervisor role
- store a request headers during uba_audit LOGIN event
- user can upload certificate in user form 

### Fixed
--set **uba_user.lastPasswordChangeDate = maxDate** in case create domain users.