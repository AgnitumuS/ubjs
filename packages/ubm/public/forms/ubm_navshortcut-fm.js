var entityRe = /"entity"\s*:\s*"(\w*)"/;

exports.formCode = {
	initUBComponent: function () {
		var
            me = this;
        me.attributeGrid = this.down('commandbuilderentitytreepanel');

        me.getField('cmdCode').addListener('change', me.onCmdCodeChanged, me);
        me.onCmdCodeChanged(null, me.getField('cmdCode').getValue()); // initial data

        me.attributeGrid.addListener('itemdblclick', me.onEntityAttributeGridClick, me);
	},

    onCmdCodeChanged : function(field, newValue){
        var res;
        if (_.isString(newValue)){
            res = entityRe.exec(newValue);
            if (res) {
                this.attributeGrid.setEntity(res[1]);
            }
        }
    },

    onEntityAttributeGridClick: function(tree, record) {
        var
            textToInsert;
        if (record) {
            textToInsert = '"' + record.get("id") + '"';
            this.down('ubcodemirror').editor.replaceSelection(textToInsert);
        }
    },

    addBaseActions: function () {

        this.callParent(arguments);

        this.actions.ActionGenerateUpdateScript = new Ext.Action({
            actionId: 'ActionGenerateUpdateScript',
            actionText: 'Generate update script',
            eventId: 'ActionGenerateUpdateScript',
            handler: function () {
                var folderName = this.getUBCmp('attrParentID').getRawValue(),
                    desktopName = this.getUBCmp('attrDesktopID').getRawValue(),
                    code = this.record.get('code'),
                    caption = this.getUBCmp('attrCaption').getValue(),
                    iconCls = this.record.get('iconCls') ? this.record.get('iconCls') : "";

                var text = "//Desktop: "+ desktopName + ", Folder: " + folderName + ", Caption: " + caption+ ", Code: "+ code +"\n"+
                    "var ID = conn.lookup('ubm_navshortcut', 'ID', UB.Repository('ubm_navshorcut').where('code', '=', '"+this.record.get('code')+"').ubRequest().whereList, true);\n"+
                    "if (ID) {\n"+
                    "    var mi_modifyDate = conn.lookup('ubm_navshortcut', 'mi_modifyDate', UB.Repository('ubm_navshorcut').where('code', '=', '"+this.record.get('code')+"').ubRequest().whereList);\n"+
                    "    conn.run({\n"+
                    "        'entity': 'ubm_navshortcut',\n"+
                    "        'method': 'update',\n"+
                    "        'execParams': {\n"+
                    "            'cmdCode': "+JSON.stringify(this.getUBCmp('attrCmdCode').getModelData().cmdCode)+",\n"+
                    "            'ID': ID,\n"+
                    "            'iconCls' : " + iconCls + ",\n"+
                    "            'mi_modifyDate': mi_modifyDate\n"+
                    "        }\n"+
                    "    });\n"+
                    "} else { \n"+
                    "  var desktopID = conn.lookup('ubm_desktop', 'ID', UB.Repository('ubm_desktop').where('code', '=', '"+this.record.get('desktopID.code')+"').ubRequest().whereList);\n"+
                    "  var parentID = conn.lookup('ubm_navshortcut', 'ID', UB.Repository('ubm_navshorcut').where('code', '=', '"+this.record.get('parentID.code')+"').ubRequest().whereList, true);\n"+
                    "  conn.insert({\n"+
                    "   'entity'  : 'ubm_navshortcut',\n"+
                    "   'execParams' : {\n"+
                    "       'desktopID' : desktopID,\n"+
                    "       'parentID' : parentID,\n"+
                    "       'caption^' : '" + this.record.get('caption')+"',\n"+
                    "       'caption_ru^' : '" + this.record.get('caption')+"',\n"+
                    "       'caption_en^' : '" + this.record.get('caption')+"',\n"+
                    "       'caption_az^' : '" + this.record.get('caption')+"',\n"+
                    "       'code' : '" + this.record.get('code')+"',\n"+
                    "       'isFolder' : " + this.record.get('isFolder')+",\n"+
                    "       'inWindow' : " + this.record.get('inWindow')+",\n"+
                    "       'isCollapsed' : " + this.record.get('isCollapsed')+",\n"+
                    "       'displayOrder' : " + this.record.get('displayOrder')+",\n"+
                    "       'iconCls' : " + iconCls + ",\n"+
                    "       'cmdCode' : " +JSON.stringify(this.getUBCmp('attrCmdCode').getModelData().cmdCode)+"\n"+
                    "    }\n"+
                    "  });\n"+
                    "}\n";
                var wind = new Ext.Window({layout: 'fit', height: 400, width: 500, items: [{xtype:'textarea'}]});
                wind.show(null, function(){
                    var textArea = wind.down('textarea').setValue(text);
                    textArea.focus(500);
                    textArea.selectText(0,10000000000000000);
                });


            },
            scope: this
        });
    }
};