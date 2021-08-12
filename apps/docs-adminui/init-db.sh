#!/bin/bash

err_report() {
  >&2 echo "Error on line $1 for $PROCESS"
  exit 1
}
# On error
trap 'err_report $LINENO' ERR

set -o allexport
source ./ubConfig-dev.env
set +o allexport

if [ -z "$UB_APP" ]; then
  export UB_APP='autotest'
fi

if [ -z "$UB_APPDATA" ]; then
  export UB_APPDATA='./'
fi

PROCESS='Drop database'
rm -rf $UB_APPDATA/localdb/*.sqlite3

PROCESS='Drop stores'
rm -rf $UB_APPDATA/stores

PROCESS='Drop logs'
rm -f $UB_APPDATA/logs/*

PROCESS='Create logs folder'
mkdir -p "$UB_APPDATA"logs
PROCESS='Create database folder'
mkdir -p "$UB_APPDATA"localdb
PROCESS='Create stores folder'
mkdir -p "$UB_APPDATA"stores/default/_temp

mkdir -p "$UB_APPDATA"inetpub

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

UB_PWD=admin
npx ubcli initDB -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p $UB_PWD -drop -create

PROCESS='Generate DDL'
npx ubcli generateDDL -cfg $UB_CFG -autorun -out $UB_APPDATA/localdb

PROCESS='Initialize'
npx ubcli initialize -cfg $UB_CFG -u root

PROCESS='Fill demo data'
ubcli migrate -u root
