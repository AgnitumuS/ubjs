unit uUBCompressors;

{$IFDEF FPC}
  {$MODE Delphi}
{$ENDIF}

interface

uses 
  SyNodePluginIntf, SynCommons, SynZip;

type
  TUBCompressorsPlugin = class(TCustomSMPlugin)
  private
  protected
    procedure Init(const rec: TSMPluginRec); override;
  end;

  {$M+}
  TubZipReader = class(TZipRead)
  private
    function getFileNames: TStringDynArray;
    function GetFileCount: integer;
  protected

  published
    property fileNames: TStringDynArray read GetFileNames;
    property fileCount: integer read GetFileCount;
    function unZipToDir(fileIndex: integer; const dirName: string): boolean;
    function unZipAllToDir(const dirName: string): boolean;
  end;

  TubZipWriter = class(TZipWrite)
  private
  protected

  published
    procedure addFile(const fileName: string);
  end;
  {$M-}

  TubZipReaderProtoObject = class(TSMNewRTTIProtoObject)
  public
    function NewSMInstance(aCx: PJSContext; argc: uintN; vp: pjsval): TObject; override;
  end;

  TubZipWriterProtoObject = class(TSMNewRTTIProtoObject)
  public
    function NewSMInstance(aCx: PJSContext; argc: uintN; vp: pjsval): TObject; override;
  end;

implementation

uses
  SysUtils,
  SpiderMonkey, SynCommons,
  {$IFDEF WIN32}
  SynBZ,
  {$ENDIF}
  SynZip;

