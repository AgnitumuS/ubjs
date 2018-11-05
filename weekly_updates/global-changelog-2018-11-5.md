#  Package ub-server@5.4.4->5.4.6
### Changed:
 - SQL builder will add field alias for long (>20 chars) fields even if select
 clause contains only one field for all DBMS except MS SQL. Example:
 ```
 UB.Repository('tst_maindata').attrs(['manyValue']).limit(12).selectAsObject()
 // before this patch
 SELECT (SELECT group_concat(A01.destID)  FROM tst_maind_dict
 // after this patch
 SELECT (SELECT group_concat(A01.destID) AS C1  FROM tst_maind_dict
 ```
 This feature should fix Oracle shared statement cache
 - server will not echo logs to debugger console (FF or VSCode) anymore.
 Use `ub -cd -dev` for output all logs into to terminal window
 - speedup JS debugger
 - speedup server in `-dev` mode (do not queue debugger messages into internal memory queue if debugger is not attached)
### Fixed:
 - server hang when closing debugger while on breakpoint
 - FF hang in long-term debug session (by disabling echo of server-side loggs to FF console)
 - `clobTruncate` mixin will remove BOM from blob content before converting it to string
 - `clobTruncate` mixin will remove incompleate UTF8 sequences in the end of result string

#  Package adminui-pub@5.6.4->5.6.5
### Fixed:
 - visibility of ExtJS SVG based charts internal content (lines, dots, etc).
  Prevented CSS conflict between normalize.css & Ext chart svg's
 - exporting of grids to Excel in case cgid contains UBBadge columns

#  Package adminui-vue@1.0.26->1.0.27
### Changed:
 - change webpack configuration to decrease boundle for production build (from 847Kb to 630Kb)
### Fixed:
 - let's ElementUI popups be above all Ext popups by setting initial ElementUI.zIndex to 300000

#  Package blob-stores@5.0.22->5.0.23
### Fixed:
 -  historical BLOB stores will try to estimate revision number using select from ub_blobHistory in case previous
 BLOB store content is clean (use clear content for example).
 Previous implementation set the revision to `1` and if such revision already exists
 database on `ub_blobHistory` constraint fails.
   

# *New* Package hmr@0.0.1->1.0.21
### Added:
 - small FAQ added to README
### Changed:
 - only `change` file system event will be transmitted to browser

#  Package org@5.1.22->5.1.24
### Added:
 - auto generation of `org_employeeonstaff.tabNo` attribute. Length of generated code id defined 
 in `ubs_settings` `ubs.numcounter.autoIncrementalCodeLen` key. Default is 6 (codes like `000001`)
### Changed:
 - `org_staffunit.caption` generation algorithm: take a parent name from first parent with type !== 'STAFF'
  (instead of org_staffunit.parent)

#  Package ubs@5.1.25->5.1.26
### Changed:
 - `ubs.numcounter.autoIncrementalCodeLen` default value decreased from 12 to 6 - codes length `000001` is enough in most case 
