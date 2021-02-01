mkdir -p './node_modules/@ub-d'

if [ ! -d "./node_modules/@ub-d/iit-libbin" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-libbin" "./node_modules/@ub-d/"
fi

if [ ! -d "./node_modules/@ub-d/iit-sign-web" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-sign-web" "./node_modules/@ub-d/"
fi

if [ ! -d "./node_modules/@ub-d/iit-sign-js" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-sign-js" "./node_modules/@ub-d/"
fi


if [ ! -d "./node_modules/@ub-d/iit-crypto" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-crypto" "./node_modules/@ub-d/"
fi

mkdir -p './node_modules/@ub-e'

if [ ! -d "./node_modules/@ub-e/pdfsign" ]; then
  ln -s "$(pwd)/../../../ub-e/packages/pdfsign" "./node_modules/@ub-e/"
fi