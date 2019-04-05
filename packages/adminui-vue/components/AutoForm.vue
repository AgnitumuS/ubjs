<template>
  <div
    v-if="fieldsToShow"
    style="height: 100%"
  >
    <u-entity-edit
      :instance="$store.state.data"
      :entity-name="entityName"
      :instance-id="instanceID"
      :before-save="beforeSave"
      :current-tab-id="currentTabId"
      :parent-context="parentContext"
      @data-loaded="assignInstanceData"
    >
      <u-form
        :label-width="150"
      >
        <u-form-row
          v-for="[key, value] in fields"
          :key="key"
          :required="requiredFields.includes(key)"
          :label="entitySchema.attributes[key].caption"
          style="max-width: 600px"
          :error="$v[key].$error && $ut('isRequiredFieldFmt', entitySchema.attributes[key].caption)"
        >
          <el-checkbox
            v-if="entitySchema.attributes[key].dataType === 'Boolean'"
            :value="value"
            @input="storeSetter(key, $event)"
          />
          <el-date-picker
            v-else-if="entitySchema.attributes[key].dataType === 'DateTime' || entitySchema.attributes[key].dataType === 'Date'"
            :value="value"
            :type="entitySchema.attributes[key].dataType.toLowerCase()"
            placeholder="Select date and time"
            @input="storeSetter(key, $event)"
          />
          <ub-select-enum
            v-else-if="entitySchema.attributes[key].dataType === 'Enum'"
            :value="value"
            :e-group="entitySchema.attributes[key].enumGroup"
            :disabled="parentContext.hasOwnProperty(key)"
            @input="storeSetter(key, $event)"
          />
          <ub-select-entity
            v-else-if="entitySchema.attributes[key].dataType === 'Entity'"
            :value="value"
            :entity-name="entitySchema.attributes[key].associatedEntity"
            :disabled="parentContext.hasOwnProperty(key)"
            @input="storeSetter(key, $event)"
          />
          <ub-select-many
            v-else-if="entitySchema.attributes[key].dataType === 'Many'"
            :value="value"
            :entity-name="entitySchema.attributes[key].associatedEntity"
            :disabled="parentContext.hasOwnProperty(key)"
            @input="storeSetter(key, $event)"
          />
          <el-input
            v-else-if="entitySchema.attributes[key].dataType === 'Text'"
            :value="value"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
            @input="storeSetter(key, $event)"
          />
          <u-input-number
            v-else-if="['Int','BigInt','Float','Currency','ID'].includes(entitySchema.attributes[key].dataType)"
            :value="value"
            :entity-name="entitySchema.name"
            :attribute-name="key"
            :disabled="parentContext.hasOwnProperty(key)"
            @input="storeSetter(key, $event)"
          />
          <ub-upload-document
            v-else-if="entitySchema.attributes[key].dataType === 'Document'"
            :value="value"
            :doc-params="{ entity: entitySchema.name, attribute: key, ID: value.ID }"
            @input="storeSetter(key, $event)"
          />
          <u-code-mirror
            v-else-if="entitySchema.attributes[key].dataType === 'Json'"
            :value="value"
            @input="storeSetter(key, $event)"
          />
          <u-input
            v-else
            :value="value"
            :entity-name="entitySchema.name"
            :attribute-name="key"
            :object-value="$store.state.data"
            :disabled="parentContext.hasOwnProperty(key)"
            @input="storeSetter(key, $event)"
          />
        </u-form-row>
      </u-form>
    </u-entity-edit>
  </div>
</template>

<script>
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

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    fieldsToShow () {
      return this.entitySchema
        .filterAttribute({ defaultView: true })
        .map((at) => at.name)
    },

    $v () {
      return this.$store.state.$v
    },

    fields () {
      return Object.entries(this.$store.state.data)
        .filter(([key]) => this.fieldsToShow.includes(key))
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
    }
  },

  methods: {
    storeSetter (key, value) {
      this.$store.commit('SET_DATA', { key, value })
    },

    beforeSave (callback) {
      this.$v.$touch()
      if (!this.$v.$error) {
        callback()
      }
    },

    assignInstanceData (data) {
      // init all entity fields in instance module
      this.$store.dispatch('loadDataWithValidation', {
        data,
        requiredFields: this.requiredFields
      })
    }
  }
}
</script>
