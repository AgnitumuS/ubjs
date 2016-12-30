cd "%~dp0.."
uglifyjs GraphViewer.js UBMetaDiagram.js UBOrgChart.js Workflow.js ^
  -o ./dist/ube.min.js ^
  --source-map ./dist/ube.min.js.map --source-map-include-sources ^
  --screw-ie8 -p relative -c -m