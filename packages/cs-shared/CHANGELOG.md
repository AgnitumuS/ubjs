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

## [5.2.0] - 2020-02-29
### Changed
 - ESLint warnings fixed (mostly let -> const)
 
## [5.1.17] - 2020-02-03
### Changed
 - `Repository.joinCondition` will throw in case clause name already in jointAs

## [5.1.16] - 2020-01-31
## [5.1.15] - 2020-01-17
### Added
 - new private method `CustomRepository.fromUbql` - used in UB.Repository() constructor to create Repository from UBQL
 - `Repository.withTotal` can accept optional boolean parameter. If `false` total requirements will be removed from repository
 - `Repository.limit(rowsLimit)` will remove limit in case rowsLimit === 0   
  
### Changed
 - in case expression passed to `Repository.orderBy` already exists in order list it direction will be changed;
 Before this patch the same order expression was added that led to errors with duplicates in `order by`
    
## [5.1.14] - 2019-12-17
### Added
 - new method `CustomRepository.clearWhereList` - remove all where conditions from Repository.
 Should be used instead of direct access to the private CustomRepository.whereList property   

## [5.1.11] - 2019-10-09
### Added
  - remove code duplication for `Date` parsing functions (truncTimeToUtcNull & iso8601ParseAsDate are moved to LocalDataStorage) 

## [5.1.9] - 2019-09-24
### Added
 - `UBSession.signature` can return a fake signature if `authMock` parameter is true

## [5.1.7] - 2019-08-27
### Added
 - extended property UBDomain.UBModel.packageJSON added to the extended domain; Property value is parsed model `package.json`  
 
## [5.1.5] - 2019-07-28
### Added
 - documentation for 'lockType' flag of `CustomRepository.misc` method

## [5.1.3] - 2019-06-21
### Fixed
 - `UBEntity.asPlainJSON` will exclude `hasCatalogueIndex` computed property

## [5.1.1] - 2019-05-30
### Fixed
 - error in LocalDataStore filter fabric for `isNull`/`isNotNull` conditions (used inside filtering of cached entities on the client side)   
 
## [5.1.0] - 2019-05-20
### Added
  - support for UBQL v2 (value instead of values in whereList)

## [5.0.22] - 2019-05-14
### Fixed
 - CustomRepository.clone() - prevent deep cloning of connection property
 - error message for filtering by non-existed attribute in LocalDataStore will include entity name 

## [5.0.19] - 2019-03-11
### Fixed
 - addingCondition now checked in `CustomRepository.miscIf` 
 
### Added
 - `CustomRepository.clone()` method
 ```javascript
  let repo1 = UB.Repository('uba_user').attrs('ID', 'code').where('ID', '>', 15, 'byID')
  let repo2 = repo1.clone()
  repo1.orderBy('code')
  repo1.selectAsObject() // return ordered users with ID > 15

  repo2.attrs('name').where('ID', '>', 100, 'byID')
  repo2.selectAsObject() // return unordered users with their names and ID > 100
 ```
 
### Changed
 - `CustomRepository.misc` `will remove option in case it value is `false` instead of setting it to `false`
 This reduce resulting UBQL size
 
 - `CustomRepository.orderBy(attrd, direction)` accept null as `direction`.
  In this case ordering by `attr` will be removed
  ```javascript
   let repo = UB.Repository('my_entity').attrs('ID').orderBy('code')
   let orderedData = await repo.selectAsObject() // ordered. await is for client-side only
   repo.orderBy('code', null) // remove order by code
   let unorderedData = await repo.selectAsObject() // NOT ordered
  ```
 
## [5.0.18] - 2019-03-04
### Added
 - new method asPlainJSON() for UBEntity & UBEntityAttribute - return a 
 JSON representation WITHOUT properties which have default values.
 Very close to data stored in meta file
 - helper `Repository.attrsIf()`
    ```javascript
    let isPessimisticLock = !!UB.connection.domain.get('uba_user').attributes.mi_modifyDate
    // with whereIf
    let repo = UB.Repository('uba_user').attrs('ID').attrsIf(isPessimisticLock, 'mi_modifyDate')
    //without whereIf
    let repo = UB.Repository('uba_user').attrs('ID')
    if (isPessimisticLock) repo = repo.attrs('mi_modifyDate')  
    ```
 - helper `Repository.whereIf()`
    ```javascript
    let filterString = 'foundAllLikeThis' // or may be empty string
    // with whereIf
    let repo = UB.Repository('my_entity').attrs('ID')
      .whereIf(filterString, 'myAttr', 'like', filterString)
    
    //without whereIf
    let repo = UB.Repository('my_entity').attrs('ID')
    if (filterString) repo = repo.where('myAttr', 'like', filterString)
    ```
 - helper `Repository.miscIf()`  
 
### Changed
 - remove obsolete UBEntity & UBEntityAttribute `asJSON` method
 
## [5.0.15] - 2018-12-12
### Added
 - support for new authentication schema 'ROOT'. Server side in-proc server only

## [5.0.14] - 2018-12-04
### Added
 - client side `UBDomain` will throw error in case attribute exists in i18n but not defined in entity. Output sample:
```
Error: Invalid i18n for entity "tst_document" - attribute "superOld" not exist in meta or it's dataType is empty
```
 - new constant UBDomain.FLOATING_SCALE_PRECISION === 6 to be used for DDL generation and UI scale precision 
 for attributes of type **Float**

## [5.0.12] - 2018-10-23
### Added
 - `UBModel.version` attribute added. Accessible inside client and server.
 Version is taken from model package.json `version` key.
 Empty in case package.json not found or version is not specified.
 **UB server must be >= 5.4.3**  
 
## [5.0.10] - 2018-09-30
### Added
 - new convert rule is added for attributes of type `Json` in `getConvertRules` function  

## [5.0.9] - 2018-09-29
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

