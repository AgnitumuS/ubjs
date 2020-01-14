<template>
  <div>
    <u-file-input
      multiple
      @upload="upload"
      :accept="accept"
    />
    <u-table
      v-show="files.length > 0"
      :items="files"
      :columns="columns"
      class="u-file-collection__table"
      max-height="100%"
      @click.native.prevent
    >
      <button
        slot="preview"
        slot-scope="{row}"
        class="u-file-collection__action-icon el-icon-view"
        :disabled="!previewFormats.includes(row.ct)"
        @click="preview(row.id)"
      />

      <button
        slot="download"
        slot-scope="{row}"
        class="u-file-collection__action-icon el-icon-download"
        @click="download(row.id)"
      />

      <button
        slot="remove"
        slot-scope="{row}"
        class="u-file-collection__action-icon el-icon-delete"
        @click="remove(row.id)"
      />

      <template #size="{value}">
        {{ value | formatBytes }}
      </template>

      <template #type="{row}">
        {{ row.origName | getType }}
      </template>

      <template #uploadDate="{value}">
        {{ formatDate(value) }}
      </template>
    </u-table>
  </div>
</template>

<script>
const { mapMutations } = require('vuex')
const formatterMixin = require('./formatterMixin.js')
const previewDialog = require('./previewDialog')

/**
 * Multi file upload to UB entity.
 * It maps to collection in UB.Form constructor.
 */
export default {
  name: 'UFileCollection',

  mixins: [formatterMixin],

  props: {
    /**
     * Name of watched collection
     */
    collectionName: {
      type: String,
      required: true
    },

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
     * File extensions to bind into `accept` input property
     */
    accept: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      columns: [{
        id: 'preview',
        width: 40,
        minWidth: 40
      }, {
        id: 'download',
        width: 40,
        minWidth: 40
      }, {
        id: 'remove',
        width: 40,
        minWidth: 40
      }, {
        id: 'origName',
        label: 'fileInput.manyFilesTable.label',
        minWidth: 180
      }, {
        id: 'size',
        label: 'fileInput.manyFilesTable.size',
        width: 100,
        minWidth: 100
      }, {
        id: 'type',
        label: 'fileInput.manyFilesTable.type',
        width: 60,
        minWidth: 60
      }, {
        id: 'uploadDate',
        label: 'fileInput.manyFilesTable.uploadDate',
        width: 120,
        minWidth: 120
      }],

      previewFormats: [
        'application/pdf',
        'image/png',
        'image/jpeg'
      ]
    }
  },

  computed: {
    collectionData () {
      return this.$store.state.collections[this.collectionName]
    },

    files () {
      return this.collectionData.items
        .map(item => {
          const file = JSON.parse(item.data[this.fileAttribute])
          return {
            id: item.data.ID,
            origName: file.origName,
            size: file.size,
            isDirty: file.isDirty,
            ct: file.ct,
            uploadDate: item.data.mi_modifyDate || new Date()
          }
        })
    },

    entityName () {
      return this.collectionData.entity
    }
  },

  methods: {
    ...mapMutations([
      'DELETE_COLLECTION_ITEM',
      'ADD_COLLECTION_ITEM'
    ]),

    upload (binaryFiles) {
      for (const file of binaryFiles) {
        this.bindFileToEntity(file)
      }
    },

    async bindFileToEntity (file) {
      const item = await this.$UB.connection.addNewAsObject({
        entity: this.entityName,
        fieldList: ['ID', this.subjectAttribute],
        execParams: {
          [this.subjectAttribute]: this.$store.state.data.ID
        }
      })

      const fileResponse = await this.$UB.connection.post('setDocument', file, {
        params: {
          entity: this.entityName,
          attribute: this.fileAttribute,
          origName: file.name,
          filename: file.name,
          id: item.ID
        },
        headers: { 'Content-Type': 'application/octet-stream' }
      })

      item[this.fileAttribute] = JSON.stringify(fileResponse.data.result)

      this.ADD_COLLECTION_ITEM({
        collection: this.collectionName,
        item
      })
    },

    remove (id) {
      const index = this.files.findIndex(f => f.id === id)
      this.DELETE_COLLECTION_ITEM({
        collection: this.collectionName,
        index
      })
    },

    preview (id) {
      const file = this.files.find(f => f.id === id)
      const { isDirty, ct } = file
      previewDialog({
        entity: this.entityName,
        attribute: this.fileAttribute,
        id,
        isDirty,
        ct,
        origName: file.origName
      })
    },

    async download (id) {
      const { origName, isDirty } = this.files.find(f => f.id === id)
      const binaryFile = await this.$UB.connection.getDocument({
        entity: this.entityName,
        attribute: this.fileAttribute,
        id,
        isDirty
      }, { resultIsBinary: true })
      window.saveAs(new Blob([binaryFile]), origName)
    }
  }
}
</script>

<style>
  .u-file-collection__table{
    margin: 10px 0;
  }

  .u-file-collection__action-icon{
    font-size: 20px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--secondary), 0.9);
    cursor: pointer;
    background: none;
    border: none;
  }

  .u-file-collection__action-icon:disabled{
    color: rgba(var(--info), 0.2);
    cursor: not-allowed;
  }
</style>

<docs>
  First you need to create collection in UB.Form

  ```javascript
  module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent }) {
    Form({
      component: rootComponent,
      entity,
      instanceID,
      title,
      formCode,
      isModal
    })
      .processing({
        collections: {
          attachments: ({ state }) => UB.Repository('tst_attachment')
            .attrs('ID', 'file', 'dictID')
            .where('dictID', '=', state.data.ID)
        }
      })
      .validation()
      .mount()
  }
  ```

  Then you need to set collection name, file attribute and subject attribute.

  ```vue
  <template>
    <u-file-collection
      collection-name="attachments"
      file-attribute="file"
      subject-attribute="dictID"
    />
  </template>
  <script>
    export default {}
  </script>
  ```
</docs>
