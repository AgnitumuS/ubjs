<template>
  <div class="ub-code-mirror">
    <el-tooltip
      :enterable="false"
      placement="left"
    >
      <template slot="content">
        <h5>Helpers</h5>
        <ul>
          <li>Ctrl+Q - code templates</li>
          <li>Ctrl+Space - code competition</li>
          <li>Ctrl+B - Beautify content</li>
        </ul>
        <h5>Search</h5>
        <ul>
          <li>Ctrl-F  - Start searching</li>
          <li>Ctrl-G  - Find next</li>
          <li>Shift-Ctrl-G - Find previous</li>
          <li>Shift-Ctrl-F - Replace</li>
          <li>Shift-Ctrl-R - Replace all</li>
          <li>Alt-F - Persistent search (dialog does not autoclose, enter to find next, Shift-Enter to find previous)</li>
          <li>Alt-G - Jump to line</li>
        </ul>
        <h5>Edit</h5>
        <ul>
          <li>Ctrl-A - Select the whole content of the editor</li>
          <li>Ctrl-D - Deletes the whole line under the cursor</li>
          <li>Ctrl-Z - Undo the last change</li>
          <li>Ctrl-Y - Redo the last undone change</li>
          <li>Ctrl-U - Undo the last change to the selection</li>
          <li>Alt-Left / Alt-Right - Move the cursor to the start/end  of the line</li>
          <li>Tab / Shift + Tab - If something is selected, indent/dedent it</li>
        </ul>
      </template>
      <i class="el-icon-question ub-code-mirror__help" />
    </el-tooltip>
    <textarea ref="textarea" />
  </div>
</template>

<script>
/* global SystemJS */
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
      default: 'application/x-javascript'
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
        mode: this.editorMode,
        lineNumbers: true,
        lint: Object.assign({ asi: true, esversion: 6 }, this.$UB.connection.appConfig.uiSettings.adminUI.linter),
        readOnly: false,
        tabSize: 2,
        highlightSelectionMatches: { annotateScrollbar: true },
        matchBrackets: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-Q': this.showTemplates,
          'Ctrl-B': this.doBeautify
        }
      })
      this._codeMirror.setValue(this.value || '')
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
      this.$emit('loaded')
    })
  },

  computed: {
    editorInstance: {
      get: function () {
        return this._codeMirror
      }
    }
  },

  watch: {
    value: 'updateValue',

    editorMode (newVal) {
      if (!this._codeMirror) return
      if (newVal !== this._codeMirror.getOption('mode')) {
        this._codeMirror.setOption('mode', newVal)
      }
    }
  },

  methods: {
    updateValue (newVal) {
      if (!this._codeMirror) return
      let newValAsText = typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : newVal
      if (newValAsText !== this.textValue) {
        this.textValue = newValAsText
        this._codeMirror.setValue(newValAsText)
      }
    },

    async doBeautify () {
      if (this.value) {
        const beautify = await SystemJS.import('js-beautify/js/lib/beautify')
        const text = this._codeMirror.getValue()
        const formatted = beautify.js_beautify(text, {
          'indent_size': 2,
          'indent_char': ' '
        })
        this._codeMirror.setValue(formatted)
      }
    },

    showTemplates () {
      this._codeMirror.showHint({
        hint: () => {
          return {
            list: [{
              displayText: 'showList',
              text: JSON.stringify({
                'cmdType': 'showList',
                'cmdData': {
                  'params': [{
                    'entity': 'TYPE-ENTITY-CODE',
                    'method': 'select',
                    'fieldList': ['Dbl-CLICK on left prop panel to add attribute']
                  }]
                }
              }, null, '  ')
            }, {
              displayText: 'showForm',
              text: JSON.stringify({
                'cmdType': 'showForm',
                'formCode': 'TYPE HERE A FORM CODE FROM UBM_FORM or remove this line to use a default form for entity',
                'entity': 'TYPE HERE A ENTITY CODE',
                'instanceID': 'REPLACE IT by ID value (to edit element) or remove this line'
              }, null, '  ')
            }, {
              displayText: 'showReport',
              text: JSON.stringify({
                cmdType: 'showReport',
                description: 'OPTIONAL report form caption',
                cmdData: {
                  reportCode: 'type here report code',
                  reportType: 'html or pdf',
                  reportParams: { // if passed report viewer will skip showing parameters enter form to user
                    paramName: 'param value'
                  }
                }
              }, null, '  ')
            }],
            from: this._codeMirror.getCursor(),
            to: this._codeMirror.getCursor()
          }
        }
      })
    }
  }
}
</script>

<style>
.CodeMirror-hints{
  z-index: 400000 !important
}

.ub-code-mirror .CodeMirror{
  border-top: 1px solid rgba(var(--info), 0.3);
  border-bottom: 1px solid rgba(var(--info), 0.3);
}

.ub-code-mirror__help{
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  font-size: 30px;
}
</style>
