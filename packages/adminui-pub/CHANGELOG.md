# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

##  [4.2.22]
### Fixed
 - Show unhandled Promise rejection messages in dialog box (replace when->es6-promise Promise polufill)

##  [4.2.20]
### Fixed
 - UB.ux.form.field.UBDateTime. Prevent exception when picker opened and button TAB pressed. [UB-1862]

##  [4.2.18]
### Added
 - Editors for OrgChart available in UB EE is moved into standard edition (this package)

###Fixed
- fix bag in cyclical opening of modal forms.(`org_staffunit` -> `org_employeeinstaff` -> `org_staffunit`)

##  [4.2.17]
### Fixed
- allow UBComboBox.setValueById to use `valueField` instead of hardcoded 'ID'
- "Remember me" feature for Negotiate authentication now don't hung a app
- "unable to change password at first logon" issue fixed 

## [4.2.15]
### Added

### Fixed
-  prevent open the same command in separate tabs in case it's opened from left or top menu
-  set `UBStore.loading = true` in method **UBStore.reload** before call **UBStore.clearCache()**.

### Changed
- enum combobox now sort enum captions by `orderNum` attribute (instead of name)
- remove ER diagram background image (not background is white )
- ignore attributes with property `defaultView: false` for automatically generated forms

## [4.2.13]
### Added

### Fixed
- UBReportEditor now draw a dashed border around sections (both paragraph and table row)

## [4.2.12]
### Added
- AdminUI: In case of first login attempt LoginWindow will activate a tab for a first auth method from server config `security.authenticationMethods` array

### Fixed
- fix systemjs version to `0.20.10-scoped` - pathced vwrsion what allow scoped modules loading without map configuration

## [4.2.11]
### Added
- UBBoxSelect now accept ubRequest as a config parameter (for store creation)
- UBReportEditor can insert image from file (Insert -> Image -> click on button with photo)
- UBReportEditor added build-in image editor (click on image to actiate)

### Fixed
- since form definitian now evaluated only once (HMR) both `EntityGridPanel` & `ubdetailgrid` now accept `customActionas` as a Ext.Action config (not a class instance)
