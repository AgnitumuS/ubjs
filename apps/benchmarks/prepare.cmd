rem Create a database & fill it with initial data

@echo on

SET PORT=8881

if not defined UB_HOME (
  SET UB_HOME=C:\UnityBase
  echo UB_HOME is not defined. Set default UB_HOME=%UB_HOME%
)

if not defined DBA (
  SET DBA=none
)

if not defined DBA_PWD (
  SET DBA_PWD=none
)

SET TESTCASE=init database
if not defined UB_CFG (
  SET UB_CFG=ubConfig.json
  echo A default config %UB_CFG% will be used
)

rem SET UB_DEV=true

call npx ubcli createStore -cfg %UB_CFG% -noLogo
@if errorlevel 1 goto err

call npx ubcli initDB -host http://localhost:%PORT% -cfg %UB_CFG% -dba %DBA% -dbaPwd %DBA_PWD% -u admin -p admin -drop -create
if errorlevel 1 goto err

SET TESTCASE=generateDDL
call npx ubcli generateDDL -host http://localhost:%PORT% -cfg %UB_CFG% -u admin -p admin -autorun
if errorlevel 1 goto err

SET TESTCASE=initialize
call npx ubcli initialize -cfg %UB_CFG% -host http://localhost:%PORT% -u admin -p admin
if errorlevel 1 goto err

goto :eof

:err
@echo Testcase %TESTCASE% fail
EXIT 1

:eof
echo Application is ready 
