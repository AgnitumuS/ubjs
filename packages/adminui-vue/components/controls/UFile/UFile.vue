<template>
  <u-file-container :style="previewSizeCss">
    <template #toolbar>
      <u-file-add-button v-if="hasButton('add')" />
      <u-file-webcam-button v-if="hasButton('webcam')" />
      <div
        v-if="hasButton('add') || hasButton('webcam')"
        class="u-divider"
      />
      <u-file-scan-button v-if="hasButton('scan')" />
      <u-file-scan-settings-button v-if="hasButton('scanSettings')" />
      <div
        v-if="hasButton('scan') || hasButton('scanSettings')"
        class="u-divider"
      />
      <u-file-download-button v-if="hasButton('download')" />
      <u-file-preview-button v-if="hasButton('preview')" />
      <u-file-fullscreen-button v-if="hasButton('fullscreen')" />
      <div
        v-if="hasButton('download') || hasButton('preview') || hasButton('fullscreen')"
        class="u-divider"
      />
      <u-file-remove-button v-if="hasButton('remove')" />

      <slot />
    </template>

    <template #view>
      <file-renderer
        v-if="value"
        :key="value"
        ref="renderer"
        :attribute-name="attributeName"
        :entity-name="entityName"
        :file="file"
        :file-id="recordId"
        :with-preview="!!previewMode"
      />
      <u-file-input
        v-else
        ref="input"
        :accept="accept"
        :disabled="disabled"
        :border="false"
        @upload="upload"
      />
    </template>
  </u-file-container>
</template>

<script>
const FileLoader = require('./helpers/FileLoader')

export default {
  name: 'UFile',

  components: {
    UFileContainer: require('./UFileContainer.vue').default,
    FileRenderer: require('./views/FileRenderer.vue').default
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
     * Loaded file will show content immediately if it's PDF or PNG or JPG format.
     * Will set default values for width="100%" and height="auto" if passed true.
     * Passed object can override default width or height.
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
     * Disable removing or uploading file
     */
    disabled: Boolean,

    /**
     * File extensions to bind into `accept` input property
     */
    accept: String,

    /**
     * Will remove all default buttons if passed true .
     * To exclude only a few use value as array
     *
     * @example :remove-default-buttons="['add', 'preview']"
     *
     * Buttons names:
     *  - add
     *  - webcam
     *  - scan
     *  - scanSettings
     *  - download
     *  - remove
     *  - fullscreen
     *  - preview
     */
    removeDefaultButtons: [Boolean, Array],

    /**
     * Hook which called before UB.setDocument.
     * Must contain async function or function which returns promise
     *
     * @param {object} params
     * @param {string} params.entity
     * @param {number} params.id
     * @param {string} params.attribute
     * @param {object} params.file
     */
    beforeSetDocument: {
      type: Function,
      default: () => Promise.resolve()
    }
  },

  provide () {
    return {
      fileComponentInstance: this
    }
  },

  inject: {
    providedEntity: 'entity'
  },

  computed: {
    file () {
      if (this.value) {
        return JSON.parse(this.value)
      } else {
        return null
      }
    },

    fileName () {
      const { origName, fName } = this.file
      return origName || fName
    },

    /**
     * Sets preview size if unset in config
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
    },

    availableButtons () {
      if (this.removeDefaultButtons === true) {
        return []
      }
      const buttonsByDefault = [
        'add',
        'webcam',
        'scan',
        'scanSettings',
        'download',
        'remove'
      ]

      if (this.previewMode) {
        buttonsByDefault.push('fullscreen')
      } else {
        buttonsByDefault.push('preview')
      }

      if (Array.isArray(this.removeDefaultButtons)) {
        return buttonsByDefault.filter(b => !this.removeDefaultButtons.includes(b))
      }

      return buttonsByDefault
    }
  },

  created () {
    this.fileLoader = new FileLoader(this.entityName, this.attributeName)
  },

  methods: {
    async upload (binaryFiles) {
      const file = binaryFiles[0]
      await this.beforeSetDocument({
        entity: this.entityName,
        attribute: this.attributeName,
        id: this.recordId,
        file
      })
      this.$emit(
        'input',
        await this.fileLoader.uploadFile(file, this.recordId)
      )
    },

    hasButton (button) {
      return this.availableButtons.includes(button)
    },

    requestFullscreen () {
      if (this.$refs.renderer && this.$refs.renderer.$refs.view) {
        this.$refs.renderer.$refs.view.requestFullscreen()
      }
    }
  }
}
</script>

<docs>
  ### Basic usage
  ```vue
  <template>
    <u-file
      attribute-name="file"
      v-model="file"
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

  ### Disabled
  ```vue
  <template>
    <u-file
      attribute-name="file"
      disabled
      v-model="file"
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
      attribute-name="file"
      preview-mode
      v-model="file"
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

  ### Preview mode with size
  ```vue
  <template>
    <u-file
      :preview-mode="{
        height: 400,
        width: 300
      }"
      attribute-name="file"
      v-model="file"
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

  ### Custom additional button
  ```vue
  <template>
    <u-file
      v-model="doc_file"
      attribute-name="doc_file"
    >
      <u-button
        appearance="inverse"
        icon="u-icon-send"
      >
        Test
      </u-button>
    </u-file>
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

  ### Access to parent UFile instance from custom button
  ```vue
  <template>
    <u-file
      v-model="doc_file"
      attribute-name="doc_file"
    >
      <custom-button/>
    </u-file>
  </template>
  <script>
    const {mapInstanceFields} = require('@unitybase/adminui-vue')

    export default {
      computed: {
        ...mapInstanceFields(['file'])
      }
    }
  </script>

  <!--  custom button component  -->
  <template>
    <u-button
      appearance="inverse"
      icon="u-icon-send"
      :disabled="instance.file || instance.disabled"
      @click="showParentInstance"
    >
      Test
    </u-button>
  </template>
  <script>
    export default {
      inject: {
        instance: 'fileComponentInstance'
      },

      methods: {
        showParentInstance () {
          console.log(this.instance)
        }
      }
    }
  </script>
  ```

  ### Remove default buttons

  ```vue
  <template>
    <u-file
      v-model="doc_file"
      attribute-name="doc_file"
      remove-default-buttons
    />
  </template>
  ```

  To remove one or few buttons pass array with buttons names
  Buttons names:
   - add
   - webcam
   - scan
   - scanSettings
   - download
   - remove
   - preview
   - fullscreen

  ```vue
  <template>
    <u-file
      v-model="doc_file"
      attribute-name="doc_file"
      :remove-default-buttons="['add', 'preview']"
    />
  </template>
  ```
</docs>
