# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.13]
### Fixed
- for environment with SystemJS (usually browser) package will expose
 `mustache` and `lodash` as SystemJS module to prevent double-loading

## [5.0.11]
### Fixed
- XLSXWorkbook.render will use jzsip.generate instead of unsupported in UB jszip.generateAsync

## [4.2.2]
### Added
- Added supporting <br/> tag

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
wb.render().then(function (content) {
 content = Buffer.from(content)
 fs.writeFileSync('./testHtml.xlsx', content, 'binary')
})
```

Full example './_examples/testHtml.js'

## [4.1.0]
### Added
- Use javascript classes instead Ext.js classes
- Add rgb color in styles

```
wb.style.fills.add({fgColor: {rgb: 'FFCFE39D'}})
```

