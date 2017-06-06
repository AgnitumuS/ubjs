WHERE yarn
IF %ERRORLEVEL% NEQ 0 (set NPM_CLI=npm) else (set NPM_CLI=yarn)
call %NPM_CLI% install
call .\node_modules\.bin\lerna bootstrap --npm-client=%NPM_CLI%

cd .\packages\ubcli
call npm link
cd ..\..

if exist ..\ub-e\packages (
  cd ..\ub-e
  call %NPM_CLI% install
  call .\node_modules\.bin\lerna bootstrap --npm-client=%NPM_CLI%
  cd ..\ubjs
) else (
  echo UnityBase enterprise repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-e.git - clone it
  echo otherwise remove all @ub-e/* models from .\apps\autotest\ubConfig*.json 
)

if exist ..\ub-d\packages (
  cd ..\ub-d
  call %NPM_CLI% install
  call .\node_modules\.bin\lerna bootstrap --npm-client=%NPM_CLI%
  cd ..\ubjs
) else (
  echo UnityBase Defense repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-d.git - clone it
  echo otherwise remove all @ub-d/* models from .\apps\autotest\ubConfig*.json 
)
