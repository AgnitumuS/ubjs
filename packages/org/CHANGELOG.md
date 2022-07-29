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
- `org_staffunit` form: proper validation for 'position' field

## [5.23.10] - 2022-07-28
### Fixed
- Critical regression typo on `org_emloyeeonstaff` localization

## [5.23.9] - 2022-07-28
### Fixed
- `org_employeeonstaff` form:
  - do not show date_to if year equal 9999
  - fixes in 'en' translations

## [5.23.8] - 2022-07-26
## [5.23.7] - 2022-07-26
### Fixed
- Synchronization between `uba_user` and `org_employee` now work in 2 ways:
  - attributes:
    - `uba_user.firstName <=> org_employee.firstName'
    - `uba_user.lastName <=> org_employee.lastName'
    - `uba_user.fullName <=> org_employee.fullFIO'
  - `uba_user` support flag `__syncEmployee: false` to skip the sync
  - `org_employee` support flag `__syncUser: false` to skip the sync

## [5.23.6] - 2022-07-21
## [5.23.5] - 2022-07-12
## [5.23.4] - 2022-07-11
### Fixed
- `department`, `employee on staff`, `execgroup`, `profession`, `staff unit`, `org unit` forms:
  - mode v-loading directive above the toolbar, so all form content will be locked while loading
  - prevent locking of all opened forms by use `v-loading` instead of `v-loading.body`
  
## [5.23.3] - 2022-07-05
## [5.23.2] - 2022-06-19
## [5.23.1] - 2022-06-19
### Added
- Full access to ORG for DataManager

### Removed
- Roles `orgNodeAdmin` and `orgAllNodeAccess`, because they are used in a specific product and
  not needed in the platform

## [5.23.0] - 2022-06-15
### Changed
- Move localization for navigation shortcuts and desktop to json files

## [5.22.22] - 2022-06-09
### Fixed
- Remove scheduler condition for the "updateStaffUnitCaptions" caption
  (it was dependent on fts.async setting)

## [5.22.21] - 2022-06-06
## [5.22.20] - 2022-06-01
## [5.22.19] - 2022-05-26
## [5.22.18] - 2022-05-22
## [5.22.17] - 2022-05-10
### Added
 - added Deutsch (`de`) locale translations

## [5.22.16] - 2022-05-04
## [5.22.15] - 2022-04-29
## [5.22.14] - 2022-04-27
## [5.22.13] - 2022-04-25
## [5.22.12] - 2022-04-20
## [5.22.11] - 2022-04-20
## [5.22.10] - 2022-04-20
## [5.22.9] - 2022-04-19
### Added
 - added Deutsch (`de`) locale (stub for a while)

## [5.22.8] - 2022-04-14
## [5.22.7] - 2022-04-08
## [5.22.6] - 2022-03-29
## [5.22.5] - 2022-03-25
## [5.22.4] - 2022-02-16
### Added
 - Localization of the captions missed for `org_execgroup` and `org_diagram-main` forms

### Fixed
- cyrillic symbols in English (en) localization

## [5.22.3] - 2022-02-08
## [5.22.2] - 2022-01-24
## [5.22.1] - 2022-01-14
## [5.22.0] - 2022-01-09
## [5.20.37] - 2021-12-14
## [5.20.36] - 2021-12-07
## [5.20.35] - 2021-12-07
## [5.20.34] - 2021-12-06
## [5.20.33] - 2021-12-02
## [5.20.32] - 2021-11-30
## [5.20.31] - 2021-11-23
## [5.20.30] - 2021-11-14
## [5.20.29] - 2021-11-05
### Added
  - `org_employeeonstaff_all` shortcut - enable `__mip_recordhistory_all` misc and add a columns [mi_dateForm] and [mi_dateTo]

### Changed
 - English localization of the `ORG_UNITTYPE.EXECGROUP` enum item: `Execution Group` => `Executors Group`

### Fixed
 - `org_employeeonstaff` and `org_employeeonstaff_all` shortcuts - fixed error "Rendering slot is not defined
   for columns [staffUnitID.caption] and [employeeID.fullFIO]

## [5.20.28] - 2021-10-27
### Fixed
 - `org_employee` shortcut - added columns to prevent lookup to uba_user on userID column
 - `org_execgroup` shortcut - fixed error "Rendering slot is not defined for columns [parentID.caption]"

## [5.20.27] - 2021-10-18
### Added
 - Azerbaijani (az) localization for items with omitted translation

### Changed
 - Translations for `ORG_UNITTYPE` enum: minor improvements:
   - `Організація` => `Внутрішня організація`
   - `Підрозділ` => `Внутрішній підрозділ`
   - `Персонал` => `Штатна одиниця`
   - capitalization of English captions
 - Navigation shortcuts localization are taken from i18n (from entities caption)
 - English (en) localization for desktop description: the words are capitalized
  according to English rules for captions

## [5.20.26] - 2021-09-24
## [5.20.25] - 2021-09-16
### Changed
- English (en) localization for desktop/shortcut captions: the words are
  capitalized according to English rules for captions
- navigation definition is moved from `_initialData` scripts to `03_navigation.yml`
  file in order to use `ub-migrate` for migration of the navigation data

## [5.20.24] - 2021-09-08
### Fixed
 - `ubm_enum` sortOrder for the `ORG_UNITTYPE` eGroup: change from STAFF->ORG->DEP->EXECGROUP to ORG->DEP->STAFF->EXECGROUP,

## [5.20.23] - 2021-09-02
## [5.20.22] - 2021-08-31
## [5.20.21] - 2021-08-18
## [5.20.20] - 2021-08-09
## [5.20.19] - 2021-08-04
### Added
 - Dutch (nl) localization

## [5.20.18] - 2021-07-18
### Added
 - Dutch (nl) localization

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
### Changed
 - ORG forms, reports and er-diagrams are converted to `ubrow` format

## [5.19.5] - 2021-03-03
### Changed
 - client side locales reformatted into JSON
 - server-side locales reformatted into JSON

## [5.19.4] - 2021-02-25
## [5.19.3] - 2021-02-10
## [5.19.2] - 2021-02-08
## [5.19.1] - 2021-02-03
## [5.19.0] - 2021-02-02
## [5.4.37] - 2021-01-30
## [5.4.36] - 2021-01-28
## [5.4.35] - 2021-01-26
## [5.4.34] - 2021-01-19
## [5.4.33] - 2021-01-17
## [5.4.32] - 2021-01-11
## [5.4.31] - 2020-12-30
### Changed
 - [UBDF-12922] `org_staffunit`: use `', '` delimiter (instead of `','`) to join several employees on the same staff.
   Use `'*'` instead of `'* '` to mark a full name with permanent assignment. Example (before -> after):
   `* Sobiolev O.S.,Plaz O.V. (13.1.1 - dev depatdment)` -> `*Sobiolev O.S., Plaz O.V. (13.1.1 - dev department)`

## [5.4.30] - 2020-12-28
## [5.4.29] - 2020-12-22
### Changed
- Shortcuts for entities with `parentID` attribute associated with `org_unit`, are created with predefined columns.
  `parentID` is described as `parentID.caption` instead of lookup, because `getDescriptionById` method 
  returns '---' (for safe deleted, not accessible records, etc). [UBDF-12752]

## [5.4.28] - 2020-12-21
## [5.4.27] - 2020-12-20
## [5.4.26] - 2020-12-17
## [5.4.25] - 2020-12-16
## [5.4.24] - 2020-12-14
## [5.4.23] - 2020-12-09
## [5.4.22] - 2020-12-09
### Changed
- `org_employeeonstaff-fm`: rewritten to vue

## [5.4.21] - 2020-12-02
### Fixed
 - fixed `roleIDs.has is not a function` during log-in of user who not assigned to employee and not a `admin` (introduced in 5.4.20) 
- `org_employee.meta.uk`: typo in 'middleNameGen', 'middleNameDat'
- `org_staffunit-fm`: added missing `isNew` and `canSave` getters required for `saveParentBeforeAddNew`

## [5.4.20] - 2020-11-25
### Changed
 - allow log-in for user who not assigned to employee for members of Admin group (in addition to `admin` and `root` user).
   This fix regression introduced in @unitybase/org@5.4.0.
   
   The source of regression is so called "local administrators" - a regional administrator`s in a huge organizations.
  

