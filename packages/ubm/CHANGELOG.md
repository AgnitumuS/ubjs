# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.1.20]
### Changed
 - changed `ubn_navshortcut` form to vue

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
 - userful code snippets added to a form builder for def and js parts


## [4.0.36]
### Added
 - new shortcut form now contains a comment about code snippet usage
 - showReport code snippet added to shortcut form

## [4.0.27]

### Fixed
- added unique index for instanceID + admSubjectID for ubm_desktop_adm.meta & ubm_navshortcut_adm.meta 

