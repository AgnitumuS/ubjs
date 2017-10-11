/* global Blob, File */
/* global UB, $App, Ext, Q, _ */

require('../core/UBService')
require('./UBObject')
require('./PDFComponent')
require('./UBImg')
require('./UBLink')
require('./UBLabel')
require('./UBTinyMCETextArea')
require('./UBCodeMirror')
require('./UBReportEditor')
require('./UBMetaDiagram')
// require('./GraphViewer')
require('./UBOrgChart')
require('./UBOnlyOffice')
// noinspection JSUnusedGlobalSymbols
/**
 * Container for display `Document` type attribute value.
 * During panel creation there is no internal component inside, so the with and height is undefined.
 * Be carefully in case parent contained align is depending on dimensions of  UB.ux.UBDocument
 *
 * After call to setValue component will analyse contentType attribute of document data and create
 * a internal editor/viewer according to {UB.ux.UBDocument#contentTypeMapping} rules.
 *
 * If {UB.ux.UBDocument#expanded} is set to false internal component is a hyperlink for document content download.
 *
 {....
     layout: {
         type: 'vbox',
         align: "stretch"
     },
 items: [
     {...,
         flex: 1
     }, {
         attributeName: "photo",
         // the parent container layout is "vbox" with align "stretch",
         // during form align we can't calculate a width of our image (it is not loaded),
         // so we must set width of container manually
         width: 250,
         expanded: true, // show image, not link
         layout: 'auto', // let's prevent strech of internal image
         cmpConfig: {height: 300} // and prevent browser to display image on the full size
     }
 ]

 * @author UnityBase core team
 */
