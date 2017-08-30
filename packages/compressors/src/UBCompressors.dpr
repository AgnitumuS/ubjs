library UBCompressors;

uses
  FastMM4,
  SysUtils,
  Classes,
  Windows,
  SpiderMonkey,
  SyNodePluginIntf,
  uUBCompressors in 'uUBCompressors.pas';

const
  MAX_THREADS = 256;

  PluginType: TCustomSMPluginType = TUBCompressorsPlugin;

var
  ThreadRecs: array[0..MAX_THREADS] of TThreadRec;
  threadCounter: integer;

function InitPlugin(cx: PJSContext; exports_: PJSRootedObject; require: PJSRootedObject; module: PJSRootedObject; __filename: PWideChar; __dirname: PWideChar): boolean; cdecl;
var
  l: integer;
begin
  l := InterlockedIncrement(threadCounter);
  if l>=MAX_THREADS then
    raise Exception.Create('Too many thread. Max is 256');
  ThreadRecs[l].threadID := GetCurrentThreadId;
  ThreadRecs[l].plugin := PluginType.Create(cx, exports_, require, module, __filename, __dirname);
  result := true;
end;

function UnInitPlugin(): boolean;
var
  i: integer;
begin
  for I := 0 to MAX_THREADS - 1 do
    if ThreadRecs[i].threadID = GetCurrentThreadId then begin
      ThreadRecs[i].threadID := 0;
      FreeAndNil(ThreadRecs[i].plugin);
    end;
  result := true;
end;

exports InitPlugin;
exports UnInitPlugin;

begin
  IsMultiThread := True; //!!IMPORTANT for FastMM
  threadCounter := -1;
  FillMemory(@ThreadRecs[0], SizeOf(ThreadRecs), 0);
end.
 