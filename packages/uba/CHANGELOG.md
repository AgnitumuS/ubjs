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

## [5.3.29] - 2020-02-10
## [5.3.28] - 2020-02-08
## [5.3.27] - 2020-02-03
### Changed
 - `uba_user.trustedIP` attribute size increased to 2000

### Fixed
- ALS form: allow to change newly added record by enabling Save & SaveDiffInFile

## [5.3.26] - 2020-01-31
## [5.3.25] - 2020-01-17
### Changed
 - rewrote `010_create_navshortcuts.js` config for rendering uba forms on vue

### Fixed
 - `uba_user-changeUserPassword`: added a separate method for changing own and someone else's password

## [5.3.24] - 2020-01-11
## [5.3.23] - 2020-01-02
## [5.3.22] - 2019-12-27
### Added
 - icon for administrator desktop
 - description for administrator desktop (+localization)

## [5.3.21] - 2019-12-20
## [5.3.20] - 2019-12-18
## [5.3.19] - 2019-12-17
### Added
 - new attribute `uba_auditTrail.actionUserName`
  
### Changed
  - `uba_auditTrail.actionUser` attribute data type is changed form `Entity->uba_user` to `ID`.
  This prevents DDL generator from creating a check constraint to uba_user table and  allow to
  move uba_auditTrail to other Database by overriding a `uba_auditTrail.connectionName` (applicable for huge audits) 
  
## [5.3.16] - 2019-12-02
### Fixed
 - ALS edit form: fix broken layout for table with pinned header/column by replacing render component from `ElTable` to `UTable`

## [5.3.13] - 2019-11-07
### Fixed
 - prevent bug when inserting a new role at the multilingual instance
 - increased the size of `uba_subject.name` attribute to 256 characters, for compatibility with a `uba_role.description`

## [5.3.9] - 2019-10-12
### Fixed
 - prevent hangs of ALS form for huge ALS rules sets 

## [5.3.3] - 2019-09-19
### Added
 - Azery localization for uba_usergroup.meta
  
## [5.3.0] - 2019-08-31
### Added
 - TOTP (Google Authenticator) One Time Password generation and verification methods added into uba_otp
 
### Changed
 - HTTP request headers logged into `uba_audit` during user logon now truncated to 512 characters   

## [5.2.6] - 2019-08-19
### Added
 - Auditing rights provided to Supervisor role

## [5.2.5] - 2019-08-12
### Fixed
  - removes the hardcoded check for "accountAdmins" group inside changePassword endpoint.
  To change password for other used new method `uba_user.changeOtherUserPassword` is added. 
  Supervisor role is allowed to call it.
  
### Changed
 - `uba_usercertificates.serial` attribute is marked as unique    

## [5.2.4] - 2019-08-09
### Fixed
 - added ELS rule for Supervisor to allow reading roles (uba_role;select;A)

## [5.2.2] - 2019-07-29
### Changed
 - save certificates grid state in the User form (uba_user) 

## [5.2.0] - 2019-07-10
### Changed
 - all meta files and they localization transformed to array-of-attributes format
 
## [5.1.35] - 2019-07-22
### Added
 - Administration subjects names (uba_subject.name) support localization (multilang)
 - Roles descriptions (uba_role.description) and Groups names (uba_group.name) supports localization (multilang)
 - build-in roles localization for uk & ru
 - icons added for shortcuts from Security group 

### Fixed
 - localization of tabs for uba_user form [#51]
 - "name" property for attributes moved to the first line of attribute object for all `uba_*.meta`   

## [5.1.20] - 2019-03-24
### Added
 - `uba_auditTrail.request_id` attribute - a unique request identifier.
  Can be used eg for revert all changes made by a single `ubql` call. Require ub sevrer@5.7.18.

## [5.1.17] - 2019-02-26
### Added
 - navshortcuts access initialization for Supervisor role
 
## [5.1.15] - 2019-02-14
### Added
 - new API method `uba_user.setUDataKey(key, value)` - set key value inside `uba_user.uData` and store new JSON do DB
 
## [5.1.14] - 2019-02-12
### Added
 - **Attribute Level Security editor** (can be executed from ALS grid).
 This editor is a direct replacement of desktop ALS application.
 `adminui-vue` model must be added to application domain for this feature.

## [5.1.12] - 2019-01-27
### Fixed
 - allow Supervisor role to manage uba_grouprole
 - allow Supervisor role read uba_userrole, uba_usergroup and uba_grouprole [unitybase/ubjs#33]
 
### Changed
 - add warning to ELS form about insecure usage of method mask in ELS rules [unitybase/ubjs#38]

## [5.1.7] - 2018-12-11
### Fixed
- Write to security audit when group gets or lost a role
- Write to security audit when user is added/removed to/from group
- Added localization to `uba_group` entity for en/uk/ru

### Changed
 - UBA model `Session.on('login')` handler now check advanced security only. All required uData properties 
 are filled in UB model `Session._getRBACInfo` method (called by server during authorization stage) 

## [5.1.3] - 2018-11-27
### Fixed
 - uba_user.name attribute Georgian translation changed

## [5.1.1] - 2018-11-15
### Fixed 
 - fix update/insert of uba_usercertificate (setBlob method)

## [5.1.0] - 2018-10-06
### Fixed 
 - fix logging of security violation in case user without admin role try
 to change password for another user

### Changed
 - Pseudo roles Everyone, Anonymous (if user is not logged in) or User (if logged in)
  are added to `Session.uData.roles` & `Session.uData.roleIDs`. In prev. implementation `uData` not contains this roles

## [5.0.32] - 2018-09-05
### Fixed
- `uba_auditTrail-fm` fixed bug in case show changed values by attribute of type **document**

## [5.0.19] - 2018-06-28
### Changed
- `uba_user.publicRegistration` rest endpoint will use a App.externalURL  for a callbacks (in case server is behind a reverse proxy)

## [5.0.6] - 2018-04-23
### Changed
- put user name into uba_audit.actionuser for login/loginFail operations

## [4.1.32] - 2017-10-12
### Changed
- `uba_als.code` length increased to 128 to allow developer to create a unique ELS rule codes based on code = role.name + entity.name + method.name pattern

## [4.1.22] - 2017-08-03
### Added
- new attribute `uba_usercertificate.revocationDate` - not null in case certificate is revoked

## [4.1.21] - 2017-08-03
### Added
- new entity uba_advSecurity: advanced security (Associating a user with a keyMedia, IP address & device fingerprint) + new version 1.0.0.7 of IITCrypto feature [UB-1817] [UB-1818] [UB-1819]
- new shortcut `Advanced security`
- Session.on('logon') event now take a req: THTTPRequest input param
- grant rights to uba_advSecurity for Supervisor role
- store a request headers during uba_audit LOGIN event
- user can upload certificate in user form 

### Fixed
--set **uba_user.lastPasswordChangeDate = maxDate** in case create domain users.
