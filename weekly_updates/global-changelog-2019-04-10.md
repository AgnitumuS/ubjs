#  Package ub-server@5.7.18->5.8.2
### Added:
 - allow to **MERGE** an entity `entityName.meta` file if it exists in the different model.
   Before this patch file from last model OVERRIDE original.
   
   Localization will be loaded from ORIGINAL model
   (usually we need to override original entity for certain customer, so additional attributes can be
   localized directly in meta file).
   
   For example if we create the `ubm_desktop.meta` file inside the TST model it will be **MERGED** 
   with the `ubm_desktop.meta` file from UBM model. 
   
   Files are merged in order model is placed inside domain.
   For several overrides the last one win. 
   
   Current implementation will call `require` for ALL `entityName.js` file form all models.
   So in case for example entity `*.js` is overrated twice it will be required 3 times 
   with different file paths - from original model, from first override and from second.
   
   This feature require `@unitybase/ub` to be >= `5.2.11` (if ub model is older - OVERRIDE strategy will be used)
 - new application configuration property `security.skipCheckingCallerAndSessionIpEquality`  
   In case some middleware intercepts Authorization requests and redirect it to UB
   Session IP (IP address from which session is created) may differ from
   CallerIP (IP address of middleware).  
   To allow such a requests set this parameter to `true`.  
    **WARNING** vulnerability to token interception attacks.
### Changed:
 - internal optimization of SQL builder. Small speed up on heavy concurrent
 - in case attribute `request_id` not found in entity `uba_auditTrail` then `request_id` will not be logged
### Fixed:
 - fix duplication of "many" attributes values during insertion/updation in case there is several "many" attributes in one entity
 - Oracle: ORM will replace special chars ['(', ')', '"'] by space before pass a parameter value to CATSEARCH expression
 - in case we are behind the nginx reverse proxy with `X-Accel-Redirect` enabled Content-Type header
  will be added by getDocument endpoint instead of nginx 
 - in case multilanguage column CATALOGUE index will be applied only in case user language === default app language.
 For a localization columns `like` will be used, so DDL generator can omit creation of CATALOGUE indexes for localization columnus.
 - AV during domain loading in case `aclRls` is enabled in some entity
 - added asterix to the end of CTXCAT pattern for `like` expression (Oracle)

#  Package ub-pub@5.2.33->5.2.35
### Changed:
 - in case response body is empty `AsyncConnection.xhr` will return null even if `Content-Type` header is iset to `*json`

#  Package ubcli@5.3.11->5.3.12
### Added:
 - support for Oracle Text and CTXCAT indexes (require Oracle Text to be enabled - see https://docs.oracle.com/cd/E11882_01/install.112/e27508/initmedia.htm#DFSIG269)

#  Package base@5.1.5->5.1.8
### Added:
 - optional parameter **fieldAliases** for `ServerRepository.selectById` method 
### Changed:
 - in case response body is empty `SyncConnection.xhr` will return null even if `Content-Type` header is iset to `*json`

#  Package ub@5.2.5->5.2.11
### Added:
 - Entity metadata merging: in case descendant model contains entity with the same name as
 original model they `*.meta` files will be **MERGED** (before this patch descendant overrides parent).
 This allow to **override only part of meta-file attributes/properties in descendants**.

#  Package adminui-vue@1.4.0->1.4.1
### Added:
 - `Vuex` now imported inside `@unitybase/adminui-vue`. In other models:
   - for **dev** mode can be required directly ``` Vuex = require('vuex') ```
   - in case model is boundled by webpack `Vuex` should be in `externals` section of webpack config
   ```json
   externals: {
       lodash: '_',
       '@unitybase/ub-pub': 'UB',
       '@unitybase/adminui-pub': '$App',
       'vuex': {
         commonjs: 'vuex',
         commonjs2: 'vuex',
         amd: 'vuex',
         root: 'Vuex'
       }
     }
   ```  
 - new `mountHelpers` module - to be used inside form's `mount` function:
  ```javascript
    const AdminUiVue = require('@unitybase/adminui-vue')
    module.exports.mount = function (params) {
      if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
      let mountParams = {
        FormComponent: TstDictionaryFt,
        showFormParams: params
      }
      AdminUiVue.mountHelpers.mount(mountParams)
    }
  ```
 - added `UForm` component. Wrap for UFormRow which can set label width for child `UFormRow`s
 - added `modalWidth` option to mount formParams
### Changed:
 - `portal:navbar:appendSlot` now append child to navbar
 - `portal:navbar:defineSlot` define slot with new child (renamed `appendSlot` -> `defineSlot`)
 - `portal:sidebar:appendSlot` now append child to sidebar
 - `portal:sidebar:defineSlot` define slot with new child (renamed `appendSlot` -> `defineSlot`)
 - **BREAKING** renamed:
   - UbSelectEntity -> USelectEntity
   - UbSelectEnum -> USelectEnum
   - UbSelectMany -> UbSelectMany
   - UbUploadDocument -> UUploadDocument
 - set correct zIndex when open UB dialogs from magicLinks
### Fixed:
 - fixed `ubs_message_edit` form layout on small screens
 - added `storeInstanceModule`. Vuex store which track all form changes
 - added `storeValidationPlugin`. Vuex store plugin which validate instance module changes
