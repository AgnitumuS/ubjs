require('./UBObject.js')
/**
 * Class for visualise PDF filed
 */
Ext.define('UB.ux.PDFComponent', {
  extend: 'UB.ux.UBObject',
  alias: 'widget.ubpdf',
  type: 'application/pdf',

  constructor: function () {
    this.useBlobForData = true
    this.dataBlob = null
    this.dataUrl = null
    this.objUrl = null
    this.data = null
    this.callParent(arguments)
  },

  getElConfig: function () {
    var
      config = this.callParent()

    var obj

    config.cn = [obj = {
      tag: 'div'
    }]

    obj.width = this.width
    obj.height = this.height

    return config
  },

  afterRender: function () {
    var me = this
    me.callParent(arguments)
    if (me.data) {
      me.afterSetUrl()
    }
  },

  useBlobForData: true,

  getDataBlob: function () {
    var me = this
    if (!me.useBlobForData) {
      Ext.Error.raise('object does not use Blob')
    }
    return me.dataBlob
  },

  updateDataBlob: function (inBlob) {
    if (!this.useBlobForData) {
      Ext.Error.raise('object does not use Blob')
    }
    if (this.dataBlob && !Ext.isEmpty(this.objUrl)) {
      window.URL.revokeObjectURL(this.objUrl)
    }
    this.data = null
    this.dataBlob = inBlob
    this.objUrl = window.URL.createObjectURL(inBlob)
    let viewerCfg = UB.connection.appConfig.uiSettings.adminUI.pdfViewer
    let urlSuffix = (viewerCfg && viewerCfg.uriSuffix) || '#view=Fit'
    this.data = this.objUrl + urlSuffix
  },

  onDestroy: function () {
    var me = this
    me.dataBlob = null
    me.data = null
    if (me.useBlobForData && !Ext.isEmpty(me.objUrl)) {
      window.URL.revokeObjectURL(me.objUrl)
    }
    me.objUrl = null
    this.callParent()
  },

  updateDataUrl: function () {
    var oldUrl = this.data
    this.data = ''
    this.data = oldUrl
  },

  afterSetUrl: function () {
    var el; var me = this

    var obj = {
      tag: 'iframe',
      type: me.type,
      src: me.data,
      width: me.width,
      height: me.height
    }

    el = me.getEl()
    if (el) {
      el.setHTML('').appendChild(obj)
    }
  },

  /**
     *
     * @param {Object} cfg
     * @param {String} cfg.url
     * @param {String} cfg.contentType
     * @param {Blob} [cfg.blobData] (Optional) for loading data from exists blob
     * @return {Promise}
     */
  setSrc: function (cfg) {
    var
      me = this

    var data = cfg.url

    var blobData = cfg.blobData

    me.dataUrl = data
    /*
        if (me.forceMIME){ // insert parameter in the middle of url to keep session_signature in the end
            urlArr = me.dataUrl.split('&');
            elm = urlArr.pop();
            urlArr.push('forceMIME=' + encodeURIComponent(me.forceMIME), elm);
            me.dataUrl = urlArr.join('&');
        }
        */
    if (me.useBlobForData) {
      if (blobData) {
        me.updateDataBlob(blobData)
        me.afterSetUrl()
      } else {
        return $App.connection.get(me.dataUrl, { responseType: 'arraybuffer' })
          .then(function (response) {
            var pdfArray = response.data
            me.updateDataBlob(new Blob(
              [pdfArray],
              { type: 'application/pdf' }
            ))
            me.afterSetUrl()
          }).catch(function (reason) {
            if (reason.status !== 401) {
              if (cfg.onContentNotFound) {
                cfg.onContentNotFound()
              } else {
                UB.showErrorWindow('<span style="color: red">' + UB.i18n('documentNotFound') + '<span/>')
              }
            }
          }).then()
      }
    } else {
      me.data = me.dataUrl
      me.afterSetUrl()
    }
    return Promise.resolve(true)
  }

})
