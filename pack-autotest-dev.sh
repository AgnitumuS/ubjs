#!/bin/bash
err_report() {
  >&2 echo "Error on line $1"
  exit 1
}
# On error
trap 'err_report $LINENO' ERR

ROOT=$PWD
npx lerna clean -y
npx lerna bootstrap
cd $ROOT/packages/mailer
npm run build
cd $ROOT/packages/compressors
npm run build

cd $ROOT/apps/autotest

ub-app-pack -m DEV
exit 0

# deploy
# mkdir -p ./autotest
# rm -rf ./autotest/{node_modules,models}
# tar -zxf autotest.tar.gz -C ./autotest
# ln -sf `pwd`/autotest/node_modules/@unitybase/ubcli/bin/ubcli.js ./autotest/node_modules/.bin/ubcli
# ln -sf `pwd`/autotest/node_modules/@unitybase/ubcli/bin/ub-migrate.js ./autotest/node_modules/.bin/ub-migrate
# mkdir -p ./autotest/{localdb,logs,stores,inetpub}
# sudo chown -R unitybase:unitybase `pwd`/autotest
