<template>
  <u-select-multiple
    v-model="model"
    v-bind="$attrs"
  />
</template>

<script>
/**
* Component for editing an attribute of `Many` data type
*/
export default {
  name: 'USelectMany',
  props: {
    /**
     * Array of selected IDs as string joined by, or can be a number in case of one ID
     * @model
     */
    value: {}
  },

  computed: {
    model: {
      get () {
        if (this.value === '' || this.value === null || this.value === undefined) {
          return []
        } else {
          return typeof this.value === 'number'
            ? [this.value]
            : this.value.split(',').map(i => +i)
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
Based on `u-select-multiple`, all props is the same

```vue
<template>
  <u-grid>
    <u-select-many
      v-model="value"
      entity-name="req_department"
    />
    <div>Selected IDs as CSV: {{value}}</div>
  </u-grid>
</template>
<script>
  export default {
    data () {
      return {
        value: ''
      }
    },
    async mounted () {
      const firstTwoDepIDs = await this.$UB.Repository('req_department')
        .attrs('ID').limit(2).selectAsArrayOfValues()
      this.value = firstTwoDepIDs.join(',') + ',1111' // / element with ID = 111 NOT exists and displayed as ID
    }
  }
</script>
```
</docs>
