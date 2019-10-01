# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.3.6]
### Changed
  - colon separator for cdn_region uk locale csv data to ';' as in all other files  

## [5.3.3]
### Fixed
 - explicitly specified fieldList for cdn_employee & cdn_person shortcuts to prevent lookup on potentially huge cdn_organization 

## [5.3.1]
### Fixed
 - Field 'level' renamed to 'hierarchyLevel' because 'level' is a reserved word in Oracle - so this field breaks ddl generation for Oracle database
 - Forms for entering classifiers were missing

## [5.3.0]
### Added
 - cdn_classifier & cdn_classifierType - entities that provide ability to user to classify some entity in many ways, this is like user defined expandable dictionaries
 - cdn_language - list of languages according to ISO-639-1

## [5.2.12]
### Changed
 - cdn_currency.name size to 65 and cdn_currency.description size to 128

## [5.2.5]
### Changed
 - initial data locale for cdn_citytype & cdn_country entities changed to english
 - initial data for cdn_region loaded only for `uk` locale  

## [5.2.0]
### Changed
 - all meta files and they localization transformed to array-of-attributes format
  
## [5.1.17]
### Changed
 - `Subjects` folder icon changed to `fa fa-user-circle-o` to prevent conflict with `Territorial` icon

## [5.1.15]
### Changed
 - cdn_orgaccount code length changed 20 -> 29  
 
## [5.1.5]
### Changed
 - File cnd_person.meta.ka fixed

## [5.1.0]
### Added
 - new cdn dictionaries: cdn_nationality, cdn_personclass
 - new attribute of cdn_person: resident: boolean; nationality -> cdn_nationality, classID -> cdn_personclass
### Changed
 - Description attribute of cdn_currency is now multilingual
 
## [5.0.73]
### Changed
 - restriction for CCEO (OKPO) length (8 or 10 chars) is removed from `cdn_organization`

## [5.0.66]
### Changed
 - cdn_city: allow to select Country as a parent admin unit for city (filter on the form)
 - cdn_region: allow to select any admin unit as a region parent (in prev implementation
 select was limited by COUNTRY). See #19 for changes reasons
  
## [5.0.52]
### Fixed
- cdn_bank formation of the description when the constituent attributes were deleted

## [5.0.28]
### Changed
- cdn_region form marked as isDefault: false to allow override by other models

## [5.0.6]
### Changed
 - default meta file localization is english
 - entities attributes definitions transformed to array-of-object as described in entity JSON schema

## [4.0.48]
### Changed
- initial data for `cdn_currency` updated to actual currencies list

## [4.0.47]
### Added
- `cdn_bank` `cityID` and `description` attributes
- `cdn_currency` `curMult` attributes (Default multiplicity)

### Changed
- localization for cdn_orgaccount

