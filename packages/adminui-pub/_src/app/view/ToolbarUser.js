require('../core/UBAppConfig')
require('../core/UBUtil')
require('../core/UBLocalStorageManager')
require('../core/UBFormLoader')
/**
 *  Widget for MainToolbar. Create "user" menu.
 */
Ext.define('UB.view.ToolbarUser', {
  extend: 'UB.view.ToolbarWidget',
  alias: 'widget.ubtoolbaruser',

  initComponent: function () {
    this.items = [{
      xtype: 'button',
      id: 'UB-view-ToolbarUser-button',
      iconCls: 'fa fa-2x fa-user', // icon-user
      text: $App.connection.userData('employeeShortFIO') || $App.connection.userLogin(),
      menu: {
        items: [{
          glyph: UB.core.UBUtil.glyphs.faCog,
          text: UB.i18n('userSettings'),
          handler: function () {
            $App.doCommand({
              cmdType: UB.core.UBCommand.commandType.showForm,
              formCode: 'ubm_desktop-userSettings'
            })
          }
        }, {
          xtype: 'checkbox',
          checked: window.localStorage.getItem(UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN) === 'true',
          boxLabel: UB.i18n('KerberosRemember'),
          hidden: $App.connection.authMethods.indexOf('Negotiate') < 0,
          handler: function () {
            window.localStorage.setItem(UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN, this.getValue())
          }
        }, {
          glyph: UB.core.UBUtil.glyphs.faKey, // iconCls: "icon-computer-key",
          text: UB.i18n('changePassword'),
          handler: function () {
            $App.showModal({
              formCode: 'uba_user-changeUserPassword',
              description: UB.i18n('changePassword'),
              customParams: 'self'
            }).then(function (result) {
              if (result.action === 'ok') {
                $App.connection.xhr({
                  method: 'POST',
                  url: 'changePassword',
                  data: {
                    newPwd: result.newPwd,
                    pwd: result.pwd,
                    needChangePassword: result.needChangePassword
                  }
                }).done(function () {
                  $App.dialogInfo('passwordChangedSuccessfully')
                })
              }
            })
          }
        }, {
          glyph: UB.core.UBUtil.glyphs.faDatabase, // iconCls: 'iconStores',
          text: UB.i18n('storedData'),
          menu: {
            items: [{
              text: UB.i18n('clearLocalStore'),
              iconCls: 'iconData',
              handler: function () {
                $App.connection.cacheClearAll().done(function () {
                  Ext.create('widget.uxNotification', {
                    title: UB.i18n('executed'),
                    position: 't',
                    slideInDuration: 800,
                    useXAxis: true,
                    autoShow: true,
                    cls: 'ux-notification-light',
                    // iconCls: 'ux-notification-icon-error',
                    bodyPadding: 5,
                    items: [{
                      xtype: 'component',
                      autoEl: {
                        tag: 'div',
                        html: UB.i18n('clearLocalStore')
                      }
                    }]
                  })
                })
              }
            }, {
              text: UB.i18n('resetGUIToDefault'),
              iconCls: 'iconUI',
              handler: function () {
                UB.core.UBLocalStorageManager.removeUserDataUI()
              }
            }]
          }
        }]
      }
    }]
    if (UB.appConfig.supportedLanguages.length > 1) {
      this.items[0].menu.items.push({
        glyph: UB.core.UBUtil.glyphs.faLanguage,
        text: UB.i18n('changeLanguage'),
        menu: {
          items: (function () {
            var langSubmenu = []
            _.forEach(UB.appConfig.supportedLanguages, function (lang) {
              if (lang !== $App.connection.userLang()) {
                langSubmenu.push({
                  text: UB.i18n(lang),
                  handler: function () {
                    $App.dialogYesNo('?', 'changeLanguageRequireRestart').then(function (choice) {
                      if (choice) {
                        $App.connection.query({
                          entity: 'uba_user',
                          method: 'changeLanguage',
                          newLang: lang
                        }).then(function () {
                          window.localStorage.setItem(UB.LDS_KEYS.PREFERRED_LOCALE, lang)
                          $App.logout()
                        })
                      }
                    })
                  }
                })
              }
            })
            return langSubmenu.length ? langSubmenu : {text: UB.i18n('noMoreLanguages')}
          })()
        },
        handler: function () {
        }
      })
    }
    this.items[0].menu.items.push('-')
    this.items[0].menu.items.push({
      glyph: UB.core.UBUtil.glyphs.faSignOut, // iconCls: 'iconLogout',
      text: UB.i18n('logout'),
      handler: function () {
        window.localStorage.setItem(UB.LDS_KEYS.USER_DID_LOGOUT, 'true')
        $App.logout()
      }
    })
    this.callParent(arguments)
  }
})
