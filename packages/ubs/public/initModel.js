require('./dataBinder')
require('./csCommonUtils')
require('./cliUtils')
// Ext.require('UBS.dataBinder');
// Ext.require('UBS.csCommonUtils');
// Ext.require('UBS.cliUtils');

// var mustLoad = [
//     'models/UBS/css/ubs.css',
//     'models/UBS/settings.js',
//     'models/UBS/UBReport.js',
//     'models/UBS/ReportParamForm.js',
//     'models/UBS/ReportViewer.js'
//
// ];
//
// Promise.all(mustLoad.map(UB.inject));

// require('@unitybase/ubs/public/css/ubs.css')
// require('@unitybase/ubs/public/settings.js')
// require('@unitybase/ubs/public/UBReport.js')
// require('@unitybase/ubs/public/ReportParamForm.js')
// require('@unitybase/ubs/public/ReportViewer.js')

require('./css/ubs.css')
require('./settings.js')
require('./UBReport.js')
require('./ReportParamForm.js')
require('./ReportViewer.js')

/*
$App.on('buildMainMenu', function (items) {
    items.push(
        //{xtype: 'ubsmessagebar'} 
	Ext.create('UBS.MessageBar')
    );
});
*/

