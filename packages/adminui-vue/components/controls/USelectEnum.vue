<template>
  <u-select-entity
    :repository="getEnumRequest"
    :value="value"
    :value-attribute="valueAttribute"
    :disabled="disabled"
    remove-default-actions
    @input="$emit('input', $event)"
    :editable="editable"
  />
</template>

<script>
/**
* Component for select UB enum.
*/
export default {
  name: 'USelectEnum',
  props: {
    /**
     * Selected item ID
     * @model
     */
    value: {
      type: [Number, String],
      default () {
        return null
      }
    },
    /**
     * Enum group from dictionary 'ubm_enum'
     */
    eGroup: {
      type: String,
      required: true
    },
    /**
     * Set disabled status
     */
    disabled: Boolean,

    /**
     * False to prevent the user from typing text directly into the field;
     * the field can only have its value set via selecting a value from the picker.
     * In this state, the picker can also be opened by clicking directly on the input field itself.
     */
    editable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      valueAttribute: 'code',
      enumEntity: 'ubm_enum'
    }
  },

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.enumEntity)
    },

    displayAttribute () {
      return this.entitySchema.descriptionAttribute
    }
  },

  methods: {
    getEnumRequest () {
      return this.$UB.Repository(this.enumEntity)
        .attrs('eGroup', this.valueAttribute, this.displayAttribute)
        .where('eGroup', '=', this.eGroup)
    }
  }
}
</script>

<docs>
Based on `u-select-entity` accordingly have all same props

```vue
<template>
  <u-select-enum
    v-model="value"
    e-group="FORM_TYPE"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```
</docs>
