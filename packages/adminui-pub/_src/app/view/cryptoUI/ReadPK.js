/* global Ext, $App */
const UB = require('@unitybase/ub-pub')
/**
 * Form for reading user private key (from file system store)
 * @author xmax on 11.08.2017.
 */
Ext.define('UB.view.cryptoUI.ReadPK', {
  extend: 'Ext.window.Window',
  alias: 'widget.readpkwindow',

  uses: [
    'UB.core.UBApp',
    'UB.core.UBAppConfig'
  ],

  statics: {
    /**
     * Perform UnityBase `adminUI` form private key and password.
     * @return {Promise}
     */
    getPkParam: function () {
      let readPkForm = Ext.create('UB.view.cryptoUI.ReadPK', {})

      let readPk = new Promise(function (resolve, reject) {
        readPkForm.deferred = {resolve: resolve, reject: reject}
      })
      readPkForm.show()

      return readPk
    }
  },

  layout: 'anchor',
  buttonAlign: 'center',
  width: 500,
  plain: true,
  modal: true,
  closable: false,
  header: true,
  resizable: false,

  listeners: {
    afterRender: function (thisForm, options) {
      this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
        enter: this.submitForm,
        scope: this
      })
    }
  },

  initComponent: function () {
    let me = this

    me.title = UB.i18n('ReadPkTitle')
    me.items = []
    me.buttons = [{
      text: UB.i18n('ok'),
      scope: this,
      minWidth: 150,
      margins: '0 0 10 0',
      handler: function () {
        this.submitForm()
      }
    }, {
      text: UB.i18n('сancel'),
      scope: this,
      minWidth: 150,
      margins: '0 0 10 0',
      handler: function () {
        me.deferred.reject(new UB.UBAbortError())
        me.close()
      }
    }]

    me.fieldFile = Ext.create('Ext.form.field.File', {
      margin: '10 40 10 40',
      name: 'document',
      allowBlank: false,
      allowOnlyWhitespace: false,
      // inputType: 'file',
      labelClsExtra: 'fa fa-user-secret fa-2x',
      blankText: UB.i18n('requiredField'),
      requireText: UB.i18n('Select private key file'),
      labelWidth: 40,
      labelSeparator: '',
      fieldLabel: ' ',
      anchor: '100%',
      buttonText: '',
      buttonConfig: {
        iconCls: 'iconAttach'
      },
      listeners: {
        afterrender: function (sender) {
          sender.getEl().dom.addEventListener('change', me.onFileSelect, false)
          sender.inputEl.setAttribute('accept', '.dat,.pfx,.cnt,.pk8,Key-6.dat,.jks')
          sender.inputEl.on('click', function () {
            this.button.fileInputEl.dom.click()
          }, sender)
        },
        scope: this
      }
    })

    me.textFieldPassword = Ext.create('Ext.form.field.Text', {
      margin: '10 40 10 40',
      allowBlank: false,
      // cls: 'ub-login-input',
      labelClsExtra: 'fa fa-key fa-2x',
      requireText: UB.i18n('Password'),
      fieldLabel: ' ',
      labelSeparator: '',
      labelWidth: 40,
      inputType: 'password',
      anchor: '100%',
      listeners: {
        keyup: {
          fn: $App.passwordKeyUpHandler
        }
      },
      enableKeyEvents: true
    })

    me.pnl = Ext.create('Ext.form.Panel', {
      header: false,
      padding: '20 50 30 50',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: [
        me.fieldFile,
        me.textFieldPassword
      ]
    })

    me.items.push(me.pnl)

    me.callParent(arguments)
  },

  onFileSelect: function (files) {

  },

  submitForm: function () {
    var me = this
    if (!me.fieldFile.isValid() || !me.textFieldPassword.isValid()) {
      UB.showErrorWindow('SelectPKAndPassMsg')
      return
    }
    me.deferred.resolve({
      keyFile: me.fieldFile.fileInputEl.dom.files[0],
      password: me.textFieldPassword.getValue()
    })

    me.close()
  }
})
