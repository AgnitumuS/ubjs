#!/bin/sh

err()
{
  echo Testcase $TESTCASE failed
  exit 1
}

rm -f ./_autotestResults.json
rm -f ./last_result.log

TESTCASE='drop database'
rm -f ./*FTS.sqlite3

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
UB_DEV=true

ubcli createStore -cfg $UB_CFG -noLogo
if [ ! $? = 0 ]; then err; fi

ubcli initDB -host http://localhost:8880 -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -u admin -p admin -drop -create
if [ ! $? = 0 ]; then err; fi

TESTCASE=generateDDL
ubcli generateDDL -host http://localhost:8880 -cfg $UB_CFG -u admin -p admin -autorun
if [ ! $? = 0 ]; then err; fi

TESTCASE=initialize
ubcli initialize -cfg $UB_CFG -u admin -p admin -host http://localhost:8880
if [ ! $? = 0 ]; then err; fi

TESTCASE=autotest
ubcli autotest -cfg $UB_CFG -u admin -p admin -host http://localhost:8880 -noLogo -skipModules
if [ ! $? = 0 ]; then err; fi
