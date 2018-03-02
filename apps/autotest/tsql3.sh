#!/bin/sh

PORT=8881

err()
{
  echo Testcase $TESTCASE failed
  exit 1
}

rm -f ./_autotestResults.json
rm -f ./last_result.log

TESTCASE='hello'
ub -e "console.log('Start autotest')"

TESTCASE='drop database'
rm -f ./*FTS.sqlite3
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
export UB_DEV=true

npx ubcli createStore -cfg $UB_CFG -noLogo
if [ ! $? = 0 ]; then err; fi

npx ubcli initDB -host http://localhost:$PORT -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -u admin -p admin -drop -create
if [ ! $? = 0 ]; then err; fi

TESTCASE=generateDDL
npx ubcli generateDDL -host http://localhost:$PORT -cfg $UB_CFG -u admin -p admin -autorun
if [ ! $? = 0 ]; then err; fi

TESTCASE=initialize
npx ubcli initialize -cfg $UB_CFG -u admin -p admin -host http://localhost:$PORT
if [ ! $? = 0 ]; then err; fi

TESTCASE=autotest
npx ubcli autotest -cfg $UB_CFG -u admin -p admin -host http://localhost:$PORT -noLogo -skipModules
if [ ! $? = 0 ]; then err; fi
