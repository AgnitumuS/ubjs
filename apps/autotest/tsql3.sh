#!/bin/bash

# Host configuration (set UB_HOST in case of reverse proxy)
if [ -z "$UB_HOST" ]; then
  export UB_HOST='http://localhost:8881'
fi

if [ -z "$UB_APP" ]; then
  export UB_APP='autotest'
fi

if [ -z "$UB_APPDATA" ]; then
  export UB_APPDATA='./'
fi

export PLATFORM=lin

err() {
  echo Testcase "$TESTCASE" failed
  exit 1
}

rm -f "$UB_APPDATA"_autotestResults*.json
rm -f "$UB_APPDATA"last_result.log
rm -f "$UB_APPDATA"logs/*.log
rm -f "$UB_APPDATA"*FTS.sqlite3

TESTCASE='hello'
ub -e "console.log('Start autotest')" || err

TESTCASE='Check config'
ub -T > /dev/null || err

TESTCASE='drop database'
rm -f "$UB_APPDATA"localdb/*.sqlite3* || err
mkdir -p "$UB_APPDATA"localdb

rm -rf "$UB_APPDATA"stores/documents/simple || err
mkdir -p "$UB_APPDATA"stores/documents

rm -rf "$UB_APPDATA"stores/documents/simple || err

TESTCASE='init database'
# Check whether UB_CFG set and contains a value, not spaces
if [ -z "$UB_CFG" ]; then
  UB_CFG=ubConfig.json
fi
# Check whether UB_DBA set and contains a value, not spaces
if [ -z "$UB_DBA" ]; then
  UB_DBA=sa
fi
# Check whether UB_DBAPWD set and contains a value, not spaces
if [ -z "$UB_DBAPWD" ]; then
  UB_DBAPWD=sa
fi
# export UB_DEV=true

npx ubcli createStore -cfg $UB_CFG -noLogo || err

PASSWORD_FOR_ADMIN='admin'
npx ubcli initDB -cfg $UB_CFG -dba $UB_DBA -dbaPwd $UB_DBAPWD -p $PASSWORD_FOR_ADMIN -drop -create || err

TESTCASE=generateDDL
npx ubcli generateDDL -cfg $UB_CFG -autorun || err

TESTCASE=initialize
#npx ubcli initialize -cfg $UB_CFG -u admin -p $PASSWORD_FOR_ADMIN || err
npx ubcli initialize -cfg $UB_CFG -u root -p root || err

TESTCASE=autotest
# ubcli not available on server test environment - use direct call to ./node_modules/.bin/ubcli
/usr/bin/time -v ./node_modules/.bin/ubcli autotest -cfg $UB_CFG -u admin -p $PASSWORD_FOR_ADMIN -noLogo -skipModules
if [ ! $? = 0 ]; then
  if [ -f "./_autotestResults.json" ]; then
    cat ./_autotestResults.json;
  fi
  err;
fi

TESTCASE=migrate
# migrate -v for extended output
npx ubcli migrate -cfg $UB_CFG -u root  || err