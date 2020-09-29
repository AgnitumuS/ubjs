rem Create a database & fill it with initial data

@echo on

SET PORT=8881

if not defined DBA (
  SET DBA=none
)

if not defined DBA_PWD (
  SET DBA_PWD=none
)

if [%UB_HOST%]==[] (
  SET UB_HOST=http://localhost:8881
)

if [%UB_APP%]==[] (
  SET UB_APP=tpw
)

if [%UB_APPDATA%]==[] (
  SET UB_APPDATA=./
)

SET TESTCASE=init database

if not defined UB_CFG (
  SET UB_CFG=ubConfig.json
  echo A default config %UB_CFG% will be used
)

rem SET UB_DEV=true

call npx ubcli createStore -noLogo
@if errorlevel 1 goto err

call npx ubcli initDB -host http://localhost:%PORT% -cfg %UB_CFG% -dba %DBA% -dbaPwd %DBA_PWD% -p admin -drop -create
if errorlevel 1 goto err

SET TESTCASE=generateDDL
call npx ubcli generateDDL -host http://localhost:%PORT% -cfg %UB_CFG% -autorun
if errorlevel 1 goto err

SET TESTCASE=initialize
call npx ubcli initialize -cfg %UB_CFG% -host http://localhost:%PORT% -u root
if errorlevel 1 goto err

goto :eof

:err
@echo Testcase %TESTCASE% fail
EXIT 1

:eof
echo Application is ready 
