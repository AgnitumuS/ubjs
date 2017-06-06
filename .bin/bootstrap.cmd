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


