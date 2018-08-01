unit UBAmqpPlugin;

interface

uses
  SyNodePluginIntf;

type
  TUBAmqpPlugin = class(TCustomSMPlugin)
  protected
    procedure Init(const rec: TSMPluginRec); override;
  end;

implementation

uses
  Classes,
  SysUtils,
  SynCommons,
  SpiderMonkey,
  UBAmqpProto;

{ TUBAmqpPlugin }

procedure TUBAmqpPlugin.Init(const rec: TSMPluginRec);
const
  attrs = JSPROP_READONLY or JSPROP_PERMANENT;
begin
  inherited Init(rec);
  rec.Exp.ptr.DefineFunction(rec.cx, 'parse_url', ubamqp_parse_url, 1, attrs);
  TAmqpTableProto.RegisterClass(rec.cx, rec.Exp);
  TAmqpConnectionProto.RegisterClass(rec.cx, rec.Exp);
  TAmqpChannelProto.RegisterClass(rec.cx, rec.Exp);
end;

end.

