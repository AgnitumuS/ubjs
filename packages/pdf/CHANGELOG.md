# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.20]
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`    

## [5.0.18]
### Changed
 - use webpack4 for production build

## [5.0.16]
### Added
- New font [Tryzub](http://artalbum.org.ua/ru/font#Tryzub) for Ukrainian state symbols

## [5.0.14]
### Added
- Arial GEO bold italic registration corrected

## [5.0.13]
### Added
- New font set with Georgian language support for formatted pdf generation - Arial GEO

## [5.0.12]
### Added
- Font SylfaenNormal with georgian characters

## [5.0.10]
### Fixed
- `PrintToPDF.requireFonts` documentation
- parameter "compress" of constructor PrintToPdf was not enable content compression

## [5.0.7]
### Added
- `ubmodel` section adedd to `package.json`, so @unitybase/pdf model now
 can be added to the application congig in one line
 ```
  "domain": {
      "models": [
	...
        {
          "path": "./node_modules/@unitybase/pdf"
        },
 ```

## [5.0.7]
### Fixed
- invalid PDF file format in case timesNewRomanBoldItalic font is used

## [5.0.6]
### Fixed
- unicode-text plugin will require `lodash` instead of using lodash from global

## [1.1.22]
### Fixed
 - module PDF: Module throw error when html contains &frac14; 

## [1.1.17]
### Fixed
 - module PDF: If textBox has defined high and sptitOnPage=true it will split not correct

## [1.1.15]
### Fixed
- HTML2PDF: Fix exception when convert broken HTML to PDF at server side. The HTML has invalid colspan value.


## [1.1.14]
### Added
- HTML2PDF: handle TimesNewRoman Bolt + Italic font (new font added)
- add Deflater compression

### Fixed
- HTML2PDF: fixed incorrect justify align in case block element contains several fonts 



