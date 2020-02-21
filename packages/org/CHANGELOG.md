# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
 - vue form adedd for org_execgruop

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

### Deprecated

### Removed

### Fixed

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



