<template>
    <div class="ub-code-mirror">
        <el-input :id="_uid" type="textarea" v-model="currentValue"></el-input>
    </div>
</template>

<script>
  module.exports = {
    name: 'UbCodeMirror',
    props: {
      value: [String, Object]
    },
    data () {
      return {
        currentValue: this.value && typeof this.value === 'object' ? JSON.stringify(this.value, null, 2) : this.value,
        codeMirror: null
      }
    },
    mounted () {
      if (!this.codeMirror) {
        SystemJS.import('@unitybase/codemirror-full').then((CodeMirror) => {
          if (CodeMirror) {
            var el = document.getElementById(this._uid)
            if (el) {
              this.codeMirror = CodeMirror.fromTextArea(el, {
                mode: 'javascript',
                lineNumbers: true,
                lint: Object.assign({asi: true, esversion: 6}, $App.connection.appConfig.uiSettings.adminUI.linter),
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
              this.codeMirror.on('change', function (cmInstance) {
                let value, valid = true
                try {
                  value = typeof this.value === 'object' ? JSON.parse(cmInstance.getValue()) : cmInstance.getValue()
                } catch (e) {
                  valid = false
                }
                if (valid) this.$emit('input', value)
              }.bind(this))
            }
          }
        }, this)
      }
    }
  }
</script>

<style>
    .ub-code-mirror {
        line-height: 15px;
    }
</style>