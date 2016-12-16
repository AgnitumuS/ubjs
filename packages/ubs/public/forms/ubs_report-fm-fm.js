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
                            console.log("%o", edtr);
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
               /*,
                items: [
                    {
                        xtype: 'combobox',
                        fieldLabel: UB.i18n('reportType'),
                        displayField: 'name',
                        valueField: 'name',
                        value: 'html',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['name'],
                            data : [
                                {"name":"html"},
                                {"name":"pdf"}
                            ]})
                    }
                ]*/
           });
        win.show();
    },
    JSLINT_OPTIONS: {
        node: true,
        bitwise: true,
        "continue": true,
        debug: true,
        eqeq: true,
        es5: true,
        evil: true,
        forin: true,
        newcap: true,
        nomen: true,
        plusplus: true,
        regexp: true,
        undef: true,
        unparam: true,
        stupid: true,
        todo: true,
        vars: true,
        white: true,
        css: true,
        cap: true,
        on: true,
        fragment: true,
        browser: true,
        passfail: false
    },
    STRICT_CHECK: '"use strict";',
    checkJS: function() {
        var
            codeTabs = this.down('tabpanel'),
            aTab = codeTabs.getActiveTab(),
            lintRes,
            errStore,
            aErrorData = [],
            err,
            ctrl;

        ctrl = aTab ? aTab.down('ubcodemirror'): null;
        if (!ctrl) {
            return;
        }

        lintRes = JSLINT(this.STRICT_CHECK + aTab.down('ubcodemirror').getValue(), this.JSLINT_OPTIONS);
        errStore = this.debugWindow.down('grid').getStore();
        if (!lintRes) {
            for (err in JSLINT.errors) {
                if (JSLINT.errors.hasOwnProperty(err) && (JSLINT.errors[err] !== null)) {
                    aErrorData.push([JSLINT.errors[err].line, JSLINT.errors[err].character, JSLINT.errors[err].reason]);
                }
            }
            errStore.loadData(aErrorData, false);
            this.debugWindow.show();
        } else {
            errStore.loadData([
                [1, 1, UB.i18n('err_noErrors')]
            ], false);
        }


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