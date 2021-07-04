unit uUBCompressors;

{$IFDEF FPC}
  {$MODE Delphi}
{$ENDIF}

interface

uses 
  SysUtils, SpiderMonkey, SyNodePluginIntf, SynCommons, SynZip, SyNodeSimpleProto;

type
  TUBCompressorsPlugin = class(TCustomSMPlugin)
  private
  protected
    procedure Init(const rec: TSMPluginRec); override;
  end;

  {$M+}

  { TubZipReader }

  TubZipReader = class(TZipRead)
  private
    function isFileNameFlderAlike(const fn: TFileName): boolean;
    function getFileNames: TStringDynArray;
    function GetFileCount: integer;
  protected
    property _fileNames: TStringDynArray read GetFileNames;
  published
    property fileCount: integer read GetFileCount;
    /// only files (foilders are excluded)
    function fileNames(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    /// files and folders
    function getAllFilesInfo(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    function unZipToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    function unZipAllToDir(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    function unZipFileAsText(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    function unZipFileAsArrayBuffer(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
  end;

  { TubZipWriter }

  TubZipWriter = class(TZipWrite)
  private
  protected

  published
    //procedure addFile(const fileName: TFileName; [zipFileNale: string]);
    function addFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    // addZipEntry(reader, index, fileName)
    function addZipEntry(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
    function add(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
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
  {$IFDEF WIN32}
  SynBZ,
  {$ENDIF}
  SyNodeProto,
  jsbUtils;


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
  dataBin: pointer;
  dataBinLength: uint32;
const
  f_usage = 'usage: new TubZipReader(data: String|ArrayBuffer)';
  // data: String - path to file
begin
  if (argc<1) then
    raise ESMException.Create(f_usage);

  if (vp.argv[0].isString) then begin //fileName
    fName := vp.argv[0].asJSString.ToString(aCx);
    Result := TubZipReader.Create(fName);
  end else if vp.argv^[0].isObject then begin
    if not vp.argv^[0].asObject.GetBufferDataAndLength(dataBin, dataBinLength) then
      raise ESMException.CreateUTF8('Can`t read data as byte array', []);
    Result := TubZipReader.Create(dataBin, dataBinLength);
  end else
    raise ESMException.Create(f_usage);
end;

{ TubZipReader }

function TubZipReader.GetFileCount: integer;
begin
  // if zip contain inner folders we got it with empty names
  Result := Count;
end;

function TubZipReader.isFileNameFlderAlike(const fn: TFileName): boolean;
begin
   Result := (fn='') or (fn[length(fn)]='\');
end;

function TubZipReader.getFileNames: TStringDynArray;
var
  l, i, num: integer;
begin
  l := length(Entry); num := 0;
  setLength(Result, fileCount);
  for I := 0 to l-1 do
    if not isFileNameFlderAlike(Entry[i].zipName) then begin
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
    if not isFileNameFlderAlike(Entry[i].zipName) then begin
      val.asJSString := cx^.NewJSString(SetDirSeparators(Entry[i].zipName));
      r := pObj.SetElement(cx, num, val);
      inc(num);
      Assert(r);
    end;
  val.asObject := pObj;
  vp.rval := val;
  Result := true;
end;

function TubZipReader.getAllFilesInfo(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
var
  i, L, num: integer;
  val: jsval;
  pEntriesArr, pValObj: PJSObject;
  fn: TFileName;
begin
  pEntriesArr := cx.NewArrayObject(fileCount);
  L := length(Entry); num := 0;
  for I := 0 to L - 1 do begin
    if Entry[i].infoDirectory = nil then
      continue;
    pValObj := cx.NewObject(nil);
    fn := SetDirSeparators(Entry[i].zipName);
    pValObj.SetProperty(cx, 'name', cx.NewJSString(fn).ToJSVal);
    pValObj.SetProperty(cx, 'dir', jsval.BooleanValue(Entry[i].infoDirectory.IsFolder));
    if not isFileNameFlderAlike(Entry[i].zipName) then
      pValObj.SetProperty(cx, 'index', jsval.Int32Value(num));
    inc(num);
    pEntriesArr.SetElement(cx, num, pValObj.ToJSValue);
  end;
  val.asObject := pEntriesArr;
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
  l, i, en: integer;
begin
  if (argc <> 1) or (not vp.argv[0].isString) then
    raise ESMException.Create(cUSAGE);
  fDir := vp.argv[0].asJSString.toString(cx);
  fDir := IncludeTrailingPathDelimiter(fDir);
  l := length(Entry); en := 0;
  for I := 0 to l-1 do
    if not isFileNameFlderAlike(Entry[i].zipName) then begin
      if not UnZip(en, fDir) then begin
        vp.rval := jsval.FalseValue;
        raise ESMException.CreateUTF8('UZip: fail to unzip #% entry ''%'' into ''%''', [en, Entry[i].zipName, fDir]);
      end;
      inc(en);
    end else begin
      if Entry[i].zipName <> '' then
        ForceDirectories(Entry[i].zipName);
    end;
  val.asBoolean := true;
  vp.rval := val;
  Result := true;
end;

function TubZipReader.unZipFileAsText(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  cUSAGE = 'usage unZipFileAsText(const fileIndex: number): string';
var
  res: ZipString;
  val: jsval;
begin
  if (argc <> 1) or (not vp.argv^[0].isInteger) then
    raise ESMException.Create(cUSAGE);
  res := UnZip(vp.argv^[0].asInteger);
  if not IsValidUTF8(res) then begin
    val := cx.EmptyString.ToJSVal; // JSZIp compatible
    //raise ESMException.Create('uncompressed data is not a valid UTF8 string');
  end else
    val := cx.NewJSString(RawUtf8(res)).ToJSVal;
  vp.rval := val;
  Result := true;
end;

function TubZipReader.unZipFileAsArrayBuffer(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  cUSAGE = 'usage unZipFileAsArrayBuffer(const fileIndex: number): ArrayBuffer';
var
  res: ZipString;
  buf: PJSObject;
  bufOut: pointer;
begin
  if (argc <> 1) or (not vp.argv^[0].isInteger) then
    raise ESMException.Create(cUSAGE);
  res := UnZip(vp.argv^[0].asInteger);
  if length(res) = 0 then
    vp.rval := jsval.NullValue
  else begin
    buf := cx.NewArrayBuffer(length(res));
    bufOut := buf.GetArrayBufferData;
    Move(res[1], bufOut^, length(res));
    vp.rval := buf.ToJSValue;
  end;
  Result := true;
end;

{ TubZipWriter }

//procedure TubZipWriter.addFile(const fileName: TFileName);
function TubZipWriter.addFile(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
// usage addFile(const fileName: string, [zipName: string])';
var
  fName: TFileName;
  zipName: TFileName;
begin
  result := checkFuncArgs(cx, argc, vp, [atStr, atStr or atVoid]);
  if not result then exit;
  fName := vp.argv[0].asJSString.toString(cx);
  if (argc > 1) then begin
    zipName := vp.argv[1].asJSString.toString(cx);
    AddDeflated(fName, true, 6, zipName);
  end else
    AddDeflated(fName);
end;

function TubZipWriter.addZipEntry(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
const
  ERR = 'addZipEntry: first arg must be ZipRTead instance';
 //addZipEntry(reader: ZipReader; index: integer; fn: string)';
var
  r: TubZipReader;
  inst: PSMInstanceRecord;
  idx: integer;
begin
  result := checkFuncArgs(cx, argc, vp, [atObj, atI32]);
  if not result then exit;
  try
    if not IsInstanceObject(cx, vp.argv^[0], inst) then
      raise ESMException.Create(ERR);
    if not (inst.instance is TubZipReader) then
      raise ESMException.Create(ERR);
    idx := vp.argv^[1].asInteger;
    r := TubZipReader(inst.instance);
    if idx >= length(r.Entry) then
      raise ESMException.CreateUTF8('Entry % is out of bounds', [idx]);
    AddFromZip(r.Entry[idx])
  except
    on E: Exception do begin Result := false; JSError(cx, E); end;
  end;
end;

function TubZipWriter.add(cx: PJSContext; argc: uintN; var vp: JSArgRec): Boolean;
// usage add(fn: string; data: string|ArrayBufferAlike)';
var
  fn: string;
  pData: pointer;
  dataLen: uint32;
  tmpStr: RawByteString;
  v1: jsval;
begin
  result := checkFuncArgs(cx, argc, vp, [atStr, atStr or atBuf]);
  if not result then exit;
  try
    fn := vp.argv^[0].asJSString.ToString(cx);
    v1 := vp.argv^[1];
    if v1.isString then begin
      tmpStr := v1.asJSString.ToString(cx);
      pData := pointer(tmpStr);
      dataLen := length(tmpStr);
    end else // buffer
      v1.asObject.GetBufferDataAndLength(pData, dataLen);
    AddDeflated(fn, pData, dataLen);
  except
    on E: Exception do begin Result := false; JSError(cx, E); end;
  end;
end;


{ TubZipWriterProtoObject }

function TubZipWriterProtoObject.NewSMInstance(aCx: PJSContext; argc: uintN; var vp: JSArgRec): TObject;
var
  fName: TFileName;
const
  f_usage = 'usage: new TubZipWriter([fileName]: String)';
begin
  if (argc>1) or ((argc = 1) and not vp.argv^[0].isString) then
    raise ESMException.Create(f_usage);
//  fName := JSString_TO_UnicodeString(aContext.cx, JSVAL_TO_STRING(in_argv[0]));
  if argc = 1 then begin
    fName := vp.argv[0].asJSString.toString(aCx);
    Result := TubZipWriter.Create(fName);
  end else
    Result := TubZipWriter.Create();
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
