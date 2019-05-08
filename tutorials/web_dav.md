## WebDav (UB Enterprise Edition)

Add @ub-e/web-dav module to your app
```bash
npm i --save @ub-e/web-dav
```

And use it in your model main file with appropriate provider.
 
```js
const WebDav = require('@ub-e/web-dav')
const WebDavBlobStoreProvider = require('@ub-e/web-dav/providers/webDavBlobStoreProvider')
const WebDavFsProvider = require('@ub-e/web-dav/providers/webDavFileSystemProvider')
WebDav.registerEndpoint('folders')
  .addProvider(new WebDavBlobStoreProvider({
    name: 'doc',
    entities: ['tst_document']
  }))
  .addProvider(new WebDavFsProvider({
    name: 'fs',
    path: process.configPath
  }))
```

WebDavFsProvider expose a folder `process.coonfigPath` as WebDav root (**do not do such on production!!**)

To access files use URL:
 - on Windows `\\localhost@8881\folders\fs` in Explorer
 - on Linux `dav://localhost:8881/folders/fs` into Files -> Other locations 
  
WebDavBlobStoreProvider expose all BLOB attributes for `tst_document` entity. Content can be opened directly by 
Word, Excel, Notepad etc. using URL `\\localhost@8881\folders\doc\tst_document\fileStoreSimple\332468137394197\0.docx`, where:
 - `tst_document` - entity code
 - `fileStoreSimple` - BLOB attribute code
 - `332468137394197` - instance ID
 - `0` - reserved for version. Current implementation support only `0`
 - `docx` - file extension

## Editable content
 - `WebDavBlobStoreProvider` allow to save BLOB to server in case entity support locking (softLock mixin is added to entity)
 - `WebDavFsProvider` allow to save files back to server for ANY authorised user

## Authentication
 Current implementation support ONLY Negotiate authentication, so Negotiate must be present in the
 `security.authenticationMethods` of the application config.
 
## Implementing your provider
Every provider should be inherited from CustomWebDavProvider and implement all abstract method of base class
