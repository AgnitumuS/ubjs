#!/bin/bash

err() {
  echo Process $PROCESS failed
  exit 1
}

PROCESS='Drop database'
rm -rf database || err

PROCESS='Drop stores'
rm -rf stores || err

PROCESS='Drop logs'
rm -rf logs || err

PROCESS='Create logs folder'
mkdir logs || err
PROCESS='Create database folder'
mkdir database || err
PROCESS='Create stores folder'
mkdir stores || err
mkdir stores/default || err
mkdir stores/default/_temp || err

PROCESS='Init database'
# Check whether UB_CFG set and contains a value, not spaces
if [ -z ${UB_CFG+x} ] || [ -z "${UB_CFG// }" ]; then
  UB_CFG=ubConfig.json
fi
# Check whether UB_DBA set and contains a value, not spaces
if [ -z ${UB_DBA+x} ] || [ -z "${UB_DBA// }" ]; then
  UB_DBA=sa
fi
# Check whether UB_DBAPWD set and contains a value, not spaces
if [ -z ${UB_DBAPWD+x} ] || [ -z "${UB_DBAPWD// }" ]; then
  UB_DBAPWD=sa
fi

npx ubcli createStore -cfg $UB_CFG -noLogo || err

PASSWORD_FOR_ADMIN=admin
npx ubcli initDB -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p $PASSWORD_FOR_ADMIN -drop -create || err

PROCESS='Generate DDL'
npx ubcli generateDDL -cfg $UB_CFG -autorun -out ./database || err

PROCESS='Initialize'
npx ubcli initialize -cfg $UB_CFG -u root -p root || err

PROCESS='Fill demo data'
npx ub-migrate -u admin -p admin
