if not defined SRC (
  SET SRC=\SVN\M3\trunk\06-Source
  SET DELPHI_XE2=d:\delphixe2
  SET DELPHI_7=d:\delphi7
  SET INNO_SETUP=d:\Inno Setup 5\
)
set DCC="%DELPHI_XE2%\bin\dcc32.exe"
set DCC64="%DELPHI_XE2%\bin\dcc64.exe"

set BRCC="%DELPHI_XE2%\bin\brcc32.exe"
set DCC7="%DELPHI_7%\bin\dcc32.exe"
set BRCC7="%DELPHI_7%\bin\brcc32.exe"
set LIB=%SRC%\libs
set LIB_VENDOR=%SRC%\libs_vendor
set UB_CORE=%SRC%\core
set SYN_LIB=%LIB%\Synopse;%LIB%\Synopse\SQLite3;%LIB%\Synopse\SyNode
set ZEOS_LIB=%LIB%\Zeos\src;%LIB%\Zeos\src\core;%LIB%\Zeos\src\component;%LIB%\Zeos\src\plain;%LIB%\Zeos\src\parsesql;%LIB%\Zeos\src\dbc

set DCU_PATH=%SRC%\.dcu
set DCU7_PATH=%SRC%\.dcu\7
if defined BuildX64 (
set DCUX64_PATH=%SRC%\.dcu\x64
)

set EXE_PATH=%SRC%

set UNIT_PATH=%SYN_LIB%;%LIB%\FastMM;%ZEOS_LIB%;^
%LIB%\synapse40\source\lib;^
%LIB_VENDOR%\Bitis\novalibv3dcudex2;%LIB_VENDOR%\Bitis\novalibv3extdcudex2;^
%LIB%\Stemka\library

mkdir %~dp0x32
cd %~dp0..\..\mailer\src
%DCC7% -$D- -$L- -$Y- -B -Q -DRELEASE -E..\..\mailer-ssl\bin\x32 ^
  -Dopenssl ^
  -I%SYN_LIB% ^
  -R%SYN_LIB% ^
  -U%LIB%\FastMM;%SYN_LIB%;%UB_CORE%;%LIB%\synapse40\source\lib;"%DELPHI_7%\lib\Win32\release" ^
  -N%DCU7_PATH% ^
  UBMail.dpr

mkdir %~dp0x64
%DCC64% -$D- -$L- -$Y- -B -Q -DRELEASE -E..\..\mailer-ssl\bin\x64 ^
  -Dopenssl ^
  -NSSystem;Winapi;System.Win; ^
  -I%SYN_LIB% ^
  -R%SYN_LIB% ^
  -R%LIB%\Synopse ^
  -U%LIB%\FastMM;%SYN_LIB%;%UB_CORE%;%LIB%\synapse40\source\lib;"%DELPHI_XE2%\lib\Win64\release" ^
  -N%DCUX64_PATH% ^
  UBMail.dpr