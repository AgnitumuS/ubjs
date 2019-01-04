#!/bin/bash

# Reverse proxy configuration
if [ -z "$UB_RP_CONFIG" ]; then
  export UB_RP_CONFIG=$PWD/rp-config-disable.json
fi

# Host configuration (set UB_HOST in case of reverse proxy)
if [ -z "$UB_HOST" ]; then
  export UB_HOST=http://localhost:8881
fi

err()
{
  echo Testcase $TESTCASE failed
  exit 1
}

rm -f ./_autotestResults*.json
rm -f ./last_result.log
rm ./logs/*.log

TESTCASE='hello'
ub -e "console.log('Start autotest')"

TESTCASE='drop database'
rm -f ./*.sqlite3*
if [ ! $? = 0 ]; then err; fi

rm -rf ./documents/simple
if [ ! $? = 0 ]; then err; fi

TESTCASE='init database'
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
# export UB_DEV=true

npx ubcli createStore -cfg $UB_CFG -noLogo
if [ ! $? = 0 ]; then err; fi

PASSWORD_FOR_ADMIN=admin

npx ubcli initDB -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p $PASSWORD_FOR_ADMIN -drop -create
if [ ! $? = 0 ]; then err; fi

TESTCASE=generateDDL
npx ubcli generateDDL -cfg $UB_CFG -autorun
if [ ! $? = 0 ]; then err; fi

TESTCASE=initialize
npx ubcli initialize -cfg $UB_CFG -u admin -p $PASSWORD_FOR_ADMIN
if [ ! $? = 0 ]; then err; fi

TESTCASE=autotest
npx ubcli autotest -cfg $UB_CFG -u admin -p $PASSWORD_FOR_ADMIN -noLogo -skipModules
if [ ! $? = 0 ]; then
  cat ./_autotestResults.json;
  if [ ! -z ${UB_TESTRES+x} ] && [ ! -z "${UB_TESTRES// }" ]; then
    mv ./_autotestResults.json ./_autotestResults$UB_TESTRES.json
  fi
  err;
fi