### Fixed
 - `org_staffunit-fm`: fixed typo in parent context of org_employeeonstaff grid

## [5.4.19] - 2020-11-23
## [5.4.18] - 2020-11-20
## [5.4.17] - 2020-11-19
### Fixed
- `org_staffunit-fm`, `org_profession-fm`, `org_department-fm`: fixed form saving without a required `caption` field
  by adding `masterFieldList` [UBDF-12721]

## [5.4.16] - 2020-11-15
## [5.4.15] - 2020-11-14
## [5.4.14] - 2020-11-12
## [5.4.13] - 2020-11-10
### Changed
- `org_unit-fm`, `org_staffunit-fm`, `org_profession-fm`, `org_department-fm`: rewritten to vue

## [5.4.12] - 2020-11-08
## [5.4.11] - 2020-11-08
## [5.4.10] - 2020-11-05
## [5.4.9] - 2020-11-01
## [5.4.8] - 2020-10-20
### Added
- new attribute `org_execgroup.groupType` ('*' by default) to separate groups by business logic

### Changed
 - ORG model now uses ub-migrate for adding/updating ORG related enums

## [5.4.7] - 2020-10-15
## [5.4.6] - 2020-09-23
## [5.4.5] - 2020-09-22
## [5.4.4] - 2020-09-21
## [5.4.3] - 2020-09-20
## [5.4.2] - 2020-09-08
## [5.4.1] - 2020-09-01
## [5.4.0] - 2020-08-31
### Changed
 - **BREAKING** login for user who not assigned to employee allowed only for superusers
 (users `admin` and `root` = uba_common.isSuperuser()). Before these changes' logon without
 an employee is allowed for members of `Admin` group.
 
