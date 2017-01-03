cd "%~dp0..\src"
uglifyjs ^
 csStyle.js csBaseStyleElement.js csStyleBorder.js csStyleFill.js csStyleFormat.js csStyleFont.js ^
 csStyleAlign.js csStyleProtect.js csWorksheet.js csWorkbook.js ^
  -o ../dist/xlsx-all.min.js ^
  --source-map ../dist/xlsx-all.min.js.map --source-map-include-sources ^
  --screw-ie8 -p relative -c -m