<template>
  <u-form-row
    :label="label"
    :required="isRequired"
    :error="isError"
  >
    <el-checkbox
      v-if="dataType === 'Boolean'"
      v-bind="$attrs"
      v-model="model"
    />
    <el-date-picker
      v-else-if="(dataType === 'Date') || (dataType === 'DateTime')"
      v-model="model"
      v-bind="$attrs"
      :type="dataType.toLowerCase()"
      :placeholder="$ut(dataType === 'Date' ? 'selectDate' : 'selectDateAndTime')"
      :picker-options="{ firstDayOfWeek }"
    />
    <u-select-enum
      v-else-if="dataType === 'Enum'"
      v-model="model"
      v-bind="$attrs"
      :e-group="entitySchema.attributes[attributeName].enumGroup"
    />
    <u-select-entity
      v-else-if="dataType === 'Entity'"
      v-model="model"
      v-bind="$attrs"
      :entity-name="associatedEntity"
    />
    <u-select-many
      v-else-if="dataType === 'Many'"
      v-model="model"
      v-bind="$attrs"
      :entity-name="associatedEntity"
    />
    <el-input
      v-else-if="dataType === 'Text'"
      v-model="model"
      v-bind="$attrs"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 4 }"
    />
    <u-file
      v-else-if="dataType === 'Document'"
      v-model="model"
      v-bind="$attrs"
      :attribute-name="attributeName"
    />
    <u-code-mirror
      v-else-if="dataType === 'Json'"
      v-model="model"
      v-bind="$attrs"
    />
    <u-input
      v-else
      v-bind="$attrs"
      :attribute-name="attributeName"
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
     * Attribute name
     */
    attributeName: {
      type: String,
      required: true
    },

    /**
     * Overrides required prop of <form-row />
     */
    required: Boolean
  },

  computed: {
    model: {
      get () {
        return this.$store.state.data[this.attributeName]
      },

      set (value) {
        if (this.$v && this.attributeName in this.$v) {
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
    },

    isRequired () {
      return this.$v &&
        this.$v[this.attributeName] &&
        this.$v[this.attributeName].$params.hasOwnProperty('required')
    },

    isError () {
      return this.$v &&
        this.$v[this.attributeName] &&
        this.$v[this.attributeName].$error
    },

    firstDayOfWeek () {
      // moment days monday equals to 0, instead element-ui which monday equals to 1
      const momentDay = this.$moment.localeData().firstDayOfWeek()
      if (momentDay === 0) {
        return 7
      } else {
        return momentDay
      }
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
