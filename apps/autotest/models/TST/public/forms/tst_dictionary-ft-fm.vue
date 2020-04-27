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
          <h1> Icons with fill problems</h1>
          <u-icon
            :size="iconSize"
            icon="u-icon-edit-border"
          /> u-icon-edit-border
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-filter"
          /> u-icon-filter
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-folder"
          /> u-icon-folder
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-person"
          /> u-icon-person
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-send"
          /> u-icon-send
          <br>

          <h1> File icons with different line width</h1>
          <u-icon
            :size="iconSize"
            icon="u-icon-file"
          /> u-icon-file
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-list"
          /> u-icon-file-list
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-csv"
          /> u-icon-file-csv
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-double-word"
          /> u-icon-file-double-word
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-edit"
          /> u-icon-file-edit
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-excel"
          /> u-icon-file-excel
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-export"
          /> u-icon-file-export
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-html"
          /> u-icon-file-html
          <br>
          <u-icon
            :size="iconSize"
            icon="u-icon-file-pdf"
          /> u-icon-file-pdf
          <br>
          <br>
          <hr>
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
                  v-for="s in sizes"
                  :key="s"
                  :value="s"
              />
            </el-select>
          </u-form-row>

          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-add"
            /> u-icon-add
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-double-left"
            /> u-icon-arrow-double-left
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-double-right"
            /> u-icon-arrow-double-right
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-down"
            /> u-icon-arrow-down
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-left"
            /> u-icon-arrow-left
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-right"
            /> u-icon-arrow-right
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-arrow-up"
            /> u-icon-arrow-up
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-attachments"
            /> u-icon-attachments
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-attributes"
            /> u-icon-attributes
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-audit"
            /> u-icon-audit
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-back"
            /> u-icon-back
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-book"
            /> u-icon-book
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-business-processes"
            /> u-icon-business-processes
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-calendar"
            /> u-icon-calendar
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-close"
            /> u-icon-close
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-copy"
            /> u-icon-copy
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-copy-alt"
            /> u-icon-copy-alt
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-delete"
            /> u-icon-delete
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop"
            /> u-icon-desktop
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-administrator"
            /> u-icon-desktop-administrator
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-business-processes"
            /> u-icon-desktop-business-processes
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-dictionaries"
            /> u-icon-desktop-dictionaries
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-document-types"
            /> u-icon-desktop-document-types
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-documents"
            /> u-icon-desktop-documents
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-orgstucture"
            /> u-icon-desktop-orgstucture
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-desktop-swap"
            /> u-icon-desktop-swap
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-dictionary"
            /> u-icon-dictionary
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-digits"
            /> u-icon-digits
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-documet"
            /> u-icon-documet
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-download"
            /> u-icon-download
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-edit"
            /> u-icon-edit
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-edit-border"
            /> u-icon-edit-border
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-edit-line"
            /> u-icon-edit-line
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-eye"
            /> u-icon-eye
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file"
            /> u-icon-file
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-list"
            /> u-icon-file-list
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-csv"
            /> u-icon-file-csv
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-double-word"
            /> u-icon-file-double-word
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-edit"
            /> u-icon-file-edit
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-excel"
            /> u-icon-file-excel
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-export"
            /> u-icon-file-export
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-html"
            /> u-icon-file-html
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-pdf"
            /> u-icon-file-pdf
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-file-word"
            /> u-icon-file-word
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-filter"
            /> u-icon-filter
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-folder"
            /> u-icon-folder
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-folder-open"
            /> u-icon-folder-open
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-fullscreen"
            /> u-icon-fullscreen
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-fullscreen-close"
            /> u-icon-fullscreen-close
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-house"
            /> u-icon-house
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-info"
            /> u-icon-info
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-inheritate"
            /> u-icon-inheritate
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-inheritate-alt"
            /> u-icon-inheritate-alt
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-link"
            /> u-icon-link
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-list"
            /> u-icon-list
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-list-alt"
            /> u-icon-list-alt
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-list-success"
            /> u-icon-list-success
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-lock"
            /> u-icon-lock
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-mandatory"
            /> u-icon-mandatory
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-mandatory-disabled"
            /> u-icon-mandatory-disabled
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-more"
            /> u-icon-more
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-notification"
            /> u-icon-notification
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-number"
            /> u-icon-number
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-person"
            /> u-icon-person
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-person-group"
            /> u-icon-person-group
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-person-settings"
            /> u-icon-person-settings
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-person-success"
            /> u-icon-person-success
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-print"
            /> u-icon-print
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-question"
            /> u-icon-question
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-redo"
            /> u-icon-redo
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-refresh"
            /> u-icon-refresh
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-save"
            /> u-icon-save
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-scanner"
            /> u-icon-scanner
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-search"
            /> u-icon-search
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-search-minus"
            /> u-icon-search-minus
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-search-plus"
            /> u-icon-search-plus
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-send"
            /> u-icon-send
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-settings"
            /> u-icon-settings
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-settings-alt"
            /> u-icon-settings-alt
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-share"
            /> u-icon-share
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-share-alt"
            /> u-icon-share-alt
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-sort"
            /> u-icon-sort
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-street"
            /> u-icon-street
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-swap"
            /> u-icon-swap
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-tabs"
            /> u-icon-tabs
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-tabs-dotted"
            /> u-icon-tabs-dotted
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-tag"
            /> u-icon-tag
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-tags"
            /> u-icon-tags
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-trademark"
            /> u-icon-trademark
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-undo"
            /> u-icon-undo
          </div>
          <div class="exmaple-icon">
            <u-icon
              :size="iconSize"
              icon="u-icon-windows"
            /> u-icon-windows
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
      iconSize: 'large',
      sizes: ['small', 'medium', 'large']
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
