if not defined EXTERNAL_LIBS_PATH set EXTERNAL_LIBS_PATH=..\..\..\..\ub-server\libs
if not defined SHARED_LIBS_BASE set SHARED_LIBS_BASE=..\..\..\..\ub-server\bin

rem set LAZARUS_PATH="\usr\local\share\lazarus" - should be set externally
if not defined LAZARUS_PATH (
  echo LAZARUS_PATH environment variable must be defined
  exit 1
)

set SRC_PATH=..\mailer\src
set BIN_PATH=.\bin\x64
set LIB_PATH=%BIN_PATH%\lib

if not exist %BIN_PATH% mkdir %BIN_PATH%
if not exist %LIB_PATH% mkdir %LIB_PATH%
if not exist %LIB_PATH%\win64 mkdir %LIB_PATH%\win64
if not exist %LIB_PATH%\linux mkdir %LIB_PATH%\linux

fpc -Twin64 -Px86_64 -MDelphi -Scghi -WR -O1 -g -gl -l -vewnhibq -Fi%EXTERNAL_LIBS_PATH%\Synopse -Fi%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fi%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fu%EXTERNAL_LIBS_PATH%\Synopse -Fu%EXTERNAL_LIBS_PATH%\synapse40\source\lib -Fu%LAZARUS_PATH%\lcl\units\x86_64-win64\win32 -Fu%LAZARUS_PATH%\lcl\units\x86_64-win64 -Fu%LAZARUS_PATH%\components\lazutils\lib\x86_64-win64 -Fu%LAZARUS_PATH%\packager\units\x86_64-win64 -Fu%SRC_PATH% -FU%LIB_PATH%\win64 -FE%BIN_PATH% -oubmail.dll -dLCL -dLCLwin32 -dSM52 -dopenssl %SRC_PATH%\UBMail.dpr
fpc -Tlinux -Px86_64 -MDelphi -Scghi -Cg -O1 -g -gl -l -vewnhibq -FL%LAZARUS_PATH%\..\cross\lib\x86_64-linux\ld-linux-x86-64.so.2 -Fi%EXTERNAL_LIBS_PATH%\Synopse -Fi%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fi%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fu%EXTERNAL_LIBS_PATH%\Synopse -Fu%EXTERNAL_LIBS_PATH%\synapse40\source\lib -Fu%LAZARUS_PATH%\lcl\units\x86_64-linux -Fu%LAZARUS_PATH%\components\lazutils\lib\x86_64-linux -Fu%LAZARUS_PATH%\packager\units\x86_64-linux -Fu%SRC_PATH% -FU%LIB_PATH%\linux -FE%BIN_PATH% -k-L%SHARED_LIBS_BASE%\fpc-linux -olibubmail.so -dLCL -dLCLgtk2 -dSM52 -dopenssl %SRC_PATH%\UBMail.dpr