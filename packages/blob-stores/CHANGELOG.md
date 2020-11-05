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

## [5.4.12] - 2020-11-05
### Fixed
- MdbBlobStore do not throw an error on deletion

## [5.4.11] - 2020-11-01
### Added
  - `App.blobStores.getContentPath` method - retrieve full path to a file with BLOB content (in case store is file-based)

## [5.4.10] - 2020-10-15
## [5.4.9] - 2020-09-23
## [5.4.8] - 2020-09-22
### Fixed
- Allow `getDocument` endpoint calls with specific "revision" parameter for "Document" attributes,
  which does not have current value. 

## [5.4.7] - 2020-09-20
## [5.4.6] - 2020-09-01
## [5.4.5] - 2020-08-31
## [5.4.4] - 2020-08-19
## [5.4.3] - 2020-08-19
## [5.4.2] - 2020-07-26
## [5.4.1] - 2020-07-19
## [5.4.0] - 2020-07-15
### Fixed
 - for attributes of "Document" type if store name is empty then name of the default store MUST be written to DB instead
 of empty string. This allows to add another `default` store (mounted to another fs for example) and access documents
 from previous store definition. Fixed regression introduced in UB 4.  

## [5.3.3] - 2020-07-08
### Changed
 - ESLint warnings resolved (no functional changes)
 
## [5.3.2] - 2020-07-01
## [5.3.1] - 2020-06-30
## [5.3.0] - 2020-06-15
### Fixed
 - FileSystem BLOB store - fix incorrect folder names for Monthly & Daily
    - month numeration now starts from 01 (instead 00)
    - day folder name generated as "day of month" (01, 02, .., 31) instead a "day of week" (01, 02, .., 07)

## [5.2.10] - 2020-06-14
## [5.2.9] - 2020-05-25
## [5.2.8] - 2020-05-22
## [5.2.7] - 2020-05-13
## [5.2.6] - 2020-04-24
## [5.2.5] - 2020-04-10
## [5.2.4] - 2020-03-20
## [5.2.3] - 2020-03-17
## [5.2.2] - 2020-03-09
## [5.2.1] - 2020-03-04
## [5.2.0] - 2020-02-29
## [5.1.13] - 2020-02-10
## [5.1.12] - 2020-02-08
## [5.1.11] - 2020-02-03
## [5.1.10] - 2020-01-31
## [5.1.9] - 2020-01-17
## [5.1.8] - 2020-01-11
## [5.1.7] - 2019-12-27
### Changed
  - `FileSystemBlobStore.saveContentToTempStore` will return a real file md5 instead of empty string.
  This allows preventing downloads of the same file several times.

## [5.1.2] - 2019-11-19
### Fixed
 - prevent exposing of package to client by adding `"config": {"ubmodel": {} }` into package.json
 
## [5.1.0] - 2019-10-14
### Fixed
 - BlobStores regression: for stores filled by UB < 5 (without {v: 1,..} attribute in blobStore content JSON)
 default revision should be 0 instead of 1. The content below 
 ```
{"store":"simple","fName":"my file 3000006327362","origName":"","relPath":"","ct":"application/pdf","size":170326,"md5":".."}
 ```
resolved to `pathToSimpleStore/my file 3000006327362/0.pdf` instead of `.../1.pdf`
  
   

## [5.0.39] - 2019-03-19
### Fixed
 - on `nix` replace possible Windows separator inside blob store info `relPath`
 during calculation of Permanent File Name
 
## [5.0.36] - 2019-02-27
### Added
 - new method `blobStore.writeDocumentToResp` to respond to a parsed Document request

## [5.0.34] - 2019-01-30
### Fixed
 - file name in Content-Disposition header should be wrapped in "", in other case comma or other
 not allowed chars in file name can cause Chrome 72 to stop HTTP request)

## [5.0.29] - 2018-12-07
### Added
 - `setDocument` endpoint now can accept a BLOB attribute content as a `base64` encoded string. 
  In this case new parameter `encoding=base64` should be added to setDocument URL.
  Content will be decoded before written to actual storing location.
  
  Also Sync & AsyncConnection's setDocument method is modified to support new parameter.
  
  Feature is useful for clients with limited binary (arrayBuffer) functionality, such as **React Native** 

## [5.0.23] - 2018-11-01
### Added
 - `getDocument` endpoint will put error to log in case user don't have ELS rights
 for requested entity `select` method

## [5.0.23] - 2018-11-01
### Fixed
 -  historical BLOB stores will try to estimate revision number using select from ub_blobHistory in case previous
 BLOB store content is clean (use clear content for example).
 Previous implementation set the revision to `1` and if such revision already exists
 database on `ub_blobHistory` constraint fails.
   
## [5.0.22] - 2018-10-12
### Fixed
 - **SECURITY** `getDocument` endpoint will check user have ELS right to entity `select` method before getting document ID.
 Without this patch in case entity do not use RLS unauthorized access to document is possible
 - for file system based BLOB stores `setDocument` will throw error in case no disk space left
 and remove corrupted temp file. The previous implementation could create zero-length 
 or corrupted files without any exception.

## [5.0.12] - 2018-08-03
### Changed
- file system based BLOB store will use default tempPath: `path.join(this.path, '_temp')` to prevent a
 situation from [unitybase/ub-server#11]

## [5.0.6] - 2018-06-23
### Fixed
- fix exception during saving cleaned Document type attribute value for historical stores (ub-server #10)
