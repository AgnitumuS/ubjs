#  Package ub-server@5.3.2->5.4.1
### Added:
 - add missing logging of 301 & 401 responces
 - incoming request queue is added for a Socket based HTTP server.
  `ubConfig.httpServer.requestQueueLength` now work for Linux also. The dafault value of 1000 is for stand alone server.
  In case of server farm with load ballancing we recommend do set `ubConfig.httpServer.requestQueueLength: 100` and setup proxy_pass directive like this:
```
   location / {
     proxy_pass              http://balancing_upstream;
     proxy_next_upstream     error timeout invalid_header; # in case UB queue do not accept connection redirect to next upstream
     proxy_connect_timeout   2; # in case UB queue is overflow wait for 2 secont 
     proxy_set_header        Host            $host;
     proxy_set_header        X-Real-IP       $remote_addr;
     proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
   }
```
### Changed:
 - properties `userRoles` & `userRoleNames` are removed from Native session binding object
  `process.binding('ub_session')` and calculated from `Session.uData` in JS implementation of Session
### Fixed:
 - Fix ~ -70 second time shift for 'mi_modifyDate', 'mi_createDate', 'mi_deleteDate' attributes
 - fix regression introduced in ub@5.3.2 - in case server is started in console mode `process.startupMode` must be `Console`.
  In other cases (`ub -?`, `ub pathToJS.js`) `process.startupMode === 'CmdLine'`
 - Windows only: prevent server "pausing" if user click inside server console by disabling console extended mode.
  To copy text from console output to clipboard use a `Edit -> Mark` from console window menu or press Ctrl+M
  and use mouse to select text
 - `mStorage.beforedelete` method (executed before every delete) will keep attributes types.
 Previous implementation lost field types, so code below return ID as String instead of Int64
```
function doAfterDelete (ctxt) {
  let store = ctxt.dataStore
  let dataName = store.currentDataName
  store.currentDataName = TubDataStore.DATA_NAMES.BEFORE_DELETE
  let staffUnitID = store.get('staffUnitID') // HERE IF FIXED. Befiote this path (typeof staffUnitID === 'String'), after (typeof staffUnitID === 'Number') as expected
  store.currentDataName = dataName
  me.updatestaffunitcaption(staffUnitID)
```
 This patch fix [unitybase/ubjs#14] (cannot delete org_employeeonstaff)

#  Package base@5.0.17->5.0.56
### Changed:
- ServerRepository.selectSingle now accepts an optional fieldAliases parameter, which works just like in selectAsObject

#  Package org@5.1.19->5.1.22
### Changed:
 - creation of `org_staffunit.caption` will add all assigned staffs names to caption except assignments
 with type `ASSISTANT`.  
 Prev. implementation adds only assignments with `employeeOnStaffType` `PERMANENT` & `TEMPORARY`
 which led to problems when adding a new assignments types to enum with code `CDN_EMPLOYEEONSTAFFTYPE`      

#  Package ub@5.0.43->5.0.45
### Changed:
 - `$.currentUserOrUserGroupInAdmSubtable` RLS macros will add all user roles including pseudo-roles `Everyone` `User` & `Anonymous`
 Previous implementation did not check pseudo-roles.    
### Fixed:
 - **CRITICAL** endpoints `models`, `clientRequire` & `static` will return `Bad Request` in case
 of access folder (not a file). 
 Explanation:
 This patch prevent exposing of internal location to caller in case `nginx` is used as a reverse proxy.
 The problem is how `nginx` handle `location` - see [last paragraph of nginx location documentation](http://nginx.org/en/docs/http/ngx_http_core_module.html#location).
 In case our endpoints return 200 with `X-Accel-Redirect: path/to/folder` inside internal location, then
 `nginx` will redirect client (return 301) to `path/to/folder` + `/` with internal location inside.
 For example without this patch request to `http://localhost/models/UB/schemas` will redirect client to 
 `https://localhost/ubstatic-unitybase-info/app/node_modules/@unitybase/ub/public/schemas/` with 404 and
 expose to caller our internal folders structure. 

#  Package ub-pub@5.2.14->5.2.16
### Changed:
 - @unitybase/ub-pub/UBConnection module is renamed to AsyncConnection.
 Code what import connection directly like `conn = require('@unitybase/ub-pub/UBConnection')`
 should use `conn = require('@unitybase/ub-pub').UBConnection` instead 

#  Package uba@5.0.32->5.1.0
### Changed:
 - Pseudo roles Everyone, Anonymous (if user is not logged in) or User (if logged in) 
  are added to `Session.uData.roles` & `Session.uData.roleIDs`. In prev. implementation `uData` not contains this roles.   
### Fixed:
 - fix logging of security violation in case user without admin role try 
 to change password for another user

#  Package ubm@5.0.12->5.0.61
### Changed:
 - because of fix in `$.currentUserOrUserGroupInAdmSubtable` RLS macros rights for `ubm_navshortcut` & `ubm_desktop` 
 now can be granted to `Everyone` `User` `Anonymous` 