Ext.define('UB.ux.UBDocument', {
  extend: 'Ext.container.Container',
  mixins: {
    labelable: 'Ext.form.Labelable',
    field: 'Ext.form.field.Field'
  },
  alias: 'widget.ubdocument',

  // requires: [
  //     'UB.core.UBService',
  //     'UB.ux.UBObject',
  //     'UB.ux.PDFComponent',
  //     'UB.ux.UBImg',
  //     'UB.ux.UBLink',
  //     'UB.ux.UBLabel',
  //     'UB.ux.UBTinyMCETextArea',
  //     'UB.ux.UBCodeMirror',
  //     'UB.ux.UBReportEditor'
  // ],
  uses: ['UB.core.UBApp'],
  autoEl: 'div',
  statics: {
    editors: {
      tinyMCE: 'UB.ux.UBTinyMCETextArea',
      codeMirror: 'UB.ux.UBCodeMirror',
      ubDiagram: 'UB.ux.UBMetaDiagram',
      ubOrgChart: 'UB.ux.UBOrgChart',
      ubReport: 'UB.ux.UBReportEditor',
      onlyOffice: 'UB.ux.UBOnlyOffice'
    },

    valueProperties: {
      fName: 'fName',
      origName: 'origName'
    },

    /**
     * Map of document MIME type to editor
     * @type {Object<string, string>}
     * @static
     */
    contentTypeMapping: {
      'application/pdf': 'UB.ux.PDFComponent',
      'application/edi': 'UB.ux.PDFComponent',
      'image/png': 'UB.ux.UBImg', // Ext.Img
      'image/gif': 'UB.ux.UBImg',
      // tiff is Microsoft format - only IE can chow it 'image/tiff': 'Ext.Img',
      'image/jpeg': 'UB.ux.UBImg',
      'image/jpg': 'UB.ux.UBImg',
      'image/bmp': 'UB.ux.UBImg',
      'image/x-icon': 'UB.ux.UBImg',

      'text/html': 'UB.ux.UBTinyMCETextArea',
      'application/txt': 'UB.ux.UBTinyMCETextArea',
      'application/ubreport': 'UB.ux.UBReportEditor',

      'text/plain': 'UB.ux.UBCodeMirror',
      'application/json': 'UB.ux.UBCodeMirror',
      'application/def': 'UB.ux.UBCodeMirror',
      'application/javascript': 'UB.ux.UBCodeMirror',

      'text/x-yaml': 'UB.ux.UBCodeMirror',
      'application/yaml': 'UB.ux.UBCodeMirror',
      'text/xml': 'UB.ux.UBCodeMirror',
      'application/xml': 'UB.ux.UBCodeMirror',
      'application/ubWorkFlow': 'UB.ux.GraphViewer',
      'application/ubworkflow': 'UB.ux.GraphViewer',
      'application/ubMetaDiagram': 'UB.ux.UBMetaDiagram',
      'application/ubmetadiagram': 'UB.ux.UBMetaDiagram',
      'application/uborgchart': 'UB.ux.UBOrgChart',
      'application/UBOrgChart': 'UB.ux.UBOrgChart',
      'application/msword': 'UB.ux.UBOnlyOffice',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'UB.ux.UBOnlyOffice'
    }
  },
  layout: 'fit',

  cls: 'ub-document-container',

  /**
   * Request a server to convert a document content to specified MIME type
   * Converting  must be are enabled on the server side.
   *
   * @cfg {String} forceMIME
   */
  forceMIME: '',

  /**
   * Force prevent getting content from browser/proxy cache.
   * @cfg {Boolean} bypassCache
   * @type {boolean}
   * @default false
   */
  bypassCache: false,
  originalMIME: null,
  lastOriginalValue: null,
  /**
   * In case `true` - display document content instead of link to document.
   * In this case we use {UB.ux.UBDocument#contentTypeMapping} to determinate actual type of inner control
   * @cfg {boolean} expanded
   * @type {boolean}
   * @default false
   */
  expanded: false,
  /**
   * This value used to force document content type if value is not null
   * @cfg {String} documentMIME
   * @type {string|null}
   * @default null
   */
  documentMIME: null,

  /**
   *  When false each call to setValue() create new component else used one instance
   *  @cfg {Boolean} keepCmpOnRefresh
   */

  initComponent: function () {
    this.originalValue = undefined
    this.forceMIME = this.forceMIME || ''

    this.callParent(arguments)
    this.addEvents('change', 'dirtychange', 'initialize')
    if (this.initEmptyDocumentMIME) {
      this.setValue('')
    }
  },

  /**
   * Config for inner component.
   * @cfg {Object} cmpConfig
   */

  /**
   * Creates component based on contentType.
   * When no component found for contentType default 'UB.ux.UBLink' component created
   * @param {String} contentType
   */
  createComponent: function (contentType) {
    const me = this
    if (!me.ubCmp || (me.keepCmpOnRefresh === false) || (contentType !== me.cmpContentType)) {
      me.cmpContentType = contentType
      if (me.items && me.items.length > 0) {
        me.removeAll()
      }

      me.contentXType = me.getExtXType(contentType)
      me.ubCmp = Ext.create(me.contentXType, Ext.apply({
        name: me.name,
        useBlobForData: true,
        mode: me.getNormalizeContentType(contentType),
        readOnly: me.readOnly
      }, me.cmpConfig || {}))
      me.add(me.ubCmp)
      me.ubCmp.on('change', me.checkContentChange, me)
      me.ubCmp.on('setOriginalValue', function (originalValue) {
        me.lastCmpValue = originalValue
      }, me)
    }
    me.fireEvent('initialize', me)
  },

  onContentNotFound: function () {
    const me = this
    if (!me.errorLabel) {
      me.errorLabel = Ext.create('UB.ux.UBLabel', {
        html: '<span style="color: red">' + UB.i18n('documentNotFound') + '<span/>'
      })
      me.add(me.errorLabel)
    } else {
      me.errorLabel.show()
    }
    if (me.ubCmp) {
      me.ubCmp.hide()
    }
  },

  checkContentChange: function () {
    const me = this
    if (!!me.suspendCheckChange || !!me.readOnly) {
      return
    }

    switch (me.ubCmp.xtype) {
      case 'UBOnlyOffice':
        // "content changed" check delegated to component
        if (me.ubCmp.checkDirty()) {
          me.fireEvent('change', me, '', '')
          me.onChange('', '')
        }
        break
      default:
        const newVal = me.ubCmp.getValue()
        const oldVal = me.lastCmpValue
        const cValue = me.getValue()
        const isContentChanged = !me.isDestroyed && (me.ubCmp.isDirty ? me.ubCmp.isDirty() : !me.isEqual(newVal, oldVal))

        if (isContentChanged) {
          me.lastCmpValue = newVal
          let nValue = cValue ? JSON.parse(cValue) : {}
          nValue.md5 = 'changedAt' + (new Date()).getTime()
          me.value = nValue = JSON.stringify(nValue)
          me.fireEvent('change', me, nValue, cValue)
          me.onChange(newVal, oldVal)
        } else {
          let nValue
          me.lastCmpValue = newVal
          me.value = nValue = me.originalValue
          me.fireEvent('change', me, nValue, cValue)
          me.onChange(newVal, oldVal)
        }
    }
  },

  checkDirty: function () {
    const me = this
    let isDirty

    if (me.readOnly) {
      return false
    }

    isDirty = me.isDirty()

    if (isDirty !== me.wasDirty) {
      me.fireEvent('dirtychange', me, isDirty)
      me.onDirtyChange(isDirty)
      me.wasDirty = isDirty
    }
  },

  /**
   *
   * @param {String} contentType
   * @return {String}
   */
  getNormalizeContentType: function (contentType) {
    const pos = contentType.indexOf(';')
    if (pos !== -1) {
      return contentType.substring(0, pos)
    } else {
      return contentType
    }
  },

  /**
   *
   * @param {String} contentType
   * @return {String}
   */
  getExtXType: function (contentType) {
    let xtype
    let normContentType

    if (contentType === 'UB.ux.UBLink' || contentType === 'UB.ux.UBLabel') {
      return contentType
    }

    if (this.expanded) {
      normContentType = this.getNormalizeContentType(contentType)
      xtype = UB.ux.UBDocument.contentTypeMapping[normContentType]
    }
    xtype = xtype || 'UB.ux.UBLink'

    return xtype
  },

  /**
   *
   * @param {String} propertyName
   * @return {String}
   */
  getValueProperty: function (propertyName) {
    return Ext.JSON.decode(this.value, true)[propertyName]
  },

  /**
   *
   * @param {String} propertyName
   * @param {String} value
   */
  setValueProperty: function (propertyName, value) {
    const o = Ext.JSON.decode(this.value, true)
    if (!o) {
      return
    }
    if (!UB.core.UBUtil.isEqual(o[propertyName], value)) {
      o[propertyName] = value
      this.value = Ext.JSON.encode(o)
    }
  },

  /**
   *
   * @return {String}
   */
  getFName: function () {
    return this.getValueProperty(UB.ux.UBDocument.valueProperties.fName)
  },

  /**
   *
   * @param {String} value
   */
  setFName: function (value) {
    this.setValueProperty(UB.ux.UBDocument.valueProperties.fName, value)
  },

  /**
   *
   * @return {String}
   */
  getOrigName: function () {
    return this.getValueProperty(UB.ux.UBDocument.valueProperties.origName)
  },

  /**
   *
   * @param {String} value
   */
  setOrigName: function (value) {
    this.setValueProperty(UB.ux.UBDocument.valueProperties.origName, value)
  },

  /**
   *
   * @return {String}
   */
  getValue: function () {
    return this.value
  },

  /**
   * @param {String} url
   * @param {String?} defaultContentType
   * @param {boolean?} asArrayBuffer
   * @returns Promise
   **/
  loadContent: function (url, defaultContentType, asArrayBuffer) {
    const me = this
    let urlArr, mime, elm, ct, types
    let cType = null

    mime = me.forceMIME.toUpperCase()
    ct = defaultContentType ? defaultContentType.toUpperCase() : ''
    if (mime && ct !== mime && ct !== 'UB.ux.UBLabel'.toUpperCase()) {
      types = $App.domainInfo.forceMIMEConvertors[ct] || []
      _.forEach(types, function (item) {
        if (item === mime) {
          cType = me.forceMIME
          return false
        }
        return true
      })
    }

    if (me.forceMIME && cType) { // insert parameter in the middle of url to keep session_signature in the end
      urlArr = url.split('&')
      elm = urlArr.pop()
      urlArr.push('forceMIME=' + encodeURIComponent(me.forceMIME), elm)
      url = urlArr.join('&')
    }

    if (me.bypassCache) {
      url += '&_dc=' + (new Date()).getTime()
    }

    return $App.connection.get(url, {responseType: 'arraybuffer'})
      .then(function (response) {
        if (asArrayBuffer) {
          return {
            data: response.data,
            type: me.documentMIME || response.headers('content-type') || defaultContentType
          }
        } else {
          return new Blob(
            [response.data],
            {type: me.documentMIME || response.headers('content-type') || defaultContentType}
          )
        }
      }, function (reason) {
        if (reason.status !== 401) {
          me.onContentNotFound()
          throw new UB.UBAbortError()
        } else {
          throw reason
        }
      })
  },

  /**
   * Set value of document content directly to component. This method does not call setDocument method on server/
   * @param {*} value
   * @param {Boolean} [resetOriginalValue=true]
   * @returns {Promise}
   */
  setContent: function (value, resetOriginalValue) {
    const me = this
    if (!me.documentMIME) {
      throw new Error('This method support only  if "documentMIME" property has value true.')
    }
    if (resetOriginalValue !== false) {
      resetOriginalValue = true
    }
    if (!me.ubCmp) {
      me.createComponent(me.documentMIME)
      resetOriginalValue = true
    }
    if (value && _.isObject(value) && ((value instanceof Blob) || (value instanceof File))) {
      return me.ubCmp.setSrc({
        blobData: value,
        resetOriginalValue: resetOriginalValue
      }).then(function (res) {
        if (value instanceof File) {
          me.setOrigName(value.name)
        }
        return res
      })
    } else {
      return me.ubCmp.setSrc({
        rawValue: value,
        resetOriginalValue: resetOriginalValue
      }) || Q.resolve(true)
    }
  },

  /**
   *
   * @param {String|Object} valueStr
   * @param {Number?} instanceID
   * @param {Boolean?} [suspendEvents] (optional)
   * @param {Blob?} [blobValue] (optional) for update blob source
   * @returns {Promise} The promise resolve inner control object
   */
  setValue: function (valueStr, instanceID, suspendEvents, blobValue) {
    const me = this
    const defer = Q.defer()
    let xtype, contentMIME, url, params
    let val = {}
    let hasError = false
    let isString = Ext.isString(valueStr)
    let isObject = Ext.isObject(valueStr)

    me.lastNotEmptyValue = valueStr || me.lastNotEmptyValue
    me.lastOriginalValue = valueStr
    me.instanceID = instanceID

    val = isString ? Ext.JSON.decode(valueStr) : valueStr

    const isValueCorrectString = !isString || valueStr.length === 0
    const isValueCorrectObject = !isObject || !valueStr.ct || !valueStr.origName || valueStr.deleting

    if (!isValueCorrectString && !isValueCorrectObject) {
      hasError = true
      if (me.documentMIME) {
        xtype = me.getExtXType(me.documentMIME)
        contentMIME = me.documentMIME
      } else {
        xtype = 'UB.ux.UBLabel'
        url = UB.i18n('emptyContent')
      }
    } else {
      xtype = me.expanded ? me.getExtXType(val.ct) : 'UB.ux.UBLink'
      contentMIME = val.ct

      params = {
        entity: me.entityName,
        attribute: me.attributeName,
        ID: me.instanceID
      }

      if (val.store) {
        params.store = val.store
      }

      if (val.fName) {
        params.filename = val.fName
      }
      if (val.origName) {
        params.origName = val.origName
      }
      if (val.isDirty) {
        params.isDirty = val.isDirty
      }
      if (me.useRevision && !Ext.isEmpty(val.revision)) {
        params.revision = val.revision
      }
      if (!params.filename) {
        params.filename = me.entityName + me.instanceID + me.attributeName
      }

      url = Ext.String.urlAppend(
        $App.connection.baseURL + 'getDocument',
        Ext.Object.toQueryString(params)
      )
    }

    me.value = Ext.Object.getSize(val) > 0 ? Ext.JSON.encode(val) : undefined

    me.checkChange()

    function onContentLoad (blob, baseUrl, baseCt) {
      me.sourceBlob = blob
      me.loadUrl = baseUrl

      if (me.ubCmp.isHidden()) {
        me.ubCmp.show()
      }
      if (me.errorLabel) {
        me.errorLabel.hide()
      }

      let src = {
        url: baseUrl,
        contentType: baseCt,
        html: !val || val.deleting ? url : val.origName || url,
        blobData: blob
      }
      // Возможно стоит сравнить md5. Пока не везде честный md5.
      if (!me.editorInited || !me.isEditor()) { // me.forceReload || - not found through project
        me.ubCmp.setSrc(src).then(function (r) {
          defer.resolve(r)
        }, function (r) {
          defer.reject(r)
        })
        me.editorInited = me.isEditor()
      } else {
        defer.resolve(null)
      }
    }

    if (xtype === 'UB.ux.UBOnlyOffice') {
      // <-- onlyOffice
      // to prevent double loading of document from store
      // onlyOffice has it's own block
      me.createComponent(contentMIME)
      me.ubCmp.setSrc({
        contentType: contentMIME,
        params: params,
        html: val.origName
      }).then(function () {
        defer.resolve(null)
      }, function (reason) {
        if (reason && !(reason instanceof UB.UBAbortError)) {
          defer.reject(reason)
        } else {
          defer.resolve(null)
        }
      }).finally(function () {
        if (me.getEl()) {
          me.getEl().unmask()
        }
      })
      // --> /onlyOffice
    } else if (xtype === 'UB.ux.UBLink' || (hasError && Ext.Object.getSize(val) !== 0)) {
      me.createComponent(contentMIME)
      onContentLoad(null, url, contentMIME)
    } else if (Ext.Object.getSize(val) === 0) {
      me.createComponent(xtype)
      // xmax событие для инициализации нового документа где такое необходимо
      if (me.ubCmp.initNewSrc) {
        me.value = me.ubCmp.initNewSrc()
      }
      defer.resolve(null)
    } else if (blobValue && !val.deleting) {
      me.createComponent(blobValue.type)
      onContentLoad(blobValue, url, contentMIME)
    } else {
      if (me.getEl()) {
        me.getEl().mask(UB.i18n('loadingData'))
      }

      me.loadContent(url, contentMIME).then(function (blob) {
        contentMIME = blob.type
        me.createComponent(contentMIME)
        onContentLoad(blob, url, contentMIME)
        if (me.getEl()) {
          me.getEl().unmask()
        }
      }, function (reason) {
        if (me.getEl()) {
          me.getEl().unmask()
        }
        if (reason && !(reason instanceof UB.UBAbortError)) {
          defer.reject(reason)
        } else {
          defer.resolve(null)
        }
      })
    }
    return defer.promise
  },

  /**
   * Sets value for complex 'Document' attribute (for example: recStageID.docID.document)
   * @param {Object} record
   * @returns {Promise|null}
   */
  setComplexValue: function (record) {
    const oldFieldName = this.attributeName // current fieldName (for example: recStageID.docID.document)
    const lastSeparatorIndex = oldFieldName.lastIndexOf('.')
    const associationFieldName = oldFieldName.substring(0, lastSeparatorIndex) // before the last '.'.
    // ex: recStageID.docID.document -> recStageID.docID
    const documentAttrName = oldFieldName.substring(lastSeparatorIndex + 1, oldFieldName.length) // after the last '.'.
    // ex: recStageID.docID.document -> document
    const documentInstanceID = record.get(associationFieldName)
    const oldEntityName = this.entityName
    let result

    // change entityName to associatedEntity name, where we store the document
    // ex: from doc_recparticipant to doc_document
    this.entityName = $App.domainInfo.get(oldEntityName).attr(associationFieldName).associatedEntity

    // change attributeName to the document's attributeName of associatedEntity
    // ex: from recStageID.docID.document to document
    this.attributeName = documentAttrName

    // call standard setValue method
    result = this.setValue(record.get(oldFieldName), documentInstanceID, true)
    this.attributeName = oldFieldName
    this.entityName = oldEntityName
    return result
  },

  resetOriginalValue: function () {
    const me = this
    me.originalValue = me.getValue()

    if (me.ubCmp && _.isFunction(me.ubCmp.resetOriginalValue)) {
      me.ubCmp.resetOriginalValue()
    }

    me.checkDirty()
  },

  isDirty: function () {
    if (this.readOnly) {
      return false
    }
    return this.isContentDirty() || !this.isEqual(this.getValue(), this.originalValue)
  },

  isContentDirty: function () {
    if (this.ubCmp && _.isFunction(this.ubCmp.isDirty)) {
      return this.ubCmp.isDirty()
    }
    return false
  },

  isEditor: function () {
    const cType = this.contentXType
    const editors = UB.ux.UBDocument.editors
    let result = false
    Ext.Object.each(editors, function (eName, editor) {
      if (cType === editor) {
        result = true
        return false
      } else {
        return true
      }
    }, this)
    return result
    // return cType === editors.tinyMCE || cType === editors.codeMirror || cType === editors ;
  },

  /**
   * Return true if data is not null.
   * @returns {boolean}
   */
  existData: function () {
    const me = this
    let content
    if (me.ubCmp && me.ubCmp.getValue) {
      content = me.ubCmp.getValue('UBDocument')
    } else if (me.sourceBlob) {
      content = me.sourceBlob.data
    }
    return !!content
  },

  /**
   *
   * @param {Boolean} force
   * @returns {Promise}
   */
  save: function (force) {
    const me = this
    let val, content, promise

    if (!force && (!me.isEditor() || !me.isDirty())) {
      return Q.resolve(true)
    }

    val = me.getValue() || me.lastNotEmptyValue
    if (val) {
      val = JSON.parse(val)
    }

    if (me.ubCmp.getValue) {
      content = me.ubCmp.getValue('UBDocument')
    } else if (me.sourceBlob) {
      content = me.sourceBlob.data
    }

    if (!content && me.loadUrl) {
      promise = me.loadContent(me.loadUrl, null, true)
    } else {
      promise = Q.resolve(content)
    }

    // onlyOffice component saving result to temp store using special endpoint
    if (me.ubCmp.xtype !== 'UBOnlyOffice') {
      promise = promise.then(function (contentData) {
        const fileName = val && val.origName
          ? val.origName
          : me.documentMIME && (me.documentMIME.indexOf('/') < me.documentMIME.length - 1) ? 'newfile.' + me.documentMIME.substr(me.documentMIME.indexOf('/') + 1) : ''

        return $App.connection.setDocument(me.entityName, me.attributeName, me.instanceID, contentData, fileName)
      })
    }

    return promise.then(function (response) {
      const resultValue = response.data
      if (me.ubCmp.resetOriginalValue) {
        me.ubCmp.resetOriginalValue()
      }
      me.value = Ext.isObject(resultValue.result) ? JSON.stringify(resultValue.result) : resultValue.result
      return true
    })
  },

  onSave: function (result, callback, scope) {
    const resultValue = Ext.JSON.decode(result)

    if (resultValue.success) {
      this.ubCmp.resetOriginalValue()
      this.value = Ext.JSON.encode(resultValue.result)
    } else {
      UB.showErrorWindow(resultValue.errMsg, resultValue.errCode, this.entityName)
    }
    Ext.callback(callback, scope, [resultValue.success])
  },

  /**
   * this one used in BasePanel.onShowOriginal
   * @param {String} mime
   */
  setMIME: function (mime) {
    const me = this
    me.forceMIME = mime || ''

    me.setValue(me.lastOriginalValue, me.instanceID, true)
  },

  disableActions: function (value) {
    if (this.action) {
      // this action has items in two places: toolbar and allMenuItems menu
      // disable all of them
      this.action.each(function (item) {
        // disable not all action button, but only menu items, which can change document (scan, attach, delete)
        item.menu.items.each(function (menuItem) {
          let events = UB.view.BasePanel.eventId
          let eventId = menuItem.eventId
          if (eventId === events.scan ||
            eventId === events.attach ||
            eventId === events.deleteattachment) {
            menuItem[value ? 'disable' : 'enable'](value)
          }
        })
      })
//            this.action[value?'disable':'enable'](value);
    }
  },

  setReadOnly: function (readOnly) {
    this.readOnly = readOnly
    if (this.ubCmp && this.ubCmp.setReadOnly) {
      this.ubCmp.setReadOnly(readOnly)
    }
    this.disableActions(readOnly)
  },

  disable: function () {
    this.setDisable(true)
  },
  enable: function () {
    this.setDisable(false)
  },
  setDisable: function (value) {
    this.disabled = !!value
    this.disableActions(value)
  }
})
