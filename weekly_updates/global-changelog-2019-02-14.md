#  Package ub-server@5.7.1->5.7.4
### Added:
 - roles, added to user security groups `uba_group` now added to user groupIDs and
 applied to ELS
 - new variable `Session.uData.groupIDs` - an array of user group IDs
### Changed:
 - several internal optimizations in SpiderMonkey interaction:
   - native UTF8 support - JS Object values now passed to JS engine as a UTF8 instead of UTF16 (with converting)
   - prevent double memory allocation for script text during `require` calls
 - Linux: server will unescape a JSON errors text before output it to console for better readability
 - minor performance optimizations
 - JS debugger is temporary disabled for Workers threads
### Fixed:
 - unitybase/ub-server#22 - dates with 0 time should be serialized with T00:00Z suffix
 to be deserialized in FireFor and IE
 - HTTP API base server will correctly handle RemoteIPHeader & RemoteConnID in non dev modes

#  Package adminui-pub@5.6.15->5.6.25
### Changed:
- ubdetailgrid with RowEditing plugin : Changed data validation on the event 'validateedit'
 - sped-up `index.html` generation by replacing resource versions calculation algorithm from md5 to `version` from package.json
 - modal dialogs mask left-top position explicitly set to 0,0 - see [unitybase/ubjs!244] for details
   
  - if several default (isDefault=true) forms exists for an entity
  `UBFormLoader.getFormByEntity` will return a form from model with the biggest model order.
  This allow to override default forms in descending models [unitybase/ubjs#30]  
### Fixed:
 - potential error with invalid characters in scanned file name (,). Chrome72 do not allow `,` in Content-Disposition header 
 - [unitybase/ubjs#41] - float field validator should allow numbers with total char count > 17, for example `10,000,000.000001`
 - [unitybase/ubjs#42] - select row count on grid refresh only if rowCount calculation is turned ON either in ubRequest 
 or by pressing Total button on PaginationToolbar
 - clear "soft deletion" mark for combobox in case ubRequest is changed and newly selected record is not longer deleted
 - [unitybase/ubjs#36] - all exporters (Excel / CSV / HTML) will call a grid column render() function
 with parameters `col.renderer(value, null, record, rowIndex, colIndex, store)`
 - error during table insertion in the ReportBuilder UI component
  - allow negative values for fields with dataType `currency` or `float`
    

#  Package adminui-reg@5.0.69->5.1.0
### Changed:
 - sped-up index.html generation by replacing resource versions calculation algorithm from md5 to `version` from package.json
 - re-generation of cached `index.html` based on file system changes events is **removed**. In case developer change
 an `index.html` mustache template or update an application packages __server should be restarted__ to apply a new changes    

#  Package adminui-vue@1.0.33->1.1.0
### Added:
- watch for prop value changed in all controls
- open dialog with iFrame for pdf files in `UbUploadDocument`
 - components folder is added to tarball for debugging purpose
### Changed:
 - vue updated 2.5.17 -> 2.6.6
 - elemet-ui updated 2.4.9 -> 2.5.4
 - hide `Forgot password?` and `Registration` on auth form when `Negotiate` enabled
 - add title to Localizable Dialog in `UbInput`
### Fixed:
 - add missing "css" folder to the published package
 - fix popovers collapse on `UbSelectEntity` control
 - add styles for low resolution screens in `UbInput` Localizable Dialog

#  Package base@5.0.32->5.1.1
### Added:
 - `GC_KEYS` dictionary to store all known by UB global cache keys (ot prefixes) in the single place
 - handling of new authentication schema 'ROOT' in `argv.establishConnectionFromCmdLineAttributes`.
 Can be used in case client and server is the same process (client explicitly call `startServer()`)

#  Package blob-stores@5.0.29->5.0.34
### Fixed:
 - file name in Content-Disposition header should be wrapped in "", in other case comma or other
 not allowed chars in file name can cause Chrome 72 to stop HTTP request)

#  Package cdn@5.0.73->5.1.0
### Added:
 - new cdn dictionaries: cdn_nationality, cdn_personclass
 - new attribute of cdn_person: resident: boolean; nationality -> cdn_nationality, classID -> cdn_personclass
### Changed:
 - Description attribute of cdn_currency is now multilingual

#  Package cs-shared@5.0.14->5.0.15
### Added:
 - support for new authentication schema 'ROOT'. Server side in-proc server only

#  Package org@5.1.33->5.1.42
### Changed:
 - since DDL generations now executed under `root` check for `admin` login 
```
if (UBA_COMMON.isSuperUser()) return
```
 is removed from org.js Session.on('login') handler 
### Fixed:
 - typo in org_unit shortcut uk localization [UBDF-8687]
  - uData.allStaffUnitIDs will contains ALL stuff unit ID's not only permanent/assistant/temp as reported in [unitybase/ubjs#37]

#  Package pdf@5.0.12->5.0.14
### Added:
- Arial GEO bold italic registration corrected
- New font set with Georgian language support for formatted pdf generation - Arial GEO

#  Package ub@5.0.45->5.2.0
### Added:
 - extended `App.authFromRequest` - added optional Cookies for Negotiate authentication (UB server should be updated to 5.7.7+)
 - `THTTPResponse.getBodyForDebug` function
 - `App.globalCachePut` will accept `null` as 2nd parameter. In this case key will be removed from globalCache (UBserver@5.7.7+)  
 - `Session.uData.groupIDs` property - an array of group IDs user id assigned to
### Changed:
 - initial values of `Session.uData` now filled inside JS `Session._getRBACInfo` (`@unitybase/ub`)
 instead of duplication of code inside UB server and `@unitybase/uba` model
 - in case user is a member of **security group** (uba_group / uba_usergroup) then roles assigned 
 to this groups will be added to the user roles. ELS for such a roles will be also applied to user.
 **UB server must be upgraded to >= 5.7.3**
 - uData employeeShortFIO & employeeFullFIO now initialized from uba_user.firstName & uba_user.fullName.
 In case `org` model is in domain then it will override employeeShortFIO & employeeFullFIO
### Fixed:
 - `DataStore.initialize` will correctly init store from a flatten format in case rowCount = 0 [unitybase/ubjs#31]

#  Package uba@5.1.3->5.1.14
### Added:
 - **Attribute Level Security editor** (can be ronned from ALS grid).
 This editor is a direct replacement of desktop ALS application.
 `adminui-vue` model must be added to application domain for this feature.
### Changed:
 - add warning to ELS form about insecure usage of method mask in ELS rules [unitybase/ubjs#38]
 - UBA model `Session.on('login')` handler now check advanced security only. All required uData properties 
 are filled in UB model `Session._getRBACInfo` method (called by server during authorization stage) 
### Fixed:
 - allow Supervisor role to manage uba_grouprole
 - allow Supervisor role read uba_userrole, uba_usergroup and uba_grouprole [unitybase/ubjs#33]
- Write to security audit when group gets or lost a role
- Write to security audit when user is added/removed to/from group
- Added localization to `uba_group` entity for en/uk/ru

#  Package ubcli@5.2.6->5.3.0
### Changed:
 - `generateDDL` command now work under `root` system account and can be executed only locally.
 `-u` and `-p` command line switches not used anymore
```
npx ubcli generateDDL -cfg $UB_CFG -autorun
```
  Since `root` auth schema do not fire `Session.on('logon')` event developers can remove a conditions
  for DDL generation (when database is not fully created yet) 
```
 if (Session.userID === UBA_COMMON.USERS.ADMIN.ID) return
```
  from `Session.on('logon')` handlers

#  Package ubm@5.0.66->5.1.0
### Changed:
 - `ubm_form` & `ubm_diagram` cache now flushed for all thread in case insert or update is called. This solve possible
 error when form/diagram created in one thread not visible to other until server restart  

#  Package ubq@5.2.0->5.2.11
### Added:
 - Ukrainian localization

#  Package ubs@5.1.26->5.2.0
### Added:
 - new handler `onAfterRender` for reports. Will be called by ReportViewer just after HTML report result is rendered
 - new property `ReportViewer.contextMenu` - can be used to show menu while user click on hyperlink inside rendered HTML report
   See [click_sample.js](https://git-pub.intecracy.com/unitybase/ubjs/blob/master/packages/ubs/public/reports/click_sample.js#L42) 
   for usage example
 - Report editor form: show warning for server-side test and report reload in case server / client not in dev mode 
 - `ubs_globalCache` virtual entity - expose a server-side global cache content (for debugging purpose)
 - in case `reportOptions.showParamForm` is true, `reportViewer` will always display the report parameters form, 
   otherwise, the report parameters form will be displayed only if the report option `reportParams` is empty 
   (false by default) 
 ```javascript
$App.doCommand({
  cmdType: 'showReport',
  cmdData: {
    reportCode: 'your-report-code',
    reportType: 'html',
    reportParams: {a: 'b'},
    reportOptions: {
      showParamForm: true
    }
  }
```
### Changed:
 - for HTML report `this` inside `onReportClick` handler now instance of ReportViewer
 - add a warning about unnecessary `@report_code` and `@ID` metadata in the report template files; 
  ubs_report virtual entity ignore this template attributes and calculate it from template file name  
 - `ubs_report` cache now flushed for all thread in case insert or update is called. This solve possible
  error when report created in one thread not visible to other until server restart
### Fixed:
 - prevent clean of report template data in case only code block of report is updated 
 - Report editor form: fix unexpected report code cleanup on saving report
 - Report editor form: add a TIP about changing report code; set a report code to read-only for existing reports
 - syntax errors in the report initial template
 - report saving

# *New* Package udisk@0.0.1->5.0.43
### Fixed:
 - missing comma in server-side localization file

#  Package xlsx@5.0.31->5.0.41
### Added:
  - adding custom properties to the xlsx document
```
  wb.setCustomProperty('reportID', this.instanceID)
```
 - sheet protection (password is not currently supported)
```
  ws.setWorksheetProtection({
    objects: true,
    scenarios: true,
    formatColumns: false,
    formatRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  })
```
