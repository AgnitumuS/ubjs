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
    {{ $ut('fileInput.dropZoneCaption') }}
    <input
      type="file"
      :disabled="disabled"
      :multiple="multiple"
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
    disabled: Boolean
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
      const files = e.dataTransfer.files
      if (files && files.length) {
        if (this.multiple) {
          this.$emit('upload', [...files])
        } else {
          this.$emit('upload', [files[0]])
        }

        e.target.value = null
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
  border: 1px dashed rgba(var(--info), 0.3);
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
