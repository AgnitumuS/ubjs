# The Unitybase UB model

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This model is a basis for all server-side models


Model defines the basic endpoints:
 - getAppInfo
 - clientRequire
 - getDomainInfo 
 - models

A server-side i18n (UB.i18n)

A `TubDataStore` - class for execution of an ORM/SQL queries on the server side
Virtual stores: fileVirtual.js fileVirtualWritePDF.js mdb.js 

Public part contains JSON schemas in `public/schemas`.
JSON schemas can be rendered using `docson` and also can be used by IDE
to provide the code completion and file verification.



