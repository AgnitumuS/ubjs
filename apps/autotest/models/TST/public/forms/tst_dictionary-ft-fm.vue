<template>
  <div class="u-form-layout">
    <u-toolbar />

    <el-alert
      v-show="formCrashed"
      :title="$ut('formCrashTitle')"
      type="error"
      :description="$ut('formCrashBody')"
      show-icon
      :closable="false"
    />
    <u-form-container
      v-loading="loading || formCrashed"
      :label-width="160"
    >
      <el-tabs>
        <el-tab-pane label="Main">
          <u-grid>
            <u-auto-field attribute-name="code" />
            <u-auto-field attribute-name="caption" />
            <u-auto-field attribute-name="filterValue" />
            <u-auto-field attribute-name="currencyValue" />
            <u-auto-field attribute-name="floatValue" />
            <u-auto-field attribute-name="intValue" />
            <u-auto-field attribute-name="calculated" />
            <u-auto-field attribute-name="booleanColumn" />
          </u-grid>

          <u-form-row label="Participants">
            <u-select-collection
              associated-attr="subjectID"
              entity-name="tst_dictionary_ppt"
              collection-name="participants"
              clearable
            />
          </u-form-row>

          <u-auto-field attribute-name="jsonColumn" />
        </el-tab-pane>
        <el-tab-pane label="File upload">
          <u-form-row label="file collection">
            <u-file-collection
              collection-name="attachments"
              file-attribute="doc_file"
              subject-attribute="dictID"
            />
          </u-form-row>

          <u-form-row label="Base file">
            <u-file
              v-model="doc_file"
              attribute-name="doc_file"
            />
          </u-form-row>

          <u-form-row label="Base file disabled">
            <u-file
              v-model="doc_file"
              disabled
              attribute-name="doc_file"
            />
          </u-form-row>

          <u-form-row label="Preview mode">
            <u-file
              v-model="doc_file"
              attribute-name="doc_file"
              preview-mode
            />
          </u-form-row>

          <u-auto-field
            v-model="doc_file"
            label="Auto field"
            attribute-name="doc_file"
          />
        </el-tab-pane>
        <el-tab-pane
          label="Lazy collection example"
          lazy
        >
          <lazy-collection />
        </el-tab-pane>
        <el-tab-pane label="Icons">
          <u-form-row label="size">
            <el-select v-model="iconSize">
              <el-option
                v-for="size in sizes"
                :key="size"
                :value="size"
              />
            </el-select>
          </u-form-row>

          <div
            v-for="icon in icons"
            :key="icon"
            class="exmaple-icon"
          >
            <u-icon
              :size="iconSize"
              :icon="icon"
            /> {{ icon }}
          </div>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')
const LazyCollection = require('../components/LazyCollection.vue').default

