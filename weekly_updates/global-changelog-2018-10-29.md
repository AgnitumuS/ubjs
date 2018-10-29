#  Package ub-server@5.4.3->5.4.4
### Added:
 - new command line switch `-cd` (or in long form `--console-debug`) will force server to output
 **ALL** loggoing levels to console (and to files if logging.path is not empty).
 Very useful for debugging. Just run `ub -dev --console-debug` and regardless of the logging levels
 specified in the config you will see all the logs in the console
 - new command line switch `-cl` a short form of `--console-log`. If passed server will output
 to console logs, specified in server `logging.levels` config parameter
### Changed:
 - `logging.path` config parameter default value now empty string.
 Specifying of empty logging path force server to disable file logging (console still work - see below)
### Fixed:
 - **critical** Disk IO operation will throw in case of OS level errors (no disk space, for example).
 Pverious implementation created zero size files in this case.

#  Package adminui-pub@5.6.2->5.6.4
### Changed:
 - **BREAKING** change - `UBStore.reload(callback)` is obsolete and will throw error.
     Promise style call should be used instead `store.reload().then(...)`.
### Fixed:
 - UBStore will load `linkedItemsLoadList` before loading main store data. This fix displaying of empty lookup columns
 in EntityGridPanel in case depended stores (for lookup data) query is slower when query to the store.
 - remove potential second query for UBStore from EntityGridPanel `boxready` handler by set store.loading = true 

#  Package adminui-vue@1.0.16->1.0.26
### Added:
 - vue based login now support `onNeedChangePassword` connection event and display the password change form to the user
### Changed:
 - `element-ui` is upgraded to `2.4.9`   

#  Package cs-shared@5.0.10->5.0.12
### Added:
 - `UBModel.version` attribute added. Accessible inside client and server.
 Version is taken from model package.json `version` key.
 Empty in case package.json not found or version is not specified.
 **UB server must be >= 5.4.3**  

# *New* Package systemjs-plugin-vue-ub@0.0.1->1.2.2
### Added:
 - `prepublish` script added for creation minimised version of plugin into `dist` folder before publishing 

#  Package ub-pub@5.2.16->5.2.17
### Added:
 - `UBConnection` will handle a `413 Request Entity Too Large` server-side error response and raise a UB.UBAbort message.
 Such response occurs when user try to upload big files and server works behind nginx. To increase allowed payload size 
 use `ubcli generateNginxCfg -maxDocBody XXXm`   