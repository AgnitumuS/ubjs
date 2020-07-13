# -Scgi <------>- Support operators like C; Enable LABEL and GOTO(default for -MDelphi; Inlining
# -Cg PIC code >- for Linux library only (slowed code for program)
# -Ci <><------>- IO checking
# -O2 <><------>- optimization level
# -g -gl -gw2 -Xg- Generate debug information; Use line info unit (show more info with backtraces); DWARFv2 debug info; debug info in separate file
# -k'-rpath=$ORIGIN' - link to a library in the same folder as program
# -veiq -vw-n-h - verbose(errors, info, message numbers) no warnings, no notes, no hints
# -B <-><------>- build all
# -Se10 <------>- halts after 10 error.
# to switch to x64MM -dFPC_SYNCMEM should be removed and -dFPC_X64MM -dFPCMM_SERVER added

md .dcu/fpc-linux
md .dcu/fpc-win64
md bin/x86_64

if [%UB_SRC%]==[] (
  SET UB_SRC=../../../ub-server
)

fpc.exe -MDelphi -Sci -Ci -O2 -g -gl -gw2 -Xg -k-Lbin/fpc-linux -Tlinux -Px86_64 ^
  -veiq -vw-n-h- ^
  -Fi.dcu/fpc-linux -Fi$UB_SRC/libs/Synopse -Fi$UB_SRC/libs/Synopse/SQLite3 -Fi$UB_SRC/libs/Synopse/SyNode -Fi$UB_SRC/libs/synapse40/source/lib ^
  -Fl$UB_SRC/bin/fpc-linux ^
  -Fu$UB_SRC/libs/Synopse -Fu$UB_SRC/libs/Synopse/SQLite3 -Fu$UB_SRC/libs/Synopse/SyNode -Fu$UB_SRC/libs/synapse40/source/lib -Fu$LAZARUS_PATH/components/lazutils/lib/x86_64-linux -Fu. ^
  -FU.dcu/fpc-linux -FEbin/x86_64 -obin/x86_64/libubmail.so ^
  -dFPC_SYNCMEM ^
  -B -Se1 ./src/ubmail.dpr
@if errorlevel 1 goto err

fpc.exe -MDelphi -Sci -Ci -O2 -k-Lbin/fpc-linux -Twin64 -Px86_64 ^
  -veiq -vw-n-h- ^
  -Fi.dcu/fpc-win64 -Fi$UB_SRC/libs/Synopse -Fi$UB_SRC/libs/Synopse/SQLite3 -Fi$UB_SRC/libs/Synopse/SyNode -Fi$UB_SRC/libs/synapse40/source/lib ^
  -Fu$UB_SRC/libs/Synopse -Fu$UB_SRC/libs/Synopse/SQLite3 -Fu$UB_SRC/libs/Synopse/SyNode -Fu$UB_SRC/libs/synapse40/source/lib -Fu$LAZARUS_PATH/components/lazutils/lib/x86_64-win64 -Fu. ^
  -FU.dcu/fpc-win64 -FEbin/x86_64 -obin/x86_64/ubmail.dll ^
  -dFPC_SYNCMEM ^
  -B -Se1 ./src/ubmail.dpr
@if errorlevel 1 goto err

goto :eof


:err
@echo Build fail
EXIT 1

:eof
