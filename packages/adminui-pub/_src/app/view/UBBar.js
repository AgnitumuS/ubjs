/**
 * Applies to TabPanel's bar UB.view.OverflowSelect style overflow.
 * You do not need to use this class directly.
 */
Ext.define('UB.view.UBBar', {
    override: 'Ext.tab.Bar',
    requires: ['UB.view.OverflowSelect'],

    // в сборанной версии не попадает в глобал скоп внутри initComponent
    classOverflowSelect: UB.view.OverflowSelect,
    initComponent: function() {
        this.callParent(arguments);
        var cls = UB.view.OverflowSelect || this.classOverflowSelect;
        this.layout.overflowHandler = new cls(this.layout);
            //new Ext.layout.container.boxOverflow.Menu(this.layout);
    },

    afterComponentLayout : function(width) {
        this.needsScroll = false;
        this.callParent(arguments);
    }
});

