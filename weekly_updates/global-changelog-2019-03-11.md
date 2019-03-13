#  Package adminui-pub@5.8.1->5.8.3
### Added:
 - Font color selection button added to `UB.ux.form.HtmlEditor`
 - Preview in PDF button now enabled in `UB.ux.form.HtmlEditor` (package @unitybase/pdf should be in package.json for this feature)
### Changed:
 - i18 key `oshibkaVvoda` renamed to `fieldValidationError` and moved to up-pub
 - tabId parameter of `$App.doCommand` should be of type string.
 Explicit typecast of `tabId` to string added to prevent "unclosable" tab error 
 - **BREAKING** `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
 `git mv my_entity-fm.js my_entity-fm.vue`

#  Package adminui-vue@1.3.1->1.3.3
### Added:
 -  Vue.prototype.$dialog, $dialogYesNo, #dialogInfo, $dialogError
 - new Vue base `sidebar` component (left menu). Enabling by setting
 `UB.connection.appConfig.uiSettings.adminUI.customSidebar` to `true` in app config
 - `$notify` method to Vue.prototype
- buttons `show error on full screen` and `show info for developer` added to Error notification popup
### Changed:
 - prevent override Vue.prototype.$notify introduced by El, instead inject UDialog as `$dialog`
 - Vue forms will use `Alt+R` for "Remove" instead  of Alt+Del because DEl and Backspace because
 on Mac keyboards the key normally identified as "backspace" on PC keyboards is called "delete"
 - popover button animation removed for vue select (in remote mode)  
 - `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
    `git mv my_entity-fm.js my_entity-fm.vue`
 - due to modifications in vue runtime parser all imports of `vue` files must be done as
 `const cmpName = require('cmpName.vue').default`
 - renamed CSS variables according twitter-bootstrap
### Fixed:
 - ub-auth page will handle pressing of Enter key in UB authorization scheme user name field
 - UbSelectEntity vue component:
    - added shortcuts for popup actions
    - "blink" area around popup actions button is removed
 - UBToolbarComponent.vue - "Save" and "Save and close" color changed to btn-primary (green)

#  Package base@5.1.1->5.1.5
### Fixed:
 - @unitybase/base.options will accept `--help` for show help (also `-help` and `-?` is supported)
 - better formatting for `ubcli command --help`

#  Package cs-shared@5.0.15->5.0.19
### Added:
 - `CustomRepository.clone()` method
 ```javascript
  let repo1 = UB.Repository('uba_user').attrs('ID', 'code').where('ID', '>', 15, 'byID')
  let repo2 = repo1.clone()
  repo1.orderBy('code')
  repo1.selectAsObject() // return ordered users with ID > 15
  repo2.attrs('name').where('ID', '>', 100, 'byID')
  repo2.selectAsObject() // return unordered users with their names and ID > 100
 ```
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
### Changed:
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
 - remove obsolete UBEntity & UBEntityAttribute `asJSON` method
### Fixed:
 - addingCondition now checked in `CustomRepository.miscIf` 

#  Package systemjs-plugin-vue-ub@1.2.5->1.3.1
### Added:
 - ES6 `export default` support for Vue SFC - parser will replace it to `module.exports.default =` in dev mode
 - vue component definition is exported as `default` so should be imported as 
   `const MyComponent = require('./MyComponent.vue').default`. `BOUNDLED_BY_WEBPACK` hack should be removed
      
### Changed:
 - code simplified - all unsupported and unused features are removed from code
 - vue compiler padding changed from `line` to `space`

#  Package ub-pub@5.2.31->5.2.33
### Changed:
 - separate stack trace in developer error reporter onto lines for better readability

#  Package ubcli@5.3.0->5.3.11
### Fixed:
 - `npx ubcli meta-tr` command now work correctly. Meta content encoding before using `JSON.parse()` was fixed

# *New* Package ubdev@0.0.1->0.0.11
### Fixed:
 - entity metadata editor show normalized metadata JSON representation ready to be stored in `meta` file

#  Package ubm@5.1.7->5.1.10
### Changed:
- **BREAKING** `vue` forms definition extension changed from `js` to `vue`. Existed `vue` forms should be renamed manually 
 `git mv my_entity-fm.js my_entity-fm.vue`
