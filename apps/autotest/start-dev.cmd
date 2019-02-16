@echo off

set UB_CFG=ubConfig.json

start ub -cfg %UB_CFG% -dev -cd
ping 127.0.0.1 -n 4 > nul
start npx ub-hmr -u admin -p admin
