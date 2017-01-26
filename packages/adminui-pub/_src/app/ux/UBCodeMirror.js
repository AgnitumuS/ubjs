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

  ensureCodemirrorLoaded: function () {
    return new Promise((resolve, reject) => {
      window.BOUNDLED_BY_WEBPACK = false
      // while boundled by WebPack we add a `BOUNDLED_BY_WEBPACK: true` conition variable
      // using webpack.DefinePlugin, so conditions below will be replaced by if(false) and if (true)
      if (!BOUNDLED_BY_WEBPACK) {
        window.CodeMirror = require('codemirror/lib/codemirror')
        require('codemirror/lib/codemirror.css')
        require('codemirror/addon/edit/matchbrackets')
        require('codemirror/addon/edit/closebrackets')
        require('codemirror/addon/edit/trailingspace')
        require('codemirror/addon/fold/foldcode')
        require('codemirror/addon/fold/foldgutter')
        require('codemirror/addon/fold/foldgutter.css')
        require('codemirror/addon/fold/brace-fold')
        require('codemirror/addon/fold/xml-fold')
        require('codemirror/addon/fold/comment-fold')
        require('codemirror/addon/dialog/dialog')
        require('codemirror/addon/dialog/dialog.css')
        require('codemirror/mode/javascript/javascript')
        require('codemirror/addon/hint/show-hint')
        require('codemirror/addon/hint/show-hint.css')
        require('codemirror/addon/hint/javascript-hint')
        require('codemirror/addon/search/search')
        require('codemirror/addon/search/searchcursor')
        require('codemirror/addon/scroll/annotatescrollbar')
        require('codemirror/addon/search/matchesonscrollbar')
        require('codemirror/addon/search/match-highlighter')
        require('../../css/CodeMirror-match.css')
        require('codemirror/addon/comment/comment')
        resolve(true)
      }

      if (BOUNDLED_BY_WEBPACK) require.ensure(['codemirror/lib/codemirror', 'codemirror/lib/codemirror.css'], function () {
        var re = require
        if (BOUNDLED_BY_WEBPACK) {
          window.CodeMirror = re('codemirror/lib/codemirror')
          re('codemirror/lib/codemirror.css')
          re('codemirror/addon/edit/matchbrackets')
          re('codemirror/addon/edit/closebrackets')
          re('codemirror/addon/edit/trailingspace')
          re('codemirror/addon/fold/foldcode')
          re('codemirror/addon/fold/foldgutter')
          re('codemirror/addon/fold/foldgutter.css')
          re('codemirror/addon/fold/brace-fold')
          re('codemirror/addon/fold/xml-fold')
          re('codemirror/addon/fold/comment-fold')
          re('codemirror/addon/dialog/dialog')
          re('codemirror/addon/dialog/dialog.css')
          re('codemirror/mode/javascript/javascript')
          re('codemirror/addon/hint/show-hint')
          re('codemirror/addon/hint/show-hint.css')
          re('codemirror/addon/hint/javascript-hint')
          re('codemirror/addon/search/search')
          re('codemirror/addon/search/searchcursor')
          re('codemirror/addon/scroll/annotatescrollbar')
          re('codemirror/addon/search/matchesonscrollbar')
          re('codemirror/addon/search/match-highlighter')
          re('../../css/CodeMirror-match.css')
          re('codemirror/addon/comment/comment')
        }
        resolve(true)
      })
    })
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
        .then(function(response) {
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

      // patch default CodeMirror style
      var css = Ext.util.CSS.getRule('.CodeMirror')
      if (css) css.style.height = '100%'

      this.ensureCodemirrorLoaded().then(() => {
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
      })

    }
  }
})
