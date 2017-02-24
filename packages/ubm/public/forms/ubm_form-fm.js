exports.formCode = {
    propTree: null,
    codeTabs: null,

    initUBComponent: function() {
        var
            me = this,
            code = this.getField('code').getValue(),
            fn;

		    me.down('label[ubID="newFormTip"]').setVisible(me.isNewInstance);
        me.getField('code').addListener('change', me.onCodeChanged, me);
        me.getField('entity').addListener('change', me.onEntityChanged, me);

        me.entityCode = me.getField('entity').getValue();
        me.propTree = me.down('commandbuilderentitytreepanel[cbID="1"]');
        me.propTree.addListener("itemdblclick", me.onEntityTreePanelItemDblClick, me);

        me.propTree1 = me.down('commandbuilderentitytreepanel[cbID="2"]');
        me.propTree1.addListener("itemdblclick", me.onEntityTreePanelItemDblClick, me);


        me.propTree1.setEntity(me.entityCode);
        me.propTree.setEntity(me.entityCode);

        me.formDefEditor = me.down('ubcodemirror[name="formDef"]');

        me.codeTabs = me.down('tabpanel');
        me.designer = me.down('UBVDesigner');
        me.designer.setEntityCode(me.entityCode);
        me.codeTabs.on('tabchange', function( tabPanel, newCard, oldCard ){
            if (me.codeTabs.getActiveTab().isDesigner){
                if (me.record.get('formType') === 'auto' ){
                    me.designer.setVisible(true);
                    me.designer.setValue(me.formDefEditor.getValue());
                } else {
                    me.designer.setVisible(false);
                }
            }
        });
        if (!me.isEditMode) { //new form
            me.record.set('ID', null); // ID will be calculated as crc32(code)
            me.getUBCmp("attrFormDef").setValue("{\"store\":\"mdb\",\"fName\":\"" + (fn = code.length > 0 ? code + ".def" : "") + "\",\"origName\":\"" + fn + "\",\"ct\":\"application/def\",\"size\":0,\"isDirty\":true}", this.instanceID);
            me.getUBCmp("attrFormCode").setValue("{\"store\":\"mdb\",\"fName\":\"" + (fn = code.length > 0 ? code + ".js" : "") + "\",\"origName\":\"" + fn + "\",\"ct\":\"application/javascript\",\"size\":0,\"isDirty\":true}", this.instanceID);
        } else {
          me.getUBCmp("attrCode").setReadOnly(true)
          me.getUBCmp("attrModel").setReadOnly(true)
          me.getUBCmp("attrEntity").setReadOnly(true)
        }
        $App.connection.authorize().then(function(session){me.CRC32 = session.crc32})
    },

    onCodeChanged: function(field, newValue, oldValue, eOpts) {
        if (this.isEditMode) {
          throw new UB.UBError('To change form code rename both *-fm.js and *-fm.def files in folder "yourModel\\public\\forms"')
        }
        this.record.set('ID', this.CRC32(newValue))
        this.getUBCmp("attrFormDef").setOrigName(newValue.length > 0 ? newValue + ".def" : newValue);
        this.getUBCmp("attrFormCode").setOrigName(newValue.length > 0 ? newValue + ".js" : newValue);
    },

    onSave: function(action) {
        var
            me = this,
            res = true,
			      className;

        if (!this.formDefEditor){
            this.formDefEditor = this.down('ubcodemirror[name="formDef"]');
        }
        var codeEditor = this.down('ubcodemirror[name="formCode"]');

        if (res) {
            UB.core.UBFormLoader.clearFormCache(me.record.get('code'));
			      // undefine ExtJS based form (remove class)
            if (me.record.get('formType') === 'custom'){
				      className = UB.core.UBFormLoader.getComponentClassName(this.formDefEditor.getValue());
              if (className) {
                UB.core.UBFormLoader.undefineExtClass(className);
              }
            } else {
              UB.core.UBFormLoader.reloadModule(codeEditor.getValue(), this.formDefEditor.getValue(), me.record.get('code'))
            }
            this.callParent([action]);
            UB.core.UBStoreManager.getFormStore().reload()
        } else {
            $App.dialogError('Errors', 'There is errors in script. Check for errors. Save is not performed').done();
            return false;
        }
    },

    onEntityChanged: function(field, newValue) {
        var
            me = this, code_parts, newCode;

        if ($App.connection.domain.entities[newValue]){
           me.entityCode = newValue;
           me.propTree.setEntity(newValue);
           me.propTree1.setEntity(newValue);
           if (me.record.get('formType') === 'auto' ){
              me.designer.setEntityCode(newValue);
           }
           code_parts = me.getField('code').getValue().split('-');
           code_parts[0] = newValue;
           newCode = code_parts.join('-');
           if (newCode !== me.getField('code').getValue()){
               me.getField('code').setValue(newCode);
           }
           me.record.set('model', $App.connection.domain.entities[newValue].modelName)
           //field.nextSibling('commandbuilderentitytreepanel').setEntity(newValue);
       }
    },

    onEntityTreePanelItemDblClick: function(tree, record) {
        var
            aTab = this.codeTabs.getActiveTab(),
            aCodeMirror,
            textToInsert = '';
        if (record) {
            if (aTab.isDefifnition) { // definition === this.codeTabs.items.getAt(1)
                textToInsert = "{ attributeName: \"" + record.get("id") + "\" /*" + record.get("text").replace(/\[[^\)]+\]/gi, "") + "*/}";
            } else { // module
                textToInsert = "this.getField('" + record.get('id') + "')";
            }
            aCodeMirror = aTab.down('ubcodemirror').codeMirrorInstance
            aCodeMirror.replaceSelection(textToInsert)
            aCodeMirror.getInputField().focus()
        }
    },

    beautyJS: function() {
        var
            aTab = this.codeTabs.getActiveTab(),
            editor = aTab.down('ubdocument').ubCmp,
            txt = editor.getValue();
        UB.inject('models/UBS/js_beautify.js').then(function() {
            txt = js_beautify(txt, {
              'indent_size': 2,
              'indent_char': ' '
            })
            editor.setValue(txt);
            aTab.down('ubdocument').checkContentChange();
        })
    }
};
