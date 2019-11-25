<template>
  <div :style="previewMode && previewSizeCss">
    <u-file-input
      v-if="!value"
      :disabled="disabled"
      :layout="previewMode ? 'horizontal' : 'vertical'"
      @upload="upload"
    />
    <template v-else>
      <div
        v-if="previewMode"
        class="u-file-preview__frame"
        @click.prevent
      >
        <div
          v-show="!disabled"
          class="u-file-preview__frame-close el-icon-close"
          @click="$emit('input', '')"
        />
        <iframe
          v-if="file.ct === 'application/pdf'"
          frameborder="0"
          :width="previewSizeCss.width"
          :height="previewSizeCss.height"
          :src="previewUrl"
        />
        <img
          v-else-if="file.ct === 'image/png' || file.ct === 'image/jpeg'"
          :src="previewUrl"
          :alt="file.name"
        >
        <el-button
          v-else
          type="primary"
          icon="el-icon-download"
          @click="saveAs"
        >
          {{ file.fName | cropFileName }} ({{ file.size | formatBytes }})
        </el-button>
      </div>
      <div
        v-else
        class="u-file"
        @click.prevent
      >
        <button
          class="u-file__button el-icon-view"
          :disabled="!previewFormats.includes(file.ct)"
          @click="previewDialog"
        />
        <button
          class="u-file__button el-icon-download"
          @click="saveAs"
        />
        <button
          class="u-file__button el-icon-delete"
          :disabled="disabled"
          @click="remove"
        />

        <div class="u-file__label">
          {{ file.fName }}
        </div>
        <div class="u-file__size">
          ({{ file.size | formatBytes }})
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const formatterMixin = require('./formatterMixin.js')
const previewDialog = require('./previewDialog')

/**
 * Component for fields with type Document.
 * Can download file or if extension is pdf or image - can show content in dialog.
 * In preview mode will be shows preview immediately.
 */
export default {
  name: 'UFile',
  filters: {
    cropFileName (fileName) {
      if (fileName.length > 20) {
        return fileName.substr(0, 9) + '...' + fileName.substr(-8)
      } else {
        return fileName
      }
    }
  },

  mixins: [formatterMixin],

  inject: {
    providedEntity: 'entity'
  },

  props: {
    /**
     * @model
     */
    value: {
      required: true
    },

    /**
     * The name of entity that stores file
     */
    entityName: {
      type: String,
      default () {
        return this.providedEntity
      }
    },

    /**
     * The name of attribute that stores file in target entity
     */
    attributeName: {
      type: String,
      required: true
    },

    /**
     * ID of record that stores file
     */
    recordId: {
      type: Number,
      default () {
        return this.$store.state.data.ID
      }
    },

    /**
     * Toggle preview mode, do not confuse with preview dialog.
     * Loaded file will shows content immediately if it's PDF or PNG or JPG format.
     * If passed true will sets default values for width="100%" and height="auto".
     * Passed object can overrides default width or height.
     */
    previewMode: {
      type: [Boolean, Object],
      width: {
        type: [String, Number]
      },
      height: {
        type: [String, Number]
      }
    },

    /**
     * Disable to remove or upload file
     */
    disabled: Boolean
  },

  data () {
    return {
      previewUrl: '',
      previewFormats: [
        'application/pdf',
        'image/png',
        'image/jpeg'
      ]
    }
  },

  computed: {
    file () {
      if (this.value) {
        return JSON.parse(this.value)
      } else {
        return null
      }
    },

    /**
     * Sets size values if unset in config
     */
    previewSize () {
      const defaults = {
        width: '100%',
        height: 'auto'
      }
      if (this.previewMode === true) {
        return Object.assign({}, defaults)
      } else {
        return Object.assign({}, defaults, this.previewMode)
      }
    },

    /**
     * Transform number size values to string
     */
    previewSizeCss () {
      return ['width', 'height'].reduce((style, property) => {
        const value = this.previewSize[property]
        style[property] = typeof value === 'number'
          ? value + 'px'
          : value
        return style
      }, {})
    }
  },

  watch: {
    value: {
      immediate: true,
      handler () {
        if (this.value && this.previewMode) {
          this.loadPreview()
        }
      }
    }
  },

  methods: {
    async upload (binaryFiles) {
      const file = binaryFiles[0]
      const response = await this.$UB.connection.post('setDocument', binaryFiles[0], {
        params: {
          entity: this.entityName,
          attribute: this.attributeName,
          origName: file.name,
          filename: file.name,
          id: this.recordId
        },
        headers: { 'Content-Type': 'application/octet-stream' }
      })
      this.$emit('input', JSON.stringify(response.data.result))
    },

    remove () {
      this.$emit('input', null)
    },

    previewDialog () {
      previewDialog({
        entity: this.entityName,
        attribute: this.attributeName,
        id: this.recordId,
        isDirty: this.file.isDirty,
        ct: this.file.ct,
        origName: this.file.origName
      })
    },

    loadFile () {
      return this.$UB.connection.getDocument({
        entity: this.entityName,
        attribute: this.attributeName,
        id: this.recordId,
        isDirty: this.file.isDirty
      }, { resultIsBinary: true })
    },

    async saveAs () {
      const binaryFile = await this.loadFile()
      window.saveAs(new Blob([binaryFile]), this.file.fName)
    },

    async loadPreview () {
      if (this.previewUrl) {
        window.URL.revokeObjectURL(this.previewUrl)
      }
      if (this.previewFormats.includes(this.file.ct)) {
        const binaryFile = await this.loadFile()

        this.previewUrl = window.URL.createObjectURL(new Blob([binaryFile], { type: this.file.ct }))
      }
    }
  }
}
</script>

