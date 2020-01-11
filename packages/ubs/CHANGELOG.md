# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added

### Changed

### Deprecated

### Removed

### Fixed

## [5.2.67] - 2020-01-11
## [5.2.66] - 2020-01-03
## [5.2.65] - 2020-01-02
## [5.2.64] - 2019-12-30
## [5.2.63] - 2019-12-27
## [5.2.62] - 2019-12-20
## [5.2.61] - 2019-12-18
### Fixed
- `@unitybase/pdf` && `@unitybase/xslx` packages are moved back into "dependencies" - neither "peerDependencies" nor
 "optionalDependencies" not works as expected for initial `lerna bootstrap` 
  
## [5.2.60] - 2019-12-17

## [5.2.59] - 2019-12-12
### Changed
 - `@unitybase/pdf` && `@unitybase/xslx` packages are moved into "peerDependencies" - "optionalDependencies" handled by 
  lerna in the same way as "dependencies"

## [5.2.58] - 2019-12-12
### Changed
 - `@unitybase/pdf` && `@unitybase/xslx` packages are moved into "optionalDependencies" package/.json section.
 This prevent `lerna` from publishing `@unitybase/ubs` and all their dependencies each time pdf or xlsx changed
 
## [5.2.52] - 2019-11-15
### Changed
 - Report names are localizable now - "Click sample" report is an example

## [5.2.45] - 2019-10-02
### Changed
 - `ubs_numcounter.getRegnum` optimization
   - new attribute ubs_numcounter.fakeLock added for select for update emulatin
   - settings key `ubs.numcounter.autoRegWithDeletedNumber` reads once 

## [5.2.25] - 2019-07-22
### Changed
 - all meta files and they localization transformed to array-of-attributes format

## [5.2.24] - 2019-07-11
### Added
 - scheduler job `ubsSoftLockCleanup` added to the UBS model.
 Will delete all expired non persistent lock from `ubs_softLock` table. By default scheduled to run every day at 05:15:25

### Fixed
 - keys for SOFTLOCK_TYPE enum changed `ltNone->None` `ltPersist->Persist` `ltTemp->Temp`
 - ExtJS based messages sending form (bell on toolbar) is removed - only Vue form is left

## [5.2.23] - 2019-07-08
### Changed
 - 'UBS.MessageBar' is deleted. New implementation is inside `@unitybase/adminui-vue` model 
 
## [5.2.22] - 2019-07-05
### Fixed
 - Vue based user messages notification widget do not throw `ELS - access deny` error for non-privileged users

## [5.2.12] - 2019-05-21
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`
 
## [5.2.3] - 2019-02-26
### Added
 - navshortcuts access initialization for Supervisor role
 - added vue form 'Messages history'
 - added vue form 'Send message'

### Changed
 - use webpack4 for production build

## [5.2.0] - 2019-02-13
### Added
 - new handler `onAfterRender` for reports. Will be called by ReportViewer just after HTML report result is rendered
 - new property `ReportViewer.contextMenu` - can be used to show menu while user click on hyperlink inside rendered HTML report
   See [click_sample.js](https://git-pub.intecracy.com/unitybase/ubjs/blob/master/packages/ubs/public/reports/click_sample.js#L42) 
   for usage example
  
### Changed
 - for HTML report `this` inside `onReportClick` handler now instance of ReportViewer
 
### Fixed
 - prevent clean of report template data in case only code block of report is updated 
 
## [5.1.41] - 2019-01-03
### Added
 - Report editor form: show warning for server-side test and report reload in case server / client not in dev mode 

## [5.1.40] - 2018-12-28
### Fixed
 - Report editor form: fix unexpected report code cleanup on saving report
 - Report editor form: add a TIP about changing report code; set a report code to read-only for existing reports
  
### Added
 - `ubs_globalCache` virtual entity - expose a server-side global cache content (for debugging purpose)

### Changed
 - add a warning about unnecessary `@report_code` and `@ID` metadata in the report template files; 
  ubs_report virtual entity ignore this template attributes and calculate it from template file name  
 - `ubs_report` cache now flushed for all thread in case insert or update is called. This solve possible
  error when report created in one thread not visible to other until server restart
  
## [5.1.39] - 2018-12-27
### Fixed
 - syntax errors in the report initial template
 - report saving

## [5.1.37] - 2018-12-14
### Added 
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
})
```

## [5.1.26] - 2018-11-04
### Changed
 - `ubs.numcounter.autoIncrementalCodeLen` default value decreased from 12 to 6 - codes length `000001` is enough in most case 

## [5.1.25] - 2018-10-17
### Changed
 - `ReportViewer` - styles for `td,th` is removed, so now table header will use body style (see ReportViewer.js line 6)

## [5.1.17] - 2018-09-24
### Changed
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
})
```

## [5.1.15] - 2018-09-13
### Added 
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
})
```

## [5.1.13] - 2018-09-11
### Fixed
- UBReport: in case `$fn` function argument is empty return empty string instead of `null`
- UBReportViewer: prevent multiple injection of the same CSS for HTML reports 
- UBReportViewer: CSS for hiding header/footer and adding 1cm margins

## [5.1.12] - 2018-09-10
### Fixed
- UBReport: HTML report will replace `<!-- pagebreak -->` placeholder to special element before print
 as in previous TinyMCE implementation  

## [5.1.11] - 2018-09-05
### Fixed
- UBReport: in case `$fn` function argument is empty return empty string instead of `null`

## [5.1.7] - 2018-08-28
### Added 
- in HTML reports `$fs` function will display negative numbers using red text color
  
## [5.1.6] - 2018-08-28
### Fixed
- fix case when reportParams not passed to $App.doCommand for `showReport`
   
## [5.1.5] - 2018-08-27
### Added
- `showReport` command can silently (without asking used for input)
create parametrised report in case `reportParams` parameter contains non-empty object

```javascript
$App.doCommand({
  "cmdType": "showReport",
  "description": "OPTIONAL report form caption",
  "cmdData": {
    "reportCode": "test",
    "reportType": "html",
    "reportParams": {
      "name": "Mark",
      "birthday": new Date(),
      "limitation": 2
    }
  }
})
``` 

## [5.1.0] - 2018-08-11
### Changed
- dramatically increase HTML report viewer by replacing TinyMCE to plain iframe
- report code module now required once in the same manner forms are required
- HMR now works for report code modules

### Added
- generic mechanism for follow hyperlink (drill down) is added to report builder. 
 See report with code click_sample for usage example    

## [5.0.30] - 2018-07-18
### Fixed
- ubs_settings.loadKey & ubs_settings.loadKeys will convert values for keys of type int and number to number using parseInt

## [5.0.23] - 2018-07-05
### Changed
- adminUI will await while ubs model finish query to `ubs_setting` entity for UBS.Settings.findByKey work correctly

## [4.1.49] - 2018-06-18
### Changed
- New parameter 'language' for UBServerReport

## [5.0.18] - 2018-06-06
### Fixed
- `UBS.MessageBar` will be bundled into `@unitybase/ubs`

## [5.0.17] - 2018-06-03
### Fixed
- package will expose and `mustache` as SystemJS module to prevent double-loading

## [5.0.16] - 2018-05-29
### Changed
- speed up UBS.ReportViewer during HTML reports rendering
- removed 15px margins in UBS.ReportViewer

### Fixed
- mustache formatting function **$fs and $fd** (aka Format Sum / Date) will
 format according to current user locale

## [5.0.15] - 2018-05-25
### Fixed
- Collapsing animation of `UBS.ReportParamForm` removed (fixed wrong report align)

## [5.0.14] - 2018-05-24
### Changed
- Report parameter form `UBS.ReportParamForm` now collapsible by default.
  To disable developed should implicitly define `collapsible: false` in
  `UBS.ReportParamForm` descendant inside report code block:

```
exports.reportCode = {
  buildReport: function (reportParams) {
...
  },
  onParamPanelConfig: function () {
    let paramForm = Ext.create('UBS.ReportParamForm', {
      collapsible: false,
      ...
```
- UBS.ReportParamForm now will collapse after BuildReport button pressed

## [5.0.7] - 2018-05-04
### Added
 - introduce method `ubs_numcounter.generateAutoIncrementalCode` - to be used in `insert:before`
 handlers for generation unique codes for entities natural primary key attribute.
 See cdn_profession.js for usage sample.
 - new ubs_settings key `ubs.numcounter.autoIncrementalCodeLen` - resulting length of
 auto incremental code created by `ubs_numcounter.generateAutoIncrementalCode` function

## [4.1.49] - 2018-06-18
### Changed
- New parameter 'language' for UBServerReport

## [4.1.47] - 2018-03-05
### Added
 - ubs_settings.addOrUpdateKey function 
 
## [4.1.43] - 2018-02-17
### Added
- New report type 'xlsx'. For detail see report 'xlsxExample'
- New function for format data types "number" and "date" as string
 for reports. List of function see in formatFunction.js

## [4.1.41] - 2018-01-25
### Changed
- ubs_report.ID now calculated as crc32(file-name-without-extension) as in ubm_form

## [4.1.38] - 2017-12-12
### Added
- report code unique check

## [4.1.25] - 2017-08-16
### Fixed
- Prevent use a browser cache template/code block in report edit form (ubs_report)

## [4.1.20] - 2017-05-17
### Changed
- add ability to pass a <a href> onclick event to HTML report



