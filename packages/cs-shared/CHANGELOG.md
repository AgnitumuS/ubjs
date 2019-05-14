# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.22]
### Fixed
 - CustomRepository.clone() - prevent deep cloning of connection property

## [5.0.19]
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

 
## [5.0.18]
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
 
## [5.0.15]
### Added
 - support for new authentication schema 'ROOT'. Server side in-proc server only

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

