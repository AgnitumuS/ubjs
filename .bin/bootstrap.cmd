WHERE yarn
IF %ERRORLEVEL% NEQ 0 (set NPM_CLI=npm) else (set NPM_CLI=yarn)
call %NPM_CLI% install
call .\node_modules\.bin\lerna bootstrap --npm-client=%NPM_CLI%

if not exist .\apps\autotest\node_modules\@unitybase mkdir .\apps\autotest\node_modules\@unitybase
mklink /J .\apps\autotest\node_modules\@unitybase\adminui-pub .\packages\adminui-pub
mklink /J .\apps\autotest\node_modules\@unitybase\adminui-reg .\packages\adminui-reg
mklink /J .\apps\autotest\node_modules\@unitybase\base .\packages\base
mklink /J .\apps\autotest\node_modules\@unitybase\canvas .\packages\canvas
mklink /J .\apps\autotest\node_modules\@unitybase\cdn .\packages\cdn
mklink /J .\apps\autotest\node_modules\@unitybase\codemirror-full .\packages\codemirror-full
mklink /J .\apps\autotest\node_modules\@unitybase\cryptojs .\packages\cryptojs
mklink /J .\apps\autotest\node_modules\@unitybase\http-proxy .\packages\http-proxy
mklink /J .\apps\autotest\node_modules\@unitybase\mailer .\packages\mailer
mklink /J .\apps\autotest\node_modules\@unitybase\org .\packages\org
mklink /J .\apps\autotest\node_modules\@unitybase\stubs .\packages\stubs
mklink /J .\apps\autotest\node_modules\@unitybase\ub .\packages\ub
mklink /J .\apps\autotest\node_modules\@unitybase\ub-pub .\packages\ub-pub
mklink /J .\apps\autotest\node_modules\@unitybase\uba .\packages\uba
mklink /J .\apps\autotest\node_modules\@unitybase\ubm .\packages\ubm
mklink /J .\apps\autotest\node_modules\@unitybase\ubq .\packages\ubq
mklink /J .\apps\autotest\node_modules\@unitybase\ubs .\packages\ubs
mklink /J .\apps\autotest\node_modules\@unitybase\xlsx .\packages\xlsx
mklink /J .\apps\autotest\node_modules\@unitybase\pdf .\packages\pdf

if exist ..\ub-e\packages\ube-pub (
  if not exist .\apps\autotest\node_modules\@ub-e mkdir .\apps\autotest\node_modules\@ub-e
  mklink /J .\apps\autotest\node_modules\@ub-e\dses ..\ub-e\packages\dses
  mklink /J .\apps\autotest\node_modules\@ub-e\odata  ..\ub-e\packages\odata 
  mklink /J .\apps\autotest\node_modules\@ub-e\ube-pub ..\ub-e\packages\ube-pub
) else (
  echo UnityBase enterprise repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-e.git - clone it
  echo otherwise remove all @ub-e/* models from .\apps\autotest\ubConfig*.json 
)

if exist ..\ub-d\packages (
  if not exist .\apps\autotest\node_modules\@ub-d mkdir .\apps\autotest\node_modules\@ub-d
  mklink /J .\apps\autotest\node_modules\@ub-d\nm-dstu ..\ub-d\packages\nm-dstu 
  mklink /J .\apps\autotest\node_modules\@ub-d\iit-crypto ..\ub-d\packages\iit-crypto  
) else (
  echo UnityBase Defense repository not found
  echo If you have access to https://gitlab.intecracy.com/unitybase/ub-d.git - clone it
  echo otherwise remove all @ub-d/* models from .\apps\autotest\ubConfig*.json 
)
