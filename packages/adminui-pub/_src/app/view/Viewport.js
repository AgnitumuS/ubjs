/**
 * UnityBase Ext-based client main vievport
 */
Ext.define('UB.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'UB.core.UBApp',
        'UB.core.UBStoreManager',
        'UB.view.MainToolbar',
        'UB.view.NavigationPanel',
        'UB.view.LeftPanel',
        'Ext.ux.window.Notification',
        'UB.view.UBBar',
        'Ext.ux.form.CheckboxGroupFix',
        'UB.ux.UBToolTipOverride'
    ],

    initComponent: function() {
        var
            me = this;
        $App.on({
            updateCenterPanel: me.onUpdateCenterPanel,
            desktopChanged: me.onDesktopChanged,
            scope: me
        });

        me.topPanel =  Ext.create('UB.view.MainToolbar',{
            region: 'north',
            collapsible: false,
            //height: 46,
            border: false,
            margin: '0, 0, 0, 0'
        });
        me.leftPanel = Ext.create('UB.view.LeftPanel', {
            header: false,
            region: 'west',
            width: 225, //280
            //split: {size: 2},
            margin: '0, 5, 0, 0',
            //collapsible: true,
            border: false
//            ,stateful: true,
//            stateId: UB.core.UBLocalStorageManager.getKeyUI('viewportWest')
        });
        me.contextMenu = Ext.create('Ext.menu.Menu',{items:[
            {
                text    : UB.i18n('close'),
                scope   : me,
                handler : function(item) {
                    me.centralPanel.remove( me.centralPanel.items.getAt(me.contextMenu.itemPos));
                }
            },
            {
                text    : UB.i18n('closeOther'),
                scope   : me,
                handler : function(item) {
                        me.centralPanel.items.each(function(cmp, index){
                            if (index !==  me.contextMenu.itemPos){
                                me.centralPanel.remove( cmp );
                            }
                        });
                }
            },
            {
                text    : UB.i18n('closeAll'),
                scope   : me,
                handler : function(item) {
                    me.centralPanel.removeAll();
                }
           }
        ]});

        /**
         * Central panel instance - this is a place where other components opens
         * @property {Ext.tab.Panel} centralPanel
         */
        me.centralPanel =  Ext.create('Ext.tab.Panel',{
            region: 'center',
            id: 'ubCenterViewport',
            isMainTabPanel: true,
            deferredRender: false,
            layout: 'fit',
            maxTabWidth: 200,

            //tabBar: {columnWidth: 150},
            border: false,
            margin: '5, 0, 0, 5',
            //            style: { background: 'white'},
            loader: { autoLoad: false },
//            html: ['<svg id="UBLogo" width="150" style="fill:#205081;fill-opacity:0.2">',
//                '<g transform="translate(30%, 30%) scale(1, 1)">',
//                '    <path d="m 82.827902,20.258506 -3.779969,15.080556 c 0,0 5.122147,-6.232156 15.281068,-6.633182 l 3.982395,-15.735811 -15.483494,7.288437 z"></path>',
//                '    <path d="m 31.093126,44.607672 15.197597,-7.152209 c 0,0 -17.315918,41.004075 1.222257,43.485045 C 66.9453,83.541387 67.022049,40.979283 89.740267,34.675171 115.18984,27.614102 125.57613,48.325282 125.22308,58.900574 124.58701,78.00479 113.55506,85.416024 109.79523,87.783786 89.272088,100.7038 74.196327,85.414109 74.196327,85.414109 c 0,0 4.257743,-5.779322 6.262859,-10.605033 1.771979,2.30445 5.978881,6.354005 14.303458,6.354005 18.625476,0 25.615546,-33.655194 4.957133,-35.488572 C 86.311429,44.484868 80.758515,61.719244 78.372527,66.327164 73.7694,75.217777 67.803948,94.332542 44.394981,92.349494 15.036875,89.86469 31.093126,44.607672 31.093126,44.607672 z"></path>',
//                '</g>',
//            '</svg>'].join(''),

            listeners: {
                boxready: function(){
                    UB.view.Viewport.centerPanel = me.getCenterPanel();
                    if (window.location.href && window.location.href.indexOf('#') > 0){
                        var command = UB.core.UBCommand.getCommandByUrl(window.location.href, me.getCenterPanel());
                        if (command){
                           $App.doCommand(command);
                        }
                    }
                },
                add: function(sender, container, pos){
                    var barItm =  me.centralPanel.tabBar.items.getAt(pos);
                    barItm.on('boxready', function(sender){
                        sender.getEl().on('contextmenu', function(e,el) {
                            me.contextMenu.itemPos = pos;
                            me.contextMenu.showAt(e.getXY());
                        }, me);
                    }, me);

                },
                scope: me
            }
        });

        Ext.apply(me, {
            layout: 'border',
            items: [
                me.topPanel,
                me.leftPanel,
                me.centralPanel
            ]
        });

        /*
        me.on('boxready', function(){
            var el = me.getEl();
            if (el){
               el.on('keydown', function(e){
                   var activeNodeName, activeElType;
                   if(document.activeElement){
                      activeNodeName = document.activeElement.nodeName;
                      activeElType = document.activeElement.type;
                   }
                   if (e.getKey() === 8  && (
                       (activeNodeName !== 'INPUT' && activeNodeName !== 'TEXTAREA') ||
                       (activeNodeName === 'INPUT' && activeElType !== 'TEXT' && activeElType !== 'text')
                       )){
                       e.preventDefault();
                   }
               });
            }
        });
        */
        this.callParent(arguments);

        UB.view.Viewport.main = this;
        this.on('destroy', function(){
            this.topPanel = null;
            this.leftPanel = null;
            UB.view.Viewport.main = null;
            UB.view.Viewport.centerPanel = null;
        }, this);
    },

    /**
     *
     * @deprecated Use {$App.viewport.centralPanel} instead
     */
    getCenterPanel: function() {
        return this.getLayout().centerRegion;
    },

    getLeftPanel: function() {
        return this.leftPanel;
    },

    onUpdateCenterPanel: function(url) {
        var centerPanel = this.getCenterPanel();
        if(typeof url==='string'){
            centerPanel.getLoader().load({url: url});
        }else{
            centerPanel.add(url);
        }
    },
    
    onDesktopChanged: function(desktop) {
        var url,
            desktopId = parseInt(desktop, 10),
            record = UB.core.UBStoreManager.getDesktopStore().getById(desktopId);

        if(!record || !(url=record.get('Url'))){
            return;
        }
        this.onUpdateCenterPanel(url);
    }
});
