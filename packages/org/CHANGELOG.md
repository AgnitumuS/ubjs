# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.2.30]
### Added
  - synchronization of the org_employee's fullFIO attribute into uba_user fullName (in case employee is assigned to some user)
  - Entity `org_execgroup`, which is a part of organizational structure, is `unitType` is `EXECGROUP`.
    The detail entity `org_execgroupmember` contains its members, which are `org_staffunit`.
    Business value of this entity is ability to use a group of staff units at once, for example for task assignment,
    like parallel approvals.
    Added a navigational menu item for this dictionary in `org_desktop`.

## [5.2.17]
### Fixed
  - logon event handler will not add a staff units ID for deleted employee;
  Situation is possible when one userID assigned to different employee and one of employee is deleted
  
## [5.2.8]
### Fixed
 - allow to update org_employeeonstaff when parent org unit is not visible on the current date (for example department is closed)  

## [5.2.0]
### Changed
 - all meta files and they localization transformed to array-of-attributes format
 
## [5.1.59]
### Changed
 - org_orgaccount code length changed 20 -> 29  
 
## [5.1.42]
### Fixed
 - typo in org_unit shortcut uk localization [UBDF-8687]

## [5.1.39]
### Fixed
  - uData.allStaffUnitIDs will contains ALL stuff unit ID's not only permanent/assistant/temp as reported in [unitybase/ubjs#37]
  
## [5.1.35]
### Changed
 - since DDL generations now executed under `root` check for `admin` login 
```
if (UBA_COMMON.isSuperUser()) return
```
 is removed from org.js Session.on('login') handler 
 

## [5.1.33]
### Changed
  - use `UBA_COMMON.isSuperUser()` to prevent ORG.orgOnUserLogin from execution for `admin`
   or `root` because this users are used for DDL generation

## [5.1.25]
### Changed
 - `org_employeeonstaff.caption` generation algorithm: in case `org_employeeonstaff.tabNo` is empty or whitespace - 
 don't use it in forming `org_employeeonstaff.caption`    

## [5.1.24]
### Added
 - auto generation of `org_employeeonstaff.tabNo` attribute. Length of generated code id defined 
 in `ubs_settings` `ubs.numcounter.autoIncrementalCodeLen` key. Default is 6 (codes like `000001`)
 
### Changed
 - `org_staffunit.caption` generation algorithm: take a parent name from first parent with type !== 'STAFF'
  (instead of org_staffunit.parent)

## [5.1.22]
### Changed
 - creation of `org_staffunit.caption` will add all assigned staffs names to caption except assignments
 with type `ASSISTANT`.  
 Prev. implementation adds only assignments with `employeeOnStaffType` `PERMANENT` & `TEMPORARY`
 which led to problems when adding a new assignments types to enum with code `CDN_EMPLOYEEONSTAFFTYPE`      

## [5.1.19]
### Fixed
 - generation of `org_employeeonstaff.caption`: in case `org_employee.shortFIO` is empty - use `org_employee.lastName`
 [unitybase/ubjs#14]. Deletion of `org_employeeonstaff` is fixed inside server ( ub >= v5.3.3) 

## [5.1.12]
### Fixed
 - org_orgaccount formation of the description when the constituent attributes were deleted

## [5.1.0]
### Fixed
 - syntax error in org_employeenstaff.caption isMultilang attribute
   
### Changed
- all fullName* attributes sizes increased to 300 for org_department, org_employee and org_organization 

## [5.0.39]
### Fixed
- set `uData.orgUnitIDs` order as **org_unit.mi_treePath**

## [5.0.29]
### Changed
- org_staffunit.parentID.allowNull is set to **false** (all staffs should be assigned either to organization or to department)

## [5.0.24]
### Added
- `org_employyee` add new attributes (**lastNameObj, firstNameObj, middleNameObj, shortFIOObj, fullFIOObj, applyObj**)
 describes how to treat to this person in objective case

## [5.0.23]
### Fixed
- Cleaned up border unit shortcut from `_initialData`

## [5.0.13]
### Fixed
- `org_orgaccount.currencyID` attribute should be of dataType: cnd_currency

## [4.0.45]
### Fixed
- `org_orgaccount` localization

## [4.0.42]
### Added
 - `org_orgaccount.description` attribute (calculated automatically)

### Fixed
 - Fixed "General" tab localization for org* forms

## [4.0.37]
### Added
 - org_ograccount entity for storing bank's accounts for our organizations  



