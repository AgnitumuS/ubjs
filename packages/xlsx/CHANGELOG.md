# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.40]
### Added
  - custom properties
    Example: wb.setCustomProperty('reportID', this.instanceID);
  - sheet protection (password is not currently supported)
    Example: ws.setWorksheetProtection({ objects: true, scenarios: true, formatColumns: false, formatRows: false, sort: false, autoFilter: false, pivotTables: false });

## [5.0.31]
### Added
 - preserve spaces is cells by default (required for creating indents)

### Fixed
 - columns properties was applied in incorrect order

## [5.0.26]
### Added
 - support of `th` tag during export HTML table to XLSX

## [5.0.16]
### Fixed
 - removing special symbols from sheet name. XLSX format does not allow symbols []/\?:* in sheet name

### Added
- support for <br/> tag

## [5.0.15]
### Added
- `ubmodel` section adedd to `package.json`, so @unitybase/xlsx model now
 can be added to the application congig in one line
 ```
  "domain": {
      "models": [
	...
        {
          "path": "./node_modules/@unitybase/xlsx"
        },
 ```

## [5.0.14]
### Fixed
- **BREAKING** `XLSXWorkbook.render` will return rendered data instead of Promise,
 because we use a synchronous version of JSZip
### Changed
- use external `lodash` library inside bundle (webpack config changed)

## [5.0.13]
### Fixed
- for environment with SystemJS (usually browser) package will expose
 `mustache` and `lodash` as SystemJS module to prevent double-loading

## [5.0.11]
### Fixed
- XLSXWorkbook.render will use jzsip.generate instead of unsupported in UB jszip.generateAsync

## [4.1.6]
### Added
- Converter from HTML to XLSX.

Simple example:
```
const {XLSXWorkbook, XLSXfromHTML} = require('xlsx')
const xmldom = require('xmldom')
const wb = new XLSXWorkbook({useSharedString: false})
const converter = new XLSXfromHTML(xmldom.DOMParser, wb, [{name: 'Лист'}])
converter.writeHtml({html: yourHtmlString})
let content = wb.render()
content = Buffer.from(content)
fs.writeFileSync('./testHtml.xlsx', content, 'binary')
```

Full example './_examples/testHtml.js'

## [4.1.0]
### Added
- Use javascript classes instead Ext.js classes
- Add rgb color in styles

```
wb.style.fills.add({fgColor: {rgb: 'FFCFE39D'}})
```

