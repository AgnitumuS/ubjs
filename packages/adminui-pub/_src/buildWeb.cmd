@echo on
SET DT=%date%%time%
SET DT=%DT:/=%
SET DT=%DT:-=%
SET DT=%DT:.=%
SET DT=%DT:,=%
SET DT=%DT::=%



cd ..\..

rem "%SENCHA%\sencha" --nologo compile -classpath=.\jslibs\tinymce exclude -all ^
rem   and include -file tinymce.js,inline\theme.js,modern\theme.js,templateEditor\plugin.js,advlist\plugin.js,anchor\plugin.js,autolink\plugin.js,autoresize\plugin.js,autosave\plugin.js,bbcode\plugin.js,charmap\plugin.js,code\plugin.js,colorpicker\plugin.js,compat3x\plugin.js,contextmenu\plugin.js,directionality\plugin.js,emoticons\plugin.js,fullpage\plugin.js,fullscreen\plugin.js,hr\plugin.js,image\plugin.js,importcss\plugin.js,insertdatetime\plugin.js,layer\plugin.js,legacyoutput\plugin.js,link\plugin.js,lists\plugin.js,media\plugin.js,nonbreaking\plugin.js,noneditable\plugin.js,pagebreak\plugin.js,paste\plugin.js,preview\plugin.js,print\plugin.js,save\plugin.js,searchreplace\plugin.js,spellchecker\plugin.js,tabfocus\plugin.js,table\plugin.js,template\plugin.js,textcolor\plugin.js,textpattern\plugin.js,visualblocks\plugin.js,visualchars\plugin.js,wordcount\plugin.js ^
rem   and concat -out=.\jslibs\tinymce\tinymce-with-plugin-debug.js ^
rem   and concat -closure -out=.\jslibs\tinymce\tinymce-with-plugin.js > lastResult.txt
rem @if not exist .\jslibs\tinymce\tinymce-with-plugin.js goto err
rem @if not exist .\jslibs\tinymce\tinymce-with-plugin-debug.js goto err
rem @if errorlevel 1 goto err

rem xcopy compiled\tinymce-with-plugin.js jslibs\tinymce\
rem del .\compiled\tinymce-with-plugin.js

rem   and include -file compiled\tinymce-all.js ^
rem  and include -file tinymce.js,advlist\plugin.js,anchor\plugin.js,autolink\plugin.js,autoresize\plugin.js,autosave\plugin.js,bbcode\plugin.js,charmap\plugin.js,code\plugin.js,colorpicker\plugin.js,compat3x\plugin.js,contextmenu\plugin.js,directionality\plugin.js,emoticons\plugin.js,fullpage\plugin.js,fullscreen\plugin.js,hr\plugin.js,image\plugin.js,importcss\plugin.js,insertdatetime\plugin.js,layer\plugin.js,legacyoutput\plugin.js,link\plugin.js,lists\plugin.js,media\plugin.js,nonbreaking\plugin.js,noneditable\plugin.js,pagebreak\plugin.js,paste\plugin.js,preview\plugin.js,print\plugin.js,save\plugin.js,searchreplace\plugin.js,spellchecker\plugin.js,tabfocus\plugin.js,table\plugin.js,template\plugin.js,textcolor\plugin.js,textpattern\plugin.js,visualblocks\plugin.js,visualchars\plugin.js,wordcount\plugin.js ^



set currProj=Concatenate CSS
echo ****** Concatenate CSS
"%SENCHA%\sencha" --nologo fs concatenate -to=.\compiled\ub-css-all-debug.css -from=.\css\font-awesome.css,.\jslibs\codemirror\lib\codemirror.css,.\jslibs\codemirror\lib\util\simple-hint.css,.\ux\form\field\BoxSelect.css,.\css\GridFilters.css,.\css\RangeMenu.css,.\css\toastr.css > lastResult.txt
@if not exist .\compiled\ub-css-all-debug.css goto err
@if errorlevel 1 goto err

rem MPV: actually minified by 5% - so let use unminified
rem %JAVA% -jar "%SENCHA%\lib\yuicompressor-2.4.7.jar" .\compiled\ub-css-all-debug.css -o .\compiled\ub-css-all.css 
copy .\compiled\ub-css-all-debug.css .\compiled\ub-css-all.css 

@echo ****** Web part compiled success
@goto end


:err
if exist lastResult.txt type lastResult.txt
@echo !!!!!!!!!!!!!! Compilation of %currProj% fail !!!!!!!!!!!!!!!!
echo error errorlevel=%ERRORLEVEL%
EXIT /B 1

:end