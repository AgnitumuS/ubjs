<template>
  <label
    class="u-file__dropzone"
    :class="{
      hover: dragging,
      disabled,
      'u-file__dropzone-border': border
    }"
    @dragleave.prevent.stop="dragging = false"
    @dragend.prevent.stop="dragging = false"
    @dragenter="dragover"
    @dragover="dragover"
    @drop.stop.prevent="drop"
  >
    <u-icon
      icon="u-icon-cloud-alt"
      color="control"
      size="large"
      class="u-file__dropzone-icon"
    />
    <div v-if="value.length">
      {{ $ut(selectedPlaceholder) }}: {{ selectedFileNames }}
    </div>
    <div
      v-else
      class="u-file__dropzone-placeholder"
    >
      {{ $ut(placeholder) }}
      <div v-if="accept">
        ({{ accept }})
      </div>
    </div>
    <input
      type="file"
      :disabled="disabled"
      :multiple="multiple"
      :accept="accept"
      v-bind="$attrs"
      @change="fileInputChanged"
    >
  </label>
</template>

<script>
/**
 * Input file with drag and drop
 */
export default {
  name: 'UFileInput',

  props: {
    /**
     * Allow to select multiple files. Like native attribute `multiple` in input[type=file]
     */
    multiple: Boolean,
    /**
     * Dropzone in non-selected state placeholder
     */
    placeholder: {
      type: String,
      default: 'fileInput.dropZone.caption'
    },
    /**
     * Dropzone in selected state placeholder
     */
    selectedPlaceholder: {
      type: String,
      default: 'fileInput.dropZone.selectedFiles'
    },
    /**
     * Sets disabled state
     */
    disabled: Boolean,
    /**
     * File types the file input should accept. This string is a comma-separated list of unique file type specifiers.
     * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     *
     * Example: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
     */
    accept: {
      type: String,
      default: ''
    },

    /**
     * Show border
     */
    border: {
      type: Boolean,
      default: true
    },

    value: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      dragging: false
    }
  },

  computed: {
    acceptableFileTypes: function () {
      return this.accept.split(',').map(a => a.trim())
    },
    selectedFileNames: function () {
      return this.value.map(f => f.name).join(', ')
    }
  },

  methods: {
    fileInputChanged (e) {
      this.upload(e.target.files)
      e.target.value = null
    },

    drop (e) {
      this.dragging = false
      if (this.disabled) return

      this.upload(e.dataTransfer.files)
    },

    upload (files) {
      const { valid, invalid } = this.validateFiles(files)

      if (valid.length) {
        this.$emit('input', valid)
      }

      if (invalid.length) {
        const invalidFilesNames = invalid.map(f => f.name).join(', ')
        this.$notify({
          type: 'error',
          message: `${this.$ut('fileInput.dropZone.acceptError')}: ${invalidFilesNames}`,
          duration: 0
        })
      }
    },

    validateFiles (files) {
      const valid = []
      const invalid = []
      for (const file of Array.from(files)) {
        if (this.isAcceptable(file)) {
          valid.push(file)
        } else {
          invalid.push(file)
        }
      }

      return { valid, invalid }
    },

    dragover (e) {
      if (this.disabled) return false
      e.preventDefault()
      e.stopPropagation()
      this.dragging = true
    },

    isAcceptable (file) {
      if (this.accept === '') {
        return true
      }
      return this.acceptableFileTypes.some(ft => {
        // file type specifier can be either extension or mime
        return file.name.endsWith(ft) || file.type.includes(ft)
      })
    }
  }
}
</script>

<style>
  .u-file__dropzone input {
    display: none;
  }

  .u-file__dropzone {
    padding: 20px 12px;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
    height: 100%;
    width: 100%;
  }

  .u-file__dropzone-placeholder {
    color: hsl(var(--hs-text), var(--l-text-description));
  }

  .u-file__dropzone-border{
    border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  }

  .u-file__dropzone-icon {
    margin-bottom: 4px;
  }

  .u-file__dropzone:active:not(.disabled),
  .u-file__dropzone.hover:not(.disabled) {
    border-color: hsl(var(--hs-primary), var(--l-input-border-hover));
    color: hsl(var(--hs-primary), var(--l-text-label));
    background: hsl(var(--hs-primary), var(--l-background-default));
  }

  .u-file__dropzone.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

<docs>
  When multiple is false will be emits upload just with one file.

  ```vue
  <template>
    <div>
      <el-button @click="disabled = !disabled">Toggle "disabled"</el-button>
      <el-button @click="multiple = !multiple">Toggle "multiple"</el-button>
      <pre>
        disabled: {{disabled}}
        multiple: {{multiple}}
      </pre>
      <u-file-input
          :disabled="disabled"
          :multiple="multiple"
          @input="upload"
      />
      Accept only PDF and txt and bind to model selectedFiles property:
      <u-file-input
          :disabled="disabled"
          :multiple="multiple"
          placeholder="Select file for import"
          selected-placeholder="Will import"
          accept=".pdf,.txt"
          v-model="selectedFiles"
      />
      <u-button @click="doImport" :disabled="!selectedFiles.length">Import</u-button>
      <div>
        {{selectedFiles.length}} files selected
      </div>
    </div>
  </template>
  <script>
    export default {
      data () {
        return {
          disabled: false,
          multiple: true,
          selectedFiles: []
        }
      },
      methods: {
        upload (files) {
          console.log(files)
        },
        doImport () {
          const fileNames = selectedFiles.map(f => f.name).join(', ')
          this.$dialogYesNo(`Import ${fileNames} into database?`)
        }
      }
    }
  </script>
  ```
</docs>
