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
<!--    IMPORTANT tab below marked as lazy to prevent getDocument request on form open -->
        <el-tab-pane label="File upload" lazy>
          <u-form-container label-position="top">
            <u-form-row label="<u-file-input/>">
              <u-file-input />
            </u-form-row>
            <u-auto-field
              v-model="doc_file"
              label="<u-file/> Auto field"
              attribute-name="doc_file"
            />
            <u-form-row label="<u-file/> (Additional button)">
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
            </u-form-row>
            <u-form-row label="<u-file/> (Remove default buttons)">
              <u-file
                v-model="doc_file"
                attribute-name="doc_file"
                remove-default-buttons
              />
            </u-form-row>
            <u-form-row label="<u-file/> (Hide one default button [add])">
              <u-file
                v-model="doc_file"
                attribute-name="doc_file"
                :remove-default-buttons="['add']"
              />
            </u-form-row>
            <u-form-row label="<u-file/> (Disabled)">
              <u-file
                v-model="doc_file"
                attribute-name="doc_file"
                disabled
              />
            </u-form-row>
            <u-form-row label="<u-file/> (Preview mode)">
              <u-file
                v-model="doc_file"
                attribute-name="doc_file"
                preview-mode
              />
            </u-form-row>
            <u-form-row label="<u-file/> (Preview mode with size)">
              <u-file
                v-model="doc_file"
                attribute-name="doc_file"
                :preview-mode="{
                  width: 400,
                  height: 400
                }"
              />
            </u-form-row>

            <u-form-row label="<u-file-multiple/>">
              <u-file-multiple
                v-model="multipleFileExample"
                file-attribute="doc_file"
                subject-attribute="dictID"
                entity-name="tst_attachment"
                :subject-attribute-value="ID"
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/>">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/> (Disabled)">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
                disabled
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/> (Remove default buttons)">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
                remove-default-buttons
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/> (Remove one default button [add])">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
                :remove-default-buttons="['add']"
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/> (Additional custom button)">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
              >
                <u-button
                  appearance="inverse"
                  icon="u-icon-send"
                >
                  Test
                </u-button>
              </u-file-collection>
            </u-form-row>

            <u-form-row label="<u-file-collection/> (View mode carousel)">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
                view-mode="carousel"
              />
            </u-form-row>

            <u-form-row label="<u-file-collection/> (View mode carouselWithPreview)">
              <u-file-collection
                collection-name="attachments"
                entity-name="tst_attachment"
                file-attribute="doc_file"
                subject-attribute="dictID"
                view-mode="carouselWithPreview"
              />
            </u-form-row>
          </u-form-container>
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
      multipleFileExample: [],
      iconSize: 'medium',
      sizes: ['small', 'medium', 'large'],
      icons: [
        'u-icon-add',
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
        'u-icon-back',
        'u-icon-bell',
        'u-icon-book',
        'u-icon-book-alt',
        'u-icon-branch',
        'u-icon-calendar',
        'u-icon-calendar-alt',
        'u-icon-check',
        'u-icon-check-double',
        'u-icon-circle',
        'u-icon-circle-bold',
        'u-icon-circle-close',
        'u-icon-circle-dollar',
        'u-icon-circle-double',
        'u-icon-circle-info',
        'u-icon-circle-minus',
        'u-icon-circle-plus',
        'u-icon-circle-question',
        'u-icon-circle-trademark',
        'u-icon-clock',
        'u-icon-close',
        'u-icon-cloud',
        'u-icon-cloud-alt',
        'u-icon-copy',
        'u-icon-copy-alt',
        'u-icon-crosshairs',
        'u-icon-data',
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
        'u-icon-dollar',
        'u-icon-download',
        'u-icon-edit',
        'u-icon-edit-alt',
        'u-icon-eraser',
        'u-icon-exit',
        'u-icon-expand',
        'u-icon-eye',
        'u-icon-eye-slash',
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
        'u-icon-folder-add',
        'u-icon-folder-alt',
        'u-icon-folder-open',
        'u-icon-fullscreen',
        'u-icon-globe',
        'u-icon-grid',
        'u-icon-hand',
        'u-icon-hashtag',
        'u-icon-hdd',
        'u-icon-hierarchy',
        'u-icon-hierarchy-alt',
        'u-icon-house',
        'u-icon-image',
        'u-icon-key',
        'u-icon-layers',
        'u-icon-letter',
        'u-icon-line-chart',
        'u-icon-link',
        'u-icon-list',
        'u-icon-list-align-left',
        'u-icon-list-align-right',
        'u-icon-list-success',
        'u-icon-lock',
        'u-icon-mandatory',
        'u-icon-mandatory-slash',
        'u-icon-message',
        'u-icon-message-alt',
        'u-icon-message-text',
        'u-icon-minus',
        'u-icon-more',
        'u-icon-more-vertical',
        'u-icon-number',
        'u-icon-object-group',
        'u-icon-photo',
        'u-icon-person',
        'u-icon-person-group',
        'u-icon-person-settings',
        'u-icon-person-success',
        'u-icon-print',
        'u-icon-puzzle-piece',
        'u-icon-rectangle',
        'u-icon-rectangle-dotted',
        'u-icon-redo',
        'u-icon-refresh',
        'u-icon-resize',
        'u-icon-rhombus',
        'u-icon-save',
        'u-icon-save-and-close',
        'u-icon-scan',
        'u-icon-scan-settings',
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
        'u-icon-sort-asc-alt',
        'u-icon-sort-desc',
        'u-icon-sort-desc-alt',
        'u-icon-street',
        'u-icon-swap',
        'u-icon-tabs',
        'u-icon-tabs-dotted',
        'u-icon-tag',
        'u-icon-tags',
        'u-icon-undo',
        'u-icon-unlock',
        'u-icon-wallet',
        'u-icon-window-left',
        'u-icon-window-top',
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

  .exmaple-icon > .u-icon {
    margin-right: 8px;
  }
</style>