## [5.3.29] - 2020-08-19
## [5.3.28] - 2020-08-19
### Added
 - Tajik locale translation

## [5.3.27] - 2020-08-03
## [5.3.26] - 2020-07-29
## [5.3.25] - 2020-07-28
## [5.3.24] - 2020-07-26
## [5.3.23] - 2020-07-19
## [5.3.22] - 2020-07-16
## [5.3.21] - 2020-07-15
## [5.3.20] - 2020-07-08
## [5.3.19] - 2020-07-01
## [5.3.18] - 2020-06-30
## [5.3.17] - 2020-06-24
## [5.3.16] - 2020-06-21
## [5.3.15] - 2020-06-15
## [5.3.14] - 2020-06-15
## [5.3.13] - 2020-06-14
## [5.3.12] - 2020-05-25
## [5.3.11] - 2020-05-22
## [5.3.10] - 2020-05-17
### Changed
 - replace most font-awesome and element-ui to UB icons analog

## [5.3.9] - 2020-05-13
## [5.3.8] - 2020-05-06
## [5.3.7] - 2020-04-24
## [5.3.6] - 2020-04-10
## [5.3.5] - 2020-03-30
## [5.3.4] - 2020-03-20
## [5.3.3] - 2020-03-17
### Fixed
 - cyclic dep check for org units - raised an exception, when pass parentID - the same as it was before

## [5.3.2] - 2020-03-09
## [5.3.1] - 2020-03-04
## [5.3.0] - 2020-02-29
### Changed
 - entities localization files (*.meta.??) are moved to `meta_locale` folder

## [5.2.56] - 2020-02-23
### Added
 - vue form added for org_execgruop

