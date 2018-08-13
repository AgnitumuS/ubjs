# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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



