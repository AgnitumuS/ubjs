<template>
  <div class="ub-code-mirror">
    <i class="u-icon-circle-question ub-code-mirror__help" :title="tips"></i>
    <textarea ref="textarea"/>
  </div>
</template>

<script>
/* global SystemJS */
const { debounce } = require('throttle-debounce')

/**
 * Wrapper around a [CodeMirror](https://codemirror.net/) editor.
 * Editor itself is loaded in async mode form `@unitybase/codemirror-full` package.
 */
export default {
  name: 'UCodeMirror',

  props: {
    value: {
      type: [String, Object, Array],
      default: null
    },

    /** set it to `true` in case binds value is an Object (parsed JSON) */
    valueIsJson: {
      type: Boolean,
      default: false
    },

    /**
     * CodeMirror editor mode
     * @values application/javascript, application/json, text/yaml, script/x-vue, text/x-sql
     */
    editorMode: {
      type: String,
      default: 'application/x-javascript'
    },

    /**  Allows to run CodeMirror in readonly mode */
    readonly: {
      type: Boolean,
      default: false
    },

    /**  Any additional properties to pass to CodeMirror control, see https://codemirror.net/doc/manual.html#config */
    options: {
      type: Object
    },

    /**
     * Optional function what return a hints. See hint/show-hint.js section in https://codemirror.net/doc/manual.html#addons
     * Called with one parameter - codeMirror instance
     */
    hintsFunction: {
      type: Function,
      default: null
    }
  },

  data () {
    return {
      textValue: this.value && typeof this.value === 'object' ? JSON.stringify(this.value, null, 2) : this.value
    }
  },

  computed: {
    // for external use and compatibility
    editorInstance () {
      return this._codeMirror
    },
    tips () {
      return `Helpers:
  - Ctrl+Q: code templates
  - Ctrl+Space: code competition
  - Ctrl+B: Beautify content

Search:
  - Ctrl+F: Start searching
  - Ctrl+G: Find next
  - Shift-Ctrl+G: Find previous
  - Shift-Ctrl+F: Replace
  - Shift-Ctrl+R: Replace all
  - Alt+F: Persistent search (dialog does not auto-close, enter to find next, Shift-Enter to find previous)
  - Alt+G: Jump to line

Edit:
  - Ctrl+A: Select the whole content of the editor
  - Ctrl+D: Deletes the whole line under the cursor
  - Ctrl+Z: Undo the last change
  - Ctrl+Y: Redo the last undone change
  - Ctrl+U: Undo the last change to the selection
  - Alt-Left / Alt-Right: Move the cursor to the start/end of the line
  - Tab / Shift + Tab: indent/dedent selected text`
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

  mounted () {
    const defaultOptions = {
      lineNumbers: true,
      tabSize: 2,
      highlightSelectionMatches: {
        annotateScrollbar: true
      },
      matchBrackets: true,
      foldGutter: true,
      gutters: [
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
        'CodeMirror-lint-markers'
      ]
    }

    // do not put _codeMirror inside data to prevent it observation
    // Vue initialize reactivity BEFORE created(), so all NEW object properties assigned here is not reactive
    let codeMirrorPromise
    if (BOUNDLED_BY_WEBPACK) {
      codeMirrorPromise = import('@unitybase/codemirror-full').then(cmModule => cmModule.default)
    } else {
      codeMirrorPromise = SystemJS.import('@unitybase/codemirror-full')
    }
    codeMirrorPromise.then((CodeMirror) => {
      this._codeMirror = CodeMirror.fromTextArea(
        this.$refs.textarea,
        {
          ...defaultOptions,
          mode: this.editorMode,
          lint: Object.assign(
            {
              asi: true,
              esversion: 8
            },
            this.$UB.connection ? this.$UB.connection.appConfig.uiSettings.adminUI.linter : {}
          ),
          readOnly: this.readonly,
          extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Ctrl-Q': this.showTemplates,
            'Ctrl-B': this.doBeautify
          },
          ...this.options
        })
      this._codeMirror.setValue(this.textValue || '')
      this._codeMirror.on('change', debounce(300, cmInstance => {
        const newValFromCm = cmInstance.getValue()
        if (newValFromCm !== this.textValue) {
          this.textValue = newValFromCm
          try {
            const val = this.valueIsJson ? JSON.parse(this.textValue) : this.textValue
            if (this.valueIsJson && typeof val !== 'object') return
            this.$emit('changed', val)
            this.$emit('input', val)
          } catch (e) {}
        }
      }))
      this.$emit('loaded')
    })
  },

  methods: {
    updateValue (newVal) {
      if (!this._codeMirror) return
      const newValAsText = (newVal && (typeof newVal === 'object'))
        ? JSON.stringify(newVal, null, 2)
        : newVal
      if (newValAsText !== this.textValue) {
        this.textValue = newValAsText
        this._codeMirror.setValue(newValAsText || '')
      }
    },

    async doBeautify () {
      if (this.value) {
        const beautify = await SystemJS.import('js-beautify/js/lib/beautify')
        const text = this._codeMirror.getValue()
        const formatted = beautify.js_beautify(text, {
          indent_size: 2,
          indent_char: ' '
        })
        this._codeMirror.setValue(formatted)
      }
    },

    showTemplates () {
      if (!this.hintsFunction) return
      this._codeMirror.showHint({
        hint: this.hintsFunction
      })
    }
  }
}
</script>

<style>
.CodeMirror-hints {
  z-index: 400000 !important
}

.ub-code-mirror .CodeMirror {
  border-top: 1px solid hsl(var(--hs-border), var(--l-input-border-default));
  border-bottom: 1px solid hsl(var(--hs-border), var(--l-input-border-default));
  min-height: 50px;
}

.ub-code-mirror__help {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  font-size: 1.5em;
  color: hsl(var(--hs-text), var(--l-text-description))
}
</style>
