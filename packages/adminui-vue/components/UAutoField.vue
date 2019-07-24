<template>
  <u-form-row
    :label="label"
    :required="$v[attributeName].$params.hasOwnProperty('required')"
    :error="$v[attributeName].$error"
  >
    <el-checkbox
      v-if="dataType === 'Boolean'"
      v-model="model"
      :disabled="disabled"
    />
    <el-date-picker
      v-else-if="(dataType === 'Date') || (dataType === 'DateTime')"
      v-model="model"
      :type="dataType.toLowerCase()"
      :placeholder="$ut(dataType === 'Date' ? 'selectDate' : 'selectDateAndTime')"
      :disabled="disabled"
    />
    <u-select-enum
      v-else-if="dataType === 'Enum'"
      v-model="model"
      :e-group="entitySchema.attributes[attributeName].enumGroup"
      :disabled="disabled"
    />
    <u-select-entity
      v-else-if="dataType === 'Entity'"
      v-model="model"
      :entity-name="associatedEntity"
      :disabled="disabled"
    />
    <u-select-many
      v-else-if="dataType === 'Many'"
      v-model="model"
      :entity-name="associatedEntity"
      :disabled="disabled"
    />
    <el-input
      v-else-if="dataType === 'Text'"
      v-model="model"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 4 }"
      :disabled="disabled"
    />
    <u-upload-document
      v-else-if="dataType === 'Document'"
      v-model="model"
      :entity-name="entity"
      :file-store="attributeName"
      :doc-id="$store.state.data.ID"
      :disabled="disabled"
    />
    <u-code-mirror
      v-else-if="dataType === 'Json'"
      v-model="model"
      :disabled="disabled"
    />
    <u-input
      v-else
      :attribute-name="attributeName"
      :disabled="disabled"
    />
  </u-form-row>
</template>

<script>
/**
 * Create a form component and validators based on entity attribute type
 */
export default {
  name: 'UAutoField',

  inject: ['$v', 'entity', 'entitySchema'],

  props: {
    /**
     * attribute name
     */
    attributeName: {
      type: String,
      required: true
    },
    /**
     * Set disable status
     */
    disabled: Boolean
  },

  computed: {
    model: {
      get () {
        return this.$store.state.data[this.attributeName]
      },

      set (value) {
        if (this.$v) {
          this.$v[this.attributeName].$touch()
        }
        this.$store.commit(`SET_DATA`, { key: this.attributeName, value })
      }
    },

    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },

    associatedEntity () {
      return this.entitySchema.attributes[this.attributeName].associatedEntity
    },

    label () {
      return this.entitySchema.attributes[this.attributeName].caption
    }
  }
}
</script>

<docs>
  Create a form component and validators based on entity attribute type

  ### Basic usage:

  ```vue
  <template>
    <u-auto-field attribute-name="code" />
  </template>
  ```
</docs>
