require('./UBReport')
//require('@unitybase/adminui-pub/_src/app/ux/PDFComponent.js')
//require('@unitybase/adminui-pub/_src/app/ux/UBTinyMCETextArea.js')
/**
 * Displays a report.
 * Example:
 *
 *           report = Ext.create('UBS.UBReport',{
 *              code: 'test',
 *              type: 'pdf',
 *              params: {userName: 'Helen'}
 *           });
 *           report.init().done(function(){
 *               var viewer = Ext.create('UBS.ReportViewer', {
 *                  renderTo: Ext.getBody(),
 *                  report: report
 *               });
 *           });
 *
 */
Ext.define('UBS.ReportViewer', {
    extend: 'Ext.form.Panel',
    requires: [
         'UBS.UBReport',
         'UB.ux.PDFComponent',
         'UB.ux.UBTinyMCETextArea'
    ],
    layout: { type: 'vbox', align: 'stretch'},
    width: 700,
    height: 500,

    /**
     * @cfg {UBS.UBReport} report
     */
    initComponent: function () {
        var me = this, container, control;

        /*
        me.paramsPanel = Ext.widget('panel', {
            buttons: [{
                caption: UB.i18n('BuildReport'),
                handler: function(){
                    me.getEl().mask(UB.i18n('pozhaluystaPodozhdite'));
                    me.report.makeReport().done(function(data){
                        me.showReport(data);
                    });
                }
            }]
        });
        */

        if (me.report && !me.reportType){
            me.reportType = me.report.reportType;
        }

        if (!me.reportType){
            throw new Error('config parameter reportType is undefined');
        }
        switch(me.reportType){
            case 'pdf':
                control = container = Ext.create('UB.ux.PDFComponent',{
                   flex: 1
                });
                break;
            case 'html':
                control = Ext.create('UB.ux.UBReportEditor', {
                    readOnly: true,
                    hidden: true,
                    //flex: 1,
                    tinyMCEEditorConfig: {
                        menubar: false,
                        contextmenu: false,
                        plugins: ["advlist autolink lists charmap print preview hr anchor pagebreak",
                        "searchreplace wordcount visualblocks visualchars code ",
                        "insertdatetime nonbreaking table contextmenu directionality",
                        "emoticons template paste textcolor"],
                        toolbar: false,
                        toolbar1: false
                        //MPV content_css : "/models/adminui/tinymce/skins/lightgray/content_preview.min.css"
                    }
                });
                container = Ext.create('Ext.panel.Panel', {
                     layout: {
                         type: 'vbox',
                         align: 'stretch'
                     },
                     flex: 1,
                     items : [{
                         flex: 1,
                         autoScroll: true,
                         //overflowX: 'auto',
                         //overflowY: 'auto',

                         layout: {
                             type: 'hbox',
                             pack: 'center',
                             align: 'stretch'
                         },
                         bodyCls: 'ub-panel-gray',
                         items: [control]
                     },{
                         padding: "3 0 3 0",
                         layout: {
                             type: 'hbox'
                         },
                         items: [
                             {
                                 flex: 1
                                 //,bodyCls: 'ub-panel-gray'
                             },{
                                 xtype: 'button',
                                 ui: 'default-toolbar',
                                 text: UB.i18n('Print'),
                                 handler: function(){
                                     control.getEditor().getWin().print();
                                 }
                             }]
                         //,
                         //cls: 'ub-panel-gray',
                         //bodyCls: 'ub-panel-gray'
                     }]
                });

                control.on('setup', function(editor){
                    editor.on('init', function() {
                        editor.dom.loadCSS('/models/adminui-pub/css/print-report.css');
                            //editor.baseURI.toAbsolute("plugins/templateEditor/css/templateEditor.css"));
                    });
                }, me, {single: true});


                /*
                control = Ext.create('Ext.panel.Panel', {
                    readOnly: true,
                    frame: true,
                    flex: 1
                });
                */
                break;
            default:
                throw new Error('Unknown value ' + me.reportType + ' for reportType.');
        }
        me.items = [
            //me.paramsPanel,
            container
        ];
        me.reportControl = control;

        //me.report = new UBS.UBReport({code: me.reportCode, type: me.reportType, params: me.reportParams });

        me.report.init().then(function(){
            if (me.report.onParamPanelConfig){
                var onParamForm = me.report.onParamPanelConfig();
                if (onParamForm){
                    me.addParamForm(onParamForm);
                }
                return true;
            } else {
                return false;
            }
        }).then(function(result){
              if (result){
                  return false;
              }
              return me.report.makeReport();
        }).done(function(data){
            if (data && data.reportData){
                me.showReport(data.reportData);
            }
            if (me.getEl()){
                me.getEl().unmask();
            }
            me.reportDone = true;
        });
        me.callParent(arguments);
    },

    /**
     *
     * @param {UBS.ReportParamForm|Array} paramForm
     */
    addParamForm: function(paramForm){
        var me = this, prmCfg;
        if (paramForm instanceof Array){
            prmCfg = paramForm;
            paramForm = Ext.create('UBS.ReportParamForm', {
                items: paramForm,
                getParameters: function(owner) {
                    var result = {}, frm = owner.getForm();
                    _.forEach(prmCfg, function(item){
                        result[item.name] = frm.findField(item.name).getValue();
                    });
                    return result;
                }
            });
        }
        me.insert(0, paramForm);
        paramForm.on('buildReport', function(param, form){
            me.getEl().mask(UB.i18n('pleaseWait'));
            me.report.makeReport(param).done(function(data){
                me.showReport(data.reportData);
            });
        });
    },

    showReport: function(data){
        var me = this, i;
        switch(me.reportType){
            case 'pdf':
                if (typeof(data) === 'string'){
                    var pdfLength = data.length;
                    var pdfArray = new Uint8Array(new ArrayBuffer(pdfLength));

                    for (i = 0; i < pdfLength; i++) {
                        pdfArray[i] = data.charCodeAt(i);
                    }

                    data = new Blob(
                        [pdfArray],
                        {type: "application/pdf"}
                    );
                } else if ((typeof(data) === 'object') && (data instanceof ArrayBuffer)){
                    data = new Blob(
                        [data],
                        {type: "application/pdf"}
                    );
                }

                me.reportControl.setSrc({ blobData: data });
                break;
            case 'html':
                me.reportControl.show();
                me.reportControl.setValue(data);
                var ed = me.reportControl.getEditor();
                if (ed && ed.dom){
                    if (me.reportControl.orientation === 'landscape'){
                        ed.dom.loadCSS('/models/adminui-pub/css/print-landscape.css');
                    } else {
                        ed.dom.loadCSS('/models/adminui-pub/css/print-portrait.css');
                    }
                } else {
                    me.reportControl.on('setup', function(editor){
                        editor.on('init', function() {
                            if (me.reportControl.orientation === 'landscape'){
                                editor.dom.loadCSS('/models/adminui-pub/css/print-landscape.css');
                            } else {
                                editor.dom.loadCSS('/models/adminui-pub/css/print-portrait.css');
                            }
                        });
                    }, me, {single: true});
                }


                /*
                me.reportControl.rpHtml = data;
                if (me.reportControl.getEl()){
                    me.reportControl.getEl().setHTML(data);
                } else {
                    me.reportControl.on('afterrender', function(){
                        me.reportControl.getEl().setHTML(data);
                    }, me, {single: true});
                }
                */
                break;
        }
        if (me.getEl()){
            me.getEl().unmask();
        }
    },

    afterRender: function() {
        var me = this;
        me.callParent();
        if (!me.reportDone){
            me.getEl().mask(UB.i18n('pleaseWait'));
        }
    }

});
