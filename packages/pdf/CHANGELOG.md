# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [5.0.25] - 2019-12-11
### Fixed
 - invalid size of text-indent attribute in htmlToPDF transformation 

## [5.0.22] - 2019-08-13
### Fixed
 - invalid PDF file format in case `ArialBoldItalic` font is used

## [5.0.20] - 2019-05-21
### Changed
 - `optionalDependencies` are moved to `devDependencies` to prevent install it even when `NODE_ENV=production`    

## [5.0.18] - 2019-03-01
### Changed
 - use webpack4 for production build

## [5.0.16] - 2019-02-15
### Added
- New font [Tryzub](http://artalbum.org.ua/ru/font#Tryzub) for Ukrainian state symbols

## [5.0.14] - 2018-12-27
### Added
- Arial GEO bold italic registration corrected

## [5.0.13] - 2018-12-14
### Added
- New font set with Georgian language support for formatted pdf generation - Arial GEO

## [5.0.12] - 2018-11-27
### Added
- Font SylfaenNormal with georgian characters

## [5.0.10] - 2018-08-08
### Fixed
- `PrintToPDF.requireFonts` documentation
- parameter "compress" of constructor PrintToPdf was not enable content compression

## [5.0.7] - 2018-06-26
### Added
- `ubmodel` section added to `package.json`, so @unitybase/pdf model now
 can be added to the application config in one line
 ```
  "domain": {
      "models": [
	...
        {
          "path": "./node_modules/@unitybase/pdf"
        },
 ```

## [5.0.7] - 2018-06-26
### Fixed
- invalid PDF file format in case timesNewRomanBoldItalic font is used

## [5.0.6] - 2018-05-24
### Fixed
- unicode-text plugin will require `lodash` instead of using lodash from global

## [1.1.22] - 2017-09-14
### Fixed
 - module PDF: Module throw error when html contains &frac14; 

## [1.1.17] - 2017-06-01
### Fixed
 - module PDF: If textBox has defined high and sptitOnPage=true it will split not correct

## [1.1.15] - 2017-04-27
### Fixed
- HTML2PDF: Fix exception when convert broken HTML to PDF at server side. The HTML has invalid colspan value.


## [1.1.14] - 2017-04-12
### Added
- HTML2PDF: handle TimesNewRoman Bolt + Italic font (new font added)
- add Deflater compression

### Fixed
- HTML2PDF: fixed incorrect justify align in case block element contains several fonts 



