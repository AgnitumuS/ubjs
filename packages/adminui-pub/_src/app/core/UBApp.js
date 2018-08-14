/* global Ext, $App, SystemJS */
const UB = require('@unitybase/ub-pub')
require('../view/LoginWindow.js')
require('../../ux/window/Notification')
require('../view/Viewport')
require('../core/UBDataLoader.js')
require('../view/cryptoUI/ReadPK')
require('../view/cryptoUI/SelectCert')
require('./UBStoreManager')

const _ = require('lodash')

const RE_LETTERS = /[A-Za-zА-Яа-яЁёіІїЇґҐ]/
const RE_ENGLISH = /[A-Za-z]/
const RE_CAPS = /[A-ZА-ЯЁІЇҐ]/

/**
 * UnityBase adminUI application.
 * Accessible via alias $App.
 *
 *  Using UB.core.UBApp developer have access to:
 *
 *  - {@link UB.core.UBApp#doCommand} method for run UnityBase client commands and {@link UB.core.UBApp#showModal} for showing forms in modal mode
 *  - instance of UBConnection {@link UB.core.UBApp#connection}
 *  - instance of UBNativePDFSign {@link UB.core.UBApp#pdfSigner} for PDF signing operations
 *  - instance of UBNativeScanner {@link UB.core.UBApp#scanService} for scan & print barcode
 *  - instance of UBNativeDocEdit {@link UB.core.UBApp#docEdit} for edit document content
 *  - number of service functions {@link UB.core.UBApp#dialogYesNo}, {@link UB.core.UBApp#dialogError}, {@link UB.core.UBApp#dialogYesNo}
 *
 * Entry point of calls is UB.core.UBApp#launch which:
 *
 *  - obtain Application information (getAppInfo server method)
 *  - create instance of {UBConnection}
 *  - obtain Domain information (getDomainInfo server method)
 *  - inject scripts with name `initModel.js` from `modelFolder\public` folder for each model
 *  - create {@link UB.view.Viewport viewport} - the main documnet DOM component
 *
 * @author UnityBase core team
 * @namespace $App
 */
