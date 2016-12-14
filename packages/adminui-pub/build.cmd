cd ./public/_src
sencha --nologo compile -classpath=..\..\..\..\libs_vendor\ext\src,.\app.js,.\app,.\app\view,.\ux,.\ux\form,.\ux\form\field ^
  exclude -file=ext,tinymce-with-plugin ^
  and include -file=UBTinyMCETextArea.js,TinyMCETextArea.js,FullTextSearchWidget.js,UBText.js,UBTextArea.js ^
  and concat -out=..\dist\adminui.js