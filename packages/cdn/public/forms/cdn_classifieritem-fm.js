exports.formCode = {
  //plugins: {
  //  ptype: 'form-title',
  //  template: '{classifierID}'
  //},

  initUBComponent: function() {
    var
      me = this;

    if (me.parentContext) {
      Object.keys(me.parentContext).forEach(function(attrName) {
        var field = me.parentContext.hasOwnProperty(attrName) ? me.form.findField(attrName) : undefined;
        if (field) {
          field.hide()
        }
      })
    }
    me.getField('classifierID').on('change', me.onClassifierChange, me);
    me.on('formDataReady', me.onFormDataReady);
  },

  onFormDataReady: function() {
    var me = this;

    me.onClassifierChange();
  },

  onClassifierChange: function() {
    var me = this,
      classifierID = me.getField('classifierID').getValue(),
      parentField = me.getField('parentID'),
      parentFieldStore = parentField.getStore(),
      id = parentField.lastSelection.length ? parentField.lastSelection[0].get('ID') : null;

    parentFieldStore.setWhereList({
      '0': { // Filter by classifierID
        expression: 'classifierID',
        condition: 'equal',
        values: {
          v0: classifierID
        }
      }
    });
    parentFieldStore.reload();
    parentField.clearIsPhantom();
    parentField.setValueById(id);
  }
};