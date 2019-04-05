<template>
  <u-entity-edit
    :entity-name="entityName"
    :instance-id="instanceID"
    :instance="fields"
    :current-tab-id="currentTabId"
    :form-code="formCode"
    :before-save="beforeSave"
    @data-loaded="assignInstanceData"
  >
    <u-form
      v-if="$v"
      :label-width="140"
    >
      <el-row :gutter="20">
        <!--responsive. for large screen a half of screen width, for small - full width -->
        <el-col
          :lg="12"
          :sm="24"
        >
          <u-form-row
            :required="requiredFields.includes('code')"
            :label="entitySchema.attributes.code.caption"
            :error="$v.code.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.code.caption)"
          >
            <u-input
              :value="fields.code"
              :entity-name="entityName"
              attribute-name="code"
              @input="storeSetter('code', $event)"
            />
          </u-form-row>
          <u-form-row
            :required="requiredFields.includes('caption')"
            :label="entitySchema.attributes.caption.caption"
            :error="$v.caption.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.caption.caption)"
          >
            <u-input
              :value="fields.caption"
              :entity-name="entityName"
              attribute-name="caption"
              :object-value="fields"
              @input="storeSetter('caption', $event)"
            />
          </u-form-row>
          <u-form-row
            :required="requiredFields.includes('booleanColumn')"
            :label="entitySchema.attributes.booleanColumn.caption"
            :error="$v.booleanColumn.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.booleanColumn.caption)"
          >
            <el-checkbox
              :value="fields.booleanColumn"
              @input="storeSetter('booleanColumn', $event)"
            />
          </u-form-row>
        </el-col>
        <el-col
          :lg="12"
          :sm="24"
        >
          <u-form-row
            :required="requiredFields.includes('filterValue')"
            :label="entitySchema.attributes.filterValue.caption"
            :error="$v.filterValue.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.filterValue.caption)"
          >
            <u-input-number
              :value="fields.filterValue"
              :entity-name="entityName"
              attribute-name="filterValue"
              @input="storeSetter('filterValue', $event)"
            />
          </u-form-row>
          <u-form-row
            :required="requiredFields.includes('currencyValue')"
            :label="entitySchema.attributes.currencyValue.caption"
            :error="$v.currencyValue.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.currencyValue.caption)"
          >
            <u-input-number
              :value="fields.currencyValue"
              :entity-name="entityName"
              attribute-name="currencyValue"
              @input="storeSetter('currencyValue', $event)"
            />
          </u-form-row>
          <u-form-row
            :required="requiredFields.includes('floatValue')"
            :label="entitySchema.attributes.floatValue.caption"
            :error="$v.floatValue.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.floatValue.caption)"
          >
            <u-input-number
              :value="fields.floatValue"
              :entity-name="entityName"
              attribute-name="floatValue"
              @input="storeSetter('floatValue', $event)"
            />
          </u-form-row>
        </el-col>
        <el-col>
          <u-form-row
            :required="requiredFields.includes('jsonColumn')"
            :label="entitySchema.attributes.jsonColumn.caption"
            :error="$v.jsonColumn.$error && $ut('isRequiredFieldFmt', entitySchema.attributes.jsonColumn.caption)"
          >
            <u-code-mirror
              :value="fields.jsonColumn"
              :entity-name="entityName"
              attribute-name="jsonColumn"
              :value-is-json="true"
              @input="storeSetter('jsonColumn', $event)"
            />
          </u-form-row>
        </el-col>
      </el-row>
    </u-form>
  </u-entity-edit>
</template>

<script>
const AdminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function (params) {
  if (AdminUiVue.mountHelpers.activateIfMounted(params)) return
  let mountParams = {
    FormComponent: TstDictionaryFt,
    showFormParams: params,
    store: {
      state: {
        formTitle: params.title
      }
    }
  }
  AdminUiVue.mountHelpers.mount(mountParams)
}

const TstDictionaryFt = module.exports.default = {
  name: 'TstDictionaryFt',
  props: {
    entityName: {
      type: String,
      required: true
    },
    instanceID: Number,
    currentTabId: String,
    formCode: String
  },

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    fieldsToShow () {
      return this.entitySchema
        .filterAttribute({ defaultView: true })
        .map((at) => at.name)
    },

    /**
     * check is attribute allowNull and not Boolean
     * @return {Array} array of required fields
     */
    requiredFields () {
      return this.fieldsToShow.map(field => {
        const attr = this.entitySchema.attributes[field]
        const isRequired = !attr.allowNull
        const notBoolean = attr.dataType !== 'Boolean'

        if (isRequired && notBoolean) {
          return field
        }
      })
    },

    fields () {
      return this.$store.state.data
    },

    $v () {
      return this.$store.state.$v
    }
  },

  methods: {
    assignInstanceData (data) {
      this.$store.dispatch('loadDataWithValidation', {
        data,
        requiredFields: this.requiredFields
      })
    },

    beforeSave (callback) {
      this.$v.$touch()
      if (!this.$v.$error) {
        callback()
      }
    },

    storeSetter (key, value) {
      this.$store.commit('SET_DATA', { key, value })
    }
  }
}
</script>