### Changed
 - `Session.on('login', ...)` event handler now queries and records all Execution Groups IDs into `orgUnitIDs` member
   of uData.  It could and should be used for RLS.  It would make all existing RLS to account memberships
   in Execution Groups, if permission to row is added to some Execution Groups.
   If Execution Groups are not used, it shall have no impact.

   For clarity, that is what is done:
    ```
    // Query exec groups obtained though all staff member IDs
    const execGroupIDs = UB.Repository('org_execgroupmember')
      .attrs('execGroupID')
      .where('orgUnitID', 'in', allStaffUnitIDsArray)
      .selectAsObject()
      .map(gm => gm.execGroupID)
    if (execGroupIDs.length > 0) {
      orgUnitIDs = _.union(orgUnitIDs, execGroupIDs)
    }
    ```

   NOTE: Despite execution groups MAY belong to organizations or departments, this implementation won't automatically
   grant user parent org units by execution groups, i.e. Staff Unit from ORG1 won't have permission of ORG2, even, if
   included into an execution group of ORG2.

## [5.2.55] - 2020-02-18
## [5.2.54] - 2020-02-13
## [5.2.53] - 2020-02-10
## [5.2.52] - 2020-02-08
### Changed
  - org model 'login' event will throw `<<<UserWithoutOrgEmployeeNotAllowed>>>` without detailed description
  to allow ub-pub to i18n it
  
## [5.2.51] - 2020-02-03
### Fixed
 - fixed not found record error after execute 'setDescriptionAttributeByCurrency' method in org_orgaccount.js

## [5.2.50] - 2020-01-31
## [5.2.49] - 2020-01-17
### Changed
 - renamed caption of sextype from 'Sex' to 'Gender' 
 - all fullName* attributes sizes increased to 500 for `org_department`, `org_organization`
 - all name* attributes sizes increased to 256 for `org_department`, `org_organization`
 - rewrote `010_create_navshortcuts.js` config for rendering org forms on vue

## [5.2.48] - 2020-01-13
### Changed
 - all fullName* attributes sizes increased to 500 for `org_department`, `org_organization`
 - all name* attributes sizes increased to 256 for `org_department`, `org_organization`

## [5.2.47] - 2020-01-11
## [5.2.46] - 2020-01-03
## [5.2.45] - 2020-01-02
## [5.2.44] - 2019-12-30
## [5.2.43] - 2019-12-27
### Added
  - description for 'Org. structure' desktop (+localization)
  
## [5.2.42] - 2019-12-20
## [5.2.41] - 2019-12-18
## [5.2.40] - 2019-12-17

## [5.2.35] - 2019-12-09
### Fixed
 - synchronization of the `org_employee` into `uba_user` in case org_employee.userID is null

## [5.2.34] - 2019-12-09
### Fixed
  - synchronization of the `org_employee` into `uba_user` on insert operation
  - a typo in English enum name: "Staffunit" => "Staff unit"

## [5.2.33] - 2019-12-05
### Fixed
  - synchronization of the `org_employee` fullFIO attribute into `uba_user` fullName (in case employee is assigned to some user):
    - actually checked if employee is assigned to some user to prevent bug
    - sync not only fullFIO, but firstName and lastName
    - do not load data not present in execParams, get it from `selectBefureUpdate` dataset
    - do not do sync, if any of name attributes present in execParams
  - synchronization of the `cdn_contact` to `uba_user` email, fixes:
    - was incorrect check for contact type

## [5.2.30] - 2019-12-02
### Added
  - synchronization of the org_employee's fullFIO attribute into uba_user fullName (in case employee is assigned to some user)
  - Entity `org_execgroup`, which is a part of organizational structure, is `unitType` is `EXECGROUP`.
    The detail entity `org_execgroupmember` contains its members, which are `org_staffunit`.
    Business value of this entity is ability to use a group of staff units at once, for example for task assignment,
    like parallel approvals.
    Added a navigational menu item for this dictionary in `org_desktop`.

## [5.2.17] - 2019-09-18
### Fixed
  - logon event handler will not add a staff units ID for deleted employee;
  Situation is possible when one userID assigned to different employee and one of employee is deleted
  
## [5.2.8] - 2019-08-23
### Fixed
 - allow to update org_employeeonstaff when parent org unit is not visible on the current date (for example department is closed)  

