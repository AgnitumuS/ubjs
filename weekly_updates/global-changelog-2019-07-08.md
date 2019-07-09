#  Package ub-server@5.12.2->5.12.3
### Fixed:
 - reduce "DB" log level log output for SQL Server OleDB provider (used for access to MS SQL under Windows)
 - server will shutdown correctly in case OS do not support database driver specified for any of dbConnection in config

#  Package ubs@5.2.12->5.2.23
### Changed:
 - 'UBS.MessageBar' is deleted. New implementation is inside `@unitybase/adminui-vue` model 
### Fixed:
 - Vue based user messages notification widget do not throw `ELS - access deny` error for non-privileged users

#  Package base@5.1.11->5.1.16
### Fixed:
 - `ServerRepository.using('methodOtherWhenSelect')` now work as expected. Before this patch using is ignored and `select` is called

#  Package ub@5.2.18->5.2.22
### Added:
 - update ubConfig JSON schema about new key `uiSettings.adminUI.pdfViewer.uriSuffix`

#  Package adminui-vue@1.6.6->1.6.12
### Added:
 - `Form->processing` added hooks:
   - beforeDelete
   - deleted
 - `Form->processing` if beforeDelete hook returns false, deleting will be canceled
### Fixed:
 - translation of attributes inside Full Text Search widget snippets (FTS return attributes in lower case)
 - ub-auth login form: add more space between password field and "Login" button in case of http: to prevent overlap of
 login button by browser "not secure connection" warning  
 - Vue based user messages notification widget do not throw `ELS - access deny` error for non-privileged users
 - fix exception `"UForm.instance()" should be called once` - occurred during opening of vue form (introduced in 1.6.10)
 - moment usage fix: now `const momemnt = require('moment')` in underline models works as expected and 
 use `moment` instance already injected by adminui-vue
 - fix `can not read property style of undefined` in `Vue.prototype.$zIndex`  
 - UBSelect* - set cursor to `pointer` in case `editable` prop is `false`

#  Package ubm@5.1.27->5.1.33
### Fixed:
 - icon selection in umb_navshortcur form now works in fireFox 

#  Package adminui-pub@5.8.24->5.10.0
### Added:
 - new key in ubConfig `uiSettings.adminUI.pdfViewer.uriSuffix` - value passed directly to the PDF viewer URL.
 See [PDF open parameters](https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/pdf_open_parameters.pdf) documentation for possible values.
 Default is `#view=Fit`   
### Changed:
 - **BREAKING** `adminui-pub` model does not create a navbar and sidebar anymore.
 Consider either to add a `@unitybase/adminui-vue` to the domain or write your own navbar and sidebar
 - **BREAKING** `UB.view.LoginWindow` is removed. External HTML form should be used for initial login
 (already implemented in `@unitybase/adminui-vue`).
 Re-login form can be added by call to `UB.connection.setRequestAuthParamsFunction()` (already done in adminui-vue).    
 - sidebar mount point now a div with ID `sidebar-placeholder`
 - Ext components removed: 'UB.view.FullTextSearchWidget', 'UB.view.LeftPanel', 'UB.view.MainToolbar',
 'UB.view.NavigationPanel', 'UB.view.SelectPeriodDialog', 'UB.view.ToolbarMenu', 'UB.view.ToolbarMenuButton',
 'UB.view.ToolbarUser', "UB.view.ToolbarWidget"
 - viewport internal HTML layout is simplified (unneeded nested divs are removed)
 - `customSidebar` and `customNavbar` adminUI configuration keys are removed from application config (always true)
 - **BREAKING** `UBStore.load` will return a native Promise instead of Q.Promise from bluebird-q
 - `UBStore.reload` will return a native Promise instead of Q.Promise. **WARNING** `UBStore.reload` clears an entity cache
 and should be used VERY RARELY. For example to refresh store because of changes in ubRequest `store.load()` is enough.
 Even if store already loaded it will be refreshed during load() call.
### Fixed:
 - fix invalid use of this in `UBStore.load` what cause a unexpected limit by 25 rows (introduced in 5.9.0) 
 - prevent changing of zIndex according to current Vue zIndex for forms with both `isModel: true` and `target` defined.
 Actually this is not a modal form, but rather form embedded into another form.
 - do not show error in case user click on empty sidebar folder
 - while checking what tab is already opened inside Viewport `basepanel.tabId` will be used for **Ext** forms and `html element id` for **Vue** forms.
 Heuristic what use `basepanel.instanceID` is removed    

#  Package adminui-reg@5.1.13->5.2.0
### Changed:
 - Ext based login form is removed. In case `uiSettings.adminUI.loginURL` is not defined and `adminui-vue` is in domain then 
  vue-based login form will be used, if `loginURL` not defined and `adminui-vue` not in domain - error page will be displayed 
