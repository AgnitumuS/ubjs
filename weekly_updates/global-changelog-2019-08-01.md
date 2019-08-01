#  Package ub-server@5.12.7->5.14.2
### Added:
 - check what `associationManyData` property for attribute of type "many" do not point to the existed entity what not a many-to-many relation;
 This prevent DDL generator from dropping columns in the existed entity table.
 - changing of log levels without restarting server. Under Linux when got SUGHUP signal UB will reload `logging.levels`
  from application ubConfig, **rotate current log file** and starts new with new logging levels.
  This allow to change logging detailing without restarting production server. Try to run UB, change a logging.levels 
  in config and send a HUP signal to running process:
```bash
kill -HUP `pidof ub`
```
  Even if logging levels is not changed UB starts new log file on SIGHUP.
### Changed:
 - minor `softLock` mixin performance optimizations
### Fixed:
 - softLock mixin will not insert a lock with type `None`. This allow to select an instance together with lock info using single request:
```
let r = UB.Repository('tst_document').attrs('ID').misc({lockType: 'None'}).where('ID', '=', 332729226657819)
r.select().then(rp => console.log(r.rawResult.resultLock))
```

#  Package cs-shared@5.1.3->5.1.5
### Added:
 - documentation for 'lockType' flag of `CustomRepository.misc` method

#  Package ub-pub@5.3.6->5.3.10
### Added:
 - `ClientRepository.rawResult` property. Contains a server response in raw format. Can be used to
 get additional response parameters for `select*` methods. For example get lock information together with `select` execution:
```javascript
let repo = UB.Repository('tst_document').attrs('ID', 'reg_date').misc({lockType: 'None'}).where('ID', '=', 332729226657819)
let data = await repo.selectSingle() // {ID: 332729226657819, regDate: Date}
let lockInfo = repo.rawResult.resultLock // {success: true, ownLock: ....}
```
In general any parameters added on the server side to the `ctxt.mParams` is accessible 
### Fixed:
 - in case UBNativeMessage instantiated inside iFrame `window.parent.postMessage` will be called with 
 `targetOrign` calculated during UBNativeMessage.connect. This prevent possible XSS attack to the NativeMessages app 
 - UBNativeMessage will show extension setup instruction ASAP in case `__connect` to native messages host is failed
  Technical details: for unknown reason in chrome 75 response for message to not existing host is a valid message instead of timeout
   

#  Package ubq@5.2.34->5.2.36
### Changed:
 - audit trail is explicitly disabled for `ubq_messages` entity for performance reason  
 - all meta files and they localization transformed to array-of-attributes format

#  Package uba@5.2.0->5.2.2
### Changed:
 - save certificates grid state in the User form (uba_user) 

#  Package ubs@5.2.24->5.2.25
### Changed:
 - all meta files and they localization transformed to array-of-attributes format

#  Package ubcli@5.3.28->5.3.30
### Added:
 - new command `ubcli checkStoreIntegrity` for validate blobStore consistency by checking equality of the
 md5 checksum stored in the database with actual file MD5
```bash
npx ubcli checkStgoreIntegrity -u ... -p ... -entity tst_document -attribute fileStoreSimple
``` 
see `npx ubcli checkStoreIntegrity --help` for details
   
### Fixed:
 - in case executed for folder `ubcli meta-tr` will skip files what contains meta in name but not a metafile itself (bla-bla.metadata for example)

#  Package org@5.1.59->5.2.0
### Changed:
 - all meta files and they localization transformed to array-of-attributes format

#  Package cdn@5.1.17->5.2.0
### Changed:
 - all meta files and they localization transformed to array-of-attributes format

#  Package adminui-vue@1.6.14->1.6.18
### Added:
 - support for `softLock` (Pessimistic locks) mixin
 - new icon-color classes for UToolbarButton: `info`, `danger`. Example:
 ```vue
<u-toolbar-button
  v-if="entitySchema.hasMixin('softLock')"
  :icon-cls="isLocked ? 'fa fa-lock' : 'fa fa-unlock'"
  :icon-color="isLocked ? (isLockedByMe ? 'green' : 'danger') : 'info'"
  :tooltip="lockInfoMessage"
```
### Changed:
 - method `showValidationErrors` in `UB.view.BasePanel`. Now returns `entityCode.fieldCode` when fieldLabel is empty.  
### Fixed:
 - VueJS based form now accept `tabId` in UForm constructor.
 If passed it will be used to identity tab and prevent opening tab with the same tabId twice. 
 If omitted will be calculated based on entity and instanceID.
 ```js
module.exports.mount = function ({ ..., tabId }) {
    Form({
      ...,
      tabId
    }).store()
      .instance()
      .processing()
      .validation()
      .mount()
  }
```
 - locking for Vue forms based on entity without softLock mixin is remove (fix)
 - placeholder translation for u-auto-field of Date/DateTime type ( #63 )
 - put moment in global even in case user language is `en`

#  Package ubm@5.1.33->5.2.0
### Changed:
 - all meta files and they localization transformed to array-of-attributes format

#  Package adminui-pub@5.10.2->5.10.5
### Changed:
 - added new methods `getRepository` and `getAttrCode` to `UB.ux.UBOrgChart`
 Can be overrated by other model in case org structure uses some other unity entity (`hr_staffUnit` for example)
### Fixed:
  - enable Action ('del') after add first row in grid
 - prevent open second tab for forms what not a BasePanel descendant;
 Implemented by using selector `panel[tabID=${cfg.tabId}]` instead of `basepanel[...]` to find what form is already opened
    