<style>
  .u-file{
    display: flex;
    border: 1px solid rgba(var(--info), 0.3);
    border-radius: 4px;
    align-items: center;
    height: 40px;
    padding-right: 10px;
  }

  .u-file__button{
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--secondary), 0.9);
    cursor: pointer;
    background: none;
    border: none;
    height: 100%;
    position: relative;
    margin-left: 10px;
  }

  .u-file__button:disabled{
    color: rgba(var(--info), 0.2);
    cursor: not-allowed;
  }

  .u-file__button:after{
    content: '';
    position: absolute;
    left: -5px;
    top: calc(50% - 8px);
    width: 1px;
    height: 16px;
    background: rgba(var(--info), 0.3);
  }

  .u-file__button:first-child:after{
    content: none;
  }

  .u-file__label{
    font-weight: 600;
    margin-left: 10px;
  }

  .u-file__size{
    color: rgba(var(--info), 0.7);
    margin-left: 5px;
  }

  .u-file-preview__frame{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border: 1px solid rgba(var(--info), 0.3);
    border-radius: 4px;
    min-height: 100px;
  }

  .u-file-preview__frame img {
    max-width: 100%;
    max-height: 100%;
  }

  .u-file-preview__frame-close{
    position: absolute;
    width: 40px;
    height: 40px;
    background: white;
    border: 1px solid rgba(var(--info), 0.3);
    color: rgb(var(--info));
    border-radius: 100px;
    top: 10px;
    right: 10px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .u-file__preview-dialog .el-dialog__body{
    padding: 0;
    height: 65vh;
  }
</style>

<docs>
  ### Basic usage
  ```vue
  <template>
    <u-file
      v-model="file"
      attribute-name="file"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: {
        ...mapInstanceFields(['file'])
      }
    }
  </script>
  ```

  ### Preview mode
  ```vue
  <template>
    <u-file
      v-model="file"
      attribute-name="file"
      preview-mode
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: {
        ...mapInstanceFields(['file'])
      }
    }
  </script>
  ```

  ### Preview mode config
  ```vue
  <template>
    <u-file
      v-model="file"
      attribute-name="file"
      :preview-mode="{
        height: 400
      }"
    />
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: {
        ...mapInstanceFields(['file'])
      }
    }
  </script>
  ```
</docs>
