/* global Ext */
const UB = require('@unitybase/ub-pub')
/**
 * User login window.
 *
 * Static method DoLogon used by UBConnection to resolve current user credential.
 *
 * @protected
 * @author pavel.mash
 */
Ext.define('UB.view.LoginWindow', {
  extend: 'Ext.window.Window',
  alias: 'widget.loginwindow',

  uses: [
    'UB.core.UBApp',
    'UB.core.UBAppConfig'
  ],

  statics: {
    /**
     * Perform UnityBase `adminUI` client auth. Form must ask user for login/password/authMethod and call connection.auth
     * @param {UBConnection} connection
     * @return {Promise}
     */
    DoLogon: function (connection, isRepeat) {
      let loginWindow = Ext.create('UB.view.LoginWindow', { connection: connection })

      let loginPromise = new Promise(function (resolve, reject) {
        loginWindow.deferred = { resolve: resolve, reject: reject }
      })
      // user already authorized but session expire
      // disable userName & auth tabs so user can only repeat then same auth
      if (connection.lastLoginName) {
        loginWindow.textFieldLoginCert && loginWindow.textFieldLoginCert.setDisabled(true)
        loginWindow.textFieldLogin && loginWindow.textFieldLogin.setDisabled(true)
        if (loginWindow.authTabs) {
          loginWindow.authTabs.getTabBar().setDisabled(true)
        }
      }
      loginWindow.show()
      Ext.WindowManager.bringToFront(loginWindow)
      return loginPromise
    }
  },

  cls: 'ub-login-window',
  layout: 'anchor',
  buttonAlign: 'center',
  width: 500,
  plain: true,
  modal: true,
  closable: false,
  header: false,
  resizable: false,
  id: 'extClientLoginForm',

  /**
   * @type {UBConnection}
   */
  connection: null,
  /**
   * @param {UBConnection} connection
   */
  constructor: function (connection) {
    this.callParent(arguments)
  },

  destroy: function () {
    this.connection = null
    this.poweredBy && this.poweredBy.destroy()
    if (this.keyNav) {
      this.keyNav.destroy(false)
    }
    this.callParent(arguments)
  },

  listeners: {
    afterRender: function (thisForm, options) {
      this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
        enter: this.submitLogin,
        scope: this
      })
    }
  },

  addCertAuthPanel (me, authItems, minAuthTabsHeight) {
    let firstLogin = window.localStorage.getItem('firstLogin') === 'true'
    let cfgAdminUI = UB.appConfig.uiSettings.adminUI
    let authenticationCert = cfgAdminUI.authenticationCert || {}
    let lastSavedLogin = window.localStorage.getItem(UB.LDS_KEYS.LAST_LOGIN)

    me.textFieldLoginCert = Ext.create('Ext.form.field.Text', {
      margin: '0 80 0 80',
      allowBlank: false,
      cls: 'ub-login-input',
      labelClsExtra: 'fa fa-user fa-2x',
      requireText: UB.i18n('User'),
      fieldLabel: ' ',
      labelSeparator: '',
      regex: authenticationCert.userNameRE ? new RegExp(authenticationCert.userNameRE) : null,
      regexText: authenticationCert.userNameREMessage ? UB.i18n(authenticationCert.userNameREMessage) : null,
      labelWidth: 40,
      value: me.connection.lastLoginName || lastSavedLogin
    })
    me.textFieldPasswordCert = Ext.create('Ext.form.field.Text', {
      margin: '10 80 10 80',
      allowBlank: false,
      cls: 'ub-login-input',

      labelClsExtra: 'fa fa-key fa-2x',
      requireText: UB.i18n('Password'),
      fieldLabel: ' ',
      labelSeparator: '',
      labelWidth: 40,

      inputType: 'password',
      name: 'password',
      anchor: '100%',
      value: cfgAdminUI.defaultPasswordForDebugOnly
    })

    me.chkFirstLogin = Ext.create('Ext.form.field.Checkbox', {
      margin: '10 80 10 125',
      xtype: 'checkbox',
      labelAlign: 'left',
      labelCls: 'ub-login-label',
      // boxLabelAlign: 'before',
      labelWidth: 80,
      checked: !!firstLogin,
      boxLabel: UB.i18n('RegistrationMode')
    })

    let certItem = []
    let useCertificateInfo = 'useCertificateInfo'
    certItem.push(
      me.textFieldLoginCert,
      me.textFieldPasswordCert
    )
    if (authenticationCert.description) {
      useCertificateInfo = authenticationCert.description
    }
    certItem.push(
      me.chkFirstLogin,
      {
        xtype: 'component',
        padding: '20 0 0 0',
        autoEl: {
          tag: 'div',
          html: UB.i18n(useCertificateInfo)
        }
      }
    )
    me.pnlCert = Ext.create('Ext.panel.Panel', {
      title: UB.i18n('useCertificateTitle'),
      header: false,
      authType: 'CERT',
      padding: '20 50 0 50',

      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: certItem
    })
    authItems.push(me.pnlCert)
    return minAuthTabsHeight + 80
  },

  addCert2AuthPanel (me, authItems, minAuthTabsHeight) {
    let firstLogin = window.localStorage.getItem('firstLogin') === 'true'
    let cfgAdminUI = UB.appConfig.uiSettings.adminUI
    me.fieldKeyFile = Ext.create('Ext.form.field.File', {
      margin: '5 40 0 40',
      name: 'document',
      allowBlank: false,
      allowOnlyWhitespace: false,
      // inputType: 'file',
      labelClsExtra: 'fa fa-user-secret fa-2x',
      blankText: UB.i18n('obazatelnoePole'),
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
          sender.inputEl.on('click', function () {
            this.button.fileInputEl.dom.click()
          }, sender)
        },
        scope: this
      }
    })

    me.textFieldPasswordCert = Ext.create('Ext.form.field.Text', {
      margin: '10 40 0 40',
      allowBlank: false,
      cls: 'ub-login-input',

      labelClsExtra: 'fa fa-key fa-2x',
      requireText: UB.i18n('Password'),
      fieldLabel: ' ',
      labelSeparator: '',
      labelWidth: 40,

      inputType: 'password',
      name: 'password',
      anchor: '100%',
      value: cfgAdminUI.defaultPasswordForDebugOnly
    })

    me.chkFirstLogin = Ext.create('Ext.form.field.Checkbox', {
      margin: '10 80 0 125',
      xtype: 'checkbox',
      labelAlign: 'left',
      labelCls: 'ub-login-label',
      // boxLabelAlign: 'before',
      labelWidth: 80,
      checked: !!firstLogin,
      boxLabel: UB.i18n('RegistrationMode')
    })

    let certItem = [
      me.fieldKeyFile,
      me.textFieldPasswordCert,
      me.chkFirstLogin,
      {
        xtype: 'component',
        padding: '5 0 0 0',
        autoEl: {
          tag: 'div',
          html: UB.i18n('useCertificateInfoSimple')
        }
      }
    ]
    me.pnlCert = Ext.create('Ext.panel.Panel', {
      title: UB.i18n('useCertificateTitle'),
      header: false,
      authType: 'CERT2',
      padding: '20 50 0 50',

      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      items: certItem
    })
    authItems.push(me.pnlCert)
    return minAuthTabsHeight + 100
  },

  initComponent: function () {
    var
      me = this
    var authMethods = me.connection.authMethods
    var authItems = []
    var minAuthTabsHeight = 265
    var lastSavedLogin = window.localStorage.getItem(UB.LDS_KEYS.LAST_LOGIN)
    var cfgAdminUI = me.connection.appConfig.uiSettings.adminUI
    let silenceKerberosLogin = window.localStorage.getItem(UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN) === 'true'

    me.items = []
    me.buttons = [{
      text: UB.i18n('Enter'),
      cls: 'ub-login-btn',
      scope: this,
      minWidth: 150,
      margins: '0 0 10 0',
      handler: function () {
        this.submitLogin()
      }
    }]

    // Image
    if (cfgAdminUI && cfgAdminUI.loginWindowTopLogoURL) {
      me.items.push(Ext.create('Ext.Img', {
        src: cfgAdminUI.loginWindowTopLogoURL, // 'images/logo-top.png',
        autoEl: 'div',
        cls: 'logo-top'
      }))
    }
    // form caption
    let applicationName = me.connection.appConfig.applicationName
    me.items.push({
      xtype: 'component',
      autoEl: {
        tag: 'h2',
        html: applicationName
      }
    })

    let haveCERT = (authMethods.indexOf('CERT') >= 0)
    if (haveCERT) {
      minAuthTabsHeight = me.addCertAuthPanel(me, authItems, minAuthTabsHeight)
    }

    let haveCERT2 = (authMethods.indexOf('CERT2') >= 0)
    if (haveCERT2) {
      minAuthTabsHeight = me.addCert2AuthPanel(me, authItems, minAuthTabsHeight)
    }

    var haveUB = (authMethods.indexOf('UB') >= 0)
    if (haveUB) {
      me.textFieldLogin = Ext.create('Ext.form.field.Text', {
        margin: '0 80 0 80',
        allowBlank: false,
        cls: 'ub-login-input',
        labelClsExtra: 'fa fa-user fa-2x',
        requireText: UB.i18n('User'),
        fieldLabel: ' ',
        labelSeparator: '',
        labelWidth: 40,
        anchor: '100%',
        value: me.connection.lastLoginName || lastSavedLogin,
        listeners: {
          afterrender: function (cmp) {
            cmp.inputEl.set({
              autocomplete: 'off'
            })
          }
        }
      })
      me.textFieldPassword = Ext.create('Ext.form.field.Text', {
        margin: '10 80 10 80',
        allowBlank: false,
        cls: 'ub-login-input',
        labelClsExtra: 'fa fa-key fa-2x',
        requireText: UB.i18n('Password'),
        fieldLabel: ' ',
        labelSeparator: '',
        labelWidth: 40,
        inputType: 'password',
        anchor: '100%',
        value: me.connection.appConfig.uiSettings.adminUI.defaultPasswordForDebugOnly,
        listeners: {
          keyup: {
            fn: $App.passwordKeyUpHandler
          }
        },
        enableKeyEvents: true
      })

      me.pnlUB = Ext.create('Ext.panel.Panel', {
        title: UB.i18n('useUBAuthenticationTitle'),
        header: false,
        authType: 'UB',
        padding: '20 50 30 50',
        layout: {
          type: 'vbox',
          align: 'stretch'
        },
        items: [
          me.textFieldLogin,
          me.textFieldPassword,
          {
            xtype: 'component',
            autoEl: {
              tag: 'div',
              html: UB.i18n('UBAuthTip')
            }
          }
        ]
      })
      authItems.push(me.pnlUB)
    }

    var haveNegotiate = (authMethods.indexOf('Negotiate') >= 0)
    if (haveNegotiate) {
      me.chkSilenceLogint = Ext.create('Ext.form.field.Checkbox', {
        margin: '10 80 10 125',
        xtype: 'checkbox',
        labelAlign: 'left',
        labelCls: 'ub-login-label',
        labelWidth: 80,
        checked: !!silenceKerberosLogin,
        boxLabel: UB.i18n('KerberosRemember')
      })
      me.pnlOs = Ext.create('Ext.panel.Panel', {
        title: UB.i18n('useOSCredentialTitle'),
        header: false,
        authType: 'Negotiate',
        padding: '20 50 50 50',
        items: [me.chkSilenceLogint,
          {
            xtype: 'component',
            autoEl: {
              tag: 'div',
              html: UB.i18n('KerberosTip')
            }
          }]
      })
      authItems.push(me.pnlOs)
    }

    var haveOpenIDConnect = (authMethods.indexOf('OpenIDConnect') >= 0)
    if (haveOpenIDConnect) {
      UB.get('openIDConnect', { responceType: 'json' }).then(function (responce) {
        var OpenIDConnectProviders = responce.data
        var radioGroup = {
          xtype: 'radiogroup',
          // Arrange radio buttons into two columns, distributed vertically
          columns: 1,
          id: 'extLoginOpenIDType',
          vertical: true,
          items: []
        }

        OpenIDConnectProviders.forEach(function (provider) {
          radioGroup.items.push({ boxLabel: UB.i18n(provider), name: 'providerName', inputValue: provider })
        })
        if (radioGroup.items.length) {
          radioGroup.items[0].checked = true
        }

        me.pnlOID.add(radioGroup)
      })
      me.pnlOID = Ext.create('Ext.panel.Panel', {
        title: UB.i18n('OpenIDConnect'),
        header: false,
        authType: 'OpenIDConnect',
        padding: '20 150 50 50'
      })
      authItems.push(me.pnlOID)
    }

    if (authItems.length > 1) {
      me.authTabs = Ext.create('Ext.tab.Panel', {
        height: minAuthTabsHeight,
        maxTabWidth: 140,
        tabBar: {
          layout: {
            pack: 'center',
            align: 'middle'
          },
          titleAlign: 'center',
          buttonAlign: 'center'
        },
        items: authItems
      })
      me.items.push(me.authTabs)
    } else {
      me.items.push(authItems[0])
    }

    if (me.connection.appConfig.uiSettings.adminUI && me.connection.appConfig.uiSettings.adminUI.loginWindowBottomLogoURL) {
      me.items.push(Ext.create('Ext.Img', {
        src: me.connection.appConfig.uiSettings.adminUI.loginWindowBottomLogoURL,
        cls: 'logo-bottom'
      }))
    }

    me.poweredByText = `v${me.connection.appConfig.appVersion}. Powered by UnityBase ${me.connection.serverVersion}`

    me.on('boxready', function () {
      this.poweredBy = Ext.create('Ext.Component', {
        html: this.poweredByText,
        top: '95%',
        style: {
          opacity: 0.5,
          fontSize: '0.9em'
        },
        shadow: false,
        floating: true
      })
      this.poweredBy.showBy(this, 'bl', [15, 4])
    })

    me.callParent(arguments)

    let authPanel
    if (me.authTabs) {
      let lastAuthSchema = window.localStorage.getItem(UB.LDS_KEYS.LAST_AUTH_SCHEMA) || authMethods[0] // activate first auth method by default
      authPanel = me.query('panel[authType="' + lastAuthSchema + '"]')[0] || authItems[0]
      me.authTabs.setActiveTab(authPanel)
    } else {
      authPanel = authItems[0]
    }
    let panelInputs = authPanel.query('textfield')
    if (panelInputs[0] && panelInputs[0].getValue()) { // user name is defined - focus password
      me.defaultFocus = panelInputs[1]
    } else {
      me.defaultFocus = panelInputs[0]
    }
  },

  submitLogin: function () {
    let me = this
    let login = ''
    let password = ''

    let authType = me.authTabs ? me.authTabs.getActiveTab().authType : me.down('panel').authType
    if (authType === 'UB') {
      me.textFieldLogin.validate()
      me.textFieldPassword.validate()
      login = Ext.String.trim(me.textFieldLogin.getValue())
      password = Ext.String.trim(me.textFieldPassword.getValue())
      if (!password || password === '' || !login || login === '') {
        return
      }
    }
    if (authType === 'CERT2') {
      if (!me.fieldKeyFile.validate()) return
      if (!me.textFieldPasswordCert.validate()) return
      window.localStorage.setItem('firstLogin', me.chkFirstLogin.checked)
      me.deferred.resolve({
        authSchema: authType,
        keyFile: me.fieldKeyFile.fileInputEl.dom.files[0],
        password: me.textFieldPasswordCert.getValue(),
        registration: me.chkFirstLogin.checked ? 1 : 0
      })
    } else if (authType === 'CERT') {
      me.textFieldLoginCert.validate()
      me.textFieldPasswordCert.validate()
      if (!me.textFieldLoginCert.validate()) {
        return
      }
      if (!me.textFieldPasswordCert.validate()) {
        return
      }
      login = Ext.String.trim(me.textFieldLoginCert.getValue() || '')
      password = Ext.String.trim(me.textFieldPasswordCert.getValue() || '')
      window.localStorage.setItem('firstLogin', me.chkFirstLogin.checked)
      UB.inject('models/UBA/BigInteger.js').then(function () {
        /**
         * Build password hash as in ERC
         * @param pwd
         * @returns {string}
         * @private
         */
        function ERC_encodePassword (pwd) {
          var maxLen = 30; var buff; var i; var c
          var res = bigInt.one // require('bigint').one;
          buff = pwd
          while (buff.length < maxLen) {
            buff = buff + pwd.length + pwd
          }
          buff = buff.substr(0, maxLen)
          for (i = 1; i <= 30; i++) {
            c = buff.charCodeAt(i - 1) - 15
            res = res.multiply(Math.ceil(c / 3)).add(c * i + i)
          }
          return res.toString().substr(0, maxLen)
        }

        me.deferred.resolve({
          authSchema: authType,
          login: login.toLowerCase(), // [UB-919],
          password: UB.MD5(login.toLowerCase() + ':' + ERC_encodePassword(password)).toString(),
          registration: me.chkFirstLogin.checked ? 1 : 0
        })
      })
    } else if (authType === 'OpenIDConnect') {
      var selectedBtn = Ext.getCmp('extLoginOpenIDType').getValue()
      var url = window.location.href
      url = url.substr(0, url.lastIndexOf('/')) + '/openIDConnect/' + selectedBtn.providerName

      function getWindowConfig () {
        var width = 600
        var height = 525
        var left = Math.floor(window.screenX + (window.outerWidth - width) / 2)
        var top = Math.floor(window.screenY + (window.outerHeight - height) / 2)

        return 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0'
      }

      var loginWindowOpenID = window.open(url, 'login', getWindowConfig())

      function loginListener (event) {
        if (event.source === loginWindowOpenID) {
          window.removeEventListener('message', loginListener)
          if (event.origin.indexOf(window.location.origin) === 0) {
            var response = event.data

            if (response.success) {
              response.authSchema = 'OpenIDConnect'
              me.deferred.resolve(response)
              me.close()
            } else {
              $App.dialogError('authOpenIDConnectFail')
            }
          } else {
            $App.dialogError('authOpenIDConnectFail')
          }
        }
      }

      window.addEventListener('message', loginListener)
      window.localStorage.setItem(UB.LDS_KEYS.LAST_AUTH_SCHEMA, authType)
      return
    } else {
      me.deferred.resolve({
        authSchema: authType,
        login: login.toLowerCase(), // [UB-919],
        password: password,
        registration: 0 // me.chkFirstLogin.checked ? 1: 0
      })
    }

    if (authType === 'Negotiate') {
      window.localStorage.setItem(UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN, me.chkSilenceLogint.getValue())
    }

    me.close()
  }
})
