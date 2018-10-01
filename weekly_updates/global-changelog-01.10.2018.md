##  Package ub-server@5.3.1->5.3.2
### Changed:
 - **BREAKING** support for running UB as Windows Service is removed. We recommend to use [pm2](http://pm2.keymetrics.io/) as process manager
 or other windows tools to wrap applicatin to Windows Service
                                                             

##  Package adminui-pub@5.5.4->5.5.8
### Added:
 - `UploadFileAjax` component can optionally limits file extensions allowed for selection
 ```javascript
Ext.create('UB.view.UploadFileAjax', {
  ...
  accept: '.cer',
  ...
``` 
 - application version (from package.json) is shown below login window (new feature `connection.appConfig.appVersion`) 
 - support for `CERT2` auth
### Fixed:
 - new version creation for *cached* entities with `dataHistory` mixin
 - allow passing of null/undefined into basePanel.hideActions array item
 - certificates related i18 keys is moved into ub-pub

##  Package adminui-reg@5.0.51->5.0.52
### Fixed:
- allow blob: source for connect-src CSP rules. It required by UBDocument (ER diagrams, Org chart)

##  Package adminui-vue@1.0.15->1.0.16
### Added:
 - vue based login now support `CERT2` authentication (available in UB DE)

##  Package amqp@1.0.10->1.0.15
### Changed:
- UBServerNotifier class moved to separate package
- exchange declaration removed in startup code
  due to unwanted side effects to some operations like initDB
  now 'ub-amqp-notify' topic exchange must be created manually

##  Package amqp-notify@1.0.3->1.1.2
### Added:
- initial release
### Changed:
- auth endpoints registration now moved to separate function to be called at model init

##  Package amqp-notify-pub@1.0.8->1.0.10
### Changed:
- Fix bug when processing '*' uri value

##  Package base@5.0.10->5.0.17
### Fixed:
- ServerRepository.selectAsObject now accept two optional parameters
  `selectAsObject(fieldAliases, resultInPlainText)` to be compatible with ClientRepository.
  **WARNING** using fieldAliases on server side cause a little performance degradation

##  Package blob-stores@5.0.6->5.0.12
### Changed:
- file system based BLOB store will use default tempPath: `path.join(this.path, '_temp')` to prevent
 situation from [unitybase/ub-server#11]

##  Package cdn@5.0.50->5.0.52
### Fixed:
- cdn_bank formation of the description when the constituent attributes were deleted

##  Package compressors@5.1.0->5.1.3
### Fixed:
- Ubuntu 18 support

##  Package mailer@5.0.13->5.1.0
### Fixed:
- Ubuntu 18 support

##  Package org@5.0.39->5.1.0
### Changed:
- all fullName* attributes sizes increased to 300 for org_department, org_employee and org_organization 
### Fixed:
 - syntax error in org_employeenstaff.caption isMultilang attribute
   

##  Package pdf@5.0.7->5.0.10
### Fixed:
- `PrintToPDF.requireFonts` documentation
- parameter "compress" of constructor PrintToPdf was not enable content compression

##  Package ub@5.0.34->5.0.38
### Added:
 - `getAppInfo` endpoint return a application version in `appVersion` key.
 Version taken from application package.json version attribute.
 Client side can read it from `connection.appConfig.appVersion`.
### Fixed:
 - domain documentation generator fixed `ubcli generateDoc -u admin -p admin` 

##  Package ub-pub@5.2.5->5.2.10
### Added:
 - translation for `MAX_TREEPATH_DEPTH_EXCEED`
 - support for `CERT2` auth
 - `CERT2` related localization added to i18n
### Fixed:
 - fix call to `btoa` for non-latin string (using encodeURIComponent)

##  Package uba@5.0.19->5.0.32
### Fixed:
- `uba_auditTrail-fm` fixed bug in case show changed values by attribute of type **document**

##  Package ubcli@5.0.30->5.0.40
### Fixed:
- `ubcli generateDDL` will skip DDL generation for entities without `mStorage` mixin [unitybase/ubjs#11]
- When create a new DB using `ubcli initDB -create` command, the created user for
  SQL Server database have correct default schema `dbo` [unitybase/ubjs#12]

##  Package ubm@4.0.48->5.0.12
### Fixed:
- fix creation of a new pureExtJS form from adminUI

##  Package ubq@4.2.0->5.1.0
### Changed:
 - `mail` job rewritten to module. Use `"module": "@unitybase/ubq/ubqMailJob"` to override mail scheduler
 - `FTSReindexFromQueue` job rewritten to module. Use `"module": "@unitybase/ubq/ubqFTSJob"` to override FTS scheduler
### Fixed:
 - [unitybase/ubjs#9] - null value in column "appname" violates not-null constraint for **linux** platform
 - allow use mail over SSL

##  Package ubs@5.1.13->5.1.17
### Added:
 - excel export button added to the ReportViewer in case `allowExportToExcel` report option is true (false by default) 
 ```javascript
$App.doCommand({
  cmdType: 'showReport',
  cmdData: {
    reportCode: 'your-report-code',
    reportType: 'html',
    reportParams: {a: 'b'},
    reportOptions: {
      allowExportToExcel: true
    }
  }
```
### Changed:
 - `reportOptions.allowExportToExcel` allowed value changed from to 'xls' or 'xlsx'. ('xlsx' by default)
   For 'xls' report will be saved as html but with **xls** extension - excell will convert such files on open
   otherwise report will be regenerated as native **xlsx** file
 ```javascript
$App.doCommand({
  cmdType: 'showReport',
  cmdData: {
    reportCode: 'your-report-code',
    reportType: 'html',
    reportParams: {a: 'b'},
    reportOptions: {
      allowExportToExcel: 'xls'
    }
  }
```

##  Package xlsx@5.0.25->5.0.26
### Added:
 - support of `th` tag during export HTML table to XLSX