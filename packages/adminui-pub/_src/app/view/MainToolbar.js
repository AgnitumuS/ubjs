require('../core/UBAppConfig')
require('../core/UBUtil')
require('../core/UBLocalStorageManager')
require('./ToolbarWidget')
require('./ToolbarMenu')
require('./ToolbarUser')
require('./ToolbarMenuButton')
require('./FullTextSearchWidget')

/**
 * Main window toolbar container.
 * Content of toolbar is added inside `buildMainMenu` event handler(s).
 * Default toolbar content created in UBM/public/initModel.js
 *
 * See <a href="https://dev.intecracy.com/confluence/display/UB/Ext-based+client.+Main+window+toolbar+customization">Main window toolbar customization</a> article for details.
 */
Ext.define('UB.view.MainToolbar', {
  extend: 'Ext.toolbar.Toolbar',
  alias: 'widget.maintoolbar',
  cls: 'ub-header-menu-container',

  initComponent: function () {
    this.buildToolbar()
    this.callParent(arguments)
    UB.view.MainToolbar.toolbar = this
  },

  buildToolbar: function () {
    let toolBarItems = []
    $App.fireEvent('buildMainMenu', toolBarItems)
    Ext.apply(this, { items: toolBarItems })
  }
})
