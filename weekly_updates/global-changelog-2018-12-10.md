#  Package ub-server@5.6.3->5.7.1
### Added:
 - Unix Domain Socket support for both server - host in config can be specified as 
 `unix:/path/to/socket.sock`) and `http` - URl can be specified as `http://unix:/path/to/socket.sock:/uri/path`
### Changed:
 - huge performance boots (up to 50% on techempower benchmark) as a result of:
    - internal UBQL->SQL builder optimizations (+5-15% to performance)
    - speed-up creation of JS objects what based on `native` prototypes
 (the most important is TubDataStore) - new implementation does not copy `native` methods/props
 from prototype to JS instance (+25% to performance)
    - `Session.reset` & `_timerLoop` functions now called from `native` using their `jsid`
    instead of names (+1% to performance)
### Fixed:
 - soft lock mixin message "Record with ID=doc_addresses for entity "3000019427301" is not locked"
  changed to "Record with ID=3000019427301 for entity "doc_addresses" is not locked"

#  Package adminui-pub@5.6.13->5.6.15
### Changed:
  - use a new function `AsyncConnection.setDocument` for files uploading
   

#  Package base@5.0.27->5.0.32
### Added:
 - default value (X-Conn-ID) for new `reverseProxy.remoteConnIDHeader` is added
 to `argv.getServerConfiguration`
 - `UBA_COMMON.haveAdminRole` method is added - check logged in user is a member of `admin` role
   
### Changed:
 - `SyncConnection.setDocument` can accept optional `dataEncoding` parameter.
 Set it to `base64` if content is a base64 encoded binary.
  - `UBA_COMMON.isSuperUser` method now return `true` only is user is exactly `admin` or `root`.
    Prev. implementation return `true` for any user what member of `admin` role. Method is useful 
    for example to prevent Session.on(`login`) event handlers for DDL generations
```
const UBA_COMMON = require('@unitybase/base').uba_common
Session.on('login', () => {
  if (UBA_COMMON.isSuperUser()) return
  // get data from other tables what may not exists while DDL is not ready
```

#  Package blob-stores@5.0.23->5.0.29
### Added:
 - `setDocument` endpoint now can accept a BLOB attribute content as a `base64` encoded string. 
  In this case new parameter `encoding=base64` should be added to setDocument URL.
  Content will be decoded before written to actual storing location.
  Also Sync & AsyncConnection's setDocument method is modified to support new parameter.
  Feature is useful for clients with limited binary (arrayBuffer) functionality, such as **React Native** 

#  Package cdn@5.0.66->5.0.73
### Changed:
 - restriction for CCEO (OKPO) length (8 or 10 chars) is removed from `cdn_organization`

#  Package org@5.1.25->5.1.33
### Changed:
  - use `UBA_COMMON.isSuperUser()` to prevent ORG.orgOnUserLogin from execution for `admin`
   or `root` because this users are used for DDL generation

#  Package ub-pub@5.2.19->5.2.23
### Added:
  - new function `AsyncConnection.setDocument` to easy call a `setDocument` endpoint

#  Package ubcli@5.2.4->5.2.6
### Added:
 - `generateNginxCfg` now support `reverseProxy.remoteConnIDHeader` and in case
  it is not empty adds a `proxy_set_header {{remoteConnIDHeader}} $connection;`
  section to nginx config
### Changed:
 - in case invalid command is passed to `ubcli` human readable error will be shown
