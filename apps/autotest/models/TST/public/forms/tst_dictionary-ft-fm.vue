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
        <el-tab-pane
          label="File upload"
          lazy
        >
          <u-form-container label-position="top">
            <u-form-row label="<u-file-input/>">
              <u-file-input />
            </u-form-row>
            <u-form-row label="<u-file-input accept='.dbf'/>">
              <u-file-input accept=".dbf" placeholder="DBF upload" v-model="selectedFiles"/>
              <div> {{ selectedFiles.length }} files selected </div>
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
                  color="primary"
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
                  color="primary"
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
      selectedFiles: []
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
