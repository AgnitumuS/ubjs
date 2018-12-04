# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.14]
### Added
 - client side `UBDomain` will throw error in case attribute exists in i18n but not defined in entity. Output sample:
```
Error: Invalid i18n for entity "tst_document" - attribute "superOld" not exist in meta or it's dataType is empty
```
 - new constant UBDomain.FLOATING_SCALE_PRECISION === 6 to be used for DDL generation and UI scale precision 
 for attributes of type **Float**

## [5.0.12]
### Added
 - `UBModel.version` attribute added. Accessible inside client and server.
 Version is taken from model package.json `version` key.
 Empty in case package.json not found or version is not specified.
 **UB server must be >= 5.4.3**  
 
## [5.0.10]
### Added
 - new convert rule is added for attributes of type `Json` in `getConvertRules` function  

## [5.0.9]
### Added 
 - `UBEntity.getEntityAttributeInfo` in case of request to inner keys of Json type attribute
 will return actual Json attribute in `parentAttribute` and `attribute: ubndefined`
 
### Changed
 - `UBEntity.getEntityAttributeInfo` speed up from x10 to x100 (avoid calling String.split if not necessary)
 - `UBEntity.getEntityAttributeInfo` will return additional parameter `parentAttribute`

### Fixed 
 - `UBEntity.getEntityAttributeInfo` will return correct entity (listed after @) for
 cases `domain.get('org_unit').getEntityAttributeInfo('parentID.code@org_department')`.
 Previous implementation return `org_unit` for such query. 

