/* eslint-disable new-cap,no-new */
/* global Ext, $App, UB */
/* global Q, _ */
/* global DocsAPI */
/**
 * Control to show document using OnlyOffice document server
 *
 {....
   layout: {
   type: 'vbox',
   align: 'stretch'
 },
 items: [{
   attributeName: 'resume', // in *.meta has to be of 'Document' type
   expanded: true, // or will be collapsed to link
   readOnly: true, // true|false
   documentMIME: 'application/word', // 'application/word'|'application/excel'
   height: 500,
   width: 800
   }]
 }
 *
 */

Ext.define('UB.ux.UBOnlyOffice', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.UBOnlyOffice',
  minHeight: 500,
  minWidth: 500,
  width: '100%',
  height: '100%',
  layout: 'fit',
  statics: {
    /**
     * Maps MIMEType to editor type ('application/msword' -> 'text')
     */
    contentTypeMap: { // 'text' | 'spreadsheet' | 'presentation',
      'application/msword': 'text',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet'
    },
    /**
     * returns component configuration
     * @return {{isConfigured: boolean, serverIP: string}}
     */
    getConfiguration: function () {
      const serverAddress = $App.connection.userData('onlyOfficeServer')
      const configuration = {
        isConfigured: _.isString(serverAddress),
        serverIP: serverAddress || ''
      }
      return configuration
    },
    /**
     * Returns true - if configuration available
     * @return {boolean}
     */
    isAvailable: function () {
      return this.getConfiguration().isConfigured
    }
  },

  // region Private variables
  /**
   * Stores "key" of the document used by onlyOffice server to identify document
   * @private
   */
  _documentKey: null,
  /**
   * Stores instance of DocsAPI.DocEditor class
   * @private
   */
  _onlyOfficeObject: null,
  /**
   * Stores Promise, that will be resolved after successful client script load from onlyOffice server
   * @private
   */
  _initializationPromise: null,
  /**
   * Defer that will be resolved in "render" listener
   * @see _placeholderID
   * @private
   */
  _domReadyDefer: null,
  /**
   * Element id where onlyOffice will render it's view.
   * Value filled in "render" listener. As it may not be available earlier.
   * After value set control is ready to show and @see {@link _domReadyDefer} resolved
   * @private
   */
  _placeholderID: null,

  /**
   * Created during call to GetValue. It's Promise returned from GetValue.
   * Resolved in "onDownloadAs" with location of document in temp store
   * @private
   */
  _onlyOfficeGetValueDefer: null,
  /**
   * Stores params received in SetSrc method as they later will be used in {@link _getControlConfiguration} and {@link onDownloadAs} event
   * @type {object}
   * @private
   */
  _params: null,

  _isModified: false,
  readOnly: true,
  // endregion

  listeners: {
    boxready: function (me, width, height) {
      console.log('boxready')
      console.log(width)
      console.log(height)
    },
    resize: function (me, width, height, oldWidth, oldHeight) {
      console.log('resize')
      console.log(width)
      console.log(height)
      console.log(oldWidth)
      console.log(oldHeight)
    },
    render: function (me) {
      // me.body may be not available before render
      me._placeholderID = me.body.dom.id
      me._domReadyDefer.resolve()
    }
  },

  // region Inherited from Ext control
  /**
   * Component initialization
   * Tries to find configuration section $App.connection.userData('onlyOfficeServer')
   * Generates markup for onlyOffice component starts loading client side script
   */
  initComponent: function () {
    const me = this
    const configuration = UB.ux.UBOnlyOffice.getConfiguration()
    if (!configuration.isConfigured) {
      console.warn('OnlyOffice configuration is missed. Yet control were tried to bootstrap')
      me.callParent(arguments)
      return
    }

    const url = 'http://' + configuration.serverIP + '/web-apps/apps/api/documents/api.js'
    me._initializationPromise = me._loadScript(url)
    me._domReadyDefer = Q.defer()
    me.callParent(arguments)
  },
  // endregion

  // region Inherited from UBDocument.js
  /**
   * Used by UBDocument to get value from component
   * After call to downloadAs() callback 'onDownloadAs' will be triggered and deferred resolved
   * @param {any} requestedValue - ignored
   * @return {Promise<string>} - resolves to an URL on onlyOffice server with modified document
   */
  getValue: function (requestedValue) {
    const me = this
    me._onlyOfficeGetValueDefer = Q.defer()
    me._onlyOfficeObject.downloadAs()
    return me._onlyOfficeGetValueDefer.promise
  },

  /**
   * Used by UBDocument to modify readOnly property
   * @param readOnly
   */
  setReadOnly: function (readOnly) {
    const me = this
    me.readOnly = readOnly
    if (readOnly && me._onlyOfficeObject) {
      console.log('UB.ux.UBOnlyOffice control set to readonly state. But object already created')
    }
  },

  /**
   * Used by UBDocument to check for modifications
   * @return {boolean}
   */
  isDirty: function () {
    const me = this
    return !me.readOnly && me._isModified
  },

  /**
   * Used by UBDocument to check for modifications
   * @return {boolean}
   */
  checkDirty: function () {
    const me = this
    return !me.readOnly && me._isModified
  },

  /**
   * Used by UBDocument to set value to component.
   * @param {Object} cfg
   * @param {String} [cfg.contentType] type of document
   * @param {String} [cfg.html] contains name of file
   * @param {Object} [cfg.params] The parameters necessary to obtain the document
   * @returns {Promise}
   */
  setSrc: function (cfg) {
    const me = this
    me._params = cfg.params
    me._params.user = $App.getUserData().userID

    Q.all([me._initializationPromise, me._domReadyDefer.promise])
      .then(() => {
        const documentType = me._mapContentTypeToDocumentType(cfg.contentType)
        const configuration = me._getControlConfiguration(documentType, cfg.params, cfg.html)
        me._documentKey = configuration.document.key
        me._onlyOfficeObject = new DocsAPI.DocEditor(me._placeholderID, configuration)
      })

    return Q.resolve(true)
  },

  // endregion

  // region Private methods
  /**
   * For onlyOffice client component to work, we need to load it's client script from it's server
   * @param {string} url - onlyOffice client bootstrap script
   * @return {Promise}
   * @private
   */
  _loadScript: function (url) {
    return Q.Promise((resolve, reject) => {
      Ext.Loader.loadScript({url: url, onLoad: resolve, onError: reject})
    })
  },

  /**
   * Generates configuration for DocsAPI.DocEditor object
   * @param fileType
   * @param fileUrl
   * @param title
   * @return {{document: {key: (string|*), title: (*|string), url: *}, documentType: (*|string), editorConfig: {mode: string, lang: string, callbackUrl: string, customization: {autosave: boolean, forcesave: boolean}}, events: {onDocumentStateChange: events.onDocumentStateChange, onDownloadAs: events.onDownloadAs, onCollaborativeChanges: events.onCollaborativeChanges, onOutdatedVersion: events.onOutdatedVersion, onError: events.onError, onReady: events.onReady, onSaveEnd: events.onSaveEnd, onRequestEditRights: events.onRequestEditRights, onRequestHistory: events.onRequestHistory, onRequestHistoryData: events.onRequestHistoryData, onRequestHistoryClose: events.onRequestHistoryClose}}}
   * @private
   */
  _getControlConfiguration: function (fileType, fileUrl, title) {
    const me = this
    const serverFileUrl = Ext.String.urlAppend($App.connection.serverUrl + 'getDocumentOffice', Ext.Object.toQueryString(me._params))
    // Server remembers keys and urls.
    // So if document with "key" were saved then "key" can't be reused - "onOutdatedVersion" will be called
    const key = UB.MD5((new Date()).toString() + '||' + serverFileUrl).toString().substr(20)
    const lang = 'ru' // ToDo: find out how to set language (variants with 'uk-UA'|'UA'|'uk'|'U' looks not working)
    const callbackUrl = $App.connection.serverUrl + 'notifyDocumentSaved'
    const editorMode = me.readOnly ? 'view' : 'edit'
    const type = me.readOnly ? 'embedded' : 'desktop'
    return {
      'document': {
        'key': key,
        'title': title || '',
        'url': serverFileUrl
      },
      'documentType': fileType || 'text',
      'type': type,
      'editorConfig': {
        'mode': editorMode,
        'lang': lang,
        'callbackUrl': callbackUrl,
        'customization': {
          'autosave': true,
          'forcesave': true,
          'chat': false,
          'compactToolbar': true,
          'comments': false
        }
      },
      'events': {
        'onDocumentStateChange': function onDocumentStateChange (e) {
          // fires instantly, currently only usefull variant "e.data === true" - document content changed
          if (e.data === true) {
            me._isModified = true
            console.log('Changes in document detected. Current document marked as dirty')
            me.fireEvent('change', me)
          }
        },
        'onDownloadAs': function onDownloadAs (e) {
          // fired after call to DocsAPI.DocEditor.downloadAs
          // e.data - url of the modified document
          const config = {
            params: me._params,
            headers: {'Content-Type': 'application/octet-stream'}
          }
          const request = $App.connection.post('setOnlyOfficeDocumentToTempStore', e.data, config)
          me._onlyOfficeGetValueDefer.resolve(request)
        },
        'onCollaborativeChanges': function onCollaborativeChanges (e) {
          console.log('onCollaborativeChanges')
        },
        'onOutdatedVersion': function onOutdatedVersion (e) {
          // fires when "document.key" found on onlyOffice server, but it's version is different from stored on URL
          console.log('onOutdatedVersion')
        },
        'onError': function onError (e) {
          console.log('onError')
        },
        'onReady': function onReady (e) {
          console.log('onReady')
        },
        'onSaveEnd': function onSaveEnd (e) {
          console.log('onSaveEnd')
        },
        'onRequestEditRights': function onRequestEditRights (e) {
          console.log('onRequestEditRights')
        },
        'onRequestHistory': function onRequestHistory (e) {
          console.log('onRequestHistory')
        },
        'onRequestHistoryData': function onRequestHistoryData (e) {
          console.log('onRequestHistoryData')
        },
        'onRequestHistoryClose': function onRequestHistoryClose (e) {
          console.log('onRequestHistoryClose')
        }
      }
    }
  },

  /**
   * Transforms document MIME type to editor type e.g. 'application/msword' -> 'text'
   * @param {string} contentType
   * @return {string}
   * @private
   */
  _mapContentTypeToDocumentType: function (contentType) {
    const documentType = UB.ux.UBOnlyOffice.contentTypeMap[contentType]
    if (!documentType) {
      console.warn('"UBOnlyOffice.js" - contentType passed in control is "' + contentType + '" and don\'t have corresponding mapping to onlyOffice type. So default type "text" will be used')
      return 'text'
    }
    return documentType
  }
  // endregion

})
