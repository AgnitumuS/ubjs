<template>
  <div class="ub-code-mirror">
    <textarea ref="textarea" />
  </div>
</template>

<script>
const { debounce } = require('throttle-debounce')

module.exports = {
  name: 'UCodeMirror',
  props: {
    value: [String, Object],
    /** true in case binded value is Object (parsed JSON) */
    valueIsJson: {
      type: Boolean,
      default: false
    },
    /** CodeMirror editor mode */
    editorMode: {
      type: String,
      default: 'javascript'
    }
  },
  data () {
    return {
      textValue: this.value && typeof this.value === 'object' ? JSON.stringify(this.value, null, 2) : this.value
    }
  },
  mounted () {
    // do not put _codeMirror inside data to prevent it observation
    // Vue initialize reactivity BEFORE created(), so all NEW object properties assigned here is not reactive
    // eslint-disable-next-line no-undef
    SystemJS.import('@unitybase/codemirror-full').then((CodeMirror) => {
      this._codeMirror = CodeMirror.fromTextArea(this.$refs.textarea, {
        mode: this.mode,
        lineNumbers: true,
        lint: Object.assign({asi: true, esversion: 6}, this.$UB.connection.appConfig.uiSettings.adminUI.linter),
        readOnly: false,
        tabSize: 2,
        highlightSelectionMatches: {annotateScrollbar: true},
        matchBrackets: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
        extraKeys: {
          'Ctrl-Space': 'autocomplete'
        }
      })
      this._codeMirror.on('change', debounce(300, cmInstance => {
        try {
          let newValFromCm = cmInstance.getValue()
          if (newValFromCm !== this.textValue) {
            this.textValue = newValFromCm
            let val = this.valueIsJson ? JSON.parse(this.textValue) : this.textValue
            this.$emit('changed', val)
            this.$emit('input', val)
          }
        } catch (e) {}
      }))
    })
  },
  watch: {
    value (newVal) {
      if (!this._codeMirror) return
      let newValAsText = typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : newVal
      if (newValAsText !== this.textValue) {
        this.textValue = newValAsText
        this._codeMirror.setValue(newValAsText)
      }
    },
    editorMode (newVal) {
      if (!this._codeMirror) return
      if (newVal !== this._codeMirror.getOption('mode')) {
        this._codeMirror.setOption('mode', newVal)
      }
    }
  }

}
</script>

<style>
.ub-code-mirror .CodeMirror{
  border-top: 1px solid rgba(var(--info), 0.3);
  border-bottom: 1px solid rgba(var(--info), 0.3);
}
</style>