module.exports.mount = function (cfg) {
  Form(cfg)
    .processing({
      collections: {
        todo: {
          repository: ({ state }) => UB.Repository('tst_dictionary_todo')
            .attrs('ID', 'objectID', 'name', 'status', 'link')
            .where('objectID', '=', state.data.ID),
          lazy: true
        },

        participants: ({ state }) => UB.Repository('tst_dictionary_ppt')
          .attrs('ID', 'objectID', 'subjectID')
          .where('objectID', '=', state.data.ID),

        attachments: ({ state }) => UB.Repository('tst_attachment')
          .attrs('ID', 'doc_file', 'dictID')
          .where('dictID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'TstDictionary',
  components: { LazyCollection },

  inject: ['$v', 'entity'],

  data () {
    return {
      iconSize: 'medium',
      sizes: ['small', 'medium', 'large'],
      icons: [
        'u-icon-add',
        'u-icon-add-circle',
        'u-icon-arrow-alt-left',
        'u-icon-arrow-alt-right',
        'u-icon-arrow-double-left',
        'u-icon-arrow-double-right',
        'u-icon-arrow-down',
        'u-icon-arrow-left',
        'u-icon-arrow-right',
        'u-icon-arrow-up',
        'u-icon-attachments',
        'u-icon-attributes',
        'u-icon-audit',
        'u-icon-back',
        'u-icon-bell',
        'u-icon-book',
        'u-icon-book-alt',
        'u-icon-branch',
        'u-icon-calendar',
        'u-icon-calendar-alt',
        'u-icon-check',
        'u-icon-check-double',
        'u-icon-close',
        'u-icon-close-alt',
        'u-icon-cloud',
        'u-icon-cloud-alt',
        'u-icon-copy',
        'u-icon-copy-alt',
        'u-icon-crosshairs',
        'u-icon-delete',
        'u-icon-desktop',
        'u-icon-desktop-administrator',
        'u-icon-desktop-business-processes',
        'u-icon-desktop-dictionaries',
        'u-icon-desktop-document-types',
        'u-icon-desktop-documents',
        'u-icon-desktop-orgstructure',
        'u-icon-desktop-swap',
        'u-icon-dictionary',
        'u-icon-digits',
        'u-icon-document',
        'u-icon-dollar',
        'u-icon-dollar-alt',
        'u-icon-download',
        'u-icon-edit',
        'u-icon-edit-alt',
        'u-icon-eye',
        'u-icon-file',
        'u-icon-file-code',
        'u-icon-file-csv',
        'u-icon-file-double-word',
        'u-icon-file-edit',
        'u-icon-file-excel',
        'u-icon-file-export',
        'u-icon-file-html',
        'u-icon-file-image',
        'u-icon-file-pdf',
        'u-icon-file-text',
        'u-icon-file-word',
        'u-icon-filter',
        'u-icon-folder',
        'u-icon-folder-alt',
        'u-icon-folder-open',
        'u-icon-fulscreen',
        'u-icon-hashtag',
        'u-icon-hdd',
        'u-icon-hierarchy',
        'u-icon-hierarchy-alt',
        'u-icon-house',
        'u-icon-info',
        'u-icon-letter',
        'u-icon-link',
        'u-icon-list',
        'u-icon-list-align-left',
        'u-icon-list-align-right',
        'u-icon-list-success',
        'u-icon-lock',
        'u-icon-mandatory',
        'u-icon-mantadory-disabled',
        'u-icon-message',
        'u-icon-minus',
        'u-icon-more',
        'u-icon-number',
        'u-icon-person',
        'u-icon-person-group',
        'u-icon-person-settings',
        'u-icon-person-success',
        'u-icon-print',
        'u-icon-puzzle-piece',
        'u-icon-question',
        'u-icon-redo',
        'u-icon-refresh',
        'u-icon-save',
        'u-icon-save-and-close',
        'u-icon-scan',
        'u-icon-search',
        'u-icon-search-minus',
        'u-icon-search-plus',
        'u-icon-send',
        'u-icon-setting',
        'u-icon-setting-alt',
        'u-icon-share',
        'u-icon-share-alt',
        'u-icon-sort',
        'u-icon-sort-asc',
        'u-icon-sort-desc',
        'u-icon-street',
        'u-icon-swap',
        'u-icon-tabs',
        'u-icon-tabs-dotted',
        'u-icon-tag',
        'u-icon-tags',
        'u-icon-trademark',
        'u-icon-undo',
        'u-icon-wallet',
        'u-icon-windows',
        'u-icon-wrench'
      ]
    }
  },

  computed: {
    ...mapInstanceFields([
      'ID',
      'caption',
      'filterValue',
      'currencyValue',
      'floatValue',
      'intValue',
      'calculated',
      'booleanColumn',
      'jsonColumn',
      'doc_file'
    ]),

    ...mapGetters(['loading']),

    ...mapState(['formCrashed'])
  }
}
</script>

<style>
  .exmaple-icon{
    width: 15%;
    display: inline-flex;
    align-items: center;
  }
</style>
