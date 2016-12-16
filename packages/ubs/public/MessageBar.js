/**
 * Toolbar widget for display user notification messages. 
 * <a href="See http://docs.ub.softline.kiev.ua/docs/Server/index.html#!/guide/message"> Tutorial is here </a>
 * 
 * @author xmax
 */
Ext.define('UBS.MessageBar', {
    extend: 'UB.view.ToolbarWidget',
    alias: 'widget.ubsmessagebar',
    requires: [
        'UBS.UBReport',
        'UB.ux.PDFComponent',
        'UB.ux.UBTinyMCETextArea'],

    statics: {
        /**
         * Mark a message as accepted
         * @param {Number} recipientID
         * @return {Promise}
         */
        acceptMessage: function(recipientID){
            return $App.connection.run({entity: 'ubs_message_recipient', method: 'accept',
                fieldList: ['ID'],
                execParams: {
                    'ID': recipientID
                }
            });
        },
        showMessage: function(ctx, row, allowNext){
             var me = this, win, defer = Q.defer();
             win = new Ext.Window({
                 modal: true,
                 width: 600,
                 closeAction: 'destroy',
                 stateful: true,
                 stateId: 'messageWin',
                 resizable: true,
                 maximizable: false,
                 minimizable: false,
                 closable: false,
                 padding: '1 1 1 1',
                 overflowX: 'auto',
                 overflowY: 'auto',
                 title: Ext.Date.format(new Date(row.startDate), Ext.util.Format.datetimeFormat) + '  ' +
                     UB.i18n('msgType' + Ext.String.capitalize(row.messageType || ' ')),
                 items: [{
                     html: row.messageBody
                 }],
                 buttons: [{
                     text: UB.i18n('ok'),
                     handler: function(){
                         if (row['recipients.acceptDate']){
                             win.close();
                             defer.resolve('ok');
                             return;
                         }
                         UBS.MessageBar.acceptMessage(row["recipients.ID"]).done(function(){
                             win.close();
                             me.msgWin = null;
                             defer.resolve('ok');
                         });
                     }
                 }, {
                     text: UB.i18n('nextMessage'),
                     hidden: !allowNext,
                     handler: function(){
                         if (row['recipients.acceptDate']){
                             win.close();
                             me.msgWin = null;
                             defer.resolve('ok');
                             return;
                         }
                         UBS.MessageBar.acceptMessage(row["recipients.ID"]).done(function(){
                             win.close();
                             defer.resolve('next');
                         });
                     }
                 }]
             });
             win.show();
             if (ctx){
                 ctx.msgWin = win;
             }
             return defer.promise;
         }
    },

    initComponent: function(){
        var me = this;
        me.hidden = me.hidden || !UB.appConfig.messenger || !UB.appConfig.messenger.enabled;

        var btnMenuItems = [{
            text: UB.i18n('messageHistory'),
            handler: me.showHistory,
            scope: me
        }];
        if ($App.connection.domain.isEntityMethodsAccessible('ubs_message_edit', ['insert', 'update'])){
            btnMenuItems.push({
                text: UB.i18n('actionAdd'),
                handler: function(){
                    $App.doCommand({
                        cmdType: 'showForm',
                        entity: 'ubs_message_edit'
                    });
                },
                scope: me
            });
        }
        me.buttonMessages = Ext.create('Ext.button.Button',{
            border: false,
            glyph: UB.core.UBUtil.glyphs.faBell,
            cls: 'ub-menu-button',
            text: '0',
            tooltip: UB.i18n('msgToolbarTip'),
            handler: me.messageClick,
            scope: me,
            menu: {
                items: btnMenuItems,
                listeners: {
                    beforeshow: function() {
                        return !(me.infoMessages && me.infoMessages.length !== 0); //prevent menu show in case exists info messages
                    },
                    scope: me
                }
            }
        });

        me.items = [
            me.buttonMessages
        ];

        if (!me.hidden) {
            // schedule message checking after ws notification
            if ($App.ubNotifier.supported){
                $App.ubNotifier.on('ubs_message', me.checkMessages.bind(me));
            }
            // In we are already authorized - check for messages
            if ($App.connection.isAuthorized()){
                me.checkMessages();
            }
            // schedule message checking after relogon
            $App.connection.on('authorized', me.checkMessages.bind(me));
        }
        me.callParent(arguments);
    },

    checkMessages: function(){
        var me = this,
            userID = $App.connection.userData('userID'),
            request;

        if (!userID) {
            return;
        }

        me.processRequestStarted = true;
        request = UB.Repository('ubs_message').using('getCached')
            .attrs([/*'ID',*/ 'messageBody','complete','messageType','startDate','expireDate',
                'recipients.ID', 'recipients.acceptDate', 'recipients.userID'])
            .where('[recipients.acceptDate]', 'isNull')
            .orderBy('startDate').ubRequest();
        request.version = me.lastVersion || -1;
        $App.connection.run(request).done(function(response){
            me.processRequestStarted = false;
            me.lastVersion = response.version;
            if (response.resultData.notModified){
                return;
            }

            me.lastData = UB.LocalDataStore.selectResultToArrayOfObjects(response); //.resultData;

            me.doOnMessageRetrieved(me.lastData);
        }, function(err){
            me.processRequestStarted = false;
            throw err;
        });
    },

    showHistory: function(){
        var me = this, store, win;
        store = Ext.create('UB.ux.data.UBStore', {
            pageSize: 30,
            ubRequest: UB.Repository('ubs_message')
                .attrs(['ID', 'messageBody','complete','messageType','startDate','expireDate', 'recipients.ID',
                    'recipients.acceptDate', 'recipients.userID']).orderByDesc('startDate').ubql(),
            autoLoad: true,
            autoDestroy: true
        });

        win = new Ext.Window({
                modal: true,
                width: 700,
                closeAction: 'destroy',
                stateful: true,
                stateId: 'messageHistoryWin',
                resizable: true,
                maximizable: true,
                minimizable: false,
                closable: true,
                title: UB.i18n('messageHistory'),
                layout: {
                     type: 'vbox',
                     align: 'stretch'
                },
                items: [{
                    xtype: 'checkbox',
                    fieldLabel: UB.i18n('onlyUnread'),
                    itemId: 'onlyUnread',
                    listeners:{
                        change: function(owner, value){
                            if (value){
                                store.filter([{
                                    id: 'onlyUnread',
                                    property: 'recipients.acceptDate',
                                    condition: 'isNull'
                                }]);
                            } else {
                                store.clearFilter();
                            }
                        }
                    }
                }, {
                    xtype: 'grid',
                    flex: 1,
                    store: store,
                    hideHeaders: true,
                    viewConfig: {
                        trackOver: false,
                        stripeRows: false
                    },
                    columns: [{
                        dataIndex: 'recipients.acceptDate',
                        renderer: function(value, meta){
                            if (!value){
                               meta.tdCls = 'history-message-cell-accept';
                            }
                            return value;
                        },
                        width: 5,
                        hideable: false
                    }, {
                        text: 'message',
                        dataIndex: 'messageBody',
                        flex: 1,
                        sortable: false,
                        hideable: false,
                        renderer: function(value, meta, record){
                            return UB.format('<div class="history-message-msg-div">{0}</div>',
                                value
                            );
                        }
                    }, {
                        text: 'startDate',
                        dataIndex: 'startDate',
                        renderer: Ext.util.Format.dateRenderer(Ext.util.Format.datetimeFormat || "d.m.Y G:i"),
                        width: 140,
                        hideable: false
                    }, {
                        sortable: false,
                        hideable: false,
                        width: 150,
                        dataIndex: 'messageType',
                        renderer: function(value, p, record){
                            return UB.i18n('msgType' + Ext.String.capitalize(value));
                        }
                    }],
                    listeners: {
                        celldblclick: function( owner, elm, cellIndex, record, tr, rowIndex ){
                            UBS.MessageBar.showMessage(me,{
                                messageBody: record.get('messageBody'),
                                messageType: record.get('messageType'),
                                'recipients.acceptDate': record.get('recipients.acceptDate'),
                                startDate: record.get('startDate'),
                                'recipients.ID': record.get('recipients.ID')
                            }).done(function(res){
                                    record.set('recipients.acceptDate', new Date());
                            });
                        }
                    },
                    bbar: Ext.create( 'UB.view.PagingToolbar', {
                        isPagingBar: true,
                        cls: 'ub-grid-info-panel-tb',
                        padding: '0 0 0 5',
                        autoCalcTotal: false,
                        store: store   // same store GridPanel is using
                    })
                }]
        });
        win.show();
    },

    messageClick: function(){
        var me = this, index = 0, count = me.infoMessages.length;
        if (!me.infoMessages || me.infoMessages.length === 0){
            me.buttonMessages.setText('0');
            me.buttonMessages.removeCls('message-menu-exists');
            return;
        }
        function show(){
           var rw = me.infoMessages[index];
           UBS.MessageBar.showMessage(me, rw, me.infoMessages.length > index + 1)
           .done(function(result){
                count--;
                me.buttonMessages.setText(String(count) );
                if (count > 0){
                    me.buttonMessages.addCls('message-menu-exists');
                } else {
                    me.buttonMessages.removeCls('message-menu-exists');
                }
                if (result === 'next'){
                    index++;
                    show();
                } else {
                    me.infoMessages.splice(0, index + 1);
                }
           });
        }
        show();
    },

    doOnMessageRetrieved: function(data){
       var me = this, dataObj, infoRW = [], attention = [], index;

        if (me.msgWin){
            me.msgWin.close();
            me.msgWin = null;
        }

        dataObj = data;
        _.forEach(dataObj, function(rw){
           if (rw.messageType !== 'information') {
               attention.push(rw);
           } else {
               infoRW.push(rw);
           }
        });

        me.infoMessages = infoRW;
        me.buttonMessages.setText(String(infoRW.length || 0) );
        if (infoRW.length > 0){
            me.buttonMessages.addCls('message-menu-exists');
        } else {
            me.buttonMessages.removeCls('message-menu-exists');
        }

        index = 0;
        function show(){
            UBS.MessageBar.showMessage(me, attention[index])
                .done(function(){
                    index++;
                    if (index < attention.length){
                        show();
                    }
                });
        }
        if (attention.length > 0){
            show();
        }

    }
});
