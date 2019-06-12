<template>
  <u-form-row
    :label="label"
    :required="$v[code].$params.hasOwnProperty('required')"
    :error="$v[code].$error"
  >
    <el-checkbox
      v-if="dataType === 'Boolean'"
      v-model="model"
      :disabled="disabled"
    />
    <el-date-picker
      v-else-if="isDate"
      v-model="model"
      :type="dataType.toLowerCase()"
      placeholder="Select date and time"
      :disabled="disabled"
    />
    <u-select-enum
      v-else-if="dataType === 'Enum'"
      v-model="model"
      :e-group="entitySchema.attributes[code].enumGroup"
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
      :file-store="code"
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
      v-model="model"
      :attribute-name="code"
      :disabled="disabled"
    />
  </u-form-row>
</template>

<script>
/**
 * Automaticly create field from entity schema
 * and validate it
 */
export default {
  name: 'UAutoField',

  inject: ['$v', 'entity', 'entitySchema'],

  props: {
    /**
     * @model
     */
    value: {
      required: true
    },
    /**
     * attribute code
     */
    code: {
      type: String,
      required: true
    },
    /**
     * Set disable status
     */
    disabled: Boolean
  },

  data () {
    return {
      dateTypes: ['Date', 'DateTime']
    }
  },

  computed: {
    model: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },

    dataType () {
      return this.entitySchema.attributes[this.code].dataType
    },

    associatedEntity () {
      return this.entitySchema.attributes[this.code].associatedEntity
    },

    label () {
      return this.entitySchema.attributes[this.code].caption
    },

    isDate () {
      return this.dateTypes.includes(this.dataType)
    }
  }
}
</script>

<docs>
  Automaticly create field from entity schema and validate it

  ### Basic usage:

  ```vue
  <template>
    <u-auto-field
      v-model="code"
      code="code"
    />
  </template>

  <script>
    export default {
      data () {
        return {
          code: ''
        }
      }
    }
  </script>
  ```
</docs>
