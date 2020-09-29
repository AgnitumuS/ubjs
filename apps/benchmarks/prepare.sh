#!/bin/bash
# Create a database & fill it with initial data

PORT=8881

err() {
  echo Testcase $TESTCASE failed
  exit 1
}

if [ -z "$UB_CFG" ]
then
  UB_CFG=ubConfig.json
  echo "A default config $UB_CFG will be used"
fi
[ -z "$UB_DBA" ] && UB_DBA=sa
[ -z "$UB_DBAPWD" ] &&  UB_DBAPWD=sa

if [ -z "$UB_APP" ]; then
  export UB_APP='tpw'
fi

if [ -z "$UB_APPDATA" ]; then
  export UB_APPDATA='./'
fi

TESTCASE='init database'

npx ubcli createStore -cfg $UB_CFG -noLogo
if [ ! $? = 0 ]; then err; fi

npx ubcli initDB -host http://localhost:$PORT -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p admin -drop -create -cd
if [ ! $? = 0 ]; then err; fi

TESTCASE='generateDDL'
npx ubcli generateDDL -host http://localhost:$PORT -cfg $UB_CFG -autorun
if [ ! $? = 0 ]; then err; fi

TESTCASE='initialize'
npx ubcli initialize -host http://localhost:$PORT -cfg $UB_CFG -u root
if [ ! $? = 0 ]; then err; fi

echo Application is ready
