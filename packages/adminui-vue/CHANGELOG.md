# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.0]
### Changed
 - webpack4 is used for compile production mode
 - updated vue@2.6.6 -> vue@2.6.7
 - upgraded vue-loader@14.2.4 -> vue-loader@15.6.4
 
## [1.2.2]
### Fixed
 - relogon form: default focused element should be password
 - relogon form: password should be cleaned after submit
 - `adminui-vue` model replace Ext-JS based dialogs with VueJS implementation.
  List of methods which was changed:
    - `Ext.Msg.confirm`
    - `$App.dialogYesNo`
    - `$App.dialogInfo`
    - `$App.dialogError`
    - `window.onerror`
    - `Ext.override` -> `UB.view.BasePanel` -> `showValidationErrors`

## [1.2.0]
### Changed
 - `adminui-vue` model replace a top Ext-JS based tabbar with tabbar implemented using VueJS.
  See `components/UbTabbar`
 - `adminui-vue` model replace Ext-JS based relogon window with VueJS implementation.
  See `components/UbRelogon`

### Fixed
 - authorization form validation message localisation

## [1.1.0]
### Changed
 - vue updated 2.5.17 -> 2.6.6
 - element-ui updated 2.4.9 -> 2.5.4

## [1.0.44]
### Added
- watch for prop value changed in all controls
- open dialog with iFrame for pdf files in `UbUploadDocument`

## [1.0.43]
### Fixed
 - add missing "css" folder to the published package

## [1.0.40]
### Added
 - components folder is added to tarball for debugging purpose

## [1.0.34]
### Changed
 - hide `Forgot password?` and `Registration` on auth form when `Negotiate` enabled
 - add title to Localizable Dialog in `UbInput`

### Fixed
 - fix popovers collapse on `UbSelectEntity` control
 - add styles for low resolution screens in `UbInput` Localizable Dialog

## [1.0.33]
### Changed
 - vue loader registration is moved form `adminui-vue` to `adminui-pub`

### Fixed
 - set `ub-auth` page title to the `uiSettings.adminUI.applicationTitle` just after got an application info

## [1.0.32]
### Fixed
 - error with hidden UB auth in case this is only one possible auth method

## [1.0.31]
### Changed
 - adminui-vue auth form will hide ub auth under `options` if Kerberos or CERT2 is enabled

## [1.0.27]
### Fixed
 - let's ElementUI popups be above all Ext popups by setting initial ElementUI.zIndex to 300000

### Changed
 - change webpack configuration to decrease boundle for production build (from 847Kb to 630Kb)
 
## [1.0.26]
### Added
 - vue based login now support `onNeedChangePassword` connection event and display the password change form to the user
 
### Changed
 - `element-ui` is upgraded to `2.4.9`   
 
## [1.0.16]
### Added
 - vue based login now support `CERT2` authentication (available in UB DE)

## [1.0.11]
### Changed
 - update element-ui to 2.4.5 (2.4.6 not theme is compiled)

## [1.0.9]
### Fixed
- theme will set ExtJS fieldset border radius to 4px

## [1.0.8]
### Fixed
- ub-auth.html: hide password on password input (type="password")

## [1.0.6]
### Added
- css for round ExtJS form fields border radius (as in ElementUI)

## [1.0.6]
### Added
- ability to load Vue single file components (*.vue) - see ``@unitybase/systemjs-plugin-vue-ub` readme for restrictions

### Changed
- default size of ElementUI components is set to to `small`

## [1.0.5]
### Fixed
- login window logo css fixed in way logo looks the same on adminui-vue and adminui login windhw
- add missing `views/ub-auth.html` to the package

## [1.0.3]
### Fixed
- use Vue version with compiler (vue/dist/vue.common.js) for both dev/prod build

## [1.0.2]
### Changed
- theme css `/dist/adminui-vue.css` will loaded by adminui-vue automatically (using require)
- theme CSS will not override a body font-size, so other modules can set his own (we recommend 14px)
