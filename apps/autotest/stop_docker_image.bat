rem set /p containerid=<onlyoffice.pid
rem docker stop %containerid%
docker stop onlyoffice
rem rm .\onlyoffice.pid