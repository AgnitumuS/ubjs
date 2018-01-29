EXTERNAL_LIBS_PATH="../../../../ub-server/libs"
LAZARUS_PATH="/usr/local/share/lazarus"
SRC_PATH=./src
BIN_PATH=./bin/x64
LIB_PATH=$BIN_PATH/lib

mkdir -p $BIN_PATH
mkdir -p $LIB_PATH

fpc -MDelphi -Scghi -Cg -O1 -g -gl -l -vewnhibq -Fi$EXTERNAL_LIBS_PATH/Synopse -Fi$EXTERNAL_LIBS_PATH/Synopse/SQLite3 -Fi$EXTERNAL_LIBS_PATH/Synopse/SyNode -Fu$LAZARUS_PATH/lcl/units/x86_64-linux -Fu$LAZARUS_PATH/components/lazutils/lib/x86_64-linux -Fu$LAZARUS_PATH/packager/units/x86_64-linux -Fu$EXTERNAL_LIBS_PATH/FastMM4 -Fu$EXTERNAL_LIBS_PATH/Synopse/SyNode -Fu$EXTERNAL_LIBS_PATH/Synopse/SQLite3 -Fu$EXTERNAL_LIBS_PATH/Synopse -Fu$EXTERNAL_LIBS_PATH/synapse40/source/lib -Fu$SRC_PATH -FU$LIB_PATH -FE$BIN_PATH -olibubmail.so -dLCL -dLCLgtk2 -dSM52 $SRC_PATH/UBMail.dpr