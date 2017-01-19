/**
 * UnityBase Ext-based client main viewport
 */
Ext.define('UB.view.Viewport', {
  extend: 'Ext.container.Viewport',
  requires: [
    'UB.view.OverflowSelect', // MPV Important for rolluped version
    'UB.view.UBBar',
    'UB.core.UBStoreManager',
    'UB.view.MainToolbar',
    'UB.view.NavigationPanel',
    'UB.view.LeftPanel',
    'Ext.ux.window.Notification',
    'Ext.ux.form.CheckboxGroupFix',
    'UB.ux.UBToolTipOverride'
  ],
  uses: ['UB.core.UBApp'],

  initComponent: function () {
    var me = this
    $App.on({
      updateCenterPanel: me.onUpdateCenterPanel,
      desktopChanged: me.onDesktopChanged,
      scope: me
    })

    me.topPanel = Ext.create('UB.view.MainToolbar', {
      region: 'north',
      collapsible: false,
            // height: 46,
      border: false,
      margin: '0, 0, 0, 0'
    })
    me.leftPanel = Ext.create('UB.view.LeftPanel', {
      header: false,
      region: 'west',
      width: 225, // 280
      margin: '0, 5, 0, 0',
      border: false
//    ,stateful: true,
//    stateId: UB.core.UBLocalStorageManager.getKeyUI('viewportWest')
    })
    me.contextMenu = Ext.create('Ext.menu.Menu', {items: [
      {
        text: UB.i18n('close'),
        scope: me,
        handler: function (item) {
          me.centralPanel.remove(me.centralPanel.items.getAt(me.contextMenu.itemPos))
        }
      },
      {
        text: UB.i18n('closeOther'),
        scope: me,
        handler: function (item) {
          me.centralPanel.items.each(function (cmp, index) {
            if (index !== me.contextMenu.itemPos) {
              me.centralPanel.remove(cmp)
            }
          })
        }
      },
      {
        text: UB.i18n('closeAll'),
        scope: me,
        handler: function (item) {
          me.centralPanel.removeAll()
        }
      }
    ]})

    /**
     * Central panel instance - this is a place where other components opens
     * @property {Ext.tab.Panel} centralPanel
     */
    me.centralPanel = Ext.create('Ext.tab.Panel', {
      region: 'center',
      id: 'ubCenterViewport',
      isMainTabPanel: true,
      deferredRender: false,
      layout: 'fit',
      maxTabWidth: 200,
      border: false,
      margin: '5, 0, 0, 5',
      loader: { autoLoad: false },
      listeners: {
        boxready: function () {
          UB.view.Viewport.centerPanel = me.getCenterPanel()
          if (window.location.href && window.location.href.indexOf('#') > 0) {
            var command = UB.core.UBCommand.getCommandByUrl(window.location.href, me.getCenterPanel())
            if (command) {
              $App.doCommand(command)
            }
          }
        },
        add: function (sender, container, pos) {
          var barItm = me.centralPanel.tabBar.items.getAt(pos)
          barItm.on('boxready', function (sender) {
            sender.getEl().on('contextmenu', function (e, el) {
              me.contextMenu.itemPos = pos
              me.contextMenu.showAt(e.getXY())
            }, me)
          }, me)
        },
        scope: me
      }
    })

    Ext.apply(me, {
      layout: 'border',
      items: [
        me.topPanel,
        me.leftPanel,
        me.centralPanel
      ]
    })
    this.callParent(arguments)

    UB.view.Viewport.main = this
    this.on('destroy', function () {
      this.topPanel = null
      this.leftPanel = null
      UB.view.Viewport.main = null
      UB.view.Viewport.centerPanel = null
    }, this)
  },

    /**
     *
     * @deprecated Use {$App.viewport.centralPanel} instead
     */
  getCenterPanel: function () {
    return this.getLayout().centerRegion
  },

  getLeftPanel: function () {
    return this.leftPanel
  },

  onUpdateCenterPanel: function (url) {
    var centerPanel = this.getCenterPanel()
    if (typeof url === 'string') {
      centerPanel.getLoader().load({url: url})
    } else {
      centerPanel.add(url)
    }
  },

  onDesktopChanged: function (desktop) {
    var url,
      desktopId = parseInt(desktop, 10),
      record = UB.core.UBStoreManager.getDesktopStore().getById(desktopId)

    if (!record || !(url = record.get('Url'))) {
      return
    }
    this.onUpdateCenterPanel(url)
  }
})
