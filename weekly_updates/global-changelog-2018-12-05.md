#  Package ub-server@5.4.8->5.6.3
### Added:
 - introduce new OTP based authorization schema `ROOT` for a super-user `root` (used internally for a while)
 - `runAs*` functions allow maximum of 2 level depth of recursion. The code below now work correctly:
```
  Session.runAsAdmin(function () {
    return Session.runAsUser(UserID, doSomethingAsUser)
  })
```
Before this patch inner call to `Session.runAsUser` throws 'Recursive call to Session.runAs* is not allowed'
### Changed:
 - `UB.js` now compiled into executable as a resource
 - simplify logging output by removeing internal class names and instance pointers
 - 5-10% speed-up for real life operations
   - remove unnecessary property getters and prevent memory reallocation for String/Int46 arrays access
   - remove stack checking for production builds
 - ubConfig parsed will keep envirinment variables AS IS instead of JSON-Escaping it.
  For example in %LANGS% marros is used in config, when it can be passed as:
```bash
LANGS='["en","ru"]' ub -cd
```
### Fixed:
 - `console.*` inside **Worker** created from shell script (ub in command line mode)
  will output to console as expected (prev. implementation do nothong in this case)
 - improve console output performance on Linux by reduce syscalls count required for colored output
 - remove console artifacts for multilyne output
 - fix internal JSON parser for *.meta custom settings [unitybase/ub-server#20]

#  Package adminui-pub@5.6.10->5.6.13
### Added:
 - vue based form `mount` function accept `commandConfig` as a parameter
 ```javascript
$App.doCommand({
  "cmdType": "showForm",
  "formCode": "ubdev_metadata",
  "cmdData": {
    "entityCode": objectCode
  }
```
### Changed:
  - prevent entering a string with all whitespaces for **required** text fields by 
   setting `allowOnlyWhitespace` to false for `Ext.form.field.Text` descendants 
   inside `Ext.form.field.Text.setAllowBlank` overrided handler
  - default precision for **Float** attribute set to 6 (instead of 4)
  - default UI control for **Float** attribute now validate input
  - vue loader registration is moved form `adminui-vue` to `adminui-pub` 
         

#  Package adminui-vue@1.0.31->1.0.33
### Changed:
 - vue loader registration is moved form `adminui-vue` to `adminui-pub`
### Fixed:
 - set `ub-auth` page title to the `uiSettings.adminUI.applicationTitle` just after got an application info
 - error with hidden UB auth in case this is only one possible auth method

#  Package cs-shared@5.0.12->5.0.14
### Added:
 - client side `UBDomain` will throw error in case attribute exists in i18n but not defined in entity. Output sample:
```
Error: Invalid i18n for entity "tst_document" - attribute "superOld" not exist in meta or it's dataType is empty
```
 - new constant UBDomain.FLOATING_SCALE_PRECISION === 6 to be used for DDL generation and UI scale precision 
 for attributes of type **Float**

# *New* Package draw-service@0.0.1->5.0.4
### Changed:
 - allow to configure custom font
```bash
PORT=8883 FONT=path/to/your/font.ttf  node ./node_modules/@unitybase/draw-service
```

#  Package pdf@5.0.10->5.0.12
### Added:
- Font SylfaenNormal with georgian characters

#  Package uba@5.1.1->5.1.3
### Fixed:
 - uba_user.name attribute Georgian translation changed

#  Package ubcli@5.2.2->5.2.4
### Added:
 - DDl generator will use floating scale precision from UBDomain.FLOATING_SCALE_PRECISION constant
 (6 by default)  
### Changed:
 - **BREAKING** change default floating scale precision from 4 to 6
 - `initDB` will ignore `-host` parameter (always used a host from config)
 - `initDB` will ignore `-u` parameter (always used a `admin`)
 - `initDB` will set a default password for user `admin` as specified in `-p` command line parameter.
   Previous implementation always set the `admin` password to `admin`  

#  Package ubq@5.1.0->5.2.0
### Changed:
 - schedulers initialization rewritten using `root` auth schema
### Fixed:
 - schedulers jobs will continue to work even if `runAs` user for job
  is blocked or his password is expired
 - text logs produced by scheduler worker is decreased (thanks to `root` auth schema)
