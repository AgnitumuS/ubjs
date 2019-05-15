<template>
  <u-select-entity
    :repository="getEnumRequest"
    :value="value"
    :model-attr="modelAttr"
    @input="$emit('input', $event)"
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
    // TODO - pass entityCode, add attrCode, clearable only in case attr allow null
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
    disabled: Boolean
  },

  data () {
    return {
      modelAttr: 'code',
      enumEntity: 'ubm_enum'
    }
  },

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.enumEntity)
    },

    displayAttr () {
      return this.entitySchema.descriptionAttribute
    }
  },

  methods: {
    getEnumRequest () {
      return this.$UB.Repository(this.enumEntity)
        .attrs('eGroup', this.modelAttr, this.displayAttr)
        .where('eGroup', '=', this.eGroup)
    }
  }
}
</script>

<docs>
UbSelectEnum:

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
