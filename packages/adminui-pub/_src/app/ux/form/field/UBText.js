/**
 * Text field implementing specific logic of UB
 */
Ext.define('UB.ux.form.field.UBText', {
    extend: 'Ext.form.field.Trigger', //Ext.form.field.Text
    alias: 'widget.ubtextfield',

    triggerCls: 'ub-multilang-trigger',

    initComponent: function(){
        var me = this, menuItems = [];

        me.hideTrigger = !me.isMultiLang;
        if (me.hideTrigger){
            me.componentLayout = 'field';
        }
        menuItems.push({
            text: UB.i18n('editMultiLang'),
            //iconCls: 'iconClear',
            //itemID: 'clearValue',
            handler: me.showMultiLangForm,
            //disabled: me.disabled || me.readOnly,
            scope: me
        });

        me.contextMenu = Ext.create('Ext.menu.Menu',{items:menuItems });
        me.callParent(arguments);
    },

    getSubTplMarkup: function(values) {
        var me = this;

        if (me.hideTrigger){
            return me.getTpl('fieldSubTpl').apply(this.getSubTplData());
        } else {
            return me.callParent(arguments);
        }
    },

    initTrigger: function(){
        var me = this;
        if (me.hideTrigger){
            return;
        }  else {
            me.callParent(arguments);
        }
    },


    onTriggerClick: function(){
        this.showMultiLangForm();
    },

    /**
     * This method allow change the allowBlank property dynamically
     * @param allowBlank
     */
    setAllowBlank : function(allowBlank){
        this.callParent(arguments);
    },


    /**
     * @cfg {Boolean} isMultilang If true the user can edit text in all languages.
     * For this mode, you must:
     *   - Put this field into {@link UB.view.BasePanel}
     *   - Set entity attribute to property "attributeName"
     */

    /**
     * @private
      */
    afterRender: function( ){
        var me = this;

        me.callParent(arguments);
        if (me.isMultiLang){
            if (me.triggerEl){
              me.triggerEl.set({ "data-qtip": UB.i18n('isMultilangTip')});
            }
            me.getEl().on('contextmenu', me.showContextMenu, me);
        }
    },

    showContextMenu: function(e){
        e.stopEvent();
        this.contextMenu.showAt(e.getXY());
    },

    showMultiLangForm: function(){
        var me = this,
            basePanel,
            fieldList = ['ID'],
            controls = {},
            items = [], window,
            savedData;
        basePanel = me.up('basepanel');
        if (!basePanel || !me.attributeName){
            return;
        }
        _.forEach(UB.appConfig.supportedLanguages, function(lang){
            if ($App.connection.userLang() === lang){
                return;
            }
            fieldList.push(me.attributeName + '_' + lang + '^');
            controls[lang] = Ext.create(Ext.getClassName(me) /* 'Ext.form.field.Text'*/,{
                fieldLabel: UB.i18n(lang), /*+ (me.allowBlank ? '': '<span class="ub-view-marked-field-label">*</span>')*/
                allowBlank: me.allowBlank,
                readOnly: me.readOnly || me.disabled,
                labelStyle: "word-break: 'break-all'; word-wrap: 'break-word';",
                labelWidth: 120,
                rows: me.rows
            });
            items.push(controls[lang]);
        });

        savedData = basePanel.getExtendedDataForSave();
        function setSavedData(){
            _.forEach(UB.appConfig.supportedLanguages, function(lang){
                if ($App.connection.userLang() === lang){
                    return;
                }
                if (savedData.hasOwnProperty(me.attributeName + '_' + lang + '^')){
                    controls[lang].setValue( savedData[me.attributeName + '_' + lang + '^'] );
                    controls[lang].resetOriginalValue();
                }
            });
        }


        if (basePanel.instanceID /*&& !me.nationalFieldEdited*/){
            $App.connection.select({
                entity: basePanel.entityName,
                method:"select",
                fieldList: fieldList,
                ID: basePanel.instanceID
            })
            .then(UB.LocalDataStore.selectResultToArrayOfObjects)
            .done(function(data){
                    var row = data && data.length > 0 ? data[0]: {};
                    _.forEach(UB.appConfig.supportedLanguages, function(lang){
                        if ($App.connection.userLang() === lang){
                            return;
                        }
                        controls[lang].setValue(row[me.attributeName + '_' + lang + '^']);
                        controls[lang].resetOriginalValue();
                    });
                    setSavedData();
            });

        } else {
            setSavedData();
        }

        function saveForm(){
            var saveData = {};
            if (!window.down('form').isValid()){
                return;
            }
            _.forEach(UB.appConfig.supportedLanguages, function(lang){
                if (($App.connection.userLang() === lang) || !controls[lang].isDirty()){
                    return;
                }
                saveData[me.attributeName + '_' + lang + '^'] = controls[lang].getValue();
            });
            basePanel.addExtendedDataForSave(saveData);
            me.nationalFieldEdited = true;
            window.close();
        }

        window = Ext.create('UB.view.BaseWindow', {
            title: me.fieldLabel, //UB.i18n('filterForm'),
            height: 250,
            width: 500,
            modal: true,
            stateful: true,
            stateId: "ubLangForm_" + basePanel.entityCode + '_' + me.attributeName,
            layout: { type: 'fit' },

            items: [{
                overflowX: 'auto',
                overflowY: 'auto',
                xtype: 'form',
                padding: 5,
                layout: { type: 'vbox', align: 'stretch' },
                items: items
            }],
            buttons: [{
                    text: UB.i18n('Change'),
                    glyph: UB.core.UBUtil.glyphs.faSave,
                    hidden: me.readOnly || me.disabled,
                    handler: saveForm,
                    scope: me
                }, {
                    text: UB.i18n('cancel'),
                    glyph: UB.core.UBUtil.glyphs.faTimes,
                    handler: function() {
                        window.close();
                    }
                }
            ]
        });

        window.on('boxready', function(){
            window.actionsKeyMap = {};
            window.actionsKeyMap.saveAndClode = new Ext.util.KeyMap({
                target: window.getEl(),
                binding: [{
                    key: Ext.EventObject.ENTER,
                    ctrl: true,
                    shift: false,
                    //Ctrl+Enter
                    fn: function () {
                        saveForm();
                    }
                }]
            });
        });
        window.show();
    }
});

