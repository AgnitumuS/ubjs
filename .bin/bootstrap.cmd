if exist ..\ub-e\packages (
  cd ..\ub-e
  call npm i
  call npx lerna bootstrap
  @if errorlevel 1 goto err
  cd ..\ubjs
) else (
  echo UnityBase enterprise repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-e.git - clone it
  echo otherwise remove all @ub-e/* models from .\apps\autotest\ubConfig*.json 
)

if exist ..\ub-d\packages (
  cd ..\ub-d
  call npm i
  call npx lerna bootstrap
  @if errorlevel 1 goto err
  cd ..\ubjs
) else (
  echo UnityBase Defense repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-d.git - clone it
  echo otherwise remove all @ub-d/* models from .\apps\autotest\ubConfig*.json 
)

call npm i
@if errorlevel 1 goto err
call npx lerna bootstrap
@if errorlevel 1 goto err

cd .\packages\ubcli
call npm link
cd ..\..

if not defined SRC (
  echo on
  echo To compile a native modules you need:
  echo  - checkout a UnityBase server sources 
  echo  - set environment variable SRC to Source folder location
  echo  - execute command `npm run build:native`
  echo Compilation use a Delphi@XE2-sp4 Delphi@7 and InnoSetup@5.5.9 - all of them MUST be installed
  echo In case you do not have access to Server Sources or compilers - run a 
  echo   `npm run replace-native` in autotest folder
  echo This will install latest compiled packages from registry
  exit 0
)

call npm run build:native
@if errorlevel 1 goto err

@goto end

:err
@echo Bootstrap failed
EXIT /B 1

:end