{ TUBCompressorsPlugin }
{$IFDEF WIN32}
function nsm_unBzipM2(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; cdecl;
const
  sUsage = 'usage unBzipM2(buffer: ArrayBuffer): ArrayBuffer';
var
  in_argv: PjsvalVector;
  BufObj: PJSObject;
  bufFrom: pointer;
  BufLength: uint32;

  bzStream: TSynMemoryStream;
  bzD: TBZDecompressor;

  bzUncompressedLength, lRead: Longint;
  OutBufObj: PJSObject;
  bufOut: pointer;
begin
  Result := false;
  try
    in_argv := vp.argv;
    if (argc<>1) or not in_argv[0].isObject then
     raise ESMException.Create(sUsage);
    BufObj := in_argv[0].asObject;
    if BufObj.IsArrayBufferObject then
     raise ESMException.Create(sUsage);
    BufLength := BufObj.GetArrayBufferByteLength;
    bufFrom := BufObj.GetArrayBufferData;
    if BufLength<4 then
      raise ESMException.Create('it is not M2 bz2 file');

    bzStream := TSynMemoryStream.Create(bufFrom, BufLength);

    try
      bzStream.Read(bzUncompressedLength, SizeOf(bzUncompressedLength));
      OutBufObj := cx.NewArrayBuffer(bzUncompressedLength);
      bufOut := OutBufObj.GetArrayBufferData;
      bzD := TBZDecompressor.Create(bzStream);
      try
        lRead := bzD.Read(bufOut^, bzUncompressedLength);
        if lRead <> bzUncompressedLength then
          raise Exception.Create('invalid BZ2 content');
      finally
        bzD.Free;
      end;
    finally
      bzStream.Free;
    end;

    vp.rval := OutBufObj.ToJSValue;
    Result := true;
  except
    on E: Exception do
      JSError(cx, E);
  end;
end;
{$ENDIF}

function nsm_gzipFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; cdecl;
const
  sUsage = 'usage gzipFile(fileNameFrom, fileNameTo: string)';
var
  in_argv: PjsvalVector;
  aFrom, aTo: TFileName;
  buffer: RawByteString;
begin
  Result := false;
  try
    in_argv := vp.argv;
    if (argc<>2) or not in_argv[0].isString or not in_argv[1].isString then
     raise ESMException.Create(sUsage);
    aFrom := in_argv[0].AsJsString.ToString(cx);
    aTo := in_argv[1].AsJsString.ToString(cx);
    buffer := StringFromFile(aFrom);
    if buffer = '' then
      raise Exception.CreateFmt('invalid file "%s"', [aFrom]);
    CompressGZip(buffer, True);
    if not FileFromString(buffer, aTo) then
      RaiseLastOSError;
    Result := true;
  except
    on E: Exception do
      JSError(cx, E);
  end;
end;

function nsm_gunzipFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean; cdecl;
const
  sUsage = 'usage gzipFile(fileNameFrom, fileNameTo: string)';
var
  in_argv: PjsvalVector;
  aFrom, aTo: TFileName;
  buffer: RawByteString;
begin
  Result := false;
  try
    in_argv := vp.argv;
    if (argc<>2) or not in_argv[0].isString or not in_argv[1].isString then
     raise ESMException.Create(sUsage);
    aFrom := in_argv[0].AsJSString.ToString(cx);
    aTo := in_argv[1].AsJSString.ToString(cx);
    buffer := StringFromFile(aFrom);
    if buffer = '' then
      raise Exception.CreateFmt('invalid file "%s"', [aFrom]);
    CompressGZip(buffer, False);
    if not FileFromString(buffer, aTo) then
      RaiseLastOSError;
    Result := true;
  except
    on E: Exception do
      JSError(cx, E);
  end;
end;

function TubZipReaderProtoObject.NewSMInstance(aCx: PJSContext; argc: uintN; vp: pjsval): TObject;
var
  in_argv: PjsvalVector;
  sm_inst: PSMInstanceRecord;
  valType: JSType;
  fName: string;
const
  f_usage = 'usage: new TubZipReader(from: String|TubBuffer)';
begin
  in_argv := JS_ARGV(aCx, vp);
  {$POINTERMATH ON}
  if (argc<>1) then
    raise ESMException.Create(f_usage);
  valType := JS_TypeOfValue(aCx, in_argv[0]);
  if (valType = JSTYPE_STRING) then begin //fileName
//    fName := JSString_TO_UnicodeString(aContext.cx, JSVAL_TO_STRING(in_argv[0]));
    fName := JSVAL_TO_STRING(in_argv[0]).ToSynUnicode(aCx);
    Result := TubZipReader.Create(fName);
  end else if (valType = JSTYPE_OBJECT) and IsInstanceObject(aCx, JSVAL_TO_OBJECT(in_argv[0]), sm_inst) and (sm_inst.Instance is TubBuffer) then begin
    with TubBuffer(sm_inst.Instance) do
      Result := TubZipReader.Create(PByteArray(DataString), Size);
  end else
    raise ESMException.Create(f_usage);
  {$POINTERMATH OFF}
end;

{ TubZipReader }

function TubZipReader.GetFileCount: integer;
var
  i: integer;
begin
  // if zip contain inner folders we got it with empty names
  Result := 0;
  for i := 0 to length(Entry)-1 do
    if Entry[i].zipName <> '' then
      inc(result);
end;

function TubZipReader.getFileNames: TStringDynArray;
var
  l, i, num: integer;
begin
  l := length(Entry); num := 0;
  setLength(Result, fileCount);
  for I := 0 to l-1 do
    if Entry[i].zipName <> '' then begin
      Result[num] := Entry[i].zipName;
      inc(num);
    end;
end;

function TubZipReader.unZipToBuffer(fileIndex: integer; const dest: TubBuffer): integer;
var
  s: RawByteString;
begin
  s := UnZip(fileIndex);
  Result := dest.write(pointer(s)^, length(s));
end;

function TubZipReader.unZipToDir(fileIndex: integer; const dirName: string): boolean;
begin
  Result := UnZip(fileIndex, dirName);
end;

function TubZipReader.unZipAllToDir(const dirName: string): boolean;
var
  l, i: integer;
begin
  l := length(Entry);
  for I := 0 to l-1 do
    if Entry[i].zipName <> '' then begin
      if not UnZip(i, dirName) then
        exit(false);
    end;
  Result := true;
end;

{ TubZipWriter }

procedure TubZipWriter.addBuffer(const fileName: string; const byteCount: cardinal; const source: TubBuffer);
var
  actualSizeToWrite: Cardinal;
begin
  if source <> nil then begin
    actualSizeToWrite := source.size - source.position;
    if actualSizeToWrite < byteCount then
      actualSizeToWrite := byteCount;
    AddDeflated(fileName, source.currentPos, actualSizeToWrite);
  end;
end;

procedure TubZipWriter.addFile(const fileName: string);
begin
  AddDeflated(fileName);
end;

{ TubZipWriterProtoObject }

function TubZipWriterProtoObject.NewSMInstance(aCx: PJSContext; argc: uintN; vp: pjsval): TObject;
var
  in_argv: PjsvalVector;
  fName: string;
const
  f_usage = 'usage: new TubZipWriter(fileName: String)';
begin
  in_argv := JS_ARGV(aCx, vp);
  {$POINTERMATH ON}
  if (argc<>1) or not JSVAL_IS_STRING(in_argv[0]) then
    raise ESMException.Create(f_usage);
//  fName := JSString_TO_UnicodeString(aContext.cx, JSVAL_TO_STRING(in_argv[0]));
  fName := JSVAL_TO_STRING(in_argv[0]).ToSynUnicode(aCx);
  {$POINTERMATH OFF}
  Result := TubZipWriter.Create(fName);
end;

procedure TUBCompressorsPlugin.Init(const rec: TSMPluginRec);
begin
  inherited;
{$IFDEF WIN32}
  rec.Exp.ptr.DefineFunction(rec.cx, 'unBzipM2', nsm_unBzipM2, 1, StaticROAttrs);
{$ENDIF}
  rec.Exp.ptr.DefineFunction(rec.cx, 'gunzipFile', nsm_gunzipFile, 2, StaticROAttrs);
  rec.Exp.ptr.DefineFunction(rec.cx, 'gzipFile', nsm_gzipFile, 2, StaticROAttrs);
end;

end.
