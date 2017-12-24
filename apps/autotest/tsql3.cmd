PORT=8881


del .\_autotestResults.json
del .\last_result.log

SET TESTCASE=drop database
del /Q .\*FTS.sqlite3


SET TESTCASE=init database
if [%UB_CFG%]==[] (
  SET UB_CFG=ubConfig.json
)
SET UB_DEV=true

call ubcli createStore -cfg %UB_CFG% -noLogo
@if errorlevel 1 goto err

call ubcli initDB -host http://localhost:%PORT% -cfg %UB_CFG% -dba %UB_DBA% -dbaPwd %UB_DBAPWD% -u admin -p admin -drop -create
@if errorlevel 1 goto err

SET TESTCASE=generateDDL
call ubcli generateDDL -host http://localhost:%PORT% -cfg %UB_CFG% -u admin -p admin -autorun
@if errorlevel 1 goto err

SET TESTCASE=initialize
call ubcli initialize -cfg %UB_CFG% -u admin -p admin -host http://localhost:%PORT%
@if errorlevel 1 goto err

SET TESTCASE=autotest
call ubcli autotest -cfg %UB_CFG% -u admin -p admin -host http://localhost:%PORT% -noLogo -skipModules
@if errorlevel 1 goto err


goto :eof


:err
@echo Testcase %TESTCASE% fail
EXIT 1

:eof