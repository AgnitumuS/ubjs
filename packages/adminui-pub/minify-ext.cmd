uglifyjs ext-all-debug-w-comments.js ^
  -o ./dist/ext-all.min.js ^
  --source-map ./dist/ext-all.min.js.map --source-map-include-sources ^
  --screw-ie8 --prefix relative --compress --mangle