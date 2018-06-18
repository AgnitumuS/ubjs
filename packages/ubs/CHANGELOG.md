# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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



