/* global Ext */
// create default toolbar menu
const UB = require('@unitybase/ub-pub')
$App.on('buildMainMenu', function (items) {
  if (UB.connection.appConfig.uiSettings.adminUI.customSidebar !== true) {
    items.push(
      Ext.create('UB.view.ToolbarMenuButton'),
      '-'
    )
  }
  items.push(
    Ext.create('UB.view.ToolbarMenu'),
    '->',
    Ext.create('UB.view.ToolbarUser')
  )
})
