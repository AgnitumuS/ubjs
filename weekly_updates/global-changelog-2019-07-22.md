#  Package ub-server@5.12.3->5.12.7
### Added:
 - new configuration key `security.domainMap` - rules for transformation of fully qualified domain names to NT4-style.
 To be used for Negotiate authentication under Linux in case domain name contains dots.
 For example to prevent transformation of `user@MYCOMPANY.COM` -> `MYCOMPANY\\user` (default behavior) the following can be configured:
 ```JSON5
  //....
  "security": {
    "authenticationMethods": ["UB", "Negotiate"],
    "domainMap": {
      "MYCOMPANY.COM": "MYCOMPANY.COM"
    }
  }
```
### Fixed:
 - throw graceful error in case client pass a condition other when `isNull/notIsNull` and `"values": {"paramName": null}` into where List
 - prevent AV inside `App.updateFTSIndex` in case passed entity no longer exists in domain
 - prevent returns of `resultData` parameter in results of  `softLock` mixin 'lock' method.
 Actual lock method results are inside `resultLock` (as before)
 - softLock mixin: removed log warning in case `lockIdentifier` or `lockEntity` mixin properties is empty
 and server sets a default values
 - prevent returns of `__fieldListExternal` private parameter in response `mParams`
 - throws in case whereList contains invalid (not supported) condition
 - 'addnew' method will return correct max date for `mi_deleteDate` attribute instead of `maxDate` string

#  Package ub-pub@5.3.5->5.3.6
### Added:
 - added `filter i18n` to UB.install. Can be used as $ut replacement
```vue
<div> {{ 'uba_user' | i18n}} </div> 
<div> {{ 'login' | i18n('Mike') }} </div>
```
is equal to
```vue
<div> {{ $ut('uba_user') }} </div> 
<div> {{ $ut(login, 'Mike') }} </div>
```
### Changed:
 - error message is added into detailed exception information with h2 HTML tag to be shown in "Details for developer"
 window together with stack trace
 - prevent put empty `file: line:` into exception details in case file name and line number is not available in error stack trace
 - highlight file names in the error stack trace even if it's name not ends wih `.js` extension     

#  Package ubq@5.2.26->5.2.34
### Fixed:
 - FTS scheduler job will skip FTS commands for entities what not in domain (this prevents AV inside updateFTSIndex)

#  Package uba@5.1.20->5.2.0
### Added:
 - Administration subjects names (uba_subject.name) support localization (multilang)
 - Roles descriptions (uba_role.description) and Groups names (uba_group.name) supports localization (multilang)
 - build-in roles localization for uk & ru
 - icons added for shortcuts from Security group 
### Fixed:
 - localization of tabs for uba_user form [#51]
 - "name" property for attributes moved to the first line of attribute object for all `uba_*.meta`   

#  Package ubs@5.2.23->5.2.24
### Added:
 - scheduler job `ubsSoftLockCleanup` added to the UBS model.
 Will delete all expired non persistent lock from `ubs_softLock` table. By default scheduled to run every day at 05:15:25
### Fixed:
 - keys for SOFTLOCK_TYPE enum changed `ltNone->None` `ltPersist->Persist` `ltTemp->Temp`
 - ExtJS based messages sending form (bell on toolbar) is removed - only Vue form is left

#  Package ubcli@5.3.22->5.3.28
### Changed:
 - `MSSQL2012` dialect will use `NVARCHAR(MAX)` instead of `NVARCHAR(4000)` for JSON 

#  Package base@5.1.16->5.1.18
### Changed:
 - added support of UBQLv2 for `DataLoader.localizeEntity`

#  Package ub@5.2.22->5.2.24
### Added:
 - new configuration key `security.domainMap` - rules for transformation of fully qualified domain names to NT4-style.
 To be used for Negotiate authentication under Linux in case domain name contains dots.
 For example to prevent transformation of `user@MYCOMPANY.COM` -> `MYCOMPANY\\user` (default behavior) the following can be configured:
 ```JSON5
  //....
  "security": {
    "authenticationMethods": ["UB", "Negotiate"],
    "domainMap": {
      "MYCOMPANY.COM": "MYCOMPANY.COM"
    }
  }
```    
 In this case Negotiated user name will be  `MYCOMPANY.COM\\user`
### Changed:
 - server-side UB.i18n now support formatting (like client side i18n). Sample:
```js
UB.i18nExtend({
  "en": { greeting: 'Hello {0}, welcome to {1}' },
  "ru": { greeting: 'Привет {0}, добро пожаловать в {1}' }
UB.i18n('greeting', 'Mark', 'Kiev') // in case current user language is en -> "Hello Mark, welcome to Kiev"
UB.i18n('greeting', 'uk', 'Mark', 'Kiev') // in case ru lang is supported -> "Привет Mark, добро пожаловать в Kiev"
```
### Fixed:
 - `Session.runAsUser` & `Session.runAsAdmin` should restore original session even if one of `login` handler fails for passed user

#  Package adminui-vue@1.6.12->1.6.14
### Added:
 - exports `dialog`, `dialogError`, `dialogInfo`, `dialogYesNo` functions from `adminui-vue`. To be used outside Vue instance:
```javascript
const adminUiVue = require('@unitybase/adminui-vue')
adminUiVue.dialogInfo('Hello')
// inside Vue instance the same can be called as this.$dialogInfo
```
### Changed:
 - default repository for `USelectEntity` & `USelectMultiple` is sorter by description attribute.
 Pass your repository for custom sorting (or to remove sorting) 
 - `USelectEnum` is sorted by `ubm_enum.sortOrder`
 - `processing` - excluded fields mi_createDate, mi_createUser, mi_deleteDate, mi_deleteUser, mi_modifyUser, mi_owner from insert request
### Fixed:
 - `UFormContainer` should prevent submitting of form in case user press Enter key while input on form is focused 

#  Package adminui-pub@5.10.0->5.10.2
### Changed:
 - rename `pokazatPrevu` -> `showPreview`, `neNaidenShablon` -> `nodeTemplateNotFound` in i18n
### Fixed:
 - return back `UB.core.UBUtilTree` (used in udisk)  
 - sidebar width should be max 240px and should not depend on shortcut text length

#  Package adminui-reg@5.2.0->5.2.2
### Added:
 - more details will be shown to user in case server works in production mode but user use a `-dev` endpoint 
