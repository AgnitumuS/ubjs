# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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

