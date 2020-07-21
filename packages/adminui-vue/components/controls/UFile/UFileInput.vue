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
    {{ $ut('fileInput.dropZone.caption') }}
    <input
      type="file"
      :disabled="disabled"
      :multiple="multiple"
      :accept="accept"
      v-bind="$attrs"
      @change="fileChanged"
    >
  </label>
</template>

<script>
/**
 * Input file with drag and drop, but without display value - just upload
 */
export default {
  name: 'UFileInput',

  props: {
    /**
     * Like native attribute multiple in input[type=file].
     */
    multiple: Boolean,

    /**
     * Sets disabled state
     */
    disabled: Boolean,

    /**
     * File extensions to bind into `accept` input property
     */
    accept: {
      type: String,
      default: ''
    },

    /**
     * Display border
     */
    border: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      dragging: false
    }
  },

  methods: {
    fileChanged (e) {
      const files = e.target.files
      if (files && files.length) {
        this.$emit('upload', [...files])
        e.target.value = null
      }
    },

    drop (e) {
      this.dragging = false
      if (this.disabled) return

      const { valid, invalid } = [...e.dataTransfer.files].reduce((files, file) => {
        const isValid = this.isAccept(file)
        if (isValid) {
          files.valid.push(file)
        } else {
          files.invalid.push(file)
        }
        return files
      }, {
        valid: [],
        invalid: []
      })

      this.$emit('upload', valid)

      if (invalid.length) {
        const invalidFilesNames = invalid.map(f => f.name).join(', ')
        this.$notify({
          type: 'error',
          message: `${this.$ut('fileInput.dropZone.acceptError')}: ${invalidFilesNames}`,
          duration: 0
        })
      }
    },

    dragover (e) {
      if (this.disabled) {
        return false
      } else {
        e.preventDefault()
        e.stopPropagation()
        this.dragging = true
      }
    },

    isAccept (file) {
      if (this.accept === '') {
        return true
      }
      const accepts = this.accept.split(',')
        .map(a => a.trim())
      return accepts.some(accept => {
        const [type, extension] = accept.split(/\/|\./)
        if (type === '') {
          const fileExtention = file.name.split('.').pop()
          return fileExtention.includes(extension)
        } else {
          if (extension === '*') {
            return file.type.includes(type)
          } else {
            return file.type === accept
          }
        }
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
    color: hsl(var(--hs-text), var(--l-text-description));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
    height: 100%;
    width: 100%;
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
      <el-button @click="previewMode = !previewMode">Toggle "previewMode"</el-button>
      <el-button @click="disabled = !disabled">Toggle "disabled"</el-button>
      <el-button @click="multiple = !multiple">Toggle "multiple"</el-button>
      <pre>
        previewMode: {{previewMode}}
        disabled: {{disabled}}
        multiple: {{multiple}}
      </pre>
      <u-file-input
          :disabled="disabled"
          :multiple="multiple"
          @upload="upload"
      />
    </div>
  </template>
  <script>
    export default {
      data () {
        return {
          disabled: false,
          previewMode: false,
          multiple: true
        }
      },
      methods: {
        upload (files) {
          console.log(files)
        }
      }
    }
  </script>
  ```
</docs>
