@rem PATH=..\..\..\..\ub-server\bin\d-win32;..\..\node_modules\.bin;%PATH%
@rem PATH=..\..\..\..\ub-server\bin\fpc-win32;..\..\node_modules\.bin;%PATH%
rem PATH=..\..\..\..\ub-server\bin\fpc-win64;..\..\node_modules\.bin;%PATH%

if [%UB_HOST%]==[] (
  SET UB_HOST=http://localhost:8881
)

if exist .\_autotestResults.json del .\_autotestResults.json
if exist .\last_result.log del .\last_result.log

SET TESTCASE=hello
ub -e "console.log('Start autotest')"
@if errorlevel 1 goto err

SET TESTCASE=drop database
if exist autotestDB.sqlite3 del autotestDB.sqlite3
if exist autotestFTS.sqlite3 del autotestFTS.sqlite3
if exist autotestSubjectsFTS.sqlite3 del autotestSubjectsFTS.sqlite3

SET TESTCASE=init database
if [%UB_CFG%]==[] (
  SET UB_CFG=ubConfig.json
)
rem SET UB_DEV=true

call npx ubcli createStore -cfg %UB_CFG% -noLogo
@if errorlevel 1 goto err

call npx ubcli initDB -host %UB_HOST% -cfg %UB_CFG% -u admin -p admin -drop -create
@if errorlevel 1 goto err

SET TESTCASE=generateDDL
call npx ubcli generateDDL -host %UB_HOST% -cfg %UB_CFG% -u admin -p admin -autorun
@if errorlevel 1 goto err

SET TESTCASE=initialize
call npx ubcli initialize -cfg %UB_CFG% -u admin -p admin -host %UB_HOST%
@if errorlevel 1 goto err

SET TESTCASE=autotest
call npx ubcli autotest -cfg %UB_CFG% -u admin -p admin -host %UB_HOST% -noLogo -skipModules
@if errorlevel 1 goto err


goto :eof


:err
@echo Testcase %TESTCASE% fail
EXIT 1

:eof