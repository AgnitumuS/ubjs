/**
 * Implements Date selection in separate window
 */
Ext.define('UB.view.InputDateWindow', {
  extend: 'Ext.window.Window',
  alias: 'widget.inputdatewindow',

  padding: 1,
  autoShow: true,
  autoDestroy: true,
  closable: false,
  border: 0,
  layout: 'fit',
  modal: true,
  initComponent: function () {
    const
      me = this
    const fieldDate = Ext.create('Ext.form.field.Date', {
      allowBlank: false,
      blankText: UB.i18n('requiredField'),
      fieldLabel: UB.i18n('aktualnoS'),
      anchor: '100%',
      value: new Date(),
      listeners: {
        scope: me,
        specialkey: function (field, e, eOpts) {
          switch (e.getKey()) {
            case e.ENTER:
              me.onButtonClick()
              break
            case e.ESC:
              me.close()
              break
          }
        }
      }
    })
    const form = Ext.create('Ext.form.Panel', {
      frame: true,
      items: [fieldDate]
    })

    Ext.apply(me, {
      title: UB.i18n('aktualnoS'),
      defaultFocus: fieldDate,
      items: [form],
      fieldDate: fieldDate,
      buttons: [{
        text: Ext.MessageBox.buttonText.ok,
        scope: me,
        handler: me.onButtonClick
      }, {
        text: Ext.MessageBox.buttonText.cancel,
        scope: me,
        handler: me.close
      }]
    })

    me.callParent(arguments)
  },

  onButtonClick: function (btn, e) {
    const
      me = this
    const date = me.fieldDate.getValue()

    Ext.callback(me.callback, me.callback, [date])
    me.close()
  }
})
