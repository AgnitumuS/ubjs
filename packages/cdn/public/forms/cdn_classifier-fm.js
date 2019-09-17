exports.formCode = {
  //plugins: {
  //  ptype: 'form-title',
  //  template: '{classifierTypeID}'
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
    me.getField('classifierTypeID').on('change', me.onClassifierTypeChange, me);
    me.on('formDataReady', me.onFormDataReady);
  },

  onFormDataReady: function() {
    var me = this;

    me.onClassifierTypeChange();
  },

  onClassifierTypeChange: function() {
    var me = this,
      classifierTypeID = me.getField('classifierTypeID').getValue(),
      parentField = me.getField('parentID'),
      parentFieldStore = parentField.getStore(),
      id = parentField.lastSelection.length ? parentField.lastSelection[0].get('ID') : null;

    parentFieldStore.setWhereList({
      '0': { // Filter by classifierTypeID
        expression: 'classifierTypeID',
        condition: 'equal',
        values: {
          v0: classifierTypeID
        }
      }
    });
    parentFieldStore.reload();
    parentField.clearIsPhantom();
    parentField.setValueById(id);
  }
};