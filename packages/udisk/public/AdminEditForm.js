/*global UDISK*/
Ext.define("UDISK.AdminEditForm", {
    extend: 'UB.view.BasePanel',
    width: 700,
    height: 500,
    //title: UB.i18n('udiskProperties'),

    initComponent: function(){
        var me = this;
        me.adminMode = me.mode === 'admin';
        me.requiredFields = ['isFolder', 'mi_createUser', 'mi_createDate', 'mi_modifyUser', 'mi_modifyDate'];
        me.createConfig();
        me.hasAccessPromise = UDISK.AdminView.hasAccess(me.instanceID, 'write', me.entityName, me.adminMode);

        me.prepareDfmItems(me.items, true);

        me.on('formDataReady', me.adminFormDataReady, me);
        me.callParent(arguments);
    },


    adminFormDataReady: function(){
        var me = this, webDavLink, host, port;
        if (!me.adminMode && me.record.get('isFolder')) {
            me.down('ubdocument').setWidth(0);
            //me.down('#fileData').setDisabled(me.record.get('isFolder'));
        }
        function lockAction(action){
            action.initialConfig.blocked = true;
            action.disable();
            action.hide();
        }

        me.hasAccessPromise.done(function(hasAccess){
            if (!hasAccess && !(me.adminMode && me.record.get('isFolder')) ){
                me.disableEdit();
                lockAction(me.actions[UB.view.BasePanel.actionId.fDelete]);
                lockAction(me.actions[UB.view.BasePanel.actionId.save]);
                lockAction(me.actions[UB.view.BasePanel.actionId.unLock]);
                lockAction(me.actions[UB.view.BasePanel.actionId.lock]);
            }
        });

        webDavLink = me.down('#webdavlink');
        if (webDavLink) {
            if (me.record.get('isFolder')) {
                webDavLink.hide();
            } else {
                webDavLink.show();
            }
            host = $App.connection.serverUrl.split('/')[2]; // host:port
            host = host.split(':');
            if (host.length === 2) {
                port = host[1];
            }
            host = host[0];

            webDavLink.setValue(['\\', host + '@' + (port || '80'), me.WebdavProviderName, me.entityName, me.record.get('ID'), me.record.get('name')].join('\\'));
        }

    },

    addBaseDockedItems: function(){
        var me = this, topPanel, actions = UB.view.BasePanel.actionId;
        me.callParent();
        topPanel = me.dockedItems[0];
        topPanel.items.splice( topPanel.items.length - 2, 0,
            me.actions[actions.lock], me.actions[actions.unLock]
        );

    },

    onUnLock: function(){
        var me = this;
        if (this.hasPersistLock) {
            $App.dialogYesNo('udiskUnlockCheckDavTitle','udiskUnlockCheckDav')
            .done(function(res){
                if (res){
                    me.removePersistLock().done();
                }
            });

        }
    },

    createConfig: function(){
        var me = this, docCfg;
        me.padding = '4 4 4 4';
        me.baseFieldList = [];

        docCfg = me.adminMode ? {
            itemId: 'fileData',
            split: true,
            //region:'west',
            flex: 2,
            xtype:  'panel'
        }: {
            itemId: 'fileData',
            split: true,
            //region:'west',
            flex: 2,
            attributeName: "fileData",
            xtype:  'ubdocument',
            expanded: true
        };

        me.items = [
            docCfg,
            {
                xtype: 'splitter'
            },{
                //split: true,
                //padding: '8 8 8 8',
                margin: '8 8 8 8',
                //region: 'center',
                //region:'east',
                //width: 300,
                flex: 1,
                layout: 'form',
                items: [
                    { attributeName: "name", xtype: 'ubtextfield' },
                    //{ attributeName: "parentID" },
                    { attributeName: "fcomment" },
                    { attributeName: "fsize", oneWayBinding: true, readOnly: true },
                    { attributeName: "contentType", oneWayBinding: true, readOnly: true },
                    { fieldLabel: UB.i18n('udiskCreateUser'), attributeName: "mi_createUser", readOnly: true },
                    { fieldLabel: UB.i18n('udiskCreateDate'), attributeName: "mi_createDate", readOnly: true },
                    { fieldLabel: UB.i18n('udiskUpdateUser'), attributeName: "mi_modifyUser", readOnly: true },
                    { fieldLabel: UB.i18n('udiskUpdateDate'),  attributeName: "mi_modifyDate", readOnly: true },
                    { fieldLabel: UB.i18n('udiskWebDavLink'), xtype: 'textfield', itemId: 'webdavlink', selectOnFocus: true }
                    //{ attributeName: "isFolder", readOnly: true }
                    //{ attributeName: "owner", readOnly: true }
                ]
            }

        ];

        me.layout = {type: "hbox", align: 'stretch'};
        //me.layout = {type: "border"};


    }

});
