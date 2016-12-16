Ext.require('UBS.dataBinder');
Ext.require('UBS.csCommonUtils');
Ext.require('UBS.cliUtils');

var mustLoad = [
    'models/UBS/css/ubs.css',
    'models/UBS/settings.js',
    'models/UBS/UBReport.js',
    'models/UBS/ReportParamForm.js',
    'models/UBS/ReportViewer.js'
    
];

Promise.all(mustLoad.map(UB.inject));

/*
$App.on('buildMainMenu', function (items) {
    items.push(
        //{xtype: 'ubsmessagebar'} 
	Ext.create('UBS.MessageBar')
    );
});
*/

