#  Package ub-server@5.4.1->5.4.3
### Changed:
 - allow to specify not existed or empty `logging.path` in config in case `logging.levels === []`.
 Userful for example in cases when all logs are redireted to stdout/err (ub --console-log)
- if `reverseProxy.kind` === `nginx` then default values for reverse proxy config are:
    - `reverseProxy.remoteIPHeader`: 'X-Real-IP'
    - `reverseProxy.sendFileHeader`: 'X-Accel-Redirect'
    - `reverseProxy.sendFileLocationRoot`: HTTPServer.externalURL.hostname with dots replaced to '-' (http://myhost.com - > myhost-com)
  Please, **upgrade `@unitybase/ub` to at last @5.0.46** to default values work properly.
 - log files now use LF as line end (before this pathc CR)
 - disable colorizing of output in case stdout is redirected to not a TTY

#  Package blob-stores@5.0.12->5.0.22
### Fixed:
 - **SECURITY** `getDocument` endpoint will check user have ELS right to entity `select` method before getting document ID.
 Without this patch in case entity do not use RLS unauthorized access to document is possible      

#  Package ubcli@5.1.2->5.1.4
### Changed:
 - `ubcli generateNginxConfig` now use `httpServer.externalURL` from server config for
 generation of nginx proxy server_name.
  - many improvements to nginx config generated `ubcli generateNginxConfig` - 
  **we recommend to recreate reverse proxy configs** after upgrading ub server and all packages.
### Fixed:
 - `ubcli initDB -drop` for SQLite3 will also delete possible WAL logs (-wal and -shm files)
 - `ubcli generateNginxConfig` will add `expire` and `Cache-Control` for
  internal locations to force browser to check resources on server is actual. For DEV modes
  set expires to 0 in `../app` internal location

#  Package ubs@5.1.17->5.1.25
### Changed:
 - `ReportViewer` - styles for `td,th` is removed, so now table header will use body style (see ReportViewer.js line 6)