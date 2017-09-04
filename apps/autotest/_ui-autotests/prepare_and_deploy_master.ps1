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
cd C:\ub-e\packages\ube-pub
npm i systemjs@0.20.10-scoped --registry=http://registry.unitybase.info
npm i

cd c:\ubjs
npm run bootstrap

# fix / workaround for ubcli 
$c = Get-Content C:\ubjs\apps\autotest\node_modules\.bin\ubcli.cmd
$cx = $c -replace [Regex]::Escape('%UB_HOME%\ub  "%~dp0\..\..\..\..\packages\ubcli\bin\ubcli.js" %*'), '%UB_HOME%\ub  "%~dp0\..\..\..\..\..\packages\ubcli\bin\ubcli.js" %*'
set-content -Path C:\ubjs\apps\autotest\node_modules\.bin\ubcli.cmd $cx 

cd C:\ubjs\apps\autotest
npm run test

ub
