#  Package ub-server@5.4.7->5.4.8
### Changed:
 - all server-side core_modules now embadedd into program as a resources
### Fixed:
 - remove 1 second delay for non-GET `http.xhr`(POST, PUT) requests on Linux by
 adding empty `Expect:` header to libCURL calls.

#  Package adminui-pub@5.6.8->5.6.10
### Fixed:
 - add nonce for unhandled rejection polyfill script to bypass a CSP rules in production mode  
 - BasePanel toolbar icon appearance for tool buttons without text but with drop-down 

#  Package adminui-reg@5.0.52->5.0.69
### Changed:
 - Content Security Policy for WebSocket is limited to (optional) URL from `application.customSettings.amqpNotificationUrl`
### Fixed:
 - Content Security Policy for WebSocket should be limited to `uiSettings.adminUI.amqpNotificationUrl`
 instead of server-side `application.customSettings.amqpNotificationUrl` setting

#  Package adminui-vue@1.0.27->1.0.31
### Changed:
 - adminui-vue auth form will hide ub auth under `options` if Kerberos or CERT2 is enabled

#  Package hmr@1.0.21->1.0.24
### Fixed:
 - fixed hmr server shutdown after file is changed (bug in version 1.0.21)

#  Package org@5.1.24->5.1.25
### Changed:
 - `org_employeeonstaff.caption` generation algorithm: in case `org_employeeonstaff.tabNo` is empty or whitespace - 
 don't use it in forming `org_employeeonstaff.caption`    

#  Package ubcli@5.1.4->5.2.2
### Added:
 - `npx ubcli` will display short commands descriptions in addition to command names
 - new command `meta-tr` added to `ubcli` to be used to transform *.meta attributes from Object to Array as
 required by latest Entity JSON schema:
```bash
 npx ubcli meta-tr -m /home/mpv/dev/ubjs/apps/autotest/models/TST/tst_document.meta
```   
### Changed:
 - `npx ubcli generateNgingCfg` will enable **HTTP 2.0** in case external URL is HTTPS  
 - `ln -s` sample for nginx config will change config file name to the site host name. 
   This help to manage a big productions configs.  
### Fixed:
 - `npx ubcli generateNgingCfg` will generate correct `ssl_ciphers` list
 - `npx ubcli generateNgingCfg` will add `listen 443 ssl;` in case external URL is HTTPS
