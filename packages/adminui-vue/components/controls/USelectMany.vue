<template>
  <u-select-multiple
    v-model="model"
    v-bind="$attrs"
  />
</template>

<script>
/**
* Component for select UB many type property.
*/
export default {
  name: 'USelectMany',
  props: {
    /**
     * Array of selected IDs as string joined by ,
     * @model
     */
    value: {
      type: String
    }
  },

  computed: {
    model: {
      get () {
        if (this.value === '' || this.value === null || this.value === undefined) {
          return []
        } else {
          return this.value.split(',').map(i => +i)
        }
      },
      set (val) {
        this.$emit('input', val.join(','))
      }
    }
  }
}
</script>

<docs>
Based on `u-select-multiple` accordingly have all same props

```vue
<template>
  <u-select-many
    v-model="value"
    entity-name="tst_dictionary"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: '1,2'
      }
    }
  }
</script>
```
</docs>
