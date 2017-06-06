call npm i --prefer-offline
call .\node_modules\.bin\lerna bootstrap

cd .\packages\ubcli
call npm link
cd ..\..

if exist ..\ub-e\packages (
  cd ..\ub-e
  call npm i --prefer-offline
  call .\node_modules\.bin\lerna bootstrap
  cd ..\ubjs
) else (
  echo UnityBase enterprise repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-e.git - clone it
  echo otherwise remove all @ub-e/* models from .\apps\autotest\ubConfig*.json 
)

if exist ..\ub-d\packages (
  cd ..\ub-d
  call npm i --prefer-offline
  call .\node_modules\.bin\lerna bootstrap
  cd ..\ubjs
) else (
  echo UnityBase Defense repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-d.git - clone it
  echo otherwise remove all @ub-d/* models from .\apps\autotest\ubConfig*.json 
)

if not defined SRC (
  echo To compile a native modules you need:
  echo  - checkout a UnityBase server sources 
  echo  - set environment variable SRC to Source folder location
  echo  - execute command `npm run build:native`
  echo
  echo Compilation use a Delphi@XE2-sp4 Delphi@7 and InnoSetup@5.5.9 - all of them MUST be installed
  echo
  echo In case you do not have access to Server Sources or compilers - run a `npm run replace-native` in autotest folder
  echo this command will install latest compiled packages from registry
  exit 1
)

call npm run build:native


