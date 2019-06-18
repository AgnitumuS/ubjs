#  Package ub-server@5.10.1->5.12.0
### Added:
 - allow to **MERGE** an entity **localization** `entityName.meta.lang` files for MERGED meta files.
   Before this patch Localization files are always loaded from ORIGINAL model.
   After this patch in case `meta` files are MERGED their lang files will also be be merged.
   
   Both original and descendant lang file must be in array-of-object representation. Lang files can be converted to the 
   array-of-object representation using meta-tr ubcli command, for example:
   
```bash
  npx ubcli meta-tr -m full/path/to/some.meta.uk
```
### Changed:
 - UnityBase application represent itself as regular browser tab instead of extension for remote debugger. This fix
 incompatibility with VSCode "Debugger for Firefox"@1.8.0 plugin. `launch.json` should be modified as below:
```
    "version": "0.2.0",
    "configurations": [
        {
            "type": "firefox",
            "request": "attach",
            "name": "UB",
            "host": "127.0.0.1",
            "port": 6000,
            "sourceMaps": "client"
        }
    ]
```
### Fixed:
 - AV during parsing of like/notLike where expression for attributes with `CTXCAT` index
 - ensure `__skipAclRls` & `__skipRls` are ignored in case they passed form a client
 - potential AV inside initialization process (use external const to OK response instead of stack allocation)
 - for debugging inside Lazarus IDE UB server will wait for Enter pressed to stop instead of Alt+C combination (STOPBYALTC compiler condition)

#  Package cs-shared@5.1.0->5.1.1
### Fixed:
 - error in LocalDataStore filter fabric for `isNull`/`isNotNull` conditions (used inside filtering of cached entities on the client side)   

#  Package ub-pub@5.3.1->5.3.3
### Added:
 - new `switchCurrentSession` method added to the UBConnection. It is necessary to be able to quickly switch between user sessions without reconnecting on server side.

#  Package ubq@5.2.22->5.2.26
### Added:
 - new scheduler `ubqMessagesCleanup` for truncating ubq_messages table (if there are no non-pending tasks).
 Scheduled at 5:15AM by default. 

#  Package ubcli@5.3.12->5.3.19
### Fixed:
 - in case ID attribute explicitly specified in meta file and mapped to another attribute whose isUnique===false
 then then the primary key for such an entity is not created 

#  Package codemirror-full@1.2.24->1.2.25
### Added:
 - support for VueJS syntax - `script/x-vue` MIME type 

#  Package org@5.1.42->5.1.59
### Changed:
 - org_orgaccount code length changed 20 -> 29  

#  Package cdn@5.1.5->5.1.17
### Changed:
 - `Subjects` folder icon changed to `fa fa-user-circle-o` to prevent conflict with `Territorial` icon
 - cdn_orgaccount code length changed 20 -> 29  

#  Package adminui-vue@1.5.3->1.6.3
### Added:
 - `Form->processing` added hooks:
   - beforeCreate
   - created
   - beforeLoad
   - loaded 
 - new event fired by Sidebar in case desktop is changed: `$App.fireEvent('portal:sidebar:desktopChanged', ID)`
 - `UNavbar` will handle new event `portal:navbar:prependSlot` - prepend some elements on the left of existed navbar slot elements
 - `UNavbar` will handle new event `portal:navbar:userButton:appendSlot` - insert some elements into user menu
 - Version item is added to the UNavbar user button menu. Application can define custom version number in uData `appVersion` key 
### Changed:
 - `Form->processing` changed all hooks to async, now can await result
 - `Form->processing` if beforeSave hook returns false, saving will be canceled
  - Shortcut edit window now shown inside tab instead of modal
 - VueJS form mount () will be called with additional config `rootComponent: exports.default`  
 - **BREAKING** refactor `formBoilerplate` to constructor `Form` [docs and examples](https://git-pub.intecracy.com/unitybase/ubjs/blob/11e529331f78313c4fd483e660ccad9a4e65a73f/packages/adminui-vue/utils/Form/README.md)
 - **BREAKING** `u-form` component renamed to `u-form-container`
 - `u-code-mirror` - added shortcuts tooltip
 - `u-code-mirror` - added key bindings according old codeMirror 
### Fixed:
 - fix UFormContainer registration issue introduced in 1.6.2
 - do not break words in the $App.dialog* messages (word-break should be break-word instead of break-all) [UBDF-9571]
 - WebStorm IDE now recognize U* components inside templates instead of error "unknown HTML tag"
 - `USidebar` - item text is now hidden if overflow exceeds 3 lines
 - `USidebar` - prevent work break inside menu
 - `USidebar` - if parent folder is not accessible due to RLS - skip shortcut

#  Package ubm@5.1.11->5.1.26
### Changed:
 - UBM model lang files are converted to array-of-object format
 - Shortcut edit/creation form now showed in tab instead of modal window 
 - `ubm_navshortcut` form rewritten to Vue
### Fixed:
 - added missed caption for `ubm_navshortcut` form
 - VueJS form template modified according to current form boilerplate
 - Form editor now recognize a Vue form syntax (mixed HTML + js) 

#  Package adminui-pub@5.8.14->5.8.21
### Added:
 - VueJS form mount () will be called with additional config `rootComponent: exports.default` 
  - UBDocument will create CodeMirror for `text/javascript` & `script/x-vue` MIME types
  - UBCodeMirror recognize `sctipt/x-vue` / `text/x-vue` content types - Vue style will be used in this case
### Changed:
 - EntityGrinPanel will skip columns auto fit in case column width (or flex) is already defined 
### Fixed:
 - remove exception then user press Tab on last element inside BasePanel
 - update `UBExtension.crx` to allow install Chrome extension for Chrome >= 74 in offline mode
