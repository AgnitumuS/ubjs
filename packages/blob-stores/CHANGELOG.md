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

## [5.19.0] - 2021-02-02
### Changed
 - `setDocument` endpoint will use `req.writeToFile` if request body not in base64 instead of reading
   body into JS memory and when write it using fs.writeFileSync.
   This prevents double memory allocation.
 - **BREAKING** `BlobStoreCustom.saveContentToTempStore` method signature changed.
   `content` parameter can be either ArrayBuffer or THTTPRequest.
   Support for `content: THTTPRequest` MUST be added to descendants.
 - use new property `req.parsedParameters` instead of `queryString.parse(req.parameters)`

## [5.5.12] - 2021-01-30
### Changed
 - **BREAKING** `getDocument` endpoint return a BLOB content without `Content-Disposition` header.
  To download a BLOB store content with original file name new method of @unitybase/adminui-pub `$App.downloadDocument`
  should be used. 
   
  For frontends without adminui-pub `download` attribute of `a` HTML element can be used: `<a href=... download="origFileName">`
   
## [5.5.11] - 2021-01-26
## [5.5.10] - 2021-01-19
## [5.5.9] - 2021-01-17
## [5.5.8] - 2020-12-28
### Added
 - BLOB sores: to transform non lun'ed store to LUN'ed old folder MUST be mounted into `blobStoreRoot/LU00`

### Changed
 - hack with UB 1.12 and UB 4.x compatibility for file system BLOB stores with historyDepth = 0 is **REMOVED**.
   Previous implementation is correct.
    
## [5.5.7] - 2020-12-22
## [5.5.6] - 2020-12-21
## [5.5.5] - 2020-12-20
## [5.5.4] - 2020-12-14
### Fixed
 - fixed UB 1.12 and UB 4.x compatibility for file system BLOB stores with historyDepth = 0.
   For such stores file path is calculated without adding a folder for revisions

## [5.5.3] - 2020-11-25
## [5.5.2] - 2020-11-20
### Changed
 - `mdb` BLOB store: if reverseProxy is `nginx` then `getDocument` request for permanently stored items will
   redirect to `sendFileLocationRoot/models` internal location to unify retrieving of models and cmodels.
   
   On the production `cmodels` is located in then `/var/opt/unitybase/..` while models - in the `/opt/unitybase/...`
   Since linkStatic links both to the `inetpub/clientRequire/models`, so better to get all `mdb` items from there.
   
   `ubcli generateNginxCfg` should be executed after upgrade to this version (`ub-app-upgrade` lifecycle script is doing this)
          
## [5.5.1] - 2020-11-19
## [5.5.0] - 2020-11-15
### Added
  - BLOB stores: new `storeSize` `Hourly` - as `Daily` but with sub-folder for each hour inside a day folder
  - BLOB sores: new property `LUCount` - a count of Logical Units BLOB stores divided into.
    If > 0 then files are stored inside `Logical Unit` sub-folders `/LU01`, `/LU02`,.
     
    Write operations works with last LU folder. Each LU folder can be mounted to his own partition.
    In this case `tempPath` should point to the same partition as last LU.
    
## [5.4.17] - 2020-11-14
### Added
 - `@unitybase/blob-stores/storesPerfTest.js` - BLOB store performance testing endpoints implementation.
   See doc inside a `storesPerfTest.js` for usage sample.

## [5.4.16] - 2020-11-12
### Changed
- mdb store now stores MD5

## [5.4.15] - 2020-11-10
## [5.4.14] - 2020-11-08
## [5.4.13] - 2020-11-08
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
