# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [5.0.36]
### Added
 - new method `blobStore.writeDocumentToResp` to respond to a parsed Document request

## [5.0.34]
### Fixed
 - file name in Content-Disposition header should be wrapped in "", in other case comma or other
 not allowed chars in file name can cause Chrome 72 to stop HTTP request)

## [5.0.29]
### Added
 - `setDocument` endpoint now can accept a BLOB attribute content as a `base64` encoded string. 
  In this case new parameter `encoding=base64` should be added to setDocument URL.
  Content will be decoded before written to actual storing location.
  
  Also Sync & AsyncConnection's setDocument method is modified to support new parameter.
  
  Feature is useful for clients with limited binary (arrayBuffer) functionality, such as **React Native** 

## [5.0.23]
### Added
 - `getDocument` endpoint will put error to log in case user don't have ELS rights
 for requested entity `select` method

## [5.0.23]
### Fixed
 -  historical BLOB stores will try to estimate revision number using select from ub_blobHistory in case previous
 BLOB store content is clean (use clear content for example).
 Previous implementation set the revision to `1` and if such revision already exists
 database on `ub_blobHistory` constraint fails.
   
## [5.0.22]
### Fixed
 - **SECURITY** `getDocument` endpoint will check user have ELS right to entity `select` method before getting document ID.
 Without this patch in case entity do not use RLS unauthorized access to document is possible
 - for file system based BLOB stores `setDocument` will throw error in case no disk space left
 and remove corrupted temp file. The previous implementation could create zero-length 
 or corrupted files without any exception.

## [5.0.12]
### Changed
- file system based BLOB store will use default tempPath: `path.join(this.path, '_temp')` to prevent
 situation from [unitybase/ub-server#11]

## [5.0.6]
### Fixed
- fix exception during saving cleaned Document type attribute value for historical stores (ub-server #10)
