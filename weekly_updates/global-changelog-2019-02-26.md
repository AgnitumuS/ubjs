#  Package ub-server@5.7.4->5.7.14
### Added:
 - for server in production mode unhandled server-side JS exception will pass a server log timestamp to a user message 
 to simplify finding of exception details in server log. So used will see additional line with timestamp in error message box:
```
Unknown error. Please, contact your system administrator
```
 - new property `Attribute.hasCatalogueIndex` - true in case dbExtension with type "CATALOGUE" is exists for attribute
 - `App.authFromRequest` accept to optional parameters: noHTTPBodyInResp & doSetOutCookie (both false by default).
   If `doSetOutCookie` is true Cookies for Negotiate authorisation will be set on success Negotiate authentication
 - `_App.globalCacheList` function for `ubs_globalCache` virtual entity - expose a server-side global cache content (for debugging purpose)
### Changed:
 - OCI driver instrumental mode changed to use OCI_NO_MUTEX since UB connection pool use separate env per thread.
  This will speed up Oracle statements in multithread mode
 - remove overhead in calls to globc memory manager under linux
 - on Linux use a libc memory manager instead of FPC one. This solve a AV problem with some external library (oci for example)
 - upgrade low-level synopse lib to 1.18.5041
 - **CRITICAL** UB authorisation will check client time stamp is increasing (allow 1 minute delay for long queries).
   This prevent replay attack with the same timestamp in session signature
 - In case endpoint do not require authentication (registered with `registerEndpoint(name, handler, false)`
 Session for such endpoint will Anonymous even if valid Authorisation is passed
 - SpiderMonkey updated to esr52 with all patches added on 2019-01-07
 - set `Server` http header to `UnityBase` (nginx will overide it to `nginx`)
### Fixed:
 - `HTTPREsponse.vlidateETag` will adds `Cache-Control: no-cache` in caseETAg not match. This cause browser to
 revalidate next request instead of getting it from browser cache
 - prevent sending `Content-Type` header twice for `application/json`
 - response to `OPRIONS` verb include 'DAV' related headers only for User-Agent with Office substring inside.
  Such response required for Microsoft Office WebDav to allow open document in edit mode 
 - MS SQL for Linux ODBC access: server will call `USE connectionConfig.databaseName` statement just after connection is
 created. This allow to configure `Database=master` parameter in ODBC data source config (`~/.odbc.ini`) and as a result
 `ubcli initDB -drop -create` can drop/create SQL SErver database under Linus(ODBC) as for all other RDBMS/platforms
 - [unitybase/ub-server#24] - server side `http.request(opt)` fails with message
  'Unknown host' on Linux or 'The parameter is incorrect' on Windows in case `opt` object is
  stringified or logged before call
 - prevent sending Content-Type header twice
 - in case ThreadPoolSize is not defined in app config use GetSystemThreadCount instead of CPUCount*2 which always return 2
 - CentOS support (spidermonkey recompiled with c++ version supported by CentOS)
 - **CRITICAl** prevent memory leak during call to Enumerate for TubList (enumerate of `ctxt.mParams` keys for example)
 - **CRITICAl** fix potential authorization as Admin for anonymous user inside `authFromRequest` implementation
 - Oracle driver timing now measured correctly
 - local server IP addresses calculated correctly for both Win/Lin
 - put to log correct desctiption instead of empty lines for ELS/fileChecksum calls

#  Package ub-pub@5.2.23->5.2.29
### Changed:
 - `AsyncConnection.appConfig.applicationName` now localized to user language according to 
 settings from `ubConfig`
### Fixed:
 - WebStorm code insight now work inside vue classes for this.$UB

#  Package uba@5.1.14->5.1.15
### Added:
 - new API method `uba_user.setUDataKey(key, value)` - set key value inside `uba_user.uData` and store new JSON do DB

#  Package pdf@5.0.14->5.0.16
### Added:
- New font [Tryzub](http://artalbum.org.ua/ru/font#Tryzub) for Ukrainian state symbols

#  Package ub@5.2.0->5.2.5
### Changed:
  - DocFlow specific server-side i18n are removed from @unitybase/ub
### Fixed:
 - removed extra files from boundle

#  Package adminui-vue@1.1.0->1.2.2
### Changed:
 - `adminui-vue` model replace a top Ext-JS based tabbar with tabbar implemented using VueJS.
  See `components/UbTabbar`
 - `adminui-vue` model replace Ext-JS based relogon window with VueJS implementation.
  See `components/UbRelogon`
### Fixed:
 - relogon form: default focused element should be password
 - relogon form: password should be cleaned after submit 
 - authorization form validation message localisation

#  Package ubm@5.1.0->5.1.7
### Changed:
 - ubm_form.ID calculated as `crc32(form_code + form_model)` instead of `crc32(form_code)` to prevent
 ID's conflict between overrated forms

#  Package adminui-pub@5.6.25->5.7.0
### Added:
 - UB favicon.ico added to adminui-pub
### Changed:
 - left navigation panel aligned to full screen height
 - all toolbars (application top bar and form's toolbar) color changed to white
 - border around toolbar buttons is removed
 - base panel does not send `needAls: false` parameter for `select/insert/update` in case entity do not have ALS mixin
### Fixed:
 - fix opening form from link (check viewport is exists) 
