/* global FileReader, CodeMirror */
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
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
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
        .then((response) => onDataReady(response))
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

      // patch default CodeMirror style
      var css = Ext.util.CSS.getRule('.CodeMirror')
      if (css) css.style.height = '100%'
      // var css = Ext.util.CSS.getRule('.CodeMirror-Scroll');
      // if(css){
      //     css.style.height = '100%';
      // }

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
      this.codeMirrorInstance.on('change', function (editor, tc) {
        me.checkChange()
      })
    }
  }
})
