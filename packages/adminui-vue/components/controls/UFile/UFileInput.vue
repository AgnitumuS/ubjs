<template>
  <label
    class="u-file__dropzone"
    :class="{
      hover: dragging,
      disabled,
      'u-file__dropzone__horizontal': layout === 'horizontal'
    }"
    @dragleave.prevent.stop="dragging = false"
    @dragend.prevent.stop="dragging = false"
    @dragenter="dragover"
    @dragover="dragover"
    @drop.stop.prevent="drop"
  >
    <i class="u-file__dropzone__plus-icon el-icon-plus" />
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
     * In horizontal layout mode input will be fill full parent height.
     * Can be 'horizontal' or 'vertical'.
     */
    layout: {
      type: String,
      default: 'vertical'
    },

    /**
     * Set's disabled state
     */
    disabled: Boolean,

    /**
     * File extensions to bind into `accept` input property
     */
    accept: {
      type: String,
      default: ''
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
  .u-file__dropzone input{
    display: none;
  }

  .u-file__dropzone{
    padding: 10px;
    border: 1px dashed rgb(var(--input-border));
    border-radius: 4px;
    color: rgb(var(--info));
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
  }

  .u-file__dropzone:active:not(.disabled),
  .u-file__dropzone.hover:not(.disabled){
    border-color: rgba(var(--primary), 0.3);
    color: rgb(var(--primary));
    background: rgba(var(--primary), 0.03);
  }

  .u-file__dropzone.disabled{
    opacity: 0.5;
    cursor: not-allowed;
  }

  .u-file__dropzone__plus-icon{
    font-size: 18px;
    margin-right: 10px;
    padding-right: 10px;
    border-right: 1px solid rgba(var(--info), 0.3);
  }

  .u-file__dropzone__horizontal{
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  .u-file__dropzone__horizontal .u-file__dropzone__plus-icon{
    margin: 0;
    padding: 0;
    border: none;
    margin-bottom: 10px;
    font-size: 30px;
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
        :layout="previewMode ? 'horizontal' : 'vertical'"
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