Ext.define('UB.core.UBApp', {
  singleton: true,

  uses: [
    'UB.core.UBCommand'
  ],

  mixins: {
    observable: 'Ext.util.Observable'
  },

  /**
   * The core instance. Initialized after launch()
   * @type Core
   */
  core: null,

  /** nm-scaner interface
   * @type {Promise<UBNativeScanner>}
   */
  __scanService: null,

  constructor: function () {
    this.requireEncription = false
    this.mixins.observable.constructor.call(this)

    /**
     * Connection for authorized and (optionally) encrypted communication with UnityBase server
     * @property {UBConnection} connection
     * @type {UBConnection}
     * @readonly
     */
    this.connection = null

    /**
     * Instance of ubNotifier WebSocket connection to server
     * @deprecated In UB>=4 use a $App.connection.ubNotifier instead
     * @property  {UBNotifierWSProtocol} ubNotifier
     * @type {UBNotifierWSProtocol}
     */
    this.ubNotifier = null

    /**
     * Deprecated. Use $App.domainInfo or $App.connection.domain instead of this one.
     * @deprecated
     */
    this.domain = null

    /**
     * Instance of UBDomain. It will be defined on launch application and before emit event appInitialize.
     * @property {UBDomain} domainInfo
     */
    this.domainInfo = null
    /**
     * Main application window. Initialised after $App.launch()
     * @property {UB.view.Viewport} viewport
     */
    this.viewport = null
    /**
     * UnityBase application instance short alias reference. Use it instead of UB.core.UBApp singleton
     * @property {UB.core.UBApp} $App
     * @type {UB.core.UBApp}
     * @member window
     * @global
     */
    window.$App = this

    /**
     * In case model require asynchronous operation during loading it
     * should add a chain to this promise. Next model will await chain resolving
     * @example
     *    $App.modelLoadedPromise = $App.modelLoadedPromise.then(...)
     *
     * @type {Promise<boolean>}
     */
    this.modelLoadedPromise = Promise.resolve(true)

    this.addEvents(
      /**
       * Fires then user change active desktop
       * @event desktopChanged
       */
      'desktopChanged',
      /**
       * Fires then application start initialization.
       * @event appInitialize
       */
      'appInitialize',
      /**
       * Fires then application initialization finished. This mean:
       *
       *  - user is logged in
       *  - all user locales are loaded
       *  - entities data for UI (ubm_*) are loaded
       *  - Viewport are created
       *  - active desktop is changed
       *
       * @event applicationReady
       */
      'applicationReady',
      /**
       * Fires then Domain information loaded from server.
       * @event getDomainInfo
       * @deprecated
       */
      'getDomainInfo',
      'updateCenterPanel',
      /**
       * Fires then window ( descendants of UB.view.BaseWindow ) activated (not tab)
       * @event windowActivated
       * @param {Ext.window.Window} win
       */
      'windowActivated',
      /**
       * Fires then window ( descendants of UB.view.BaseWindow ) destroyed
       * @event windowDestroyed
       * @param {Ext.window.Window} win
       */
      'windowDestroyed',
      /**
       * Fires when application ready to build main menu
       * For example in initModels.js you can write:
       *
       *        $App.on('buildMainMenu', function(items){
       *            items.push(
       *                Ext.create('UB.view.ToolbarMenu'),
       *                "->",
       *                Ext.create('UB.view.ToolbarUser')
       *            );
       *       });
       *
       * @event buildMainMenu
       * @param {*} items Collection of {@link UB.view.ToolbarWidget}.
       */
      'buildMainMenu'
    )
    return this
  },

  /**
   * Check field input and set a class in cace letters is english or CAPS
   * @param {Ext.field.Field} textField
   */
  passwordKeyUpHandler: function (textField) {
    let s = textField.getValue() || ''
    if (!s) {
      textField.removeCls('ub-pwd-keyboard-caps')
      textField.removeCls('ub-pwd-keyboard-en')
    } else {
      let n = s.length
      let t = s.substr(n - 1, 1)
      if (RE_LETTERS.test(t)) {
        if (RE_ENGLISH.test(t)) {
          textField.addClass('ub-pwd-keyboard-en')
        } else {
          textField.removeCls('ub-pwd-keyboard-en')
        }
        if (RE_CAPS.test(t)) {
          textField.addClass('ub-pwd-keyboard-caps')
        } else {
          textField.removeCls('ub-pwd-keyboard-caps')
        }
      }
    }
  },

  onPasswordChange: function (connection) {
    var wind = new Ext.Window({
      extend: 'Ext.form.Panel',
      layout: 'vbox',
      height: 300,
      width: 400,
      items: [{
        xtype: 'label',
        width: '100%',
        text: UB.i18n('Your password is expired. Please change password')
      }, {
        xtype: 'textfield',
        inputType: 'password',
        listeners: {
          keyup: {
            fn: $App.passwordKeyUpHandler
          }
        },
        enableKeyEvents: true,
        emptyText: UB.i18n('EnterOldPassword'),
        fieldLabel: UB.i18n('OldPassword'),
        labelWidth: 100,
        name: 'oldPwd',
        margins: 10,
        width: '100%',
        allowBlank: false

      }, {
        xtype: 'textfield',
        inputType: 'password',
        listeners: {
          keyup: {
            fn: $App.passwordKeyUpHandler
          }
        },
        enableKeyEvents: true,
        emptyText: UB.i18n('EnterNewPassword'),
        fieldLabel: UB.i18n('NewPassword'),
        labelWidth: 100,
        name: 'newPwd',
        margins: 10,
        width: '100%',
        allowBlank: false,
        afterLabelTextTpl: [
          '<b data-qtitle="', UB.i18n('HowToCreatePassword'),
          '" data-qtip="', UB.i18n('passwordRecommendation'),
          '" style="color: red;">?</b>'
        ]
      }, {
        xtype: 'textfield',
        inputType: 'password',
        listeners: {
          keyup: {
            fn: $App.passwordKeyUpHandler
          }
        },
        enableKeyEvents: true,
        emptyText: UB.i18n('RetypePassword'),
        fieldLabel: UB.i18n('RetypePassword'),
        labelWidth: 100,
        name: 'newPwdRetyped',
        margins: 10,
        width: '100%',
        allowBlank: false,
        validator: function (value) {
          let valid = this.up('panel').down('textfield[name=newPwd]').getValue() === value
          this.up('window').down('button[ubID=btnOK]')[valid ? 'enable' : 'disable']()
          return (valid)
        }
      }],
      buttons: [{
        ubID: 'btnOK',
        text: UB.i18n('Change'),
        glyph: UB.core.UBUtil.glyphs.faSave,
        disabled: true
      }]

    })
    wind.down('component[ubID="btnOK"]').handler = function () {
      connection.xhr({
        url: 'changePassword',
        method: 'POST',
        data: {
          newPwd: wind.down('textfield[name=newPwd]').getValue(),
          pwd: window.UB.SHA256('salt' + wind.down('textfield[name=oldPwd]').getValue()).toString()
        }
      }).then(function () {
        wind.close()
        $App.dialogInfo('passwordChangedSuccessfully').then(function () { $App.logout() })
      })
    }
    wind.show()
  },

  /**
   * The main entry point of UnityBase Ext-based application.
   * @returns {Promise} resolved then viewport is created
   */
  launch: function () {
    var me = this
    var isExternalLogin = typeof window.redirectToLogin === 'function'
    return UB.connect({
      host: window.location.origin,
      path: window.UB_API_PATH || window.location.pathname,
      onCredentialRequired: UB.view.LoginWindow.DoLogon,
      allowSessionPersistent: isExternalLogin, // see uiSettings.adminUI.loginURL
      onAuthorized: function (conn) {
        if (isExternalLogin) { // external login page
          window.localStorage.removeItem(conn.__sessionPersistKey)
        }
        window.localStorage.setItem(UB.LDS_KEYS.USER_DID_LOGOUT, 'false')
      },
      onAuthorizationFail: function (reason, conn) {
        if (isExternalLogin) {
          var storedSession = window.localStorage.getItem(conn.__sessionPersistKey)
          if (storedSession) { // invalid session is created by external login page
            window.redirectToLogin(reason)
          } else {
            UB.showErrorWindow(reason)
          }
        } else {
          UB.showErrorWindow(reason)
        }
      },
      onNeedChangePassword: $App.onPasswordChange.bind($App),
      onGotApplicationConfig: function (/** @type {UBConnection} */connection) {
        _.defaultsDeep(connection.appConfig, {
          comboPageSize: 30,
          maxMainWindowTabOpened: 40,
          storeDefaultPageSize: 100,

          gridHeightDefault: 400,
          gridWidthDefault: 600,
          gridParentChangeEventTimeout: 200,
          gridDefaultDetailViewHeight: 150,

          formMinHeight: 100,
          formMinWidth: 300,
          formDefaultAutoFormWidth: 300,
          formSaveMaskDelay: 100,

          scanRecognizeProgressInterval: 1000,
          maxSearchLength: 62,
          // MPV - deprecated browserExtensionNMHostAppKey: 'com.inbase.ubmessagehost',
          uiSettings: {
            adminUI: {
              defaultPasswordForDebugOnly: ''
            }
          }
        })

        // UB 1.12 compatibility
        UB.appConfig = connection.appConfig
        // TODO - remove because mutation of other objects is bad idea
        // UB.appConfig.defaultLang =  core.appConfig.defaultLang;
        // UB.appConfig.supportedLanguages = core.appConfig.supportedLanguages;
        return UB.inject('models/ub-pub/locale/lang-' + connection.preferredLocale + '.js').then(() => {
          if (connection.trafficEncryption || (connection.authMethods.indexOf('CERT') !== -1)) {
            const pkiForAuth = UB.appConfig.uiSettings.adminUI.encryptionImplementation || 'clientRequire/@ub-d/nm-dstu/injectEncription.js'
            const libraryName = pkiForAuth.split('/')[2]
            var advParam = {
              getPkParam: UB.view.cryptoUI.ReadPK.getPkParam,
              getCertificates: UB.view.cryptoUI.SelectCert.getCertificates
            }

            return UB.inject(pkiForAuth).then(() => {
              window[libraryName].addEncryptionToConnection(connection, advParam)
            })
          } else {
            return true
          }
          // for debug purpose
          // let nmDstu = require(@ub-d/nm-dstu)
          // return nmDstu.addEncryptionToConnection(connection)
        })
      }
    }).then(function (connection) {
      me.connection = connection
      me.ubNotifier = connection.ubNotifier
      let myLocale = connection.preferredLocale
      me.domainInfo = connection.domain
      let models = me.domainInfo.models

      // for each model configure Ext.loader
      _.forEach(models, function (item, key) { item.key = key }) // move names inside elements
      models = _.sortBy(models, 'order') // sort models by order
      _.forEach(models, function (model) {
        if (model.path && model.key !== 'UB') {
          Ext.Loader.setPath(model.key, model.path)
        }
      })
      // load localization script (bundled from all models on the server side)
      // load models initialization script in order they passed
      return UB.inject('allLocales?lang=' + myLocale).then(function () {
        let promise = Promise.resolve(true)
        // inject models initialization scripts
        window.__modelInit.forEach(function (script) {
          promise = promise.then(function () {
            return window.System.import(script)
          }).then(() => {
            // model can resolve $App.modelLoadedPromise later. See settings.js in UBS model
            return $App.modelLoadedPromise
          })
        })
        return promise
      })
    }).then(function () {
      me.fireEvent('appInitialize', me)
    }).then(function () {
      return UB.core.UBDataLoader.loadStores({
        ubRequests: ['ubm_desktop', 'ubm_form', 'ubm_enum'].map(function (item) {
          let res = {entity: item, method: 'select', fieldList: me.domainInfo.get(item).getAttributeNames()}
          if (item === 'ubm_desktop') {
            res.orderList = {
              ord: {
                expression: 'caption',
                order: 'asc'
              }
            }
          }
          return res
        }),
        setStoreId: true
      }).then(function () {
        return UB.core.UBDataLoader.loadStores({
          ubRequests: [
            UB.Repository('ubm_navshortcut')
              .attrs(UB.core.UBStoreManager.shortcutAttributes)
              .orderBy('desktopID').orderBy('parentID')
              .orderBy('displayOrder').orderBy('caption')
              .ubql()
          ],
          setStoreId: true
        })
      })
    }).then(function () {
      me.setLocalStorageProviderPrefix(me.connection.userLogin())
      me.viewport = Ext.create('UB.view.Viewport')
      me.viewport.show()
      me.fireEvent('desktopChanged', UB.core.UBAppConfig.desktop) // keep UB.core.UBAppConfig
      me.fireEvent('applicationReady')
      me.checkQueryString()
      me.hideLogo()
    }).catch(function (reason) {
      me.hideLogo()
      UB.logError('Got error from getAppInfo %o', reason)
      throw reason // global window.onerror handler show error to user
    })
  },

  /**
   * Return images path for current UI theme
   * @param {string} imageName
   * @returns {string}
   */
  getImagePath: function (imageName) {
    return 'models/adminui-pub/themes/' + UB.connection.appConfig.uiSettings.adminUI.themeName + '/ubimages/' + imageName
  },

  /**
   * Show confirmation dialog. Title & message are translated using UB.i18n
   * @example

$App.dialog('makeChangesSuccessfulTitle', 'makeChangesSuccessfullyBody')
  .then(function(btn){
    if (btn === 'yes'){
      me.openDocument()
      me.closeWindow(true)
    }
  });

   * @param {String} title
   * @param {String} msg
   * @param {Object} [config]
   * @param {Number} [config.buttons] OK: 1, YES: 2, NO: 4, CANCEL: 8.  Default YESNOCANCEL: 14
   * @param {String} [config.icon] Possible values: QUESTION, ERROR, WARNING, INFO. Default QUESTION
   * @returns {Promise} resolved pressed button name ['ok', 'yes', 'no', 'cancel']
   */
  dialog: function (title, msg, config) {
    var icon
    config = config || {}
    switch (config.icon || 'QUESTION') {
      case 'QUESTION':
        icon = Ext.window.MessageBox.QUESTION
        break
      case 'ERROR':
        icon = Ext.window.MessageBox.ERROR
        break
      case 'WARNING':
        icon = Ext.window.MessageBox.WARNING
        break
      case 'INFO':
        icon = Ext.window.MessageBox.INFO
        break
    }
    return new Promise(function (resolve, reject) {
      Ext.MessageBox.show({
        modal: true,
        title: UB.i18n(title),
        msg: UB.i18n(msg),
        buttons: config.buttons || Ext.MessageBox.YESNOCANCEL,
        icon: icon,
        fn: function (buttonId) {
          resolve(buttonId)
        }
      })
    })
  },

  /**
   * Show confirmation dialog. Title & message are translated using UB.i18n
   * Example:
   *
   *      $App.dialogYesNo('makeChangesSuccessfullTitle', 'makeChangesSuccessfullBody')
   *      .then(function(choice){
   *           if (choice){
   *               me.openDocument();
   *               me.closeWindow(true);
   *           }
   *       });
   *
   * @param {String} title
   * @param {String} msg
   * @returns {Promise} resolved to true | false depending on user choice
   */
  dialogYesNo: function (title, msg) {
    return new Promise(function (resolve) {
      Ext.MessageBox.show({
        modal: true,
        title: UB.i18n(title),
        msg: UB.i18n(msg),
        buttons: Ext.MessageBox.YESNO,
        icon: Ext.MessageBox.QUESTION,
        fn: function (buttonId) {
          resolve(buttonId === 'yes')
        }
      })
    })
  },

  /**
   * Show information dialog. msg is translated using UB.i18n
   * Example:
   *
   *      $App.connection.post('myAction', {myData: ...})
   *      .then(function(response){
   *          //do something here ....
   *          ....
   *          // notify user
   *          return $App.dialogInfo('documentWasSuccessfullyApproved');
   *      }).then(function(){
   *         // we reach this code after user read information dialog and press OK
   *      });
   *
   * @param {string} msg
   * @param {String} [title] Optional title
   * @returns {Promise} resolved to true then user click OK
   */
  dialogInfo: function (msg, title) {
    return new Promise(function (resolve, reject) {
      Ext.MessageBox.show({
        modal: true,
        title: UB.i18n(title || 'info'),
        msg: UB.i18n(msg),
        icon: Ext.MessageBox.INFO,
        buttons: Ext.MessageBox.OK,
        fn: function (buttonId) {
          resolve(buttonId === 'ok')
        }
      })
    })
  },

  /**
   * Display notification message
   * @param {String} msg message
   * @param {String} [title]
   * @param {Number} [slideInDuration] Animate time in ms. by default 800 ms
   */
  notify: function (msg, title, slideInDuration) {
    Ext.create('widget.uxNotification', {
      title: UB.i18n(title),
      position: 't',
      slideInDuration: slideInDuration || 800,
      useXAxis: true,
      autoShow: true,
      cls: 'ux-notification-light',
      // iconCls: 'ux-notification-icon-error',
      bodyPadding: 5,
      items: [{
        xtype: 'component',
        autoEl: {
          tag: 'div',
          html: UB.i18n(msg)
        }
      }]
    })
  },

  /**
   * Show error dialog. msg is translated using UB.i18n
   * Example:
   *
   *      $App.dialogError('recordNotExistsOrDontHaveRights')
   *          .done(me.closeWindow.bind(me));
   *
   * @param {String} msg
   * @param {String} [title] Default is 'error'
   */
  dialogError: function (msg, title) {
    return new Promise(function (resolve) {
      Ext.MessageBox.show({
        modal: true,
        title: UB.i18n(title || 'error'),
        msg: UB.i18n(msg),
        icon: Ext.MessageBox.ERROR,
        buttons: Ext.MessageBox.OK,
        fn: function () { resolve(true) }
      })
    })
  },

  /**
   * Return instance of {@link UBNativePDFSign} for PDF signing operations
   * @returns {Promise<UBNativePDFSign>}
   */
  pdfSigner: function () {
    let i = 'import'
    let moduleName = '@ub-e/nm-pdfsign' + (window.isDeveloperMode ? '' : '/dist/nm-pdfsign.min.js')
    // System[i] is required for preventing webpack to include a ub-e/nm-pdfsigner to the bundle
    return SystemJS[i](moduleName).then(function (nmPDFSignerModule) {
      return nmPDFSignerModule.connect()
    })
  },

  /**
   * Return instance of {@link UBNativeDocEdit} for pen document using WebDav
   * @returns {Promise<UBNativeDocEdit>} resolved to initialized UBNativeDocEdit instance
   */
  docEdit: function () {
    let i = 'import'
    let moduleName = '@ub-e/nm-docedit' + (window.isDeveloperMode ? '' : '/dist/nm-docedit.min.js')
    // System[i] is required for preventing webpack to include a ub-e/nm-docedit to the bundle
    return SystemJS[i](moduleName).then(function (nmDocEditModule) {
      return nmDocEditModule.connect()
    })
  },

  /**
   * Do edit office document
   * @param {String} path Path to document
   * @returns {Promise} resolved to true or rejected if error or incorrect path.
   */
  editDocument: function (path) {
    return this.docEdit().then(function (docedit) {
      return docedit.editDocument(path)
    })
  },

  /**
   * Return promise, resolved to instance of {@link UBNativeScanner} for direct manipulation with scanner
   * `@ub-e/nm-scanner must be in application packages list (run `npm i @ub-e/nm-scanner` in the shell)
   * @method
   * @return {Promise<UBNativeScanner>}
   */
  scanService: function () {
    let i = 'import'
    let moduleName = '@ub-e/nm-scanner' + (window.isDeveloperMode ? '' : '/dist/nm-scanner.min.js')
    // System[i] is required for preventing webpack to include a ub-e/nm-scanner to the bundle
    return SystemJS[i](moduleName).then(function (nmScannerModule) {
      return nmScannerModule.connect()
    })
  },

  /**
   * Show scanner settings
   */
  scannerSettings: function () {
    $App.scanService().then(function (scanner) {
      return scanner.getDefaultSettings()
    }).then(function (settings) {
      $App.showModal({
        formCode: 'ubm_desktop-scanerSettings',
        description: UB.i18n('nastroykiSkanera'),
        isClosable: true,
        customParams: settings
      }).then(function (result) {
        if (result.action === 'ok') {
          $App.scanService().then(function (scanService) {
            scanService.setDefaultSettings(result.params)
          })
        }
      })
    })
  },

  /**
   * Run scan process.
   * @param {String} header Caption of the scanning progress window
   * @param {Object} [config={}] Scanner settings. If passed - will merge config with UBNativeScanner.getDefaultSettings() result
   * @param {String} [documentMIME] Mime type of scanned image. If passed will override scanSettings.UBScan.OutputFormat
   * @returns {Promise} resolved to base64 data or false in case user press cancel.
   */
  scan: function (header, config, documentMIME) {
    const mimeToOutputFormat = {
      'image/jpeg': 'JPEG',
      'application/jpg': 'JPEG'
    }
    let outputFormat = mimeToOutputFormat[documentMIME]
    return $App.scanService().then(function (scanner) {
      $App.__scanService = scanner
      let allowAddPages = false
      let statusWindow = Ext.create('UB.view.StatusWindow', {
        title: header
      })

      function onNotify (progress) {
        if (progress && (progress.action === 'scan') && (progress.pageNum >= 0)) {
          statusWindow.setStatus(UB.format(UB.i18n('doScanPages'), progress.pageNum + 1))
        } else if (progress && (progress.action === 'recognize') && (progress.pageNum >= 0)) {
          statusWindow.setStatus(UB.format(UB.i18n('doRecognizePages'), progress.pageNum + 1))
        }
      }

      function onScan (pageCount) {
        if (pageCount > 0) {
          statusWindow.setStatus(UB.format(UB.i18n('doScanPages'), pageCount))
          if (allowAddPages) {
            return checkContinue()
          } else {
            statusWindow.setStatus(UB.i18n('doFinishScan'))
            return scanner.finishScan().then(null, null, onNotify)
          }
        } else {
          return askInsertPaper()
        }
      }

      function doContinue () {
        statusWindow.setStatus(UB.i18n('doStartScan'))
        return scanner.continueScan().then(onScan, null, onNotify)
      }

      function askInsertPaper () {
        return $App.dialog('scan', 'noPaperInScanner', {buttons: 9, icon: 'INFO'}).then(function (btn) {
          if (btn === 'ok') {
            return doContinue()
          } else if (btn === 'cancel') {
            throw new UB.UBAbortError()
          }
        })
      }

      function checkContinue () {
        return $App.dialog('scan', 'doYouWantResume', {buttons: 14}).then(function (btn) {
          if (btn === 'yes') {
            return doContinue()
          }
          if (btn === 'no') {
            statusWindow.setStatus(UB.i18n('doFinishScan'))
            return scanner.finishScan().then(null, null, onNotify)
          }
          if (btn === 'cancel') {
            throw new UB.UBAbortError()
          }
        })
      }

      return scanner.getDefaultSettings().then(function (defaultParams) {
        let scanSettings = _.merge(defaultParams, config || {})
        if (!scanSettings) {
          throw new UB.UBError(UB.format(UB.i18n('setScannerSettings'), '$App.scannerSettings(); '))
        }

        if (scanSettings.CurrentScanType !== 'UnityBase' && scanSettings.FRScan && scanSettings.FRScan.LastUsedScanner) {
          if (outputFormat) {
            scanSettings.CurrentScanType = 'UnityBase'
            scanSettings.UBScan.LastUsedScanner = scanSettings.FRScan.LastUsedScanner
          } else {
            _.forEach(scanSettings.FRScan.ScanSettings, function (setting) {
              if (setting.Source === scanSettings.FRScan.LastUsedScanner) {
                allowAddPages = !!setting.AllowAddPages
              }
            })
          }
        }
        if (scanSettings.CurrentScanType === 'UnityBase' && scanSettings.UBScan && scanSettings.UBScan.LastUsedScanner) {
          _.forEach(scanSettings.UBScan.ScanSettings, function (setting) {
            if (setting.Source === scanSettings.UBScan.LastUsedScanner) {
              allowAddPages = !!setting.AllowAddPages
            }
          })
          if (outputFormat) {
            scanSettings.UBScan.OutputFormat = outputFormat
          }
        }

        statusWindow.setStatus(UB.i18n('doStartScan'))
        scanner.lastScanedFormat = scanSettings.UBScan.OutputFormat
        return scanner.startScan(scanSettings)
      }).then(onScan, null, onNotify)
        .fin(function () {
          statusWindow.close()
        }).catch(function (error) {
          return scanner.cancelScan().then(function () {
            statusWindow.close()
            throw error
          })
        })
    })
  },

  /**
   * Application viewport
   * @return {UB.view.Viewport}
   */
  getViewport: function () {
    return this.viewport
  },

  /**
   * Return last user login name
   * @deprecated 1.7 Use {@link UB.core.UBApp.connection#userLogin $App.connection.userLogin()} instead
   * @returns {String}
   */
  getLogin: function () {
    UB.logDebug('UB.core.UBApp.getLogin is deprecated. Use $App.connection.userLogin() instead)')
    return this.connection.userLogin()
  },

  getDesktop: function () {
    var ubAppConfig = UB.core.UBAppConfig
    var tmpDesktop = UB.core.UBLocalStorageManager.getItem('desktop', true)

    if (!ubAppConfig.desktop) {
      ubAppConfig.desktop = UB.core.UBStoreManager.getDesktopStore().getById(tmpDesktop) ? tmpDesktop : this.getDefaultDesktop()
    }

    return ubAppConfig.desktop
  },

  getDefaultDesktop: function () {
    var store = UB.core.UBStoreManager.getDesktopStore()
    var record = store.findRecord('isDefault', true) || store.getAt(0)
    return record ? record.get('ID') : null
  },

  setDesktop: function (desktop) {
    UB.core.UBLocalStorageManager.setItem('desktop', UB.core.UBAppConfig.desktop = desktop)
    this.fireEvent('desktopChanged', desktop)
  },

  checkQueryString: function () {
    this.runLink(window.location.search)
  },

  runLink: function (link) {
    var query = Ext.isString(link) ? Ext.Object.fromQueryString(link.toLowerCase()) : link

    if (query && ((query.command && query.command.length) || query.cmdData)) {
      this.doCommand({
        commandCode: query.command,
        cmdData: query.cmdData,
        instanceID: parseInt(query.id, 10),
        onDesktop: query.ondesktop,
        parent: query.parent,
        parentID: query.parentid
      })
    }
  },

  /**
   * Can run any client-side command (showForm/showList/showReport).
   *
   *      @example
   *      // show City dictionary with all attributes in dedicated window
   *      $App.doCommand({
   *           cmdType: 'showList',
   *           cmdData: { params: [
   *               { entity: 'cdn_city', method: 'select', fieldList: '*'}
   *           ]}
   *       });
   *
   *       // show City name and region name inside main viewport tab
   *      $App.doCommand({
   *           cmdType: 'showList',
   *           cmdData: { params: [
   *               { entity: 'cdn_city', method: 'select', fieldList: ['name', 'parentAdminUnitID.name']}
   *           ]},
   *           target: $App.getViewport().getCenterPanel(),
   *           tabId: 'city_name_parent'
   *       });
   *
   *       // show default edit form for currency with code='USD'
   *       $App.connection.select({
   *          entity: 'cdn_currency',
   *          fieldList: ['ID', 'code3'],
   *          whereList: {byCode3: {
   *              expression: '[code3]', condition: 'equal', values: {code3: 'USD'}
   *          }}
   *       }).done(function(result){
   *          if (result.resultData.data.length === 1){
   *             $App.doCommand({
   *                 cmdType: 'showForm',
   *                 entity: 'cdn_currency',
   *                 instanceID: result.resultData.data[0][0]
   *             });
   *          } else {
   *              $App.dialogError('USD currency not found');
   *          }
   *       });
   *
   *       // show report
   *       $App.doCommand({
               cmdType: 'showReport',
               cmdData: {
                  reportCode: 'test',
                  reportType: 'html', // must be one of 'html'/'pdf'
                  reportParams: {'reportParam1': 1}
               }
           });
   *
   * @param {String/Object} config
   * @param {Object} [config.cmpInitConfig] Configuration, applied to Component created by command
   * @param {Boolean} [config.openInBackgroundTab] true if you want to set form/list to tab without setActiveTab. Default undefined.
   */
  doCommand: function (config) {
    if (Ext.isString(config)) {
      config = Ext.JSON.decode(config)
    }

    if (!Ext.isObject(config)) {
      throw new Error('invalid config passed to UBApp.doCommand')
    }

    Ext.create('UB.core.UBCommand', config)
  },
  /**
   * Load a shortcut command by given shortcut ID (or code) and run it
   *
   *    $App.runShortcutCommand('tst_document')
   *    //or
   *    $App.runShortcutCommand(30000012312)
   *
   * @param {Number|String} shortcutIDOrCode Either shortcut ID or shortcut code to run
   * @param {Boolean} inWindow Show a command result in window instead of tab
   */
  runShortcutCommand: function (shortcutIDOrCode, inWindow) {
    let shortcutID = shortcutIDOrCode
    if (typeof shortcutIDOrCode !== 'number') {
      let store = UB.core.UBStoreManager.getNavigationShortcutStore()
      let rowNum = store.findExact('code', shortcutIDOrCode)
      if (rowNum !== -1) {
        shortcutID = store.getAt(rowNum).get('ID')
      } else {
        throw new Error(`Shortcut with code ${shortcutIDOrCode} not found`)
      }
    }
    let cmdCodePromise = UB.core.UBStoreManager.getNavshortcutCommandText(shortcutID)
    cmdCodePromise.then(function (parsedCmdCode) {
      let commandConfig = _.clone(parsedCmdCode)
      if (!inWindow) {
        commandConfig.tabId = 'navigator' + shortcutID
        commandConfig.target = $App.viewport.centralPanel
      }
      $App.doCommand(commandConfig)
    })
  },

  /**
   * Show form in "modal" mode. Return Promise.
   * The task of form is to resolve or reject `deferred`, passed to form config.
   *
   * @param {Object} config
   * @param {String} config.formCode code of form from ubm_form
   * @param {String} [config.description] form caption
   * @param {Boolean} [config.isClosable] if true she form show close button
   * @param {*} [config.customParams] Any parameters passed to executed form
   *
   * @returns {Promise}
   */
  showModal: function (config) {
    return new Promise((resolve, reject) => {
      var cmdConfig = {
        cmdType: 'showForm',
        isModal: true,
        isResizable: false,
        isMaximizable: false,
        isMinimizable: false,
        isClosable: !!config.isClosable,
        description: config.description,
        formCode: config.formCode,
        customParams: config.customParams,
        deferred: {resolve: resolve, reject: reject} // result form MUST resolve or reject this deffer
      }
      if (!cmdConfig.formCode) {
        reject(new Error('invalid config for showModal. formCode if undefined'))
      }
      this.doCommand(cmdConfig)
    })
  },

  /**
   *
   * @param {String} prefix
   */
  setLocalStorageProviderPrefix: function (prefix) {
    var provider = Ext.state.Manager.getProvider()

    prefix += UB.core.UBLocalStorageManager.separator

    if (provider && provider.prefix !== prefix) {
      provider.prefix = prefix
      provider.state = provider.readLocalStorage()
    }
  },

  /**
   * @deprecated 1.7.0 Use {@link UB.core.UBApp.connection#userData $App.connection.userData()} instead
   * @return {Object}
   */
  getUserData: function () {
    UB.logDebug('UB.core.UBApp.getUserData is deprecated. Use connection.userData() instead')
    return this.connection.userData()
  },

  /**
   * @deprecated 1.7.0 Use {@link UB.core.UBApp.connection#userLang $App.connection.userLang()} instead
   * @return {String}
   */
  getUiLanguage: function () {
    UB.logDebug('$App.getUiLanguage is DEPRECATED. Use $App.connection.userLang()')
    return this.connection.userLang()
  },

  /**
   * Logout active user. Reload page.
   */
  logout: function () {
    let p = this.connection ? this.connection.logout() : Promise.resolve(true)
    p.catch(e => true).then(function () {
      // MPV TODO Secure browser
      // if (UB.isSecureBrowser) {
      //     var remote = require('electron').remote;
      //     var window = remote.getCurrentWindow();
      //     window.destroy();
      // } else {
      if (document.location && document.location.href && document.location.href.indexOf('#') > 0) {
        document.location.href = document.location.href.split('#')[0]
      } else {
        document.location.href = document.location.href
      }
      // }
      // reload page without cache re-validation. instead of window.location.reload() what does.
    })
  },

  locationHashChanged: function () {
    if (window.location.href && window.location.href.indexOf('#') > 0) {
      if (!window.location.href.split('#')[1]) {
        return
      }
      UB.core.UBApp.doCommand(UB.core.UBCommand.getCommandByUrl(window.location.href, $App.getViewport().centralPanel))
    }
  },

  hideLogo: function () {
    document.getElementById('UBLogo').style.display = 'none'
  }
})

module.exports = UB.core.UBApp
