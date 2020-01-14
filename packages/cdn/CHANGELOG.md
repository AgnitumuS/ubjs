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
 - cdn_classifieritem - fix error about non-existed attribute usage inside insert/update
  
## [5.3.30] - 2020-01-11
## [5.3.29] - 2020-01-03
## [5.3.28] - 2020-01-02
## [5.3.27] - 2019-12-30
## [5.3.26] - 2019-12-27
### Added
  - description for 'Common dictionary' desktop (+localization)

## [5.3.25] - 2019-12-20
## [5.3.24] - 2019-12-18
### Fixed
 - Russian language name in initial data for "ru" and "tg"

## [5.3.23] - 2019-12-17

## [5.3.19] - 2019-12-11
### Added
 - navigation shortcuts for Banks and Streets
  
## [5.3.17] - 2019-12-04
## Changed
  - **BREAKING!!!** Classifiers entities renamed, all over the code (navigation, etc)
    - `cdn_classifiertype` => `cdn_classifier`
    - `cdn_classifier` => `cdn_classifieritem`
  - Renamed `title` to `name` for both entities
  - Made `cdn_classifier.name` and `cdn_classifier.description` attributes multi-language
  - Remove `stateCode` from `cdn_classifier` as a bit too specific to be in generic dictionary. 
    If you need this (or any other) attribute, either request a JSON attribute in this dictionary or use entity override
    feature for your project.
  - Add format description for classifiers for ub-migrate (the _date/formats.js).

## [5.3.7] - 2019-12-02
### Added
  - synchronization of the user's email with the employee's contact

## [5.3.6] - 2019-10-01
### Changed
  - colon separator for cdn_region uk locale csv data to ';' as in all other files  

## [5.3.3] - 2019-09-19
### Fixed
 - explicitly specified fieldList for cdn_employee & cdn_person shortcuts to prevent lookup on potentially huge cdn_organization 

## [5.3.1] - 2019-09-17
### Fixed
 - Field 'level' renamed to 'hierarchyLevel' because 'level' is a reserved word in Oracle - so this field breaks ddl generation for Oracle database
 - Forms for entering classifiers were missing

## [5.3.0] - 2019-09-16
### Added
 - cdn_classifier & cdn_classifierType - entities that provide ability to user to classify some entity in many ways, this is like user defined expandable dictionaries
 - cdn_language - list of languages according to ISO-639-1

## [5.2.12] - 2019-09-11
### Changed
 - cdn_currency.name size to 65 and cdn_currency.description size to 128

## [5.2.5] - 2019-08-12
### Changed
 - initial data locale for cdn_citytype & cdn_country entities changed to english
 - initial data for cdn_region loaded only for `uk` locale  

## [5.2.0] - 2019-07-22
### Changed
 - all meta files and they localization transformed to array-of-attributes format
  
## [5.1.17] - 2019-06-12
### Changed
 - `Subjects` folder icon changed to `fa fa-user-circle-o` to prevent conflict with `Territorial` icon

## [5.1.15] - 2019-06-10
### Changed
 - cdn_orgaccount code length changed 20 -> 29  
 
## [5.1.5] - 2019-03-11
### Changed
 - File cnd_person.meta.ka fixed

## [5.1.0] - 2019-01-10
### Added
 - new cdn dictionaries: cdn_nationality, cdn_personclass
 - new attribute of cdn_person: resident: boolean; nationality -> cdn_nationality, classID -> cdn_personclass
### Changed
 - Description attribute of cdn_currency is now multilingual
 
## [5.0.73] - 2018-12-06
### Changed
 - restriction for CCEO (OKPO) length (8 or 10 chars) is removed from `cdn_organization`

## [5.0.66] - 2018-11-17
### Changed
 - cdn_city: allow to select Country as a parent admin unit for city (filter on the form)
 - cdn_region: allow to select any admin unit as a region parent (in prev implementation
 select was limited by COUNTRY). See #19 for changes reasons
  
## [5.0.52] - 2018-09-19
### Fixed
- cdn_bank formation of the description when the constituent attributes were deleted

## [5.0.28] - 2018-07-16
### Changed
- cdn_region form marked as isDefault: false to allow override by other models

## [5.0.6] - 2018-05-04
### Changed
 - default meta file localization is english
 - entities attributes definitions transformed to array-of-object as described in entity JSON schema

## [4.0.48] - 2018-01-04
### Changed
- initial data for `cdn_currency` updated to actual currencies list

## [4.0.47] - 2017-12-12
### Added
- `cdn_bank` `cityID` and `description` attributes
- `cdn_currency` `curMult` attributes (Default multiplicity)

### Changed
- localization for cdn_orgaccount

