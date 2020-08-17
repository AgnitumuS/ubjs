#!/bin/bash

err_report() {
  >&2 echo "Error on line $1 for $PROCESS"
  exit 1
}
# On error
trap 'err_report $LINENO' ERR

PROCESS='Drop database'
rm -rf database

PROCESS='Drop stores'
rm -rf stores

PROCESS='Drop logs'
rm -rf logs

PROCESS='Create logs folder'
mkdir logs
PROCESS='Create database folder'
mkdir database
PROCESS='Create stores folder'
mkdir -p stores/default/_temp

PROCESS='Init database'
if [ -z "$UB_CFG" ]; then
  UB_CFG=ubConfig.json
fi
if [ -z "$UB_DBA" ]; then
  UB_DBA=sa
fi
if [ -z "$UB_DBAPWD" ]; then
  UB_DBAPWD=sa
fi

npx ubcli createStore -cfg $UB_CFG -noLogo

PASSWORD_FOR_ADMIN='admin'
npx ubcli initDB -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p $PASSWORD_FOR_ADMIN -drop -create

PROCESS='Generate DDL'
npx ubcli generateDDL -cfg $UB_CFG -autorun -out ./database

PROCESS='Initialize'
npx ubcli initialize -cfg $UB_CFG -u root -p root

PROCESS='Fill demo data'
npx ub-migrate -u admin -p admin
