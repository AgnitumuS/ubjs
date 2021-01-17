unit m_logger;

interface

uses
  {$ifdef LINUX}
   BaseUnix, SynCommons,
  {$endif}
  Classes, SysUtils;

procedure addMailLog(const s: string);

implementation

{$ifdef LINUX}
var
  MAIL_LOG_FD: cInt;
{$endif}

procedure addMailLog(const s: string);
var st: string;
  l: TSsize;
begin
  {$ifdef LINUX}
  st := FormatUTF8('%: %'#10, [NowToString, s]);
  l := fpWrite(MAIL_LOG_FD, pointer(st), length(st));
  {$endif}
end;

{$ifdef MAILAV_TEST}
{$ifdef LINUX}
initialization
  MAIL_LOG_FD := fpOpen('/tmp/ub_mailerlog.txt', O_APPEND or O_CREAT or O_WRONLY);
finalization
  fpClose(MAIL_LOG_FD);
{$endif LINUX}
{$endif MAILAV_TEST}

end.

