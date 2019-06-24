#  Package ub-server@5.12.0->5.12.2
### Fixed:
 - UB SE edition only: fix debugger for VSCode as introduced in UB@5.11.1 again (CI issue)
 - MSSQL: for queries with pagination in case first page is requested without orderBy clause - force adding `order by ID` (except limit 1). 
 Otherwise, there may be an intersection between the first and subsequent pages of data.

#  Package cs-shared@5.1.1->5.1.3
### Fixed:
 - `UBEntity.asPlainJSON` will exclude `hasCatalogueIndex` computed property

#  Package ub-pub@5.3.3->5.3.5
### Fixed:
 - global exception interceptor will ignore `ResizeObserver loop limit exceeded` exception.
 [See explanation why](https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded)
 - global exception interceptor will use message as a details in case of unhandled rejection without stack (browser exception for example). 
 This prevent appears of error window with empty details. 

#  Package ubcli@5.3.19->5.3.22
### Added:
 - Now `meta-tr` supports path to file or directory contained `*.meta*` files as parameter 
 ```
 npx ubcli meta-tr -m C:\myFolder\myApp\models\tstModel
 ```

#  Package ub@5.2.12->5.2.18
### Added:
 - `App.dbConnection['..'].savepointWrap` function: rollback a part of transaction for PostgreSQL.
 This fix [unitybase/ub-server#26] - see issue discussion for details

#  Package ubdev@0.0.11->0.0.28
### Changed:
 - Entity metadata editor is moved form ubdev model into UMB

#  Package adminui-vue@1.6.3->1.6.6
### Added:
 - `u-base-input` - when using type="number", helps to establish the precision of rounding and step
 - `USelectEntity`, `USelectMultiple` added prop displayAttribute - attribute which is display value of options
 - `u-select-entity`, `u-select-enum` added `editable` prop. False to prevent the user from typing text directly into the field; the field can only have its value set via selecting a value from the picker. In this state, the picker can also be opened by clicking directly on the input field itself. True by default for u-select-entity, false by default for u-select-enum
 - expose `mountUtils` in `@unitybase/adminui-vue` exports to be used for mounting custom Vue forms
 - new prop UCodeMirror.hintsFunction - accept a function for hint generation. See `ShortcutCmdCode.vue` in UMB model for usage sample
### Changed:
 - **Breaking** `u-input` v-model support is removed, now gets and sets value from store automatically
 - **Breaking** `u-auto-field` removed v-model, now gets and sets value from store automatically
 - **Breaking** `u-auto-field` renamed prop `code` to `attribute-name`
 - `USelectEntity` modelAttr renamed to valueAttribute
 - `USelectMultiple` modelAttr renamed to valueAttribute
 - `u-sidebar` changed sidebar item height to auto, paddings reduced
### Fixed:
 - limit error dialog width to 250px to prevent text output outside viewport for errors what appears on the right border
 - UCodeMirror now handle `editorMode` prop and perform a syntax highlight for content depending on mode (default is javascript)   
 - "Always use domain for login" checkbox should be visible in navbar User menu in case "Negotiate" auth is enabled for app [UBDF-9586]
 - `class UForm` fixed the problem when two identical forms have a common store state and replace each other's data
 - `class UForm` Now any method or state property of the UForm store can be overwritten by local form store
 - `u-select-enum` fixed disabled prop

#  Package ubm@5.1.26->5.1.27
### Changed:
 - shortcut editor form: highlight currently selected folder in ShortcutTree control
 - Entity metadata editor is moved form ubdev model into UMB. double-click on entity inside diagram opens entity metadata editor 

#  Package adminui-pub@5.8.21->5.8.24
### Changed:
 - changed sidebar collapsed width from 76px to 50px
 - huge cleanup of i18n keys: most translit keys are removed; unused keys are removed 
