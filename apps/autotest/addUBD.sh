mkdir -p './node_modules/@ub-d'

if [ ! -d "./node_modules/@ub-d/iit-libbin" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-libbin" "./node_modules/@ub-d/"
fi

if [ ! -d "./node_modules/@ub-d/iit-crypto" ]; then
  ln -s "$(pwd)/../../../ub-d/packages/iit-crypto" "./node_modules/@ub-d/"
fi