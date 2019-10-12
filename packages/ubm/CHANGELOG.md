# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.3.0]
### Added
 - `ubm_desktop` props `description` and `iconCls`. Now can set description and icon for desktop which will show in sidebar desktop selector
 - `ubm_navshortcut` optional prop `description` not used yet, but will later be displayed in the sidebar
 - `ubm_navshortcut` optional prop `keywords` it needed to improve search

## [5.2.16]
### Fixed
 - added localization for shortcut form editor caption

## [5.2.0]
### Changed
 - all meta files and they localization transformed to array-of-attributes format

## [5.1.33]
### Fixed
 - icon selection in umb_navshortcur form now works in fireFox 

## [5.1.27]
### Changed
 - shortcut editor form: highlight currently selected folder in ShortcutTree control
 - Entity metadata editor is moved form ubdev model into UMB. double-click on entity inside diagram opens entity metadata editor 

## [5.1.26]
### Changed
 - UBM model lang files are converted to array-of-object format

## [5.1.25]
### Changed
 - Shortcut edit/creation form now showed in tab instead of modal window 
 
## [5.1.24]
### Fixed
 - added missed caption for `ubm_navshortcut` form
 - VueJS form template modified according to current form boilerplate

## [5.1.22]
### Fixed
 - Form editor now recognize a Vue form syntax (mixed HTML + js) 

## [5.1.21]
### Changed
 - `ubm_navshortcut` form rewritten to Vue

## [5.1.11]
### Fixed
 - insertion of form with type `module` do not throw error

## [5.1.10]
### Changed
- **BREAKING** `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
 `git mv my_entity-fm.js my_entity-fm.vue`
 
## [5.1.7]
### Changed
 - ubm_form.ID calculated as `crc32(form_code + form_model)` instead of `crc32(form_code)` to prevent
 ID's conflict between overrated forms
 
## [5.1.0]
### Changed
 - `ubm_form` & `ubm_diagram` cache now flushed for all thread in case insert or update is called. This solve possible
 error when form/diagram created in one thread not visible to other until server restart  
 
## [5.0.66]
### Added
 - In PRODUCTION mode form editor will show warning box about page reloading for applying changes  

## [5.0.61]
### Changed
 - because of fix in `$.currentUserOrUserGroupInAdmSubtable` RLS macros rights for `ubm_navshortcut` & `ubm_desktop` 
 now can be granted to `Everyone` `User` `Anonymous` 

## [5.0.12]
### Fixed
- fix creation of a new pureExtJS form from adminUI

## [4.0.48]
### Changed
- `ubm_navshortcut` now not cached on entity level (admin UI cache it using it own mechanism)
This change is required to prevent massive CLOB fetching (cmdData attribute)

## [4.0.39]
### Added
 - useful code snippets added to a form builder for def and js parts

## [4.0.36]
### Added
 - new shortcut form now contains a comment about code snippet usage
 - showReport code snippet added to shortcut form

## [4.0.27]

### Fixed
- added unique index for instanceID + admSubjectID for ubm_desktop_adm.meta & ubm_navshortcut_adm.meta 

