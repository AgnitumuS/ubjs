@rem PATH=..\..\..\..\ub-server\bin\d-win32;..\..\node_modules\.bin;%PATH%
@rem PATH=..\..\..\..\ub-server\bin\fpc-win32;..\..\node_modules\.bin;%PATH%
rem PATH=..\..\..\..\ub-server\bin\fpc-win64;..\..\node_modules\.bin;%PATH%

if [%UB_HOST%]==[] (
  SET UB_HOST=http://localhost:8881
)

if [%UB_RP_CONFIG%]==[] (
  SET UB_RP_CONFIG=./rp-config-disable.json
)

if [%UB_APP%]==[] (
  SET UB_APP=autotest
)

if [%UB_APPDATA%]==[] (
  SET UB_APPDATA=.\
)

SET PLATFORM=win

if exist %UB_APPDATA%_autotestResults*.json del %UB_APPDATA%_autotestResults*.json
if exist %UB_APPDATA%last_result.log del %UB_APPDATA%last_result.log

SET TESTCASE=hello
ub -e "console.log('Start autotest')"
@if errorlevel 1 goto err

SET TESTCASE='Check config'
ub -T > NUL
@if errorlevel 1 goto err

@REM delete all sqlute3 db and wals
SET TESTCASE=drop database
del %UB_APPDATA%localdb\*.sqlite3*

SET TESTCASE=init database
if [%UB_CFG%]==[] (
  SET UB_CFG=ubConfig.json
)
rem SET UB_DEV=true

call npx ubcli createStore -cfg %UB_CFG% -noLogo
@if errorlevel 1 goto err

SET PASSWORD_FOR_ADMIN=admin
call npx ubcli initDB -host %UB_HOST% -cfg %UB_CFG% -p %PASSWORD_FOR_ADMIN% -drop -create
@if errorlevel 1 goto err

SET TESTCASE=generateDDL
call npx ubcli generateDDL -host %UB_HOST% -cfg %UB_CFG% -u admin -p %PASSWORD_FOR_ADMIN% -autorun
@if errorlevel 1 goto err

SET TESTCASE=initialize
call npx ubcli initialize -cfg %UB_CFG% -u admin -p %PASSWORD_FOR_ADMIN% -host %UB_HOST%
@if errorlevel 1 goto err

SET TESTCASE=autotest
call npx ubcli autotest -cfg %UB_CFG% -u admin -p %PASSWORD_FOR_ADMIN% -host %UB_HOST% -noLogo -skipModules
@if errorlevel 1 (
  type .\_autotestResults.json
  if not [%UB_TESTRES%]==[] rename .\_autotestResults.json _autotestResults%UB_TESTRES%.json
  goto err
)


goto :eof


:err
@echo Testcase %TESTCASE% fail
EXIT 1

:eof