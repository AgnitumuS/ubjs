## Using WebDav

Add @ub-e/web-dav module to your app
```bash
npm i --save @ub-e/web-dav
```

And use it in your model main file with appropriate provider.
Sample below expose all application files to internet - do not do this in production environment
 
```js
const WebDav = require('@ub-e/web-dav')
const FsProvider = require('@ub-e/web-dav/providers/webDavFileSystemProvider')
WebDav.registerEndpoint('folders')
  .addProvider(new FsProvider({
    startsWith: 'fs',
    path: process.configPath
  }))
```
Now all application files is accessible from internet
 - on Windows using `\\localhost:8881\fs` in Explorer
 - on Linux type `dav://localhost:8881/fs` into Files -> Other locations 
  

## Authentication
 Current implementation support ONLY Negotiate authentication, so Negotiate must be present in the
 `security.authenticationMethods` key of application ubConfig
 
## Implementing your provider

Every provider should be inherited from CustomWebDavProvider and implement all abstract method of base class

## Available providers
 
 - `webDavFileSystemProvider` - expose any folder from server file system
 - `webDavDocAttrProvider` - TODO 
 `http[s]:\\sever:port\rootName\entity\attribute\id\main.ext`