Ext.onReady(function() {

    /* solutions for problems with a narrow field of chromium */
    Ext.define('UB.layout.component.field.Field', {
        override: "Ext.layout.component.field.Field",

        beginLayoutFixed: function (ownerContext, width, suffix) {
            var owner = ownerContext.target,
                inputEl = owner.inputEl,
                inputWidth = owner.inputWidth;

            owner.el.setStyle('table-layout', 'fixed');
            if (width !== 100 && suffix !== '%'){
               owner.bodyEl.setStyle('width', width + suffix);
            }
            if (inputEl) {
                if (inputWidth) {
                    inputEl.setStyle('width', inputWidth + 'px');
                } //else {
                    //inputEl.setStyle('width', owner.stretchInputElFixed ? '100%' : '');
                //}
            }
            ownerContext.isFixed = true;
        }

    });

    /**
     * It is override Ext.form.field.Text for visually select required field
     */
    Ext.define("UB.ux.form.field.NText", {
        override: "Ext.form.field.Text",

        initComponent: function(){
            var me = this;
            me.requiredCls = 'ub-require-control-u';
            me.callParent(arguments);
        },

        afterRender: function( ){
            var me = this;

            me.callParent(arguments);

            if (!me.allowBlank){
                me.setAllowBlank(me.allowBlank);
            }
        },


        fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available
            '<input id="{id}" type="{type}" role="{role}" {inputAttrTpl}',
            //' size="1"', /* solutions for problems with a narrow field of chromium */ // allows inputs to fully respect CSS widths across all browsers
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
            ' class="{fieldCls} {typeCls} {editableCls} {inputCls} x-form-field-text" />',  // autocomplete="off"
            {
                disableFormats: true
            }
        ],


        /**
         *  @cfg {String} requireText Text for placeHolder. Default value 'pleaseInputValueToThisField'.
         */
        requireText: 'pleaseInputValueToThisField',
        /**
         * This method allow change the allowBlank property dynamically
         * @param allowBlank
         */
        setAllowBlank : function(allowBlank){
            var me = this;
            me.allowBlank = allowBlank;
            if (!me.inputEl){
                return;
            }
            if (allowBlank){
               me.inputEl.removeCls( me.requiredCls );
               me.inputEl.dom.removeAttribute('placeholder');
            }  else {
               me.inputEl.addCls( me.requiredCls );
                if (me.requireText){
                    me.inputEl.dom.setAttribute('placeholder', UB.i18n(me.requireText));
                }
            }
            //me.updateIndicator();
        }
        /*
        ,

        updateIndicator: function(){
            var me = this;
            return;
            if (me.inputEl){
                //cmp = document.createElement("span");
                //me.inputEl.dom.appendChild(cmp);
                if (!me.ctrlRequire){
                    me.ctrlRequire = Ext.DomHelper.append(
                        Ext.get(me.inputEl.dom.parentElement),
                        {
                            tag: 'span',
                            cls: 'ub-require-control-l',
                            "data-qtip": UB.i18n('isRequiredTip'),
                            html: '*'
                        }, true
                    );
                }
                if (!me.allowBlank && !me.readOnly && !me.disabled){
                    me.ctrlRequire.show();
                } else {
                    me.ctrlRequire.hide();
                }
            }

        } */


    });

    /*
    Ext.define("UB.layout.component.field.Trigger", {
        override: "Ext.layout.component.field.Trigger"
    });
    */

    Ext.define("UB.form.field.Base", {
        override: "Ext.form.field.Base",
        /**
         * @cfg leftIndent Width in pixels of left field indent. Default 15.
         */
        leftIndent: 15,
        /**
         * @cfg rightIndent Width in pixels of right field indent. Default 15.
         */
        rightIndent: 15,
        /**
         * @cfg withoutIndent Disable all field indent when true. Default true.
         */
        margin: '3 15 2 15',  // 9 15 9 15
        withoutIndent: true,
        getLabelableRenderData: function(){
            var me = this, data;

            data = me.callParent(arguments);
            if (!me.withoutIndent){
              data.leftIndent = me.leftIndent;
              data.rightIndent = me.rightIndent;
            }
            return data;
        },
        /*
        autoEl: {
            tag: 'div',
            role: 'presentation'
        },

        applyChildEls: function(){
           var me = this;
            me.callParent(arguments);
            me.bodyEl = me.el;
            me.inputRow = me.el;
            me.labelCell = me.labelEl;
        },

        labelableRenderTpl: [

            // body row. If a heighted Field (eg TextArea, HtmlEditor, this must greedily consume height.
            //'<tr role="presentation" id="{id}-inputRow" <tpl if="inFormLayout">id="{id}"</tpl> class="{inputRowCls}">',
                // Label cell
                '<tpl if="labelOnLeft">',
                    '{beforeLabelTpl}',
                    '<label id="{id}-labelEl" style="{labelCellStyle}" {labelAttrTpl} {labelCellAttrs}',
                    '<tpl if="inputId && !(boxLabel && !fieldLabel)"> for="{inputId}"</tpl>',
                    ' class="{labelCls}"',
                    '<tpl if="labelStyle"> style="{labelStyle}"</tpl>',
                    // Required for Opera
                    ' unselectable="on"',
                    '>',
                    '{beforeLabelTextTpl}',
                    '<tpl if="fieldLabel">{fieldLabel}',
                        '<tpl if="labelSeparator">',
                             '<span role="separator">{labelSeparator}</span>',
                        '</tpl>',
                    '</tpl>',
                    '{afterLabelTextTpl}',
                    '</label>',
                    '{afterLabelTpl}',
                '</tpl>',

                // Body of the input. That will be an input element, or, from a TriggerField, a table containing an input cell and trigger cell(s)
                //'<td role="presentation" class="{baseBodyCls} {fieldBodyCls} {extraFieldBodyCls}" id="{id}-bodyEl" colspan="{bodyColspan}" role="presentation">',
                '{beforeBodyEl}',

                // Label just sits on top of the input field if labelAlign === 'top'
                '<tpl if="labelAlign==\'top\'">',
                    '{beforeLabelTpl}',
                    //'<div role="presentation" id="{id}-labelCell" style="{labelCellStyle}">',
                    '<label id="{id}-labelEl" {labelAttrTpl}<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"',
                    '<tpl if="labelStyle"> style="display: table-cell; {labelStyle}"</tpl>',
                    // Required for Opera
                    ' unselectable="on"',
                    '>',
                    '{beforeLabelTextTpl}',
                    '<tpl if="fieldLabel">{fieldLabel}',
                        '<tpl if="labelSeparator">',
                        '<span role="separator">{labelSeparator}</span>',
                        '</tpl>',
                    '</tpl>',
                    '{afterLabelTextTpl}',
                    '</label>',
                    //'</div>',
                    '{afterLabelTpl}',
                '</tpl>',

                '{beforeSubTpl}',
                '{[values.$comp.getSubTplMarkup(values)]}',
                '{afterSubTpl}',

                // Final TD. It's a side error element unless there's a floating external one
                '<tpl if="msgTarget===\'side\'">',
                    '{afterBodyEl}',
                    //'</td>',
                    '<div role="presentation" id="{id}-sideErrorCell" vAlign="{[values.labelAlign===\'top\' && !values.hideLabel ? \'bottom\' : \'middle\']}" style="{[values.autoFitErrors ? \'display:none\' : \'display: table-cell\']}" width="{errorIconWidth}">',
                    '<div role="alert" aria-live="polite" id="{id}-errorEl" class="{errorMsgCls}" style="display:none"></div>',
                    '</div>',
                '<tpl elseif="msgTarget==\'under\'">',
                    '<div role="alert" aria-live="polite" id="{id}-errorEl" class="{errorMsgClass}" colspan="2" style="display:none"></div>',
                    '{afterBodyEl}',
                    //'</td>',
                '</tpl>',
           // '</tr>',
            {
                disableFormats: true
            }
        ]
        */

        labelableRenderTpl: [

            // body row. If a heighted Field (eg TextArea, HtmlEditor, this must greedily consume height.
            '<tr role="presentation" id="{id}-inputRow" <tpl if="inFormLayout">id="{id}"</tpl> class="{inputRowCls}">',
            '<tpl if="leftIndent">',
                '<td class="labelable-left-indent" style="width: {leftIndent}px;" ></td>',
            '</tpl>',

            // Label cell
            '<tpl if="labelOnLeft">',
                '<td role="presentation" id="{id}-labelCell" style="{labelCellStyle}" {labelCellAttrs}>',
                '{beforeLabelTpl}',
                '<label id="{id}-labelEl" {labelAttrTpl}',
                '<tpl if="inputId && !(boxLabel && !fieldLabel)"> for="{inputId}"</tpl>',
                ' class="{labelCls}"',
                '<tpl if="labelStyle"> style="{labelStyle}"</tpl>',
                // Required for Opera
                ' unselectable="on"',
                '>',
                '{beforeLabelTextTpl}',
                '<tpl if="fieldLabel">{fieldLabel}',
                '<tpl if="labelSeparator">',
                '<span role="separator">{labelSeparator}</span>',
                '</tpl>',
                '</tpl>',
                '{afterLabelTextTpl}',
                '</label>',
                '{afterLabelTpl}',
                '</td>',
            '</tpl>',

            // Body of the input. That will be an input element, or, from a TriggerField, a table containing an input cell and trigger cell(s)
            '<td role="presentation" class="{baseBodyCls} {fieldBodyCls} {extraFieldBodyCls}" id="{id}-bodyEl" colspan="{bodyColspan}" role="presentation">',
            '{beforeBodyEl}',

            // Label just sits on top of the input field if labelAlign === 'top'
            '<tpl if="labelAlign==\'top\'">',
                '{beforeLabelTpl}',
                '<div role="presentation" id="{id}-labelCell" style="{labelCellStyle}">',
                '<label id="{id}-labelEl" {labelAttrTpl}<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"',
                '<tpl if="labelStyle"> style="{labelStyle}"</tpl>',
                // Required for Opera
                ' unselectable="on"',
                '>',
                '{beforeLabelTextTpl}',
                '<tpl if="fieldLabel">{fieldLabel}',
                '<tpl if="labelSeparator">',
                '<span role="separator">{labelSeparator}</span>',
                '</tpl>',
                '</tpl>',
                '{afterLabelTextTpl}',
                '</label>',
                '</div>',
                '{afterLabelTpl}',
            '</tpl>',

            '{beforeSubTpl}',
            '{[values.$comp.getSubTplMarkup(values)]}',
            '{afterSubTpl}',

            // Final TD. It's a side error element unless there's a floating external one
            '<tpl if="msgTarget===\'side\'">',
            '{afterBodyEl}',
            '</td>',
            '<td role="presentation" id="{id}-sideErrorCell" vAlign="{[values.labelAlign===\'top\' && !values.hideLabel ? \'bottom\' : \'middle\']}" style="{[values.autoFitErrors ? \'display:none\' : \'\']}" width="{errorIconWidth}">',
            '<div role="alert" aria-live="polite" id="{id}-errorEl" class="{errorMsgCls}" style="display:none"></div>',
            '</td>',
            '<tpl elseif="msgTarget==\'under\'">',
            '<div role="alert" aria-live="polite" id="{id}-errorEl" class="{errorMsgClass}" colspan="2" style="display:none"></div>',
            '{afterBodyEl}',
            '</td>',
            '</tpl>',
            '<tpl if="rightIndent">',
               '<td class="labelable-right-indent" style="width: {rightIndent}px;" ></td>',
            '</tpl>',
            '</tr>',
            {
                disableFormats: true
            }
        ]


    });


    Ext.define("UB.form.FieldContainer", {
        override: "Ext.form.FieldContainer",
        margin: '0 15 0 15'
    });

    Ext.define('UB.layout.container.Accordion', {
        override: 'Ext.layout.container.Accordion',
        beforeRenderItems: function (items) {
            var me = this, i, comp;
            for (i = 0; i < items.length; i++) {
                comp = items[i];
                comp.simpleCollapse = true;
            }
            me.callParent([items]);

        }
    });

    Ext.define('UB.panel.Panel', {
        override: 'Ext.panel.Panel',
        initTools: function() {
            var me = this, vertical;
            if (me.simpleCollapse){
                me.tools = [];

                me.toggleCmp = Ext.widget({
                    xtype: 'component',
                    autoEl: {
                        tag: 'div'
                    },
                    height: 15,
                    width: 35,
                    isHeader: true,
                    //glyph: 0, // me.glyphCollapsed,
                    //handler: me.toggle,
                    id: me.id + '-legendToggle',
                    style: 'float: left; font-size: 1.4em; padding-left: 12px; cursor: pointer;',
                    scope: me
                });
                me.toggleCmp.on('boxready', function(){
                    //me.toggleCmp.getEl().on('click', me.toggle, me);
                });
                if (!me.collapsed){
                    me.toggleCmp.addCls(['fa','fa-angle-down']);
                } else {
                    me.toggleCmp.addCls(['fa','fa-angle-right']);
                }



                vertical = me.headerPosition === 'left' || me.headerPosition === 'right';
                me.header =Ext.widget(Ext.apply({
                    xtype       : 'header',
                    title       : me.title,
                    titleAlign  : me.titleAlign,
                    orientation : vertical ? 'vertical' : 'horizontal',
                    dock        : me.headerPosition || 'top',
                    textCls     : me.headerTextCls,
                    iconCls     : me.iconCls,
                    icon        : me.icon,
                    glyph       : me.glyph,
                    baseCls     : me.baseCls + '-header',
                    tools       : [me.toggleCmp],
                    ui          : me.ui,
                    id          : me.id + '_header',
                    overCls: me.headerOverCls,
                    indicateDrag: me.draggable,
                    frame       : (me.frame || me.alwaysFramed) && me.frameHeader,
                    ignoreParentFrame : me.frame || me.overlapHeader,
                    ignoreBorderManagement: me.frame || me.ignoreHeaderBorderManagement,
                    headerRole  : me.headerRole,
                    ownerCt     : me,
                    listeners   : me.collapsible && me.titleCollapse ? {
                        click: me.toggleCollapse,
                        scope: me
                    } : null
                }, me.header));

                me.header.titleCmp.flex = undefined;
                me.header.addCls(['accordion-header']);

                me.addDocked(me.header, 0);
            } else {
                me.callParent(arguments);
            }
        },

        toggleC: function() {
            var me = this;
            if (!me.toggleCmp){
                return;
            }
            if (!me.collapsed){
                me.toggleCmp.removeCls('fa-angle-right');
                me.toggleCmp.addCls('fa-angle-down');
            } else {
                me.toggleCmp.removeCls('fa-angle-down');
                me.toggleCmp.addCls('fa-angle-right');
            }
        },


        expand: function(animate) {
            var me = this;
            me.callParent(arguments);
            me.toggleC();
        },

        collapse: function(direction, animate){
            var me = this;
            me.callParent(arguments);
            me.toggleC();
        },

        updateCollapseTool: function () {
            var me = this;
            if (!me.simpleCollapse){
                me.callParent(arguments);
            }
        }
    });

});

