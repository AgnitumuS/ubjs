<template>
  <div
    v-if="fieldsToShow"
    style="height: 100%"
  >
    <u-entity-edit
      :instance="value"
      :entity-name="entityName"
      :instance-id="instanceID"
      :before-save="beforeSave"
      :current-tab-id="currentTabId"
      :parent-context="parentContext"
      @data-loaded="assignInstanceData"
    >
      <u-form
        label-position="left"
        :label-width="150"
      >
        <!--TODO replace style max-width with el-row md=12 sm 24-->
        <u-form-row
          v-for="field in fieldsToShow"
          :key="field"
          :required="isRequired(field)"
          :label="entitySchema.attributes[field].caption"
          style="max-width: 600px"
          :error="$v.value[field].$error && $ut('isRequiredFieldFmt', entitySchema.attributes[field].caption)"
        >
          <el-checkbox
            v-if="entitySchema.attributes[field].dataType === 'Boolean'"
            v-model="value[field]"
            @change="$v.value[field].$touch()"
          />
          <el-date-picker
            v-else-if="entitySchema.attributes[field].dataType === 'DateTime' || entitySchema.attributes[field].dataType === 'Date'"
            v-model="value[field]"
            :type="entitySchema.attributes[field].dataType.toLowerCase()"
            placeholder="Select date and time"
            @change="$v.value[field].$touch()"
          />
          <ub-select-enum
            v-else-if="entitySchema.attributes[field].dataType === 'Enum'"
            v-model="value[field]"
            :e-group="entitySchema.attributes[field].enumGroup"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <ub-select-entity
            v-else-if="entitySchema.attributes[field].dataType === 'Entity'"
            v-model="value[field]"
            :entity-name="entitySchema.attributes[field].associatedEntity"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <ub-select-many
            v-else-if="entitySchema.attributes[field].dataType === 'Many'"
            v-model="value[field]"
            :entity-name="entitySchema.attributes[field].associatedEntity"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <el-input
            v-else-if="entitySchema.attributes[field].dataType === 'Text'"
            v-model="value[field]"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
            @change="$v.value[field].$touch()"
          />
          <u-input-number
            v-else-if="['Int','BigInt','Float','Currency','ID'].includes(entitySchema.attributes[field].dataType)"
            v-model="value[field]"
            :entity-name="entitySchema.name"
            :attribute-name="field"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <ub-upload-document
            v-else-if="entitySchema.attributes[field].dataType === 'Document'"
            v-model="value[field]"
            :doc-params="{ entity: entitySchema.name, attribute: field, ID: value.ID }"
            @input="$v.value[field].$touch()"
          />
          <u-code-mirror
            v-else-if="entitySchema.attributes[field].dataType === 'Json'"
            v-model="value[field]"
            @input="$v.value[field].$touch()"
          />
          <u-input
            v-else
            v-model="value[field]"
            :entity-name="entitySchema.name"
            :attribute-name="field"
            :object-value="value"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
        </u-form-row>
      </u-form>
    </u-entity-edit>
  </div>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default

module.exports = {
  name: 'AutoForm',
  props: {
    entityName: {
      type: String,
      required: true
    },
    /**
     * Parameters from parent context.
     * When we create related object - disable related fields and fill with parent data
     */
    parentContext: {
      type: Object,
      default () {
        return {}
      }
    },
    instanceID: Number,
    currentTabId: String
  },

  data () {
    return {
      value: {}
    }
  },

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    fieldsToShow () {
      return this.entitySchema.filterAttribute({ defaultView: true }).map((at) => {
        return at.name
      })
    }
  },

  methods: {
    beforeSave (callback) {
      this.$v.$touch()
      if (!this.$v.$error) {
        callback()
      }
    },

    assignInstanceData (data) {
      this.$set(this, 'value', data)
    },
    /**
     * check is attribute allowNull and not Boolean
     * @param  {String}  field Field name
     * @return {Boolean}
     */
    isRequired (field) {
      const attr = this.entitySchema.attributes[field]
      const isRequired = !attr.allowNull
      const notBoolean = attr.dataType !== 'Boolean'

      return isRequired && notBoolean
    }
  },

  validations () {
    return {
      value: this.fieldsToShow.reduce((params, field) => {
        if (this.isRequired(field)) {
          params[field] = { required }
        } else {
          params[field] = {}
        }
        return params
      }, {})
    }
  }
}
</script>
