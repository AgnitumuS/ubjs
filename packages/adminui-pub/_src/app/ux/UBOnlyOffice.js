/* eslint-disable new-cap,no-new */
/* global Ext */
/* global Q */
/* global DocsAPI */

/**
 * Integration with OnlyOffice document server
 */
Ext.define('UB.ux.UBOnlyOffice', {
  extend: 'Ext.Panel',
  alias: 'widget.UBOnlyOffice',
  width: '100%',
  height: '100%',
  layout: 'fit',

  _isScriptLoaded: false,
  _initializationPromise: null,
  _placeholderID: null,
  contentTypeMap: { // 'text' | 'spreadsheet' | 'presentation',
    'application/word': 'text',
    'application/excel': 'spreadsheet'
  },

  initComponent: function () {
    const me = this
    const configuration = me._getServerConfiguration()
    if (!configuration.isConfigured) {
      console.warn('OnlyOffice configuration is missed. Yet control were tried to bootstrap')
      me.callParent(arguments)
      return
    }

    me._placeholderID = me.id + '_placeholder'
    me.html = ['<div style="width: 100%; height: 100%;" id="' + me._placeholderID + '"></div>']

    const url = 'http://' + configuration.serverIP + '/web-apps/apps/api/documents/api.js'
    me._initializationPromise = me._loadScript(url)
    me.callParent(arguments)
  },

  _loadScript: function (url) {
    return Q.Promise((resolve, reject) => {
      Ext.Loader.loadScript({url: url, onLoad: resolve, onError: reject})
    })
  },

  getValue: function () {
    return Q.Promise(function (resolve, reject) {

    })
  },

  setValue: function (value) {
  },

  /**
   * @param {Object} cfg
   * @param {Blob|File} [cfg.blobData]
   * @param {String} [cfg.contentType]
   * @param {String} [cfg.url]
   * @param {String} [cfg.html]
   * @param {String} [cfg.rawValue]
   * @param {Boolean} [cfg.resetOriginalValue=false] Reset original value if true.
   * @param {Object} [cfg.params] The parameters necessary to obtain the document
   * @returns {Promise}
   */
  setSrc: function (cfg) {
    const me = this
    if (!cfg.url) {
      return me._initializationPromise
    }

    return me._initializationPromise
      .then(() => {
        const documentType = me._mapContentTypeToDocumentType(cfg.contentType)
        const configuration = me._getConfiguration(documentType, cfg.url, cfg.html)
        new DocsAPI.DocEditor(me._placeholderID, configuration)
      })
  },

  _getServerConfiguration: function () {
    const serverAddress = $App.connection.userData('onlyOfficeServer')
    const configuration = {
      isConfigured: _.isString(serverAddress),
      serverIP: serverAddress || ''
    }
    return configuration
  },

  _getConfiguration: function (fileType, fileUrl, title) {
    fileUrl = $App.connection.serverUrl + fileUrl.replace('/getDocument', 'getDocumentOffice')
    const lang =  $App.connection.userLang() || 'uk-UA'
    const callbackUrl = $App.connection.serverUrl + 'notifyDocumentSaved'
    return {
      'document': {
        'key': 'Khirz6zTPdf01',
        'title': title || '',
        'url': fileUrl
      },
      'documentType': fileType || 'text',
      'editorConfig': {
        'mode': 'view',
        'lang': lang,
        'callbackUrl': callbackUrl,
        'customization': {
          'autosave': false,
          'forcesave': true
        }
      },
      'events': {
        'onCollaborativeChanges': function onCollaborativeChanges () { console.log('onCollaborativeChanges') },
        'onDocumentStateChange': function onDocumentStateChange (e, r, t) {
          console.log('onDocumentStateChange')
        },
        'onDownloadAs': function onDownloadAs (e, r, t) {
          console.log('onDownloadAs')
          debugger
        },
        'onOutdatedVersion': function onOutdatedVersion () { console.log('onOutdatedVersion') },
        'onError': function onError () { console.log('onError') },
        'onReady': function onReady (e, r, t) {
          console.log('onReady')
        },
        'onSaveEnd': function onSaveEnd (e, r, t) {
          console.log('onSaveEnd')
          debugger
        },
        'onRequestEditRights': function onRequestEditRights () { console.log('onRequestEditRights') },
        'onRequestHistory': function onRequestHistory () { console.log('onRequestHistory') },
        'onRequestHistoryData': function onRequestHistoryData () { console.log('onRequestHistoryData') },
        'onRequestHistoryClose': function onRequestHistoryClose () { console.log('onRequestHistoryClose') }
      }
    }
  },

  _mapContentTypeToDocumentType: function (contentType) {
    const me = this
    const documentType = me.contentTypeMap[contentType]
    if (!documentType) {
      console.warn('"UBOnlyOffice.js" - contentType passed in control is "' + contentType + '" and don\'t have corresponding mapping to onlyOffice type. So default type "text" will be used')
      return 'text'
    }
    return documentType
  }

})
