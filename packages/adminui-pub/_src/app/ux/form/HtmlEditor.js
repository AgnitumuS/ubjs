/*global tinymce */
/**
 * This control render html with the ability to edit it. Html rendered with fixed width (parameter pageWidth).
 * When html more then control space it render scroll bar. Also implemented the ability to call a full-fledged
 * editor with a turn on the full screen. When control get focus or mouse cursor fly over it in top right corner the visible button to call up the editor.
 * Example:
 *
 *      var e = Ext.widget('ubhtmleditor', {
 *            renderTo: document.body,
 *            labelAlign: 'top',
 *            height: 90,
 *      });
 *      e.setValue('your html text');
 *      // .... on save
 *      var editedHtml = e.getValue();
 */
Ext.define('UB.ux.form.HtmlEditor', {
    extend: 'UB.ux.UBTinyMCETextArea', 
    alias: 'widget.ubhtmleditor',

    overflowX: 'auto',
    overflowY: 'auto',
    minHeight: 65,

    /**
     * @cfg Fixed page width.
     */
    pageWidth: 793,

    initComponent: function () {
        var me = this;
        Ext.getBody().getSize();

        me.elementStyle = me.elementStyle || '' + 'width: ' + me.pageWidth + 'px;';

        me.tinyMCEEditorConfig = Ext.apply({
            language_url : $App.connection.baseURL + 'models/adminui/tinymce/langs/' +  $App.connection.userLang() + '.js',
            skin_url: $App.connection.baseURL + 'models/adminui/tinymce/skins/lightgray',
            content_css : $App.connection.baseURL + "models/adminui/tini-mce-content.css",
            table_default_attributes: {
                cellpadding: '3px',
                cellspacing: '0',
                border: '1px',
                width: me.pageWidth && me.pageWidth > 20 ? me.pageWidth - 20: 20,
                style: { wordBreak: "break-all"}
            },
            browser_spellcheck : true,
            // not exists plugins in new version   'style,advhr,advimage,advlink,iespell,xhtmlxtras,inlinepopups'
            plugins: [
                //"autosave layer noneditable",
                //disabled - " media"
                "advlist autolink lists charmap print preview hr anchor pagebreak", //link image
                "searchreplace wordcount visualblocks visualchars code ", //fullscreen
                "insertdatetime nonbreaking table contextmenu directionality ", //save
                "emoticons template paste textcolor colorpicker image templateEditor"
            ],
            toolbar1: "undo redo | bold italic underline | alignleftTe aligncenterTe alignrightTe alignjustifyTe | formatselect fontsizeselect | borderL borderR borderT borderB borderE borderA | forecolor | bullist numlist outdent indent |",
            contextmenu: 'link image inserttable | cell row column deletetable | rowTemplate',
            // fontselect styleselect
            //toolbar1: "newdocument fullpage | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
            //toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | inserttime preview | forecolor backcolor",
            //toolbar3: "table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft",

            paste_data_images: true,
            paste_postprocess: UB.ux.UBReportEditor.paste_postprocess,

            //content_css : "contents.css",
            statusbar : false,
            menubar: "edit insert view format table tools",
            //menubar: false,
            /*
             menu : {
             //file   : {title : 'File'  , items : 'newdocument'},
             edit   : {title : 'Edit'  , items : 'undo redo | cut copy paste pastetext | selectall'},
             insert : {title : 'Insert', items : 'link media | template hr'},
             view   : {title : 'View'  , items : 'visualaid'},
             format : {title : 'Format', items : 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
             table  : {title : 'Table' , items : 'inserttable tableprops deletetable | cell row column'},
             tools  : {title : 'Tools' , items : 'spellchecker code'}
             },*/
            toolbar_items_size: 'small'
        }, me.tinyMCEEditorConfig || {} );

        me.tinyMCEConfig = Ext.apply({
            language_url : $App.connection.baseURL + 'models/adminui/tinymce/langs/' +  $App.connection.userLang() + '.js',
            skin_url: $App.connection.baseURL + 'models/adminui/skins/lightgray/',
            content_css : $App.connection.baseURL + "models/adminui/tini-mce-content.css",
            table_default_attributes: {
                cellpadding: '3px',
                cellspacing: '0',
                border: '1px',
                width: me.pageWidth && me.pageWidth > 20 ? me.pageWidth - 20: 20,
                style: { wordBreak: "break-all"}
            },

            browser_spellcheck : true,
            statusbar : false,
            menubar: false,
            toolbar: false,
            toolbar1: false,
            toolbar2: false,
            toolbar3: false,

            plugins: [  "paste"
                //"advlist autolink lists charmap print preview hr anchor pagebreak", //link image
                //"searchreplace wordcount visualblocks visualchars code ", //fullscreen
                //"insertdatetime nonbreaking table contextmenu directionality ", //save
                //"emoticons template paste textcolor colorpicker templateEditor"
            ],

            paste_data_images: true,
            paste_postprocess: UB.ux.UBReportEditor.paste_postprocess,

            //inline: true,
            //selector: '#' + me.getInputId() + '_content',
            //hidden_input: true
            setup: me.onsetup.bind(me)
        }, me.tinyMCEConfig || {} );

        me.callParent(arguments);
    },

    fieldSubTpl: [
        '<div id="{id}_editButton" style="visibility: hidden; z-index: 2; text-align: right; position: absolute; left: -10px; top: 10px;"></div>',
        '<div id="{id}_mframe" role="{role}" tabindex="0" {inputAttrTpl} style="width:100%; owerflow-x:auto; overflow-y: hidden;" >',
        '<textarea id="{id}" tabindex="0"  ',
        '<tpl if="name"> name="{name}"</tpl>',
        '<tpl if="rows"> rows="{rows}" </tpl>',
        '<tpl if="cols"> cols="{cols}" </tpl>',
        '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
        '<tpl if="size"> size="{size}"</tpl>',
        '<tpl if="maxLength !== undefined"> maxlength="{maxLength}"</tpl>',
        '<tpl if="readOnly"> readonly="readonly"</tpl>',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
        ' class="{fieldCls} {typeCls} {inputCls}" ',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' autocomplete="off">\n',
        '<tpl if="value">{[Ext.util.Format.htmlEncode(values.value)]}</tpl>',
        '</textarea>',
        '</div>',
        {
            disableFormats: true
        }
    ],

    afterRender: function( ){
        var me = this, input, frame, parent,
            size = Ext.getBody().getSize(), height;

        me.callParent(arguments);

        me.mainFrame = frame = Ext.get(me.getInputId() + '_mframe');
        me.mainFrame.dom.select = function(){};

        input = Ext.get(me.getInputId());
        input.dom.tabindex = 0;
        height = input.getHeight() - 20;
        if (height < me.minHeight){
            height = me.minHeight;
        }
        frame.setHeight(height);
        input.on('resize', function(){
            frame.setHeight(input.getHeight() - 20);
        });

        input.setWidth(me.pageWidth);
        input.setHeight(size.height);
        input.setStyle('owerflow-y','hidden');
        input.setStyle('owerflow-x','hidden');

        me.editBtn = Ext.get(me.getInputId()+ '_editButton');
        me.editBtn.dom.style.position = 'relative';
        me.editBtn.dom.style.height = '0px';

        me.initContextMenu();

        parent = frame.parent();
        parent.on('mouseover',function(){
            if (!me.editBtn.isVisible() && !me.readOnly ){
                me.editBtnCtrl.hide();
                me.editBtn.hide();
                me.editBtn.show();
                me.editBtnCtrl.show();
            }
        });
        parent.on('mouseleave',function(){
           if (!me.hasInputFocus){
             me.editBtn.hide();
           }
        });

        me.on('focus', function(){
            if (me.readOnly){
                return;
            }
            me.editBtnCtrl.hide();
            me.hasInputFocus = true;
            me.editBtn.hide();
            me.editBtn.show();
            me.editBtnCtrl.show();
        }, me);
        me.on('blur', function(){
            me.hasInputFocus = false;
            Ext.defer(function(){
                me.editBtn.hide();
            }, 100);
        }, me);

    },

    // for get focus in BasePanel
    getFocusEl: function() {
        return this.iframe;
    },


    initEditor: function(){
         var me = this;
         me.callParent(arguments);
    },

    onsetup: function(ed){
        var me = this, ifr,
            size = Ext.getBody().getSize();
        ed.on('init', function() {
            me.iframe = ifr = Ext.get(me.getInputId() + '_ifr');
            me.iframe.dom.tabindex = 0;
            me.iframe.dom.select = function(){};
            ifr.setWidth(me.pageWidth);
            ifr.setHeight(size.height);
        });
    },


    getSubTplMarkup: function() {
        var me = this;
        return me.callParent(arguments);
    },

    editContent: function(){
        var me = this, editorWnd, pnl,
        size = Ext.getBody().getSize();


        function showInPDF(blobUrl) {
            var adobePdfPanel, form, pObj;

            adobePdfPanel = Ext.widget('panel', {
                border: true,
                flex: 1
            });

            form = Ext.create('UB.view.BaseWindow', {
                title: 'PDF',
                width: 800,
                height: 600,
                modal: true,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    adobePdfPanel
                ]
            });

            pObj = Ext.create('UB.ux.UBObject');
            pObj.setXSize({
                width: '100%',
                height: '100%'
            });
            adobePdfPanel.add(pObj);
            pObj.setSrc({
                url: blobUrl,
                contentType: 'application/pdf'
            });
            form.show();
        }

        function makePDF(htmlText){
            PDF.init().done(function(){
                PDF.csPrintToPdf.requireFonts(
                    {fonts:[
                        /*{ fontName: 'CalibriImp', fontStyle: 'Normal'},
                        { fontName: 'CalibriImp', fontStyle: 'Bold'},
                        { fontName: 'CalibriImp', fontStyle: 'Italic'},
                        { fontName: 'CourierImp', fontStyle: 'Normal'},
                        { fontName: 'FixSys', fontStyle: 'Normal'},*/
                        { fontName: 'TimesNewRoman', fontStyle: 'Normal'},
                        { fontName: 'TimesNewRoman', fontStyle: 'Bold'},
                        { fontName: 'TimesNewRoman', fontStyle: 'Italic'}
                    ],
                        onLoad: function(){
                            var pdf = Ext.create('PDF.csPrintToPdf', {
                                font: {name: "TimesNewRoman", size: 10, type: "Normal"},
                                margin: {top: 11, right: 8, bottom: 8, left: 20},
                                //margin: {left: 50, right: 80},
                                bottomColontitle: {
                                    height: 8,
                                    font: { size: 7, wide: 0 }
                                },
                                listeners: {
                                    initColontitle: function(obj, result) {
                                        if(!result.colontitle.isTop) {
                                            result.align = PDF.csPrintToPdf.alignType.center;
                                            result.text = ' page ' + result.pageNumber + ' of ' + result.totalPages;
                                        } else {
                                            result.align = PDF.csPrintToPdf.alignType.center;
                                            result.text = 'test report - page ' + result.pageNumber + ' of ' + result.totalPages;
                                        }
                                    }
                                }
                            });
                            //pdf.writeSimpleText({text: 'Test ', wordWrap: false, splitOnPage: false, align: 'left', width: 150});
                            pdf.writeHtml({html: htmlText});
                            //window.open(pdf.output('blobUrl'), '_blank');
                            showInPDF(pdf.output('blobUrl'));
                        }
                    });
            });
        }


        editorWnd = Ext.create('UB.view.BaseWindow', {
            title: UB.i18n('redaktirovat'),
            modal: true,
            maximizable: true,
            maximized: false,
            width: size.width,
            height: size.height,
            style: {
                background: '#959596'
            },
            overflowX: 'auto',
            overflowY: 'auto',
            stateful: true,
            stateId: "HtmlEditorForm",
            //layout: { type: 'fit', align: 'stretch' },
            layout: {type: 'hbox', pack: 'center', align: 'stretch' },
            items: [
               pnl = Ext.create('UB.ux.UBTinyMCETextArea',{
                   //flex: 1,
                   width: me.pageWidth,
                   tinyMCEConfig: me.tinyMCEEditorConfig,
                   value:  me.getRawValue()
               })
            ],
            buttons:[
                {
                    disabled: !window.PDF,
                    text: UB.i18n('preViewInPDF'),
                    handler: function(){
                        makePDF(pnl.getValue());
                    }
                },{
                    xtype: 'panel',
                    flex: 1
                },{
                    text: UB.i18n('Change'),
                    glyph: UB.core.UBUtil.glyphs.faSave,
                    handler: function(){
                        var result = pnl.getValue();
                        me.setValue(result);
                        editorWnd.close();
                    }
                }, {
                    text: UB.i18n('cancel'),
                    glyph: UB.core.UBUtil.glyphs.faTimes,
                    handler: function(){
                        editorWnd.close();
                    }
                }
            ],
            listeners: {
                afterrender: function(){
                    //me.tinyMCEConfig.selector = '#' + pnl.getEl().id;
                    //me.initEditor();
                },
                beforeclose: function(){
                    //var result = pnl.getValue();
                    //me.setValue(result);

                }
            }
        });
        editorWnd.show();
        pnl.updateLayout();
    },

    initContextMenu: function(){
        var me = this;
        me.editBtnCtrl = Ext.create('Ext.Button',{
            renderTo: me.editBtn,
            cls: 'ub-btn-flat ub-btn-rounded',
            //text: UB.i18n("redaktirovat"),
            tooltip: UB.i18n("redaktirovat"),
            focusOnToFront: false,
            //plain: true,
            style: "z-index: 3;",
            glyph: UB.core.UBUtil.glyphs.faPencil, //faEdit,
            handler: me.editContent,
            scope: me
        });
    },

    // for get focus in BasePanel
    isFocusableField: true,

    isFocusable: function(){
        return !this.readOnly;
    },

    setValue: function(){
        var me = this;
        me.callParent(arguments);
    }
});