unit uUBCompressors;

{$IFDEF FPC}
  {$MODE Delphi}
{$ENDIF}

interface

uses 
  SpiderMonkey, SyNodePluginIntf, SynCommons, SynZip, SyNodeSimpleProto;

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
    property _fileNames: TStringDynArray read GetFileNames;
  published
    property fileCount: integer read GetFileCount;
    function fileNames(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    //function unZipToDir(fileIndex: integer; const dirName: TFileName): boolean;
    function unZipToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    //function unZipAllToDir(const dirName: TFileName): boolean;
    function unZipAllToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
  end;

  TubZipWriter = class(TZipWrite)
  private
  protected

  published
    //procedure addFile(const fileName: TFileName);
    function addFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
  end;
  {$M-}

  TubZipReaderProtoObject = class(TSMSimpleRTTIProtoObject)
  public
    function NewSMInstance(aCx: PJSContext; argc: uintN; var vp: JSArgRec): TObject; override;
  end;

  TubZipWriterProtoObject = class(TSMSimpleRTTIProtoObject)
  public
    function NewSMInstance(aCx: PJSContext; argc: uintN; var vp: JSArgRec): TObject; override;
  end;

implementation

uses
  SysUtils,
  {$IFDEF WIN32}
  SynBZ,
  {$ENDIF}
  SyNodeProto;


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

function TubZipReaderProtoObject.NewSMInstance(aCx: PJSContext; argc: uintN; var vp: JSArgRec): TObject;
var
  fName: TFileName;
const
  f_usage = 'usage: new TubZipReader(fileName: String)';
begin
  {$POINTERMATH ON}
  if (argc<>1) then
    raise ESMException.Create(f_usage);
  if (vp.argv[0].isString) then begin //fileName
//    fName := JSString_TO_UnicodeString(aContext.cx, JSVAL_TO_STRING(in_argv[0]));
    fName := vp.argv[0].asJSString.ToString(aCx);
    Result := TubZipReader.Create(fName);
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

function TubZipReader.fileNames(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
var
  fc, i, L, num: integer;
  val: jsval;
  r: boolean;
  pObj: PJSObject;
begin
  fc := fileCount;
  pObj := cx.NewArrayObject(fc);
  L := length(Entry); num := 0;
  for I := 0 to L - 1 do
    if Entry[i].zipName <> '' then begin
      val.asJSString := cx^.NewJSString(SetDirSeparators(Entry[i].zipName));
      r := pObj.SetElement(cx, num, val);
      inc(num);
      Assert(r);
    end;
  val.asObject := pObj;
  vp.rval := val;
  Result := true;
end;

//function TubZipReader.unZipToDir(fileIndex: integer; const dirName: TFileName): boolean;
function TubZipReader.unZipToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  cUSAGE = 'usage unZipToDir(fileIndex: integer; const dirName: TFileName)';
var
  fIndex: integer; fDir: TFileName;
  val: jsval;
begin
  if (argc <> 2) or (not vp.argv[0].isInteger) or (not vp.argv[1].isString) then
    raise ESMException.Create(cUSAGE);
  fIndex := vp.argv[0].asInteger;
  fDir := vp.argv[1].asJSString.toString(cx);
  fDir := IncludeTrailingPathDelimiter(fDir);
  val.asBoolean := UnZip(fIndex, fDir);
  vp.rval := val;
  Result := true;
end;

//function TubZipReader.unZipAllToDir(const dirName: TFileName): boolean;
function TubZipReader.unZipAllToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  cUSAGE = 'usage unZipAllToDir(const dirName: TFileName)';
var
  fDir: TFileName;
  val: jsval;
  l, i: integer;
begin
  if (argc <> 1) or (not vp.argv[0].isString) then
    raise ESMException.Create(cUSAGE);
  fDir := vp.argv[0].asJSString.toString(cx);
  fDir := IncludeTrailingPathDelimiter(fDir);
  l := length(Entry);
  for I := 0 to l-1 do
    if Entry[i].zipName <> '' then begin
      if not UnZip(i, fDir) then begin
        val.asBoolean := false;
        vp.rval := val;
        exit(false);
      end;
    end;
  val.asBoolean := true;
  vp.rval := val;
  Result := true;
end;

{ TubZipWriter }

//procedure TubZipWriter.addFile(const fileName: TFileName);
function TubZipWriter.addFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  cUSAGE = 'usage addFile(const fileName: TFileName)';
var
  fName: TFileName;
begin
  if (argc <> 1) or (not vp.argv[0].isString) then
    raise ESMException.Create(cUSAGE);
  fName := vp.argv[0].asJSString.toString(cx);
  AddDeflated(fName);
  Result := true;
end;

{ TubZipWriterProtoObject }

function TubZipWriterProtoObject.NewSMInstance(aCx: PJSContext; argc: uintN; var vp: JSArgRec): TObject;
var
  fName: TFileName;
const
  f_usage = 'usage: new TubZipWriter(fileName: String)';
begin
  {$POINTERMATH ON}
  if (argc<>1) or not vp.argv[0].isString then
    raise ESMException.Create(f_usage);
//  fName := JSString_TO_UnicodeString(aContext.cx, JSVAL_TO_STRING(in_argv[0]));
  fName := vp.argv[0].asJSString.toString(aCx);
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
  defineClass(rec.cx, TubZipReader, TubZipReaderProtoObject, rec.Exp);
  defineClass(rec.cx, TubZipWriter, TubZipWriterProtoObject, rec.Exp);
end;

end.