## [5.2.0] - 2019-07-22
### Changed
 - all meta files and they localization transformed to array-of-attributes format
 
## [5.1.59] - 2019-06-10
### Changed
 - org_orgaccount code length changed 20 -> 29  
 
## [5.1.42] - 2019-01-27
### Fixed
 - typo in org_unit shortcut uk localization [UBDF-8687]

## [5.1.39] - 2019-01-14
### Fixed
  - uData.allStaffUnitIDs will contains ALL stuff unit ID's not only permanent/assistant/temp as reported in [unitybase/ubjs#37]
  
## [5.1.35] - 2018-12-12
### Changed
 - since DDL generations now executed under `root` check for `admin` login 
```
if (UBA_COMMON.isSuperUser()) return
```
 is removed from org.js Session.on('login') handler 
 

## [5.1.33] - 2018-12-05
### Changed
  - use `UBA_COMMON.isSuperUser()` to prevent ORG.orgOnUserLogin from execution for `admin`
   or `root` because this users are used for DDL generation

## [5.1.25] - 2018-11-19
### Changed
 - `org_employeeonstaff.caption` generation algorithm: in case `org_employeeonstaff.tabNo` is empty or whitespace - 
 don't use it in forming `org_employeeonstaff.caption`    

## [5.1.24] - 2018-11-04
### Added
 - auto generation of `org_employeeonstaff.tabNo` attribute. Length of generated code id defined 
 in `ubs_settings` `ubs.numcounter.autoIncrementalCodeLen` key. Default is 6 (codes like `000001`)
 
### Changed
 - `org_staffunit.caption` generation algorithm: take a parent name from first parent with type !== 'STAFF'
  (instead of org_staffunit.parent)

## [5.1.22] - 2018-10-08
### Changed
 - creation of `org_staffunit.caption` will add all assigned staffs names to caption except assignments
 with type `ASSISTANT`.  
 Prev. implementation adds only assignments with `employeeOnStaffType` `PERMANENT` & `TEMPORARY`
 which led to problems when adding a new assignments types to enum with code `CDN_EMPLOYEEONSTAFFTYPE`      

## [5.1.19] - 2018-10-04
### Fixed
 - generation of `org_employeeonstaff.caption`: in case `org_employee.shortFIO` is empty - use `org_employee.lastName`
 [unitybase/ubjs#14]. Deletion of `org_employeeonstaff` is fixed inside server ( ub >= v5.3.3) 

## [5.1.12] - 2019-02-18
### Fixed
 - org_orgaccount formation of the description when the constituent attributes were deleted

## [5.1.0] - 2018-08-13
### Fixed
 - syntax error in org_employeenstaff.caption isMultilang attribute
   
### Changed
- all fullName* attributes sizes increased to 300 for org_department, org_employee and org_organization 

## [5.0.39] - 2018-08-08
### Fixed
- set `uData.orgUnitIDs` order as **org_unit.mi_treePath**

## [5.0.29] - 2018-07-16
### Changed
- org_staffunit.parentID.allowNull is set to **false** (all staffs should be assigned either to organization or to department)

## [5.0.24] - 2018-07-12
### Added
- `org_employyee` add new attributes (**lastNameObj, firstNameObj, middleNameObj, shortFIOObj, fullFIOObj, applyObj**)
 describes how to treat to this person in objective case

## [5.0.23] - 2018-07-02
### Fixed
- Cleaned up border unit shortcut from `_initialData`

## [5.0.13] - 2018-05-19
### Fixed
- `org_orgaccount.currencyID` attribute should be of dataType: cnd_currency

## [4.0.45] - 2017-12-12
### Fixed
- `org_orgaccount` localization

## [4.0.42] - 2017-11-17
### Added
 - `org_orgaccount.description` attribute (calculated automatically)

### Fixed
 - Fixed "General" tab localization for org* forms

## [4.0.37] - 2017-09-21
### Added
 - org_ograccount entity for storing bank's accounts for our organizations  
