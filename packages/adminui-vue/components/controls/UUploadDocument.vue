<template>
  <div v-loading="loading">
    <div v-if="value">
      <el-dialog
        :title="currentValue.origName"
        :visible.sync="dialogVisible"
        class="ub-upload-document__dialog"
        @closed="removeUrl"
      >
        <iframe
          :height="iFrameHeight"
          :width="iFrameWidth"
          type="application/pdf"
          :src="documentURL"
        />
      </el-dialog>
      <a
        class="ub-upload-document__a"
        @click="downloadFile"
      >
        <i class="el-icon-document" />
        {{ currentValue.origName }}
      </a>
      <el-tooltip
        :content="$ut('Delete')"
        :enterable="false"
      >
        <el-button
          size="mini"
          circle
          icon="el-icon-close"
          @click="remove(currentValue.origName)"
        />
      </el-tooltip>
    </div>
    <div
      v-else
      class="ub-upload-document__file-input"
    >
      <el-button
        class="el-icon-plus"
        size="mini"
        circle
      />
      <input
        type="file"
        tabindex="-1"
        @change="processFile"
      >
    </div>
  </div>
</template>

<script>
/* global saveAs, $App */

/**
 * Component for fields with type Document
 * load document on server
 * after click on document download it
 * if extension is pdf - will show content in dialog
 */
export default {
  name: 'UUploadDocument',
  props: {
    /**
     * @model
     */
    value: [Object, String],
    /**
     * Entity name
     * @type {Object}
     */
    entityName: {
      type: String,
      required: true
    },
    /**
     * name of the store to which the file will be loaded
     */
    fileStore: {
      type: String,
      required: true
    },
    /**
     * ID of master record
     */
    docId: {
      type: Number,
      required: true,
      default: NaN
    },
    /**
     * pdf preview dialog height
     */
    iFrameHeight: {
      type: String,
      default: '650px'
    },
    /**
     * pdf preview dialog width
     */
    iFrameWidth: {
      type: String,
      default: '100%'
    }
  },

  data () {
    return {
      documentURL: null,
      dialogVisible: false,
      loading: false
    }
  },

  computed: {
    currentValue () {
      return typeof this.value === 'string' ? JSON.parse(this.value) : this.value
    }
  },

  methods: {
    processFile (e) {
      this.loading = true
      const file = e.target.files[0]
      this.$UB.connection.post('setDocument', file, {
        params: {
          entity: this.entityName,
          attribute: this.fileStore,
          origName: file.name,
          filename: file.name,
          id: this.docId
        },
        headers: { 'Content-Type': 'application/octet-stream' }
      }).then(response => {
        this.$emit('input', JSON.stringify(response.data.result))
      }).finally(() => {
        e.target.value = ''
        this.loading = false
      })
    },

    downloadFile () {
      this.loading = true
      this.$UB.connection.getDocument({
        entity: this.entityName,
        attribute: this.fileStore,
        id: this.docId,
        isDirty: this.currentValue.isDirty
      }, {
        resultIsBinary: true
      }).then(result => {
        const nameArray = this.currentValue.origName.split('.')
        const extension = nameArray[nameArray.length - 1]
        if (extension === 'pdf') {
          this.documentURL = window.URL.createObjectURL(new Blob([result], { type: 'application/pdf' }))
          this.dialogVisible = true
        } else {
          saveAs(new Blob([result]), this.currentValue.origName)
        }
      }).finally(() => {
        this.loading = false
      })
    },

    removeUrl () {
      window.URL.revokeObjectURL(this.documentURL)
    },

    async remove (filename) {
      const answer = await $App.dialogYesNo('deletionDialogConfirmCaption', this.$ut('deleteFormConfirmCaption', filename))
      if (answer) {
        this.$emit('input', null)
      }
    }
  }
}
</script>

<docs>
### Basic usage

```vue
<template>
  <u-upload-document
    v-model="model"
    entity-name="tst_document"
    file-store="fileStoreSimple"
    :doc-id="$store.state.data.ID"
    :disabled="disabled"
  />
</template>
<script>
  export default {
    data () {
      return {
        model: null
      }
    }
  }
</script>
```

### Disabled

```vue
<template>
  <u-upload-document
    v-model="model"
    entity-name="tst_document"
    file-store="fileStoreSimple"
    :doc-id="$store.state.data.ID"
    disabled
  />
</template>
<script>
  export default {
    data () {
      return {
        model: null
      }
    }
  }
</script>
```
</docs>
