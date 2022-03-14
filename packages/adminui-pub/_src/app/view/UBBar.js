require('../view/OverflowSelect')
/**
 * Applies to TabPanel's bar UB.view.OverflowSelect style overflow.
 * You do not need to use this class directly.
 */
Ext.define('UB.view.UBBar', {
  override: 'Ext.tab.Bar',

  initComponent: function () {
    this.callParent(arguments)
    var Cls = UB.view.OverflowSelect || this.classOverflowSelect
    this.layout.overflowHandler = new Cls(this.layout)
  },

  afterComponentLayout: function (width) {
    this.needsScroll = false
    this.callParent(arguments)
  }
})
