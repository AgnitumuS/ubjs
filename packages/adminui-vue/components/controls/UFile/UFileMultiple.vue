<template>
  <u-file-container>
    <template #toolbar>
      <u-file-add-button
        v-if="hasButton('add')"
        multiple
      />
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
      <u-file-download-button
        v-if="hasButton('download')"
        multiple
      />
      <u-file-preview-button
        v-if="hasButton('preview')"
        multiple
      />
      <u-file-fullscreen-button
        v-if="hasButton('fullscreen')"
        multiple
      />
      <div
        v-if="hasButton('download') || hasButton('preview') || hasButton('fullscreen')"
        class="u-divider"
      />
      <u-file-remove-button
        v-if="hasButton('remove')"
        multiple
      />

      <slot />
    </template>

    <template #view>
      <u-file-input
        v-if="value.length === 0"
        multiple
        :accept="accept"
        :border="false"
        @input="upload"
      />
      <component
        :is="view"
        v-else
        ref="multipleFileView"
        v-model="selectedFileId"
        :files="files"
        :entity-name="entityName"
        :file-attribute="fileAttribute"
        :with-preview="viewMode === 'carouselWithPreview'"
      />
    </template>
  </u-file-container>
</template>

<script>
const FileLoader = require('./helpers/FileLoader')

export default {
  name: 'UFileMultiple',

  components: {
    UFileContainer: require('./UFileContainer.vue').default,
    ViewCarousel: require('./views/Carousel.vue').default,
    ViewTable: require('./views/Table.vue').default
  },

  props: {
    /**
     * @model
     */
    value: Array,

    /**
     * The name of entity that stores file
     */
    entityName: String,

    /**
     * Document type attribute in collection entity.
     */
    fileAttribute: {
      type: String,
      required: true
    },

    /**
     * Name of attribute which creates relation master entity with entity that stores files.
     * For example we have master entity "tst_dictionary" and entity which collect user files "tst_attachment".
     * In this case subjectAttribute in "tst_attachment" is a link to "tst_dictionary.ID"
     */
    subjectAttribute: {
      type: String,
      required: true
    },

    /**
     * Value of attribute which creates relation master entity with entity that stores files.
     */
    subjectAttributeValue: Number,

    /**
     * File extensions to bind into `accept` input property
     */
    accept: {
      type: String,
      default: ''
    },

    /**
     * Toggle carousel view mode
     */
    viewMode: {
      type: String,
      default: 'table',
      validator: (value) => ['table', 'carousel', 'carouselWithPreview'].includes(value)
    },

    /**
     * Disable to remove or upload file
     */
    disabled: Boolean,

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
     *  - preview
     *  - fullscreen
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
     * @param {string} params.subjectAttribute
     * @param {*} params.subjectAttributeValue
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

  data () {
    return {
      selectedFileId: null
    }
  },

  computed: {
    view () {
      switch (this.viewMode) {
        case 'carousel':
        case 'carouselWithPreview':
          return 'view-carousel'
        default:
          return 'view-table'
      }
    },

    files () {
      return this.value
        .map(item => {
          const file = JSON.parse(item[this.fileAttribute])
          return {
            ID: item.ID,
            origName: file.origName,
            size: file.size,
            isDirty: file.isDirty,
            ct: file.ct,
            uploadDate: item.mi_modifyDate || new Date()
          }
        })
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

      if (this.viewMode === 'carousel' || this.viewMode === 'table') {
        buttonsByDefault.push('preview')
      }

      if (this.viewMode === 'carouselWithPreview') {
        buttonsByDefault.push('fullscreen')
      }

      if (Array.isArray(this.removeDefaultButtons)) {
        return buttonsByDefault.filter(b => !this.removeDefaultButtons.includes(b))
      }

      return buttonsByDefault
    }
  },

  created () {
    this.fileLoader = new FileLoader(this.entityName, this.fileAttribute)
  },

  methods: {
    async upload (binaryFiles) {
      const files = []
      for (const file of binaryFiles) {
        const item = await this.$UB.connection.addNewAsObject({
          entity: this.entityName,
          fieldList: ['ID', this.subjectAttribute],
          execParams: {
            [this.subjectAttribute]: this.subjectAttributeValue
          }
        })

        await this.beforeSetDocument({
          entity: this.entityName,
          id: item.ID,
          attribute: this.fileAttribute,
          subjectAttribute: this.subjectAttribute,
          subjectAttributeValue: this.subjectAttributeValue
        })
        item[this.fileAttribute] = await this.fileLoader.uploadFile(file, item.ID)

        files.push(item)
      }

      this.$emit('input', this.value.concat(files))
    },

    hasButton (button) {
      return this.availableButtons.includes(button)
    },

    requestFullscreen () {
      const fileRenderer = this.$refs.multipleFileView.$refs[`renderer_${this.selectedFileId}`]
      if (fileRenderer && fileRenderer[0].$refs.view) {
        fileRenderer[0].$refs.view.requestFullscreen()
      }
    }
  }
}
</script>

<docs>
  ### Basic usage
  ```vue
  <template>
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
    />
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
      }
    }
  </script>
  ```

  ### Disabled
  ```vue
  <template>
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
      disabled
    />
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
      }
    }
  </script>
  ```

  ### View mode
  ```vue
  <template>
    <div>
      <el-radio v-model="viewMode" label="table">Table</el-radio>
      <el-radio v-model="viewMode" label="carousel">Carousel</el-radio>
      <el-radio v-model="viewMode" label="carouselWithPreview">Carousel with preview</el-radio>

      <u-file-multiple
        v-model="files"
        file-attribute="doc_file"
        subject-attribute="dictID"
        entity-name="tst_attachment"
        :subject-attribute-value="ID"
        :view-mode="viewMode"
      />
    </div>
  </template>
  <script>
    export default {
      data () {
        return {
          files: [],
          viewMode: 'table'
        }
      }
    }
  </script>
  ```

  ### Custom additional button
  ```vue
  <template>
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
    >
      <u-button
        appearance="inverse"
        icon="u-icon-send"
      >
        Test
      </u-button>
    </u-file-multiple>
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
      }
    }
  </script>
  ```

  ### Access to parent UFile instance from custom button
  ```vue
  <template>
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
    >
      <custom-button/>
    </u-file-multiple>
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
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
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
      remove-default-buttons
    />
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
      }
    }
  </script>
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
    <u-file-multiple
      v-model="files"
      file-attribute="doc_file"
      subject-attribute="dictID"
      entity-name="tst_attachment"
      :subject-attribute-value="ID"
      :remove-default-buttons="['add', 'preview']"
    />
  </template>
  <script>
    export default {
      data () {
        return {
          files: []
        }
      }
    }
  </script>
  ```
</docs>
