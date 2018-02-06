set EXTERNAL_LIBS_PATH="..\..\..\..\ub-server\libs"

rem set LAZARUS_PATH="\usr\local\share\lazarus" - should be set externally
if not defined LAZARUS_PATH (
  echo LAZARUS_PATH environment variable must be defined
  exit 1
)

set SRC_PATH=.\src
set BIN_PATH=.\bin\x64
set LIB_PATH=%BIN_PATH%\lib

if not exist %BIN_PATH% mkdir %BIN_PATH%
if not exist %LIB_PATH% mkdir %LIB_PATH%

fpc -MDelphi -Scghi -WR -O1 -g -gl -l -vewnhibq -Fi%EXTERNAL_LIBS_PATH%\Synopse -Fi%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fi%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\FastMM4 -Fu%EXTERNAL_LIBS_PATH%\Synopse\SyNode -Fu%EXTERNAL_LIBS_PATH%\Synopse\SQLite3 -Fu%EXTERNAL_LIBS_PATH%\Synopse -Fu%EXTERNAL_LIBS_PATH%\synapse40\source\lib -Fu%LAZARUS_PATH%\lcl\units\x86_64-win64\win32 -Fu%LAZARUS_PATH%\lcl\units\x86_64-win64 -Fu%LAZARUS_PATH%\components\lazutils\lib\x86_64-win64 -Fu%LAZARUS_PATH%\packager\units\x86_64-win64 -Fu%SRC_PATH% -FU%LIB_PATH% -FE%BIN_PATH% -oubcanvas.dll -dLCL -dLCLwin32 -dSM52 %SRC_PATH%\UBCanvas.dpr