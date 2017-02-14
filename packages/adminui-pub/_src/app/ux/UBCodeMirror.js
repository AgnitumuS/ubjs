/* global FileReader, CodeMirror, BOUNDLED_BY_WEBPACK */
/**
 * Thin wrapper around CodeMirror for JS editing.
 * @author UnityBase core team (pavel.mash) on 12.2016
 */
Ext.define('UB.ux.UBCodeMirror', {
  extend: 'Ext.Component',
  mixins: {
    field: 'Ext.form.field.Field'
  },
  alias: 'widget.ubcodemirror',
  border: 1,
  // html: '<textarea></textarea>',
  codeMirrorInstance: undefined,

  ensureCodemirrorLoaded: function () {
    window.BOUNDLED_BY_WEBPACK = false
    // while boundled by WebPack we add a `BOUNDLED_BY_WEBPACK: true` conition variable
    // using webpack.DefinePlugin, so conditions below will be replaced by if(false) and if (true)
    window.BOUNDLED_BY_WEBPACK = false
    if (BOUNDLED_BY_WEBPACK) {
      return System.import('./codemirror-async-all.js')
    }
    if (!BOUNDLED_BY_WEBPACK) {
      return System.import('@unitybase/adminui-pub/_src/app/ux/codemirror-async-all')
    }
  },

  getValue: function () {
    return this.codeMirrorInstance ? this.codeMirrorInstance.getValue() : undefined
  },

  setValue: function (value) {
    this.rawValue = value
    if (this.codeMirrorInstance) this.codeMirrorInstance.setValue(value)
  },

  /**
   * @param {Object} cfg
   * @param {Blob|File} [cfg.blobData]
   * @param {String} [cfg.rawValue]
   * @param {Boolean} [cfg.resetOriginalValue=false] Reset original value if true.
   * @param {Object} [cfg.params] The parameters necessary to obtain the document
   * @returns {Promise}
   */
  setSrc: function (cfg) {
    var me = this
    var blobData = cfg.blobData
    var resetOriginalValue = cfg.resetOriginalValue

    function onDataReady (response) {
      me.setValue(response)
      if (resetOriginalValue) {
        me.resetOriginalValue()
        me.fireEvent('setOriginalValue', response, me)
      }
      return response
    }

    if (blobData) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader()
        reader.addEventListener('loadend', function () {
          resolve(onDataReady(reader.result))
        })
        reader.addEventListener('error', function () {
          reject(onDataReady(reader.error))
        })
        reader.readAsText(blobData)
      })
    } else if (cfg.params) {
      return UB.core.UBService.getDocument(cfg.params)
        .then(function (response) {
          return onDataReady(response)
        })
    } else {
      return Promise.resolve(onDataReady(cfg.rawValue))
    }
  },

  initComponent: function () {
    this.callParent(arguments)
  },

  listeners: {
    render: function () {
      var myElm = this.getEl().dom
      var me = this

      this.ensureCodemirrorLoaded().then((CodeMirror) => {
        window.CodeMirror = CodeMirror
        this.codeMirrorInstance = CodeMirror(myElm, {
          mode: 'javascript',
          value: this.rawValue || '',
          // theme: theme,
          lineNumbers: true,
          readOnly: false,
          highlightSelectionMatches: {annotateScrollbar: true},
          matchBrackets: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
          extraKeys: { 'Ctrl-Space': 'autocomplete' }
        })
        this.codeMirrorInstance.on('change', function () {
          me.checkChange()
        })
      })
    }
  }
})
