npm i -g npm
npm i -g lerna npx
npm i -g webpack

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("C:\Users\QA\Documents\UBStandard4.1.0-beta.6.zip", "C:\UnityBase")

$oldPath = $env:Path
[Environment]::SetEnvironmentVariable("Path", $oldPath + ";C:\UnityBase", "Process")
[Environment]::SetEnvironmentVariable("Path", $oldPath + ";C:\UnityBase", "Machine")
 
[Environment]::SetEnvironmentVariable("UB_HOME", "C:\UnityBase", "Process")
[Environment]::SetEnvironmentVariable("UB_HOME", "C:\UnityBase", "Machine")
 
ub -http register
npm i -g @unitybase/ubcli --registry=http://registry.unitybase.info

git config --global user.email "ubautomation.no-reply@softengi.com"
git config --global user.name "ubautomation ubautomation"

cd c:\
git clone https://ubautomation:w5M3h7g2xfuK@git-pub.intecracy.com/unitybase/ubjs.git
cd c:\ubjs
git log origin/uiautotest -n 1
git log master -n 1
#git checkout uiautotest
git merge origin/uiautotest -s recursive -Xours -v
cd c:\
git clone https://ubautomation:w5M3h7g2xfuK@gitlab.intecracy.com/unitybase/ub-d.git
git clone https://ubautomation:w5M3h7g2xfuK@gitlab.intecracy.com/unitybase/ub-e.git 

# ----- after clonning repositories

copy-item C:\ub-e\.npmrc -destination C:\ub-e\packages\dses
copy-item C:\ub-e\.npmrc -destination C:\ub-e\packages\odata
copy-item C:\ub-e\.npmrc -destination C:\ubjs\packages\ubq

cd C:\ub-e\packages\dses
npm i
cd C:\ub-e\packages\odata
npm i odatav4-parser@^1.3.3 --registry=http://registry.unitybase.info
npm i
cd C:\ub-e\packages\odata\node_modules\odatav4-parser
npm i 
cd C:\ub-e\packages\ube-pub
npm i systemjs@0.20.10-scoped --registry=http://registry.unitybase.info
npm i

cd C:\ub-d\packages\crl-monitor
npm i

cd c:\ubjs
npm run bootstrap

cd C:\ubjs\packages\ubq\
npm i @unitybase/mailer

# workaround to add links, removed by previous npm install (probably bug https://github.com/npm/npm/issues/17929)
cd C:\ubjs\packages\ubq\node_modules\@unitybase
cmd /c mklink /D base C:\ubjs\packages\base
cmd /c mklink /D ub C:\ubjs\packages\ub
cmd /c mklink /D uba C:\ubjs\packages\uba

# workaround to install @ub-d/iit-crypto
Remove-Item -Recurse C:\ubjs\apps\autotest\node_modules\@ub-d\iit-crypto -Force
Remove-Item -Recurse C:\ubjs\apps\autotest\node_modules\@unitybase\openid-connect -Force
New-Item -ItemType Directory "C:\dummy"
cd C:\dummy
npm i @ub-d/iit-crypto --save --registry=http://registry.unitybase.info
npm i @unitybase/openid-connect@^1.0.5 --save --registry=http://registry.unitybase.info

copy-item -Recurse C:\dummy\node_modules\@ub-d\iit-crypto -destination C:\ubjs\apps\autotest\node_modules\@ub-d
copy-item -Recurse C:\dummy\node_modules\@ub-d\iit-libbin -destination C:\ubjs\apps\autotest\node_modules\@ub-d

copy-item -Recurse C:\dummy\node_modules\@unitybase\openid-connect -destination C:\ubjs\apps\autotest\node_modules\@unitybase

copy-item C:\ub-e\.npmrc -destination C:\ubjs\apps\autotest\node_modules\@unitybase\openid-connect
cd C:\ubjs\apps\autotest\node_modules\@unitybase\openid-connect
npm i

# fix / workaround for ubcli 
$c = Get-Content C:\ubjs\apps\autotest\node_modules\.bin\ubcli.cmd
$cx = $c -replace [Regex]::Escape('%UB_HOME%\ub  "%~dp0\..\..\..\..\packages\ubcli\bin\ubcli.js" %*'), '%UB_HOME%\ub  "%~dp0\..\..\..\..\..\packages\ubcli\bin\ubcli.js" %*'
set-content -Path C:\ubjs\apps\autotest\node_modules\.bin\ubcli.cmd $cx 

cd C:\ubjs\apps\autotest
npm run test

ub
