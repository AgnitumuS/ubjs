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

## [5.2.46] - 2020-01-17
### Changed
 - rewrote `010_create_navshortcuts.js` config for rendering ubm forms on vue

## [5.2.45] - 2020-01-11
## [5.2.44] - 2020-01-03
## [5.2.43] - 2020-01-02
### Added
 - `ubm_desktop-fm` form rewritten to Vue
 - `ubm_desktop` new attribute `displayOrder` - desktop display order in the sidebar

## [5.2.42] - 2019-12-30
## [5.2.41] - 2019-12-27
## [5.2.40] - 2019-12-20
## [5.2.39] - 2019-12-18
## [5.2.38] - 2019-12-17
### Added
 - Vue form template now adds component name for form component (name: 'form-code'). This simplify debugging using VueDevTools
 - double click on attribute in form editor will add `<u-auto-field>` to the form JS for Vue forms
   
## [5.2.32] - 2019-12-09
### Added
 - `ubm_query` entity, navigation shortcut for the entity (autoform is used).  The entity is intended to be used as
   as "dictionary of dictionaries" and contain actual UBQL (as a JSON attribute) to be executed.  Useful for any sort
   of custom fields, which need to refer system dictionaries.

## [5.2.30] - 2019-10-12
### Added
 - `ubm_desktop` props `description` and `iconCls`. Now can set description and icon for desktop which will show in sidebar desktop selector
 - `ubm_navshortcut` optional prop `description` not used yet, but will later be displayed in the sidebar
 - `ubm_navshortcut` optional prop `keywords` it needed to improve search

## [5.2.16] - 2019-09-20
### Fixed
 - added localization for shortcut form editor caption

## [5.2.0] - 2019-07-22
### Changed
 - all meta files and they localization transformed to array-of-attributes format

## [5.1.33] - 2019-07-06
### Fixed
 - icon selection in umb_navshortcur form now works in fireFox 

## [5.1.27] - 2019-06-20
### Changed
 - shortcut editor form: highlight currently selected folder in ShortcutTree control
 - Entity metadata editor is moved form ubdev model into UMB. double-click on entity inside diagram opens entity metadata editor 

## [5.1.26] - 2019-06-15
### Changed
 - UBM model lang files are converted to array-of-object format

## [5.1.25] - 2019-06-14
### Changed
 - Shortcut edit/creation form now showed in tab instead of modal window 
 
## [5.1.24] - 2019-06-12
### Fixed
 - added missed caption for `ubm_navshortcut` form
 - VueJS form template modified according to current form boilerplate

## [5.1.22] - 2019-06-10
### Fixed
 - Form editor now recognize a Vue form syntax (mixed HTML + js) 

## [5.1.21] - 2019-06-09
### Changed
 - `ubm_navshortcut` form rewritten to Vue

## [5.1.11] - 2019-03-11
### Fixed
 - insertion of form with type `module` do not throw error

## [5.1.10] - 2019-03-06
### Changed
- **BREAKING** `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
 `git mv my_entity-fm.js my_entity-fm.vue`
 
## [5.1.7] - 2019-02-23
### Changed
 - ubm_form.ID calculated as `crc32(form_code + form_model)` instead of `crc32(form_code)` to prevent
 ID's conflict between overrated forms
 
## [5.1.0] - 2018-12-29
### Changed
 - `ubm_form` & `ubm_diagram` cache now flushed for all thread in case insert or update is called. This solve possible
 error when form/diagram created in one thread not visible to other until server restart  
 
## [5.0.66] - 2018-11-18
### Added
 - In PRODUCTION mode form editor will show warning box about page reloading for applying changes  

## [5.0.61] - 2018-10-06
### Changed
 - because of fix in `$.currentUserOrUserGroupInAdmSubtable` RLS macros rights for `ubm_navshortcut` & `ubm_desktop` 
 now can be granted to `Everyone` `User` `Anonymous` 

## [5.0.12] - 2018-05-18
### Fixed
- fix creation of a new pureExtJS form from adminUI

## [4.0.48] - 2018-01-10
### Changed
- `ubm_navshortcut` now not cached on entity level (admin UI cache it using it own mechanism)
This change is required to prevent massive CLOB fetching (cmdData attribute)

## [4.0.39] - 2017-09-14
### Added
 - useful code snippets added to a form builder for def and js parts

## [4.0.36] - 2017-09-06
### Added
 - new shortcut form now contains a comment about code snippet usage
 - showReport code snippet added to shortcut form

## [4.0.27] - 2017-05-11

### Fixed
- added unique index for instanceID + admSubjectID for ubm_desktop_adm.meta & ubm_navshortcut_adm.meta 

