/**
 * Реализует функционал панели навигации приложения
 */
Ext.define('UB.view.NavigationPanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.navigationpanel',
    requires: [
        'UB.core.UBApp',
        'UB.core.UBAppConfig',
        'UB.core.UBStoreManager',
        'UB.core.UBUtilTree',
        'UB.ux.tree.Column'
    ],

    uses: [
        'UB.view.Viewport'
    ],
    cls: 'tree_wrap',
    //singleExpand: true,
    viewConfig :{
        showTreeLines: false
    },
    hideHeaders: true,
    folderSort: false,
    //animCollapse: true,

    initComponent: function() {
        var me = this;
        if (!me.desktopID){
           $App.addListener('desktopChanged', me.onDesktopChanged, me);
        }

        me.storeNavigationShortcut = UB.core.UBStoreManager.getNavigationShortcutStore();

        me.viewConfig = {
            toggleOnDblClick: false
        };

        //me.addCls(me.autoWidthCls);
        me.columns = [{
            xtype    : 'ubtreecolumn',
            text     : 'Name',
            width    : '100%', // Ext.isIE6 ? '100%' : 10000, // IE6 needs width:100%
            dataIndex: me.displayField
        }];


        Ext.apply(me, {
            store: Ext.create('Ext.data.TreeStore', {
                root: UB.core.UBUtilTree.arrayToTreeRootNode(me.getData($App.getDesktop())),
                sortOnLoad: false

                //,folderSort: true
            }),
            rootVisible: false,
            useArrows: true,
            cls: 'no_expand_icon no-leaf-icons no-parent-icons nav-shortcut leftMenu'
        });

        var storeDS = UB.core.UBStoreManager.getDesktopStore();
        storeDS.each(function(dsItem){
            me.store.setRootNode(UB.core.UBUtilTree.arrayToTreeRootNode(me.getData(dsItem.get('ID')) ));
            _.forEach(me.store.tree.root.childNodes, function(item, index){
                 if (index > 0 && item.isExpanded() ){
                     item.collapse(false);
                 }
            });
        });

        me.store.on('expand', function(node, opt){
            if (!node.parentNode){
                return;
            }
            node.parentNode.eachChild(function(child){
                if (child !== node && child.isExpanded() && child.childNodes.length > 0 ){
                    child.collapse(false);
                }
            });
        });

        me.callParent(arguments);

        me.addListener('itemclick', me.onItemClick, me);

        me.addEvents('itemclickstart');
        me.initContextMenu();

        if (me.desktopID){
           me.onDesktopChanged(me.desktopID);
        }
    },

    initContextMenu: function(){
        var
            me = this, entity,
            navFields = UB.core.UBAppConfig.systemEntities.navigationShortcut.fields,
            entityName = me.storeNavigationShortcut.ubRequest.entity,
            updateStore= function(store, record, operation, modifiedFieldNames, eOpts ){

                if(me.desktopID && (!operation || Ext.data.Model.COMMIT ===operation)){
                    me.onDesktopChanged(me.desktopID);
                    return;
                }
                if(me.currentDesktop && (!operation || Ext.data.Model.COMMIT ===operation)){
                    me.onDesktopChanged(me.currentDesktop);
                }
            };

        entity = $App.domainInfo.get('ubm_navshortcut');

        me.storeNavigationShortcut.on({
            datachanged: updateStore,
            update: updateStore
        });

        var editAction = new Ext.Action({
            iconCls: "icon-pencil",
            text: UB.i18n("redactirovat"),
            disabled: !entity.haveAccessToMethod('update'),
            handler: function(){
                var
                    rec = me.contextMenu.currentRecord,
                    cmdConfig = {
                        cmdType: UB.core.UBCommand.commandType.showForm,
                        entity: me.storeNavigationShortcut.ubRequest.entity,
                        instanceID: rec.get('ID'),
                        store: me.storeNavigationShortcut
                    };
                UB.core.UBApp.doCommand(cmdConfig);
            },
            scope: this
        });

        var addShortcutAction = new Ext.Action({
            iconCls: "icon-tag-blue-add",
            text: UB.i18n("dobavitYarlik"),
            disabled: !entity.haveAccessToMethod('insert'),
            handler:  function(){
                var
                    rec = me.contextMenu.currentRecord,
                    instanceID = rec.get('ID'),
                    parentID = rec.get(navFields.folderID),
                    item = !parentID ? me.storeNavigationShortcut.findRecord(navFields.folderID, instanceID): null,
                    cmdConfig;
                rec = item || rec;
                instanceID = rec.get('ID');
                cmdConfig = {
                    cmdType: UB.core.UBCommand.commandType.showForm,
                    entity: entityName,
                    addByCurrent: true,
                    store: me.storeNavigationShortcut,
                    instanceID: instanceID
                };
                UB.core.UBApp.doCommand(cmdConfig);
            },
            scope: this
        });

        var addFolderAction = new Ext.Action({
            iconCls: "icon-folder-add",
            text: UB.i18n("dobavitDirectoriu"),
            disabled: !entity.haveAccessToMethod('insert'),
            handler:  function(){
                var
                    rec = me.contextMenu.currentRecord,
                    parentID = rec.get(navFields.folderID),
                    parent = parentID ? me.storeNavigationShortcut.findRecord('ID', parentID) : parentID,
                    cmdConfig;
                rec = parent || rec;
                    cmdConfig = {
                        cmdType: UB.core.UBCommand.commandType.showForm,
                        entity: entityName,
                        addByCurrent: true,
                        store: me.storeNavigationShortcut,
                        instanceID: rec.get('ID')
                    };
                UB.core.UBApp.doCommand(cmdConfig);
            },
            scope: this
        });


        var deleteShortcutAction = new Ext.Action({
            text: UB.i18n('Delete'),
            iconCls: "iconDelete",
            scope: this,
            disabled: !entity.haveAccessToMethod('delete'),
            handler: function(){
                var
                    rec = me.contextMenu.currentRecord,
                    instanceID = rec.get('ID');
                $App.dialogYesNo('podtverditUdalenije', 'vyUvereny')
                    .done(function(choice){
                        if (choice){
                            $App.connection.run({
                                entity: entityName,
                                method: UB.core.UBCommand.methodName.DELETE,
                                execParams: {ID: instanceID}
                            }).done(function(){
                                me.storeNavigationShortcut.reload();
                            })
                        }
                    });
            }
        });


        me.contextMenu = Ext.create("Ext.menu.Menu", {
             items: [
                 editAction,
                 addShortcutAction,
                 addFolderAction,
                 {xtype: 'menuseparator' },
                 deleteShortcutAction
             ]
        });

        me.addListener("itemcontextmenu", function(view, rec, node, index, e) {
            e.stopEvent();
            me.contextMenu.currentRecord = me.storeNavigationShortcut.getById( rec.get('id'));
            me.contextMenu.showAt(e.getXY());
            return false;
        }, this);
    },

    onItemClick: function(view, record, item, index, event, eOpts) {
        var
            me = this,
            commandConfig,
            recordId, navFields, shortcut;
        if (me.clickDisabled) {
            return;  // Если быстро клацать по папке в навигационной панели, то рендерятся несколько блоков одинаковых ярлыков https://enviance.softline.kiev.ua/jira/browse/UB-361
        }
        me.clickDisabled = true;
        setTimeout(function(){
            me.clickDisabled = false;
        }, 300);

        if (record.childNodes &&  record.childNodes.length > 0){
            event.stopEvent();
            if (record.isExpanded()){
                record.collapse();
            } else {
                record.expand();
            }
            return;
        }

        recordId = parseInt(record.getId(), 10);
        navFields = UB.core.UBAppConfig.systemEntities.navigationShortcut.fields;
        shortcut = this.storeNavigationShortcut.getById(recordId);

        me.fireEvent('itemclickstart', shortcut);
        if (shortcut.get('isFolder')){
            return;
        }

        try{
            commandConfig = Ext.JSON.decode(shortcut.get(navFields.commandCode));
        } catch (e){
            UB.showErrorWindow(e.message || e );
            throw e;
        }

        commandConfig.commandContext = {menuButton: item, event: event };
        if(!shortcut.get(navFields.inWindow)){
            commandConfig.tabId = 'navigator' + recordId;
            commandConfig.target = $App.getViewport().getCenterPanel();
        }

        $App.doCommand(commandConfig);
    },

    /**
     * 
     * @param {Number} desktop
     * @return {Object[]}
     */
    getData: function(desktop) {
        var
            data = [],
            navFields = UB.core.UBAppConfig.systemEntities.navigationShortcut.fields,
            getLevel, isFirst = true;

            getLevel = function(path){
                if (!path){
                    return 1;
                }
                var mr = path.match(/(\/)/g);
                if (!mr){
                    return 1;
                }
                return mr.length - 1;
            };

        this.storeNavigationShortcut.each(function(record) {
            var level;
            if(record.get(navFields.desktopID)=== desktop){
                level = getLevel(record.get(navFields.ubTreePath));
                data.push({
                    id: record.get('ID'),
                    text: //'<span class="' +  (record.get(navFields.isFolder) === 1 ?  'fa fa-folder-o' : 'fa fa-leaf') + '">' +
                        record.get(navFields.caption), // + '</span>',
                    leaf: !record.get(navFields.isFolder),
                    parentId: record.get(navFields.folderID),
                    treepath: record.get(navFields.ubTreePath),
                    displayOrder: record.get(navFields.displayOrder),
                    desktopID: record.get(navFields.desktopID),
                    expanded: (isFirst && level === 1 || level > 1)  && !record.get(navFields.isCollapsed),
                    iconCls: record.get('iconCls') || 'fa fa-space',
                    cls: 'ub_navpnl_item' + (level < 4 ? ' ub_navpnl_item_l' + level : ''  )  //record.get('cls')
                    //iconCls: record.get(navFields.isFolder) === 1 ?  'fa fa-folder-o' : 'fa fa-leaf'
                });
                isFirst = false;
            }
        });

        return data;
    },
    
    onDesktopChanged: function(desktop) {
        this.getStore().setRootNode(UB.core.UBUtilTree.arrayToTreeRootNode(this.getData(desktop)));
        this.currentDesktop = desktop;
        _.forEach(this.getStore().tree.root.childNodes, function(item, index){
            if (index > 0 && item.isExpanded() ){
                item.collapse(false);
            }
        });
    }
});