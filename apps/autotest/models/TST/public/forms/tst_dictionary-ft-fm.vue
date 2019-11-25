<template>
  <div class="ub-form-container">
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
          <el-row :gutter="20">
            <el-col :lg="12">
              <u-auto-field attribute-name="code" />

              <u-form-row :label="`${entity}.caption`">
                <u-input attribute-name="caption" />
              </u-form-row>

              <u-form-row
                required
                :label="`${entity}.filterValue`"
                :error="$v.filterValue.$error"
              >
                <u-input attribute-name="filterValue" />
              </u-form-row>

              <u-form-row :label="`${entity}.currencyValue`">
                <u-input attribute-name="currencyValue" />
              </u-form-row>
            </el-col>

            <el-col :lg="12">
              <u-form-row :label="`${entity}.floatValue`">
                <u-input attribute-name="floatValue" />
              </u-form-row>

              <u-form-row :label="`${entity}.intValue`">
                <u-input attribute-name="intValue" />
              </u-form-row>

              <u-form-row :label="`${entity}.calculated`">
                <el-input
                  :value="calculated"
                  disabled
                />
              </u-form-row>

              <u-form-row :label="`${entity}.booleanColumn`">
                <el-checkbox v-model="booleanColumn" />
              </u-form-row>
            </el-col>
          </el-row>

          <u-form-row label="Participants">
            <u-select-collection
              associated-attr="subjectID"
              entity-name="tst_dictionary_ppt"
              collection-name="participants"
              clearable
            />
          </u-form-row>

          <u-form-row :label="`${entity}.jsonColumn`">
            <u-code-mirror v-model="jsonColumn" />
          </u-form-row>
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
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')
const LazyCollection = require('../components/LazyCollection.vue').default

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent, isModal }) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode,
    isModal
  })
    .instance()
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
