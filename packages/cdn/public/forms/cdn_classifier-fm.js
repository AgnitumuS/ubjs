exports.formCode = {
  //plugins: {
  //  ptype: 'form-title',
  //  template: '{title}'
  //},

  initUBComponent: function() {
    var
      me = this,
      dataGrid = me.queryById('ubdetailgrid-cdn_classifier');

    dataGrid.getStore().sort('hierarchyLevel', 'ASC');
  }
}
