Ext.define('UDISK.AdminEditShare', {
    extend: 'UB.view.BaseWindow',
    uses: [
        'UB.core.UBLocalStorageManager',
        'UB.core.UBService',
        'UB.core.UBApp',
        'UB.view.ErrorWindow'
    ],

    //padding: 1,
    modal: true,
    title: UB.i18n('editPermission'),
    height: 450,
    width: 600,
    layout: 'fit',
    initComponent: function(){
        var me = this;

        //fileInfoCmp = Ext.widget('label',  {text: me.fileName});
        me.isRoot = me.treePath.split('/').length <= 3;

        me.grid = Ext.widget('ubdetailgrid',{
            xtype: "ubdetailgrid",
            //hideActions: ['addNew', 'addNewByCurrent'],
            extendedColumns: [
                {
                    xtype: 'booleancolumn',
                    colID: 'cardID',
                    text: UB.i18n('udiskForAllItems'),
                    dataIndex: 'count([cardID])',
                    hidden: true,
                    renderer: function(value){
                        return value === me.allChildCount;
                    }
                }
            ],
            parentContext: {cardID: me.itemId},
            entityConfig: {
                    entity: me.entityName,
                    method: "select",
                    fieldList: [{name:'ID',visibility: false},"userID","accessType",
                        {
                            name: 'parentID',
                            description: UB.i18n('udiskIsInherited'),
                            //config: {xty}
                            format: function(value){
                                return value? UB.i18n('udiskTrue'): '';
                            }
                        }],
                    /*model: Ext.define(Ext.id(), {
                        extend: 'Ext.data.Model',
                        entityName: me.entityName,
                        idProperty: 'ID',
                        fields: [
                            {
                                name: "ID",
                                convert: null, // we convert all data just after server response
                                type: "int",
                                useNull: true,
                                mapping: 0
                            },
                            {
                                name: "userID",
                                convert: null, // we convert all data just after server response
                                type: "int",
                                useNull: true,
                                mapping: 1
                            },
                            {
                                name: "accessType",
                                convert: null, // we convert all data just after server response
                                type: "int",
                                useNull: true,
                                mapping: 2
                            },
                            {
                                name: "parentID",
                                convert: null, // we convert all data just after server response
                                type: "int",
                                useNull: true,
                                mapping: 3
                            },
                            {
                                name: "count([cardID])",
                                convert: null, // we convert all data just after server response
                                type: "int",
                                useNull: true,
                                mapping: 4
                            }
                        ]
                    }),*/
                    whereList: {
                        cardId: {
                            expression: '[cardID]',
                                condition: 'equal',
                                values: {"cardID": me.itemId}
                        }
                            /*,
                        notOwner: {
                            expression: '[accessType]',
                                condition: 'notEqual',
                                values: {accessType: 'owner'}
                        }*/
                    }

            },
            openForm: function(eOpts){
                me.openForm(eOpts);
            },
            masterFields: ["ID"],
            detailFields: ["cardID"]
        });

        me.existColumn = null;
        me.grid.columns.forEach(function(column){
            if (column.colID === 'cardID') {
                me.existColumn = column;
                return false;
            }
        });

        /*
        me.ownerTb = Ext.widget('textfield',{
            readOnly: true,
            border: 0,
            fieldLabel: UB.i18n('udiskOwnerField')
        });

        UB.Repository(me.entityName).attrs(['ID', "userID.name", "accessType"])
            .where('cardID', '=', me.itemId)
            .where('accessType', '=', 'owner') // name like '%homer%'
            .select().then(function(response){
                me.ownerTb.setValue(response[0]["userID.name"]);
            });
        */

        me.items = [{
            xtype: 'form',
            margin: '4 4 4 4',
            //layout: 'form',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    defaultType: 'radio',
                    items: [{
                          xtype: 'component',
                          fieldLabel: UB.i18n('Name'),
                          margin: '10 5 10 8',
                          cls: 'udisk-header-label',
                          readOnly: true,
                          html: me.fileName
                       },
                        //me.ownerTb,

                        {
                            xtype: 'button',
                            text: UB.i18n('udiskCopyParentRights'),
                            margin: '7 3 7 3',
                            hidden: !me.isFolder || me.isRoot,
                            handler: function(){
                                me.udiskCopyParentRights();
                            }

                        }/*,
                        {
                            xtype: 'button',
                            text: UB.i18n('udiskAddAccessForChilds'),
                            margin: '7 3 7 3',
                            hidden: !me.isFolder,
                            handler: function(){
                                me.changeAccessForChilds('add');
                            }

                        },
                        {
                            xtype: 'button',
                            margin: '7 3 7 3',
                            hidden: !me.isFolder,
                            text: UB.i18n('udiskRemoveAccessForChilds'),
                            handler: function(){
                                me.changeAccessForChilds('remove');
                            }

                        }*/

                    ]
                },
                me.grid
            ]
        }];

        me.callParent(arguments);
    },

    udiskCopyParentRights: function(){
        var me = this;
        $App.connection.run({
            entity: me.mainEntityName,
            method: 'copyParentRight',
            fieldList: ['ID'],
            ID: me.itemId
        }).then(function(){
            me.grid.store.reload();
        });

    },


    changeAccessForChilds: function(action){
        var me = this, win, userCtrl, accessTypeCtrl, allChild;

        //, accessStore accessStore = UB.core.UBEnumManager.getArrayStore('UDISK_ACCESS_TYPE');

        win = Ext.create('Ext.window.Window', {
                modal: true,
                title: action === 'add' ? UB.i18n('udiskAddAccessForChilds') : UB.i18n('udiskRemoveAccessForChilds'),
                height: 200,
                width: 600,
                layout: 'fit',
                items: [{
                    xtype: 'form',
                    margin: '4 4 4 4',
                    layout: 'form',
                    entityName: me.entityName,
                    parentContext: {cardID: me.itemId},
                    items: [{
                        itemId: 'user',
                        xtype: 'ubcombobox',
                        fieldLabel: UB.i18n('user'),
                        allowBlank: false,
                        store: Ext.create('UB.ux.data.UBStore', {
                            ubRequest: {
                                entity: 'uba_subject',
                                method: UB.core.UBCommand.methodName.SELECT,
                                fieldList: ["ID", "name", "sType"]
                            },
                            autoLoad: false,
                            autoDestroy: true
                        }),
                        valueField: 'ID',
                        displayField: "name",
                        fieldList: ["ID", "name"],
                        entityName: 'uba_user'
                    }, {
                        itemId: 'accessType',
                        hidden: action === 'remove',
                        xtype: 'ubbasebox',
                        disableContextMenu: true,
                        fieldLabel: UB.i18n('accessType'),
                        allowBlank: action === 'remove',
                        store: Ext.create('UB.ux.data.UBStore', {
                            ubRequest: {
                                entity: 'ubm_enum',
                                method: UB.core.UBCommand.methodName.SELECT,
                                fieldList: ['eGroup', 'code', 'name', 'shortName', 'sortOrder'],
                                whereList: {
                                    w: {
                                        condition: 'notEqual',
                                        expression: '[code]',
                                        values: {code: 'owner'}
                                    },
                                    grp: {
                                        condition: 'equal',
                                        expression: '[eGroup]',
                                        values: {eGroup: 'UDISK_ACCESS_TYPE'}
                                    }
                                },
                                idProperty: 'code'
                            },
                            disablePaging: true,
                            autoLoad: true,
                            autoDestroy: true
                        }),
                        valueField: 'code',
                        displayField: 'name',
                        queryMode: "local",
                        editable: false,
                        forceSelection: true,
                        grow: false
                    },{
                        xtype: 'checkbox',
                        checked: false,
                        itemId: 'allChild',
                        fieldLabel: UB.i18n('udiscAllChild')
                    }
                    ]
                }],
            buttons: [
                {
                    text: UB.i18n('ok'),
                    handler: function () {
                        $App.connection.update({entity: me.mainEntityName, method: 'changeAccess', fieldList: ['ID'],
                            execParams: {
                                userID: userCtrl.getValue(),
                                accessType: accessTypeCtrl.getValue(),
                                allChild: allChild.getValue(),
                                cardID: me.itemId,
                                action: action
                            }
                        }).then(function(){
                            win.close();
                        });

                    }
                },/*
                {
                    text: UB.i18n('removeRight'),
                    handler: function () {
                        $App.connection.update({entity: me.mainEntityName, method: 'changeAccess', fieldList: ['ID'],
                            execParams: {
                                userID: userCtrl.getValue(),
                                accessType: accessTypeCtrl.getValue(),
                                allChild: allChild.getValue(),
                                cardID: me.itemId,
                                action: 'remove'
                            }
                        }).then(function(){
                            win.close();
                        });

                        win.close();
                    }
                },*/
                {
                    text: UB.i18n('cancel'),
                    handler: function () {
                        win.close();
                    }
                }
            ]

        });

        userCtrl = win.down('#user');
        accessTypeCtrl = win.down('#accessType');
        allChild = win.down('#allChild');

        /*
        if (action === 'remove') {
            accessTypeCtrl.store.on('load', function () {
                accessTypeCtrl.store.add({code: 'any', name: UB.i18n('any'), shortName: UB.i18n('any')});
            }, {single: true});
        }
        */

        win.show();

    },

    openForm: function(eOpts){
        var me = this, win, store = me.grid.store, selection;

        selection = me.grid.getSelectionModel().getSelection();
        if (selection && selection.length) {
            selection = selection[0];
        } else {
            selection = null;
        }

        if (selection && (selection.get('accessType') === 'owner') && eOpts && eOpts.instanceID){
            win = Ext.create('Ext.window.Window', {
                modal: true,
                title: UB.i18n('editPermission'),
                height: 200,
                width: 600,
                layout: 'fit',
                items: [{
                    xtype: 'basepanel',
                    margin: '4 4 4 4',
                    layout: 'form',
                    entityName: me.entityName,
                    store: store,
                    parentContext: {cardID: me.itemId},
                    instanceID: eOpts.instanceID, // record ? record.get('ID'): null,
                    dfm: {
                        items: [
                            {
                                xtype: 'ubcombobox',
                                fieldLabel: UB.i18n('udiskOwnerField'),
                                attributeName: 'userID',
                                store: Ext.create('UB.ux.data.UBStore', {
                                    ubRequest: {
                                        entity: 'uba_user',
                                        method: 'select',
                                        fieldList: ['ID','name'],
                                        whereList: {

                                        },
                                        orderList: {_asc: {expression: 'name', order: UB.core.UBCommand.order.sqlotAsc}}
                                    },
                                    autoLoad: false,
                                    autoDestroy: true
                                }),
                                valueField: 'ID',
                                displayField: 'name',
                                fieldList: ['ID','name'],
                                entityName: 'uba_user',
                                allowNull: false
                            }
                                //attributeName: 'userID', allowNull: false}
                        ]
                    }
                }]
            });

        } else {

            win = Ext.create('Ext.window.Window', {
                modal: true,
                title: UB.i18n('editPermission'),
                height: 200,
                width: 600,
                layout: 'fit',
                items: [{
                    xtype: 'basepanel',
                    margin: '4 4 4 4',
                    layout: 'form',
                    entityName: me.entityName,
                    store: store,
                    parentContext: {cardID: me.itemId},
                    instanceID: eOpts ? eOpts.instanceID : null, // record ? record.get('ID'): null,
                    dfm: {
                        items: [
                            {attributeName: 'userID', allowNull: false},
                            {
                                attributeName: 'accessType',
                                whereList: {
                                    w: {
                                        condition: 'notIn',
                                        expression: '[code]',
                                        values: {code: me.diskType !== 'secret' ? ['owner']: ['owner','delegate']}
                                    }
                                }
                            }
                        ]
                    }
                }]
            });
        }
        win.show();

            /*
            items: [{
                xtype: 'form',
                margin: '4 4 4 4',
                layout: 'form',
                items: [
                    {
                        xtype: 'panel',
                        items: [{
                            itemId: 'user',
                            xtype: 'ubcombobox',
                            fieldLabel: UB.i18n('user'),
                            allowBlank: false,
                            store: Ext.create('UB.ux.data.UBStore', {
                                ubRequest: {
                                    entity: 'uba_user',
                                    method: UB.core.UBCommand.methodName.SELECT,
                                    fieldList: ["ID", "name"]
                                },
                                autoLoad: false,
                                autoDestroy: true
                            }),
                            valueField: 'ID',
                            displayField: "name",
                            fieldList: ["ID", "name"],
                            entityName: 'uba_user'
                        }, {
                            itemId: 'accessType',
                            xtype: 'ubbasebox',
                            disableContextMenu: true,
                            fieldLabel: UB.i18n('accessType'),
                            allowBlank: false,
                            store: Ext.create('UB.ux.data.UBStore', {
                                ubRequest: {
                                    entity: 'ubm_enum',
                                    method: UB.core.UBCommand.methodName.SELECT,
                                    fieldList: ['eGroup', 'code', 'name', 'shortName', 'sortOrder'],
                                    whereList: {
                                        w: {
                                            condition: 'notEqual',
                                            expression: '[code]',
                                            values: {code: 'owner'}
                                        },
                                        grp: {
                                            condition: 'equal',
                                            expression: '[eGroup]',
                                            values: {eGroup: 'UDISK_ACCESS_TYPE'}
                                        }
                                    },
                                    idProperty: 'code'
                                },
                                disablePaging: true,
                                autoLoad: true,
                                autoDestroy: true
                            }),
                            valueField: 'code',
                            displayField: 'name',
                            queryMode: "local",
                            editable: false,
                            forceSelection: true,
                            grow: false
                        }],
                        buttons: [
                            {
                                text: UB.i18n('addRight'),
                                handler: function () {
                                    var frm = win.down('form'), userCtrl, accessTypeCtrl, params = {}, grid;
                                    if (!frm.isValid()) {
                                        return;
                                    }
                                    userCtrl = win.down('#user');
                                    accessTypeCtrl = win.down('#accessType');
                                    //grid = win.down('ubdetailgrid');


                                    params.userID = userCtrl.getValue();
                                    params.accessType = accessTypeCtrl.getValue();
                                    params.cardID = me.itemId;

                                    $App.connection.insert({
                                        entity: me.entityName,
                                        fieldList: ["cardID", "userID", "accessType"],
                                        execParams: params
                                    })
                                        .then(function () {
                                            store.reload();
                                            //grid.store.reload();
                                        });
                                }
                            }
                        ]

                    }]
            }]
            */

        /*
        userCtrl = win.down('#user');
        accessTypeCtrl = win.down('#accessType');

        if (record) {
            userCtrl.setValue(record.get('userID'));
            accessTypeCtrl.setValue(record.get('accessType'));
        }
        */
        /*
        var store = UB.Repository(me.entityName).attrs(['ID', "userID", "accessType"])
               .where('cardID', '=', 1)
               .where('name', 'contains', 'Homer') // name like '%homer%'
               .select().then(function(response){

        });
        */
        //win.show();
    },

    setListType: function(type){
        var me = this, store = me.grid.store,
            countCtore;
        me.listType = type;
        if (type === 'my'){
            me.existColumn.hide();
            store.ubRequest = {
                entity: me.entityName,
                method: "select",
                fieldList: ['ID', "userID", "accessType"],
                whereList: {
                    cardId: {
                        expression: '[cardID]',
                        condition: 'equal',
                        values: {"cardID": me.itemId}
                    },
                    notOwner: {
                        expression: '[accessType]',
                        condition: 'notEqual',
                        values: {accessType: 'owner'}
                    }
                }
            };
            store.reload();

        } else {
            me.existColumn.show();
            //'myChild'

            if (type === 'myChild') {
                countCtore = UB.Repository(me.mainEntityName).attrs(["count(1)"])
                .where('parentID', 'equal', me.itemId).select();
            } else {
                countCtore = UB.Repository(me.mainEntityName).attrs(["count(1)"])
                    .where('mi_treePath', 'startWith', me.treePath)
                    .where('ID', '!=', me.itemId)
                    .select();

            }
            countCtore.then(function(data){
                me.allChildCount = data[0]["count(1)"];
                store.ubRequest = {
                    entity: me.entityName,
                    method: "select",
                    fieldList: ['max([ID])',"userID","accessType",'count([cardID])'],
                    whereList: {
                        cardId: {
                            expression: '[cardID]',
                            condition: 'notEqual',
                            values: {"cardID": me.itemId}
                        },
                        path: {
                            expression: '[cardID.mi_treePath]',
                            condition: 'startWith',
                            values: {"mi_treePath": me.treePath}
                        },
                        notOwner: {
                            expression: '[accessType]',
                            condition: 'notEqual',
                            values: {accessType: 'owner'}
                        }
                    },
                    groupList: ["userID","accessType"]
                };
                if (type === 'myChild') {
                    store.ubRequest.path = {
                        expression: '[cardID.parentID]',
                        condition: 'equal',
                        values: {"cardID.parentID": me.itemId}
                    };
                }
                store.reload();
            });
        }


    }

});

