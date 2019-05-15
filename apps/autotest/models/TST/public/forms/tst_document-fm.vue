<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />

    <u-form>
      <el-row>
        <el-col :lg="8">
          <u-form-row
            required
            :label="getLabel('code')"
            :error="$v.code.$error"
          >
            <el-input
              v-model="code"
            />
          </u-form-row>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :lg="8">
          <u-form-row :label="getLabel('docDate')">
            <el-date-picker
              v-model="docDate"
              type="date"
            />
          </u-form-row>
        </el-col>

        <el-col :lg="8">
          <u-form-row :label="getLabel('incomeDate')">
            <el-date-picker
              v-model="incomeDate"
              type="date"
            />
          </u-form-row>
        </el-col>

        <el-col :lg="8">
          <u-form-row :label="getLabel('regDate')">
            <el-date-picker
              v-model="regDate"
              type="date"
            />
          </u-form-row>
        </el-col>
      </el-row>

      <u-form-row
        required
        :label="getLabel('category')"
        :error="$v.category.$error"
      >
        <u-select-entity
          v-model="category"
          :entity-name="getEntity('category')"
        />
      </u-form-row>

      <u-form-row
        required
        :label="getLabel('favorites')"
        :error="$v.favorites.$error"
      >
        <u-select-entity
          v-model="favorites"
          :entity-name="getEntity('favorites')"
        />
      </u-form-row>

      <u-form-row
        required
        :label="getLabel('favorites2')"
        :error="$v.favorites2.$error"
      >
        <u-select-entity
          v-model="favorites2"
          :entity-name="getEntity('favorites2')"
        />
      </u-form-row>

      <u-form-row :label="getLabel('description')">
        <el-input
          v-model="description"
          type="textarea"
          resize="none"
          rows="5"
        />
      </u-form-row>

      <u-form-row
        :label="getLabel('docDateTime')"
        :label-width="150"
      >
        <el-date-picker
          v-model="docDateTime"
          type="date"
        />
      </u-form-row>

      <u-form-row :label="getLabel('fileStoreSimple')">
        <u-upload-document
          v-model="fileStoreSimple"
          :entity-name="entityName"
          file-store="fileStoreSimple"
          :doc-id="ID"
        />
      </u-form-row>

      <el-row :gutter="20">
        <el-col :lg="12">
          <u-form-row :label="getLabel('person')">
            <u-select-entity
              v-model="person"
              :entity-name="getEntity('person')"
            />
          </u-form-row>
        </el-col>
        <el-col :lg="12">
          <u-form-row :label="getLabel('employee')">
            <u-select-entity
              v-model="employee"
              :entity-name="getEntity('employee')"
            />
          </u-form-row>
        </el-col>
      </el-row>
    </u-form>
  </div>
</template>

<script>
const {
  mountHelpers,
  createInstanceModule,
  processingModule,
  mapInstanceFields,
  validateEntitySchema,
  validationInjectMixin
} = require('@unitybase/adminui-vue/utils/formBoilerplate/index')
const Vuex = require('vuex')
const { mapGetters } = Vuex

module.exports.mount = function (params) {
  if (mountHelpers.activateIfMounted(params)) return

  const fieldList = UB.connection.domain.get(params.entity).getAttributeNames()
  const masterRequest = UB.connection.Repository(params.entity).attrs(fieldList)

  const assignInstance = createInstanceModule()
  const assignProcessing = processingModule(assignInstance, masterRequest)
  const store = new Vuex.Store(assignProcessing)

  store.dispatch('init', params.instanceID)
  const validator = validateEntitySchema(store)

  mountHelpers.mount({
    FormComponent: TstDocument,
    showFormParams: params,
    store,
    validator
  })
}

const TstDocument = module.exports.default = {
  name: 'TstDocument',
  mixins: [validationInjectMixin],

  computed: {
    ...mapInstanceFields([
      'ID',
      'code',
      'docDate',
      'incomeDate',
      'regDate',
      'category',
      'favorites',
      'favorites2',
      'docDateTime',
      'description',
      'fileStoreSimple',
      'person',
      'employee'
    ]),

    ...mapGetters(['entitySchema', 'entityName'])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    getEntity (attr) {
      return this.entitySchema.attributes[attr].associatedEntity
    }
  }
}
</script>
