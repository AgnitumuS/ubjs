/*global UB, Ext, JSLINT, $App, js_beautify*/
UB.inject('models/UBS/js_beautify.js').done();
UB.inject('models/UBS/jslint.js').done();

exports.formCode = {
	initUBComponent: function () {
        var me = this;
        me.debugWindow = new Ext.Window({
            title: UB.i18n('konsolOshibok'),
            width: 500,
            layout: 'border',
            closeAction: 'hide',
            height: 160,
            items: [new Ext.grid.GridPanel({
                layout: 'fit',
                region: 'center',
                border: false,
                viewConfig: {
                    forceFit: true
                },
                listeners: {
                    itemdblclick: {
                        fn: function(grid, record, item, index, e, eOpts) {
                            var
                                codeTabs = me.down('tabpanel'),
                                edtr = codeTabs.getActiveTab().down('ubcodemirror').editor;
                            edtr.setCursor({
                                line: record.get('line'),
                                ch: record.get('character') - 1
                            });
                            /*var pos = edtr.cursorPosition(true);
                             edtr.selectLines(pos.line, 0, pos.line, record.get('character') - 1);*/
                        }
                    }
                },
                store: new Ext.data.ArrayStore({
                    fields: [{
                        name: 'line'
                    }, {
                        name: 'character'
                    }, {
                        name: 'reason'
                    }]
                }),
                columns: [{
                    id: 'line',
                    header: UB.i18n('err_line'),
                    width: 40,
                    fixed: true,
                    menuDisabled: true,
                    dataIndex: 'line'
                }, {
                    id: 'character',
                    header: UB.i18n('err_character'),
                    width: 70,
                    fixed: true,
                    menuDisabled: true,
                    dataIndex: 'character'
                }, {
                    header: UB.i18n('err_description'),
                    menuDisabled: true,
                    dataIndex: 'reason'
                }],
                stripeRows: true
            })]
        });

	},
    testReport: function() {
       var me = this,
           win, doTest;

           doTest = function(type){
               if (me.record.dirty) {
                  $App.dialogYesNo('saveBeforeTestTitle', 'saveBeforeTestBody')
                  .then(function(choice){
                   if (choice){
                       return me.saveForm();     
                   } else {
                       throw new UB.UBAbortError();
                   }    
                 }).done(function(){
                       $App.doCommand({
                           "cmdType": "showReport",
                           "cmdData": {
                               "reportCode": me.getField('report_code').getValue(),
                               "reportType": type, //win.down('combobox').getValue(),
                               "reportParams": {},
                               "reportOptions": {debug: true}
                           }
                       });
                       win.close();
                 }, function(err){
                       win.close();
                 });
              } else {
                       $App.doCommand({
                           "cmdType": "showReport",
                           "cmdData": {
                               "reportCode": me.getField('report_code').getValue(),
                               "reportType": type, //win.down('combobox').getValue(),
                               "reportParams": {},
                               "reportOptions": {debug: true}
                           }
                       });
                       win.close();
              }
           };

           win = new Ext.Window({
                modal: true,
                width: 400,
                //height: 120,
                title: UB.i18n('selectReportType'),
                items: [
                    {
                        margin: '5 15',  
                        xtype: 'button',   
                        scale   : 'large',
                        text: 'html',
                        handler: function(){
                             doTest('html');
                        },
                    },{
                        margin: '5 15',  
                        xtype: 'button', 
                        scale   : 'large',
                        text: 'pdf',
                        handler: function(){
                             doTest('pdf');
                        }

                    }
                ]
           });
        win.show();
    },
    beautyJS: function() {
        var
            codeTabs = this.down('tabpanel'),
            aTab = codeTabs.getActiveTab(),
            ctrl,
            txt;

        ctrl = aTab ? aTab.down('ubcodemirror'): null;
        if (!ctrl) {
            return;
        }
        txt = ctrl.getValue();

        txt = js_beautify(txt);
        ctrl.setValue(txt);
    }
};