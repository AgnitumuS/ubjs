Ext.define('UB.view.LeftPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.ubleftpanel',
    requires: [
        'UB.core.UBApp', 'UB.core.UBAppConfig', 'UB.core.UBStoreManager', 'UB.core.UBUtilTree', 'UB.view.NavigationPanel'
    ],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    cls: 'ub-left-panel',
    //height: 28,

    initComponent: function () {
        var me = this, storeDS, dsRow;

        me.items = me.items || [];
        me.desktopStore = storeDS = UB.core.UBStoreManager.getDesktopStore();

        var desktopMenu = [], defaultDT, onItemClick, mainButton, menu, dsCurrent, dsCurrentID;

        dsCurrentID = UB.core.UBApp.getDesktop();

        onItemClick = function (sender) {
            mainButton.setText(sender.text);
            mainButton.selectedItemID = sender.itemID;
            UB.core.UBApp.setDesktop(sender.itemID);
        };

        defaultDT = storeDS.getCount() > 0 ? storeDS.getAt(0) : null;
        for (var dsNum = 0; dsNum < storeDS.getCount(); dsNum++) {
            dsRow = storeDS.getAt(dsNum);
            if (dsRow.get('isDefault') === 1) {
                defaultDT = dsRow;
            }
            if (dsCurrentID === dsRow.get('ID')) {
                dsCurrent = dsRow;
            }
            desktopMenu.push({
                text: dsRow.get('caption'),
                itemID: dsRow.get('ID'),
                handler: onItemClick
            });
        }

        me.items.push(mainButton = Ext.create('Ext.button.Button', {
                text: dsCurrent ? dsCurrent.get('caption') : (defaultDT ? defaultDT.get('caption') : '--'),
                cls: 'ub-desktop-button',
                //height: 32,
                selectedItemID: dsCurrent ? dsCurrent.get('ID') : (defaultDT ? defaultDT.get('ID') : null),
                tooltip: UB.i18n('selectDesktop'),
                //arrowAlign: 'bottom',
                iconCls: 'ub-desktop-button-image',
                arrowCls: 'no',
                iconAlign: 'right',
                menu: menu = Ext.create('Ext.menu.Menu', {
                    items: desktopMenu
                })
            }));

        me.items.push(me.navPnl = Ext.create('UB.view.NavigationPanel', {flex: 1}));

        this.addEvents('itemclickstart');
        me.navPnl.on('itemclickstart', this.itemClickStart, this);
        this.callParent(arguments);

        me.on('resize', function (sender, width /*, height, oldWidth, oldHeight*/) {
            menu.setWidth(width);
        });
        me.on('destroy', this.onDestroy(), this);
    },

    itemClickStart: function (shortcut) {
        this.fireEvent('itemclickstart', shortcut);
    },

    onDestroy: function () {
        if (this.navPnl) {
            this.navPnl.on('itemclickstart', this.itemClickStart, this);
        }
        this.navPnl = null;
    }
});



