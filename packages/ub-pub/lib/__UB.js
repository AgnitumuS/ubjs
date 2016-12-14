// /**
//  * The UB namespace (global object) encapsulates all classes, singletons, and
//  * utility methods provided by UnityBase for build a transport layer for a Web applications.
//  *
//  * The main entry point for most operation is {@link UBConnection UBConnection} for communication with UnityBase server.
//  *
//  * @namespace UB
//  * @author pavel.mash
//  */
// let UB = {}
// // <editor-fold desc="Service functions block">
// let Q = require('bluebird-q')
//     /* last request content & date we send to server. We use it to prevent a reiteration requests with the same content */
//
//
// let _ = require('lodash')
//
// // </editor-fold>
//
// UB.consts = {
//
// }
//
// // if (UB.isSecureBrowser) {
// //     var electron = require('electron');
// //     electron.ipcRenderer.on('SETTINGS', function(event, message){
// //         UB.secureSettings = JSON.parse(message);
// //     });
// //     var session = electron.remote.session;
// //     session.defaultSession.on('will-download', function (event, item, webContents) {
// //         var fileName, savePath;
// //         var path = require('path');
// //         savePath = path.join(UB.secureSettings.downloadFolder, item.getFilename());
// //         item.setSavePath(savePath);
// //         //event.preventDefault();
// //         //'URL', item.getURL(), 'MIME', item.getMimeType(), 'hasUserGesture', item.hasUserGesture(), 'getFileName', item.getFilename(), 'contentDisposition', item.getContentDisposition());
// //         item.once('updated', function(event, state){
// //             fileName = item.getFilename();
// //             savePath = item.getSavePath();
// //         });
// //         item.once('done', function (event, state) {
// //             if (state === 'completed') {
// //                 $App.connection.query({
// //                     entity: 'uba_audit',
// //                     method: 'secureBrowserEvent',
// //                     action: 'DOWNLOAD',
// //                     reason: savePath
// //                 }).then(function(){
// //                         return $App.dialogInfo('Файл збережено до ' + savePath);
// //                 }).then();
// //             } else {
// //                 $App.dialogError('Завантаження відмінено');
// //             }
// //         });
// //     });
// // }
//
// /**
//  * @property {Object} appConfig UnityBase application parameter.
//  * All this parameters can be configured in ubConfig.uiSettings.adminUI section of application configuration file.
//  *
//  * @property {String} appConfig.applicationName Name of current application. This text shown in the left side of main window toolbar in Ext-based web client
//  * @property {String} appConfig.loginWindowTopLogoURL
//  * @property {String} appConfig.loginWindowBottomLogoURL
//  * @property {String} appConfig.defaultLang Default application language
//  * @property {Array.<String>} appConfig.supportedLanguages Array of all languages supported by application.
//  * @property {String} appConfig.defaultPasswordForDebugOnly Fill password on login window. Set this parameter for debug purpose only!
//  *
//  * @property {Number} appConfig.comboPageSize  Page size of UBCombobox drop-down (in case !disablePaging)
//  * @property {Number} appConfig.maxMainWindowTabOpened How many tab user can open in the same time in the main workspace
//  *
//  * @property {Number} appConfig.storeDefaultPageSize Default page size of UnityBase store
//  * @property {Number} appConfig.gridHeightDefault Default height of grid in form
//  * @property {Number} appConfig.gridWidthDefault  Default width of grid in form
//  * @property {Number} appConfig.gridParentChangeEventTimeout  Timeout for fire parentchange event
//  * @property {Number} appConfig.gridDefaultDetailViewHeight  Default height of detail grid and preview form inside master grid
//  *
//  * @property {Number} appConfig.formMinHeight Minimum form height
//  * @property {Number} appConfig.formMinWidth  Minimum form width
//  * @property {Number} appConfig.formDefaultAutoFormWidth  Default width of auto-generated form
//  * @property {Number} appConfig.formSaveMaskDelay  How long (in ms) wait before mask form while save action call. Usually save if quick operation and we do not need mask form at all
//  * @property {Number} appConfig.scanRecognizeProgressInterval Callback call interval while do scan recognition using UBDesktopService extension
//  * @property {String} appConfig.browserExtensionNMHostAppKey Native messages plugin application key
//  */
// UB.appConfig = {
//   applicationName: 'UnityBase',
//   applicationTitle: 'UnityBase',
//   loginWindowTopLogoURL: '', // 'images/UBLogo128.png',
//   loginWindowBottomLogoURL: '',
//   themeName: 'UBtheme',
//
//   userDbVersion: null,
//   defaultLang: 'en',
//   supportedLanguages: ['en'],
//   defaultPasswordForDebugOnly: '',
//   comboPageSize: 30,
//   maxMainWindowTabOpened: 10,
//   storeDefaultPageSize: 100,
//
//   gridHeightDefault: 400,
//   gridWidthDefault: 600,
//   gridParentChangeEventTimeout: 200,
//   gridDefaultDetailViewHeight: 150,
//
//   formMinHeight: 100,
//   formMinWidth: 300,
//   formDefaultAutoFormWidth: 300,
//   formSaveMaskDelay: 100,
//
//   scanRecognizeProgressInterval: 1000,
//   maxSearchLength: 62,
//   browserExtensionNMHostAppKey: 'com.inbase.ubmessagehost'
// }
//
// /**
//  * The onError callback
//  * @callback UB-onError
//  * @param {string} errorMessage
//  * @param {Number} [errorNum]
//  */
//
// /**
//  * onError handler. If set - this one is call, otherwise - default handler will be called
//  * @type UB-onError
//  */
// UB.onError = null
//
// /** @method
//  * @param {String} errMsg
//  * @param {Number} [errCode]
//  * @type {Function}
//  */
// UB.doOnProcessError = doOnProcessError
// function doOnProcessError (errMsg, errCode) {
//   if (UB.onError) {
//     UB.onError(errMsg, errCode)
//   } else {
//     throw new Error(errMsg)
//   }
// }
//
//
//
// // <editor-fold desc="Promise-based script injection">
//
// // </editor-fold>
//
// // <editor-fold desc="Promise-based XHR">
//
// /**
//  * If we are in UnityBase server scripting this property is true, if in browser - undefined or false.
//  * Use it for check execution context in scripts, shared between client & server.
//  * @property {Boolean} isServer
//  * @readonly
//  */
// Object.defineProperty(UB, 'isServer', {enumerable: true, value: false})
// // </editor-fold>
// module.exports = UB
