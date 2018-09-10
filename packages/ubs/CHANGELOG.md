# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.1.12]
### Fixed
- UBReport: HTML report will replace `<!-- pagebreak -->` placeholder to special element before print
 as in previous TinyMCE implementation  

## [5.1.11]
### Fixed
- UBReport: in case `$fn` function argument is empty return empty string instead of `null`

## [5.1.7]
### Added 
- in HTML reports `$fs` function will display negative numbers using red text color
  
## [5.1.6]
### Fixed
- fix case when reportParams not passed to $App.doCommand for `showReport`
   
## [5.1.5]
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

## [5.1.0]
### Changed
- dramatically increase HTML report viewer by replacing TinyMCE to plain iframe
- report code module now required once in the same manner forms are required
- HMR now works for report code modules

### Added
- generic mechanism for follow hyperlink (drill down) is added to report builder. 
 See report with code click_sample for usage example    

## [5.0.30]
### Fixed
- ubs_settings.loadKey & ubs_settings.loadKeys will convert values for keys of type int and number to number using parseInt

## [5.0.23]
### Changed
- adminUI will await while ubs model finish query to `ubs_setting` entity for UBS.Settings.findByKey work correctly

## [4.1.49]
### Changed
- New parameter 'language' for UBServerReport

## [5.0.18]
### Fixed
- `UBS.MessageBar` will be bundled into `@unitybase/ubs`

## [5.0.17]
### Fixed
- package will expose and `mustache` as SystemJS module to prevent double-loading

## [5.0.16]
### Changed
- speed up UBS.ReportViewer during HTML reports rendering
- removed 15px margins in UBS.ReportViewer

### Fixed
- mustache formatting function **$fs and $fd** (aka Format Sum / Date) will
 format according to current user locale

## [5.0.15]
### Fixed
- Collapsing animation of `UBS.ReportParamForm` removed (fixed wrong report align)

## [5.0.14]
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

## [5.0.7]
### Added
 - introduce method `ubs_numcounter.generateAutoIncrementalCode` - to be used in `insert:before`
 handlers for generation unique codes for entities natural primary key attribute.
 See cdn_profession.js for usage sample.
 - new ubs_settings key `ubs.numcounter.autoIncrementalCodeLen` - resulting length of
 auto incremental code created by `ubs_numcounter.generateAutoIncrementalCode` function

## [4.1.49]
### Changed
- New parameter 'language' for UBServerReport

## [4.1.47]
### Added
 - ubs_settings.addOrUpdateKey function 
 
## [4.1.43]
### Added
- New report type 'xlsx'. For detail see report 'xlsxExample'
- New function for format data types "number" and "date" as string
 for reports. List of function see in formatFunction.js

## [4.1.41]
### Changed
- ubs_report.ID now calculated as crc32(file-name-without-extension) as in ubm_form

## [4.1.38]
### Added
- report code unique check

## [4.1.25]
### Fixed
- Prevent use a browser cache template/code block in report edit form (ubs_report)

## [4.1.20]
### Changed
- add ability to pass a <a href> onclick event to HTML report



