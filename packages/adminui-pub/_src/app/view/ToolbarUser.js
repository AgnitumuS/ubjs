/**
 *  Widget for MainToolbar. Create "user" menu.
 */
Ext.define('UB.view.ToolbarUser', {
    extend: 'UB.view.ToolbarWidget',
    alias: "widget.ubtoolbaruser",
    requires: [
        "UB.core.UBApp",
        "UB.core.UBAppConfig",
        "UB.core.UBUtil",
        "UB.core.UBLocalStorageManager",
        "UB.core.UBFormLoader"
    ],

    initComponent: function(){
        this.items = [{
            xtype: "button",
            id: 'UB-view-ToolbarUser-button',
            iconCls: "fa fa-2x fa-user", //icon-user
            text: $App.connection.userData('employeeShortFIO') || $App.connection.userLogin(),
            menu: {
                items: [{
                    glyph: UB.core.UBUtil.glyphs.faCog,
                    text: UB.i18n('userSettings'),
                    handler: function() {
                        $App.doCommand({
                            cmdType: UB.core.UBCommand.commandType.showForm,
                            formCode: 'ubm_desktop-userSettings'
                        });
                    }
                },{
                     xtype: 'checkbox',
                     checked: JSON.parse(localStorage.getItem('silenceKerberosLogin') || 'false'),
                     boxLabel: UB.i18n('chkSilenceLogin'),
                     hidden: $App.connection.authMethods.indexOf('Negotiate') < 0,
                     handler: function(){
                         localStorage.setItem('silenceKerberosLogin', this.getValue());
                     }
                },{
                    glyph: UB.core.UBUtil.glyphs.faKey, //iconCls: "icon-computer-key",
                    text: UB.i18n('changePassword'),
                    handler: function() {
                        $App.showModal({
                            formCode: 'uba_user-changeUserPassword',
                            description: UB.i18n('changePassword'),
                            customParams: 'self' 
                        }).done(function (result) {
                            if (result.action === 'ok') {
                                $App.connection.xhr({
                                    method: 'POST',
                                    url: 'changePassword',
                                    data: {
                                        newPwd: result.newPwd,
                                        pwd: result.pwd,
                                        needChangePassword: result.needChangePassword
                                    }
                                }).done(function(){
                                    $App.dialogInfo('passwordChangedSuccessfully');
                                });
                            }
                        });
                    }
                }, {
                    glyph: UB.core.UBUtil.glyphs.faDatabase, // iconCls: 'iconStores',
                    text: UB.i18n('storedData'),
                    menu: {
                        items: [{
                            text: UB.i18n('clearLocalStore'),
                            iconCls: 'iconData',
                            handler: function() {
                                $App.connection.cacheClearAll().done(function() {
                                    Ext.create('widget.uxNotification', {
                                        title: UB.i18n('executed'),
                                        position: 't',
                                        slideInDuration: 800,
                                        useXAxis: true,
                                        autoShow: true,
                                        cls: 'ux-notification-light',
                                        //iconCls: 'ux-notification-icon-error',
                                        bodyPadding: 5,
                                        items: [{
                                            xtype: 'component',
                                            autoEl: {
                                                tag: 'div',
                                                html: UB.i18n('clearLocalStore')
                                            }
                                        }]
                                    });
                                });
                            }
                        }, {
                            text: UB.i18n('resetGUIToDefault'),
                            iconCls: 'iconUI',
                            handler: function() {
                                UB.core.UBLocalStorageManager.removeUserDataUI();
                            }
                        }, {
                            text: UB.i18n('clearFormsCache'),
                            iconCls: 'iconForm',
                            tooltip: 'Ctrl+Alt+C', // this shortcut handled on global level in app.js
                            handler: function() {
                                UB.core.UBFormLoader.clearFormCache();
                                Ext.create('widget.uxNotification', {
                                    title: UB.i18n('executed'),
                                    position: 't',
                                    slideInDuration: 800,
                                    useXAxis: true,
                                    autoShow: true,
                                    cls: 'ux-notification-light',
                                    //iconCls: 'ux-notification-icon-error',
                                    bodyPadding: 5,
                                    items: [{
                                        xtype: 'component',
                                        autoEl: {
                                            tag: 'div',
                                            html: UB.i18n('clearFormsCache')
                                        }
                                    }]
                                });
                            }
                        }]
                    }
                }]
            }
        }];
        if (UB.appConfig.supportedLanguages.length > 1){
            this.items[0].menu.items.push({
                glyph: UB.core.UBUtil.glyphs.faLanguage,
                text: UB.i18n('changeLanguage'),
                menu: {
                    items: (function(){
                        var langSubmenu = [];
                        _.forEach(UB.appConfig.supportedLanguages, function(lang) {
                            if (lang !== $App.connection.userLang()) {
                                langSubmenu.push({
                                    text: UB.i18n(lang),
                                    handler: function () {
                                        $App.dialogYesNo('?', 'changeLanguageRequireRestart').done(function (choise) {
                                            if (choise) {
                                                $App.connection.run({
                                                    entity: 'uba_user',
                                                    method: 'changeLanguage',
                                                    newLang: lang
                                                }).done(function () {
                                                    localStorage.setItem($App.connection.appName + 'preferredLocale', lang);
                                                    $App.logout();
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        return langSubmenu.length ? langSubmenu : {text: UB.i18n('noMoreLanguages')}
                    })()
                },
                handler: function() {
                }
            });
        }
        this.items[0].menu.items.push("-");
        this.items[0].menu.items.push({
            glyph: UB.core.UBUtil.glyphs.faSignOut, // iconCls: 'iconLogout',
            text: UB.i18n('logout'),
            handler: function() {
                localStorage.setItem('userDidLogout', 'true');
                $App.logout();
            }
        });
        this.callParent(arguments);
    }
});