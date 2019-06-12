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
              <u-auto-field
                v-model="code"
                code="code"
              />

              <u-form-row :label="getLabel('caption')">
                <u-input
                  v-model="caption"
                  :entity="entity"
                  attribute-name="caption"
                />
              </u-form-row>

              <u-form-row
                required
                :label="getLabel('filterValue')"
                :error="$v.filterValue.$error"
              >
                <u-input
                  v-model="filterValue"
                  attribute-name="filterValue"
                  type="number"
                />
              </u-form-row>

              <u-form-row :label="getLabel('currencyValue')">
                <u-input
                  v-model="currencyValue"
                  attribute-name="currencyValue"
                  type="number"
                />
              </u-form-row>
            </el-col>

            <el-col :lg="12">
              <u-form-row :label="getLabel('floatValue')">
                <u-input
                  v-model="floatValue"
                  attribute-name="floatValue"
                  type="number"
                />
              </u-form-row>

              <u-form-row :label="getLabel('intValue')">
                <u-input
                  v-model="intValue"
                  attribute-name="intValue"
                  type="number"
                />
              </u-form-row>

              <u-form-row :label="getLabel('calculated')">
                <el-input
                  :value="calculated"
                  disabled
                />
              </u-form-row>

              <u-form-row :label="getLabel('booleanColumn')">
                <el-checkbox v-model="booleanColumn" />
              </u-form-row>
            </el-col>
          </el-row>

          <u-form-row label="Participants">
            <u-select-collection
              subject-attr="subjectID"
              collection-name="participants"
              clearable
            />
          </u-form-row>

          <u-form-row :label="getLabel('jsonColumn')">
            <u-code-mirror v-model="jsonColumn" />
          </u-form-row>
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
const fieldList = [
  'ID',
  'code',
  'caption',
  'filterValue',
  'currencyValue',
  'floatValue',
  'intValue',
  'calculated',
  'booleanColumn',
  'jsonColumn'
]

module.exports.mount = function ({ title, entity, instanceID, formCode }) {
  Form({
    component: TstDictionary,
    entity,
    instanceID,
    title,
    formCode
  })
    .instance()
    .processing({
      collections: {
        todo: {
          repository: UB.connection
            .Repository('tst_dictionary_todo')
            .attrs('ID', 'objectID', 'name', 'status', 'link')
            .where('objectID', '=', instanceID),
          lazy: true
        },

        participants: UB.connection
          .Repository('tst_dictionary_ppt')
          .attrs('ID', 'objectID', 'subjectID')
          .where('objectID', '=', instanceID)
      }
    })
    .validation()
    .mount()
}

const TstDictionary = module.exports.default = {
  name: 'TstDictionary',
  components: { LazyCollection },

  inject: ['$v', 'entity', 'entitySchema'],

  computed: {
    ...mapInstanceFields(fieldList),

    ...mapGetters(['loading']),

    ...mapState(['formCrashed'])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    }
  }
}
</script>
