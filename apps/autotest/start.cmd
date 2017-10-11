@echo off

cd /d %~dp0

docker start onlyoffice > docker.result
set /p docerresult=<docker.result
del .\docker.result

@echo on

IF %docerresult% == onlyoffice goto startUB

docker pull onlyoffice/documentserver
docker run -i -t -d -p 32771:80 --name onlyoffice onlyoffice/documentserver 

:startUB
SET ub=E:\UnityBase\ub.exe
SET ConfigFile=ubConfig.json
%ub% -dev -cfg %ConfigFile%

rem ub -calcIntegrity
rem ub -dev %~dp0\ubConfig.json

rem call stop_docker_image.bat