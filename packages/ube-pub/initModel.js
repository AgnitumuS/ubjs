if (window.isDeveloperMode) {
  Ext.require(['UBE.GraphViewer', 'UBE.UBMetaDiagram', 'UBE.UBOrgChart', 'UBE.Workflow']);
} else {
  UB.inject('models/UBE/dist/ube.min.js');
}