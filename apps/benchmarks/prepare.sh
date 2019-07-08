#!/bin/bash
# Create a database & fill it with initial data

PORT=8881

err()
{
  echo Testcase $TESTCASE failed
  exit 1
}

# Check whether UB_CFG set and contains a value, not spaces
if [ -z ${UB_CFG+x} ] || [ -z "${UB_CFG// }" ]; then
  UB_CFG=ubConfig.json
  echo A default config $UB_CFG will be used
fi
# Check whether DBA set and contains a value, not spaces
if [ -z ${DBA+x} ] || [ -z "${DBA// }" ]; then
  DBA=sa
fi
# Check whether DBA_PWD set and contains a value, not spaces
if [ -z ${DBA_PWD+x} ] || [ -z "${DBA_PWD// }" ]; then
  DBA_PWD=sa
fi
#export UB_DEV=true

TESTCASE='init database'

npx ubcli createStore -cfg $UB_CFG -noLogo
if [ ! $? = 0 ]; then err; fi

npx ubcli initDB -host http://localhost:$PORT -cfg $UB_CFG -dba $DBA -dbaPwd $DBA_PWD -u admin -p admin -drop -create -cd
if [ ! $? = 0 ]; then err; fi

TESTCASE=generateDDL
npx ubcli generateDDL -host http://localhost:$PORT -cfg $UB_CFG -u admin -p admin -autorun
if [ ! $? = 0 ]; then err; fi

TESTCASE=initialize
npx ubcli initialize -host http://localhost:$PORT -cfg $UB_CFG -u admin -p admin
if [ ! $? = 0 ]; then err; fi

echo Application is ready